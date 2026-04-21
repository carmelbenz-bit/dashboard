"use client"

import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

const tabs: Tab[] = [
  { id: "cases", label: "תיקים" },
  { id: "hearings", label: "לוח דיונים" },
  { id: "meetings", label: "לוח פגישות" },
  { id: "dates", label: "לוח מועדים" },
  { id: "calendar", label: "לוח שנה" },
]

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
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
  )
}
