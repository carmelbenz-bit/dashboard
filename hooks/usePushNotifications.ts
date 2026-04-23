"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

const VAPID_PUBLIC_KEY = "BMGtsepaC7fVi-0jR1eA0fSm6qLvCEP9gz7Kgn5SBK_nDWyVcPKza-Msn7jdQx9MtpXjrixgWe0J9pu-fhpm9UQ"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export type PushStatus = "unsupported" | "denied" | "enabled" | "disabled" | "loading"

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("loading")

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported")
      return
    }
    if (Notification.permission === "denied") {
      setStatus("denied")
      return
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "enabled" : "disabled")
      })
    })
  }, [])

  const enable = async () => {
    setStatus("loading")
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus("denied")
        return
      }

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
        endpoint: subscription.endpoint,
      }, { onConflict: "user_id,endpoint" })

      setStatus("enabled")
    } catch (err) {
      console.error("Push enable failed:", err)
      setStatus("disabled")
    }
  }

  const disable = async () => {
    setStatus("loading")
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", subscription.endpoint)
        }
        await subscription.unsubscribe()
      }
      setStatus("disabled")
    } catch (err) {
      console.error("Push disable failed:", err)
      setStatus("disabled")
    }
  }

  return { status, enable, disable }
}
