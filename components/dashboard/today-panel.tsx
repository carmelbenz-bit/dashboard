"use client"

import { useState } from "react"
import { Sun, ChevronLeft, ChevronRight, Clock, Gavel, MessageSquare, CheckSquare, Calendar } from "lucide-react"
import type { CaseData } from "./case-card"
import type { GeneralTask } from "./general-tasks"
import { cn } from "@/lib/utils"

interface TodayEvent {
  time: string
  title: string
  type: "hearing" | "meeting" | "task"
  subtitle?: string
}

interface TodayPanelProps {
  cases: CaseData[]
  generalTasks: GeneralTask[]
}

function getTodayStr() {
  return new Date().toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, ".")
}

export function TodayPanel({ cases, generalTasks }: TodayPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const today = new Date()
  const todayStr = getTodayStr()

  const events: TodayEvent[] = []

  cases.forEach((c) => {
    c.hearings.forEach((h) => {
      if (h.date === todayStr) {
        events.push({ time: h.time, title: c.name, type: "hearing", subtitle: h.court || c.court })
      }
    })
    c.meetings?.forEach((m) => {
      if (m.date === todayStr && !m.completed) {
        events.push({ time: m.time, title: m.title, type: "meeting", subtitle: c.name })
      }
    })
    c.tasks.forEach((t) => {
      if (t.dueDate === todayStr && !t.completed) {
        events.push({ time: t.time || "", title: t.title, type: "task", subtitle: c.name })
      }
    })
  })

  generalTasks
    .filter((t) => t.dueDate === todayStr && !t.completed)
    .forEach((t) => {
      events.push({ time: "", title: t.title, type: "task", subtitle: "משימות כלליות" })
    })

  events.sort((a, b) => {
    if (!a.time && !b.time) return 0
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })

  const meetingMinutes = events
    .filter((e) => e.type === "hearing" || e.type === "meeting")
    .reduce((sum, e) => sum + (e.type === "hearing" ? 60 : 30), 0)

  const completedToday = cases
    .flatMap((c) => c.tasks)
    .filter((t) => t.completed && t.dueDate === todayStr).length

  const scheduledCount = events.length

  const dayName = today.toLocaleDateString("he-IL", { weekday: "long" })
  const dayNum = today.getDate()
  const monthName = today.toLocaleDateString("he-IL", { month: "long" })

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl shadow-sm flex-shrink-0 overflow-hidden transition-all duration-200",
        isCollapsed ? "w-12" : "w-72"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-100 p-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div>
            <div className="flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="font-semibold text-slate-800 text-sm">מה קורה היום</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {dayName}, {dayNum} ב{monthName}
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 flex-shrink-0"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex bg-slate-100 gap-px border-b border-slate-100">
            <div className="flex-1 text-center py-3 bg-white">
              <div className="text-xl font-bold text-slate-800">{meetingMinutes}</div>
              <div className="text-xs text-slate-400 mt-0.5">ס.מ&quot;ד</div>
            </div>
            <div className="flex-1 text-center py-3 bg-white">
              <div className="text-xl font-bold text-emerald-600">{completedToday}</div>
              <div className="text-xs text-slate-400 mt-0.5">הושלמו</div>
            </div>
            <div className="flex-1 text-center py-3 bg-white">
              <div className="text-xl font-bold text-slate-800">{scheduledCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">מתוכנן</div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Calendar className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-600">יום פנוי!</p>
              <p className="text-xs text-slate-400 mt-1">אין אירועים מתוכננים להיום</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[calc(100vh-300px)] overflow-y-auto">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {event.type === "hearing" && <Gavel className="h-3.5 w-3.5 text-primary" />}
                    {event.type === "meeting" && <MessageSquare className="h-3.5 w-3.5 text-purple-500" />}
                    {event.type === "task" && <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-tight truncate">
                      {event.title}
                    </p>
                    {event.subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{event.subtitle}</p>
                    )}
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-0.5 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
