import { createClient } from "jsr:@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── VAPID / Web Push helpers ──────────────────────────────────────────────────

function base64urlDecode(str: string): Uint8Array {
  const pad = "=".repeat((4 - (str.length % 4)) % 4)
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function base64urlEncode(buf: Uint8Array | ArrayBuffer): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function signVapidJwt(audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = base64urlEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })))
  const payload = base64urlEncode(new TextEncoder().encode(JSON.stringify({
    aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT,
  })))
  const signingInput = `${header}.${payload}`

  const pubRaw = base64urlDecode(VAPID_PUBLIC_KEY)
  const x = base64urlEncode(pubRaw.slice(1, 33))
  const y = base64urlEncode(pubRaw.slice(33, 65))

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: VAPID_PRIVATE_KEY, x, y, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  )

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(signingInput)
  )
  return `${signingInput}.${base64urlEncode(sig)}`
}

async function sendPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: object
): Promise<void> {
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const jwt = await signVapidJwt(audience)
  const vapidAuth = `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`
  const body = await encryptPayload(subscription.keys, JSON.stringify(payload))

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Authorization": vapidAuth,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Push failed ${res.status}: ${text}`)
  }
  console.log(`Push sent OK (${res.status}) → ${url.host}`)
}

// aes128gcm content encryption per RFC 8188 / Web Push spec
async function encryptPayload(keys: { p256dh: string; auth: string }, plaintext: string): Promise<Uint8Array> {
  const receiverPublicKey = base64urlDecode(keys.p256dh)
  const authSecret = base64urlDecode(keys.auth)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const senderKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])
  const senderPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", senderKeyPair.publicKey))

  const receiverKey = await crypto.subtle.importKey("raw", receiverPublicKey, { name: "ECDH", namedCurve: "P-256" }, false, [])
  const sharedBits = await crypto.subtle.deriveBits({ name: "ECDH", public: receiverKey }, senderKeyPair.privateKey, 256)

  const hkdf = async (ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, len: number) => {
    const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"])
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8))
  }

  const prk = await hkdf(new Uint8Array(sharedBits), authSecret,
    concat([str("WebPush: info\0"), receiverPublicKey, senderPublicKeyRaw]), 32)
  const cek = await hkdf(prk, salt, concat([str("Content-Encoding: aes128gcm\0"), new Uint8Array(1)]), 16)
  const nonce = await hkdf(prk, salt, concat([str("Content-Encoding: nonce\0"), new Uint8Array(1)]), 12)

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"])
  const encoded = new TextEncoder().encode(plaintext)
  const record = concat([encoded, new Uint8Array([2])]) // padding delimiter
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, record))

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + sender_public(65) + ciphertext
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, record.length + 16, false) // big-endian
  return concat([salt, rs, new Uint8Array([senderPublicKeyRaw.length]), senderPublicKeyRaw, ciphertext])
}

function str(s: string) { return new TextEncoder().encode(s) }
function concat(arrays: Uint8Array[]) {
  const out = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0))
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const now = new Date()
  const windowStart = new Date(now.getTime() - 2 * 60 * 1000)

  const { data: cases, error } = await supabase.from("cases").select("*")
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const updates: Promise<void>[] = []
  let remindersTriggered = 0

  for (const row of cases ?? []) {
    const userId: string = row.user_id
    let dirty = false

    for (const section of ["tasks", "hearings", "meetings"] as const) {
      const items: Array<Record<string, unknown>> = row[section] ?? []
      for (const item of items) {
        const reminders: Array<{ id: string; minutesBefore: number; sent?: boolean }> = (item.reminders as never[]) ?? []
        const dateStr: string = section === "tasks" ? (item.dueDate as string) : (item.date as string)
        const timeStr: string = (item.time as string) ?? "09:00"
        if (!dateStr || !reminders.length) continue

        const [day, month, year] = dateStr.split(".")
        const [hh, mm] = timeStr.split(":")
        const monthNum = +month
        const israelOffsetHours = (monthNum >= 4 && monthNum <= 10) ? 3 : 2
        const itemDate = new Date(Date.UTC(+year, monthNum - 1, +day, +hh - israelOffsetHours, +mm))

        for (const reminder of reminders) {
          if (reminder.sent) continue
          const triggerAt = new Date(itemDate.getTime() - reminder.minutesBefore * 60 * 1000)
          if (triggerAt >= windowStart && triggerAt <= now) {
            remindersTriggered++
            const label = section === "tasks" ? "משימה" : section === "hearings" ? "דיון" : "פגישה"
            const minutesLabel =
              reminder.minutesBefore === 60 ? "שעה לפני" :
              reminder.minutesBefore === 180 ? "3 שעות לפני" :
              reminder.minutesBefore === 1440 ? "יום לפני" :
              reminder.minutesBefore === 4320 ? "3 ימים לפני" :
              reminder.minutesBefore === 10080 ? "שבוע לפני" :
              reminder.minutesBefore === 20160 ? "שבועיים לפני" :
              `${reminder.minutesBefore} דקות לפני`

            const title = `${label}: ${item.title ?? dateStr}`
            const body = `${dateStr} ${timeStr} — ${minutesLabel}`
            console.log(`Reminder due: "${title}" for user ${userId}`)

            updates.push((async () => {
              const { data: subs } = await supabase
                .from("push_subscriptions")
                .select("subscription")
                .eq("user_id", userId)

              console.log(`Found ${subs?.length ?? 0} subscriptions for user ${userId}`)

              const results = await Promise.allSettled(
                (subs ?? []).map((s) =>
                  sendPush(
                    s.subscription as { endpoint: string; keys: { p256dh: string; auth: string } },
                    { title, body, url: "/dashboard", tag: reminder.id }
                  )
                )
              )

              for (const result of results) {
                if (result.status === "rejected") {
                  console.error("Push error:", result.reason)
                }
              }
            })())

            reminder.sent = true
            dirty = true
          }
        }
      }
    }

    if (dirty) {
      updates.push(
        supabase.from("cases").update({
          tasks: row.tasks,
          hearings: row.hearings,
          meetings: row.meetings,
        }).eq("id", row.id).then(() => {})
      )
    }
  }

  await Promise.allSettled(updates)
  console.log(`Done. Reminders triggered: ${remindersTriggered}`)
  return new Response(JSON.stringify({ ok: true, time: now.toISOString(), remindersTriggered }), { status: 200 })
})
