"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Scale } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/")
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("כתובת מייל או סיסמה שגויים")
      setLoading(false)
    } else {
      router.replace("/")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="p-3 bg-primary rounded-xl">
            <Scale className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">ניהול תיקים</h1>
            <p className="text-sm text-muted-foreground mt-1">מערכת משפטית מתקדמת</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h2 className="text-lg font-semibold text-center mb-6">כניסה למערכת</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-right block">כתובת מייל</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="text-left"
                dir="ltr"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-right block">סיסמה</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="text-left"
                dir="ltr"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
              disabled={loading}
            >
              {loading ? "מתחבר..." : "כניסה"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
