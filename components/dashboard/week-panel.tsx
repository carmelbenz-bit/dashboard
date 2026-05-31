"use client"

import { useState } from "react"
import { Calendar, Clock, Gavel, MessageSquare, CheckSquare, MapPin } from "lucide-react"
import type { CaseData } from "./case-card"
import type { GeneralTask } from "./general-tasks"
import { cn } from "@/lib/utils"

interface WeekEvent {
  time: string
  title: string
  type: "hearing" | "meeting" | "task"
  subtitle?: string
  location?: string
}

interface WeekPanelProps {
  cases: CaseData[]
  generalTasks: GeneralTask[]
}

const DAY_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]
const DAY_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
const MONTH_NAME = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]

function toDateStr(date: Date): string {
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, ".")
}

export function WeekPanel({ cases, generalTasks }: WeekPanelProps) {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(todayMidnight)
  startOfWeek.setDate(todayMidnight.getDate() - todayMidnight.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const [selectedDay, setSelectedDay] = useState<Date>(todayMidnight)

  const getEventsForDate = (date: Date): WeekEvent[] => {
    const dateStr = toDateStr(date)
    const events: WeekEvent[] = []

    cases.forEach((c) => {
      c.hearings.forEach((h) => {
        if (h.date === dateStr) {
          events.push({ time: h.time, title: c.name, type: "hearing", subtitle: h.court || c.court })
        }
      })
      c.meetings?.forEach((m) => {
        if (m.date === dateStr && !m.completed) {
          events.push({ time: m.time, title: m.title, type: "meeting", subtitle: c.name, location: m.location })
        }
      })
      c.tasks.forEach((t) => {
        if (t.dueDate === dateStr && !t.completed) {
          events.push({ time: t.time || "", title: t.title, type: "task", subtitle: c.name })
        }
      })
    })

    generalTasks
      .filter((t) => t.dueDate === dateStr && !t.completed)
      .forEach((t) => {
        events.push({ time: "", title: t.title, type: "task", subtitle: "משימות כלליות" })
      })

    events.sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })

    return events
  }

  const isToday = (d: Date) => d.getTime() === todayMidnight.getTime()
  const isSelected = (d: Date) => d.getTime() === selectedDay.getTime()

  const selectedEvents = getEventsForDate(selectedDay)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="font-semibold text-slate-800 text-sm">השבוע הקרוב</span>
      </div>

      {/* Day picker */}
      <div className="flex px-2 py-3 gap-1">
        {weekDays.map((day, i) => {
          const events = getEventsForDate(day)
          const hasHearings = events.some((e) => e.type === "hearing")
          const hasMeetings = events.some((e) => e.type === "meeting")
          const hasTasks = events.some((e) => e.type === "task")
          const today = isToday(day)
          const selected = isSelected(day)

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(new Date(day))}
              className={cn(
                "flex-1 flex flex-col items-center py-2 rounded-xl transition-all",
                today && "bg-primary",
                !today && selected && "border-2 border-primary/40 bg-primary/5",
                !today && !selected && "hover:bg-slate-50"
              )}
            >
              <span className={cn(
                "text-xs font-medium mb-0.5",
                today ? "text-primary-foreground/80" : "text-slate-400"
              )}>
                {DAY_SHORT[day.getDay()]}
              </span>
              <span className={cn(
                "text-sm font-bold leading-none",
                today ? "text-primary-foreground" : selected ? "text-primary" : "text-slate-700"
              )}>
                {day.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1.5 h-1.5 items-center">
                {hasTasks && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {hasMeetings && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                {hasHearings && <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      <div className="border-t border-slate-100">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-600">
            יום {DAY_FULL[selectedDay.getDay()]}, {selectedDay.getDate()} ב{MONTH_NAME[selectedDay.getMonth()]}
          </span>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-400">אין אירועים ביום זה</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {selectedEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  {event.type === "hearing" && <Gavel className="h-3.5 w-3.5 text-primary" />}
                  {event.type === "meeting" && <MessageSquare className="h-3.5 w-3.5 text-purple-500" />}
                  {event.type === "task" && <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-tight truncate">{event.title}</p>
                  {event.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{event.subtitle}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-300 flex-shrink-0" />
                      <p className="text-xs text-slate-400 truncate">{event.location}</p>
                    </div>
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
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">משימות</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">פגישות</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary/70 flex-shrink-0" />
          <span className="text-xs text-slate-400">דיונים</span>
        </div>
      </div>
    </div>
  )
}
