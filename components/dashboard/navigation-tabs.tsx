"use client"

import { cn } from "@/lib/utils"
import { FolderOpen, Gavel, Users, CalendarClock, CalendarDays } from "lucide-react"

interface Tab {
  id: string
  label: string
  shortLabel: string
  icon: React.ElementType
}

const tabs: Tab[] = [
  { id: "cases", label: "תיקים", shortLabel: "תיקים", icon: FolderOpen },
  { id: "hearings", label: "לוח דיונים", shortLabel: "דיונים", icon: Gavel },
  { id: "meetings", label: "לוח פגישות", shortLabel: "פגישות", icon: Users },
  { id: "dates", label: "לוח מועדים", shortLabel: "מועדים", icon: CalendarClock },
  { id: "calendar", label: "לוח שנה", shortLabel: "שנה", icon: CalendarDays },
]

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <>
      {/* Desktop: horizontal pills */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-md transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile: fixed bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pb-3 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{tab.shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
