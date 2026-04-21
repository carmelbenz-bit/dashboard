"use client"

import { Scale, Plus, Bell, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface HeaderProps {
  onAddCase: () => void
}

export function Header({ onAddCase }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ניהול תיקים</h1>
              <p className="text-xs text-sidebar-foreground/60">מערכת משפטית מתקדמת</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
              title="יציאה"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            <Button
              onClick={onAddCase}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף תיק
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
