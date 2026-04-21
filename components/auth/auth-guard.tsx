"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) router.replace("/login")
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) router.replace("/login")
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (session === undefined || session === null) return null

  return <>{children}</>
}
