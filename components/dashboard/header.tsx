"use client"

import { Scale, Plus, Bell, BellOff, LogOut, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { usePushNotifications } from "@/hooks/usePushNotifications"

interface HeaderProps {
  onAddCase: () => void
  onAddTask: () => void
}

export function Header({ onAddCase, onAddTask }: HeaderProps) {
  const router = useRouter()
  const { status, enable, disable } = usePushNotifications()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleBellClick = () => {
    if (status === "enabled") disable()
    else if (status === "disabled") enable()
  }

  const bellTitle =
    status === "enabled" ? "כבה התרעות" :
    status === "denied" ? "התרעות חסומות בדפדפן" :
    status === "unsupported" ? "הדפדפן לא תומך בהתרעות" :
    "הפעל התרעות"

  return (
    <header className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">ניהול תיקים</h1>
              <p className="hidden sm:block text-xs text-sidebar-foreground/60">מערכת משפטית מתקדמת</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {status !== "unsupported" && status !== "loading" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBellClick}
                disabled={status === "denied"}
                title={bellTitle}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent relative"
              >
                {status === "enabled" ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
                {status === "enabled" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                )}
              </Button>
            )}

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
              onClick={onAddTask}
              variant="outline"
              className="hidden sm:flex border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <ClipboardList className="h-4 w-4 ml-2" />
              הוסף משימה
            </Button>
            <Button
              onClick={onAddCase}
              className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground"
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
