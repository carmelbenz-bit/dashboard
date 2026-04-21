"use client"

import { Clock, MapPin, User, FileText, ExternalLink, CheckSquare } from "lucide-react"
import type { CaseData } from "./case-card"

type EventType = "hearing" | "meeting" | "task"

interface CalendarEvent {
  type: EventType
  date: string
  time: string
  caseName: string
  title?: string
  court?: string
  judge?: string
  location?: string
  notes?: string
  link?: string
  completed?: boolean
  assignee?: string
}

interface DatesBoardProps {
  cases: Record<string, CaseData[]>
}

export function DatesBoard({ cases }: DatesBoardProps) {
  const allEvents: CalendarEvent[] = []

  Object.values(cases).forEach((dateCases) => {
    dateCases.forEach((caseData) => {
      caseData.hearings.forEach((hearing) => {
        allEvents.push({
          type: "hearing",
          date: hearing.date,
          time: hearing.time,
          caseName: caseData.name,
          court: hearing.court || caseData.court,
          judge: hearing.notes,
        })
      })
      caseData.meetings?.forEach((meeting) => {
        allEvents.push({
          type: "meeting",
          date: meeting.date,
          time: meeting.time,
          caseName: caseData.name,
          title: meeting.title,
          location: meeting.location,
          notes: meeting.notes,
          link: meeting.link,
          completed: meeting.completed,
        })
      })
      caseData.tasks.forEach((task) => {
        if (!task.dueDate) return
        allEvents.push({
          type: "task",
          date: task.dueDate,
          time: "",
          caseName: caseData.name,
          title: task.title,
          completed: task.completed,
          assignee: task.tags?.[0],
          notes: task.notes,
        })
      })
    })
  })

  allEvents.sort((a, b) => {
    const parseDate = (d: string) => {
      const [day, month, year] = d.split(".").map(Number)
      return new Date(year, month - 1, day).getTime()
    }
    const diff = parseDate(a.date) - parseDate(b.date)
    if (diff !== 0) return diff
    return a.time.localeCompare(b.time)
  })

  const eventsByDate: Record<string, CalendarEvent[]> = {}
  allEvents.forEach((event) => {
    if (!eventsByDate[event.date]) eventsByDate[event.date] = []
    eventsByDate[event.date].push(event)
  })

  const formatDateDisplay = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".").map(Number)
    const date = new Date(year, month - 1, day)
    const dayName = date.toLocaleDateString("he-IL", { weekday: "long" })
    const monthName = date.toLocaleDateString("he-IL", { month: "long" })
    return { day, dayName, monthName, year }
  }

  const getDateBadgeStyle = (events: CalendarEvent[]) => {
    const types = new Set(events.map((e) => e.type))
    if (types.size > 1)
      return "bg-slate-100 border-slate-300 [&_.day-num]:text-slate-700 [&_.day-name]:text-slate-500"
    if (types.has("hearing"))
      return "bg-primary/10 border-primary/20 [&_.day-num]:text-primary [&_.day-name]:text-primary/80"
    if (types.has("meeting"))
      return "bg-purple-100 border-purple-200 [&_.day-num]:text-purple-600 [&_.day-name]:text-purple-600/80"
    return "bg-emerald-50 border-emerald-200 [&_.day-num]:text-emerald-700 [&_.day-name]:text-emerald-600/80"
  }

  const isMine = (assignee?: string) => assignee === "שלי"

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">אין אירועים מתוכננים</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {Object.entries(eventsByDate).map(([date, events]) => {
        const { day, dayName, monthName, year } = formatDateDisplay(date)
        return (
          <div key={date} className="flex gap-6">
            <div className="flex-shrink-0 w-24 text-center">
              <div className={`rounded-2xl p-3 border ${getDateBadgeStyle(events)}`}>
                <div className="day-num text-3xl font-bold">{day}</div>
                <div className="day-name text-xs font-medium">{dayName}</div>
                <div className="text-xs text-slate-500 mt-1">{monthName} {year}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {events.map((event, index) => {
                if (event.type === "hearing") return (
                  <div
                    key={`h-${index}`}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all border-r-4 border-r-primary"
                  >
                    <h3 className="font-semibold text-slate-800 text-lg text-right mb-1">{event.caseName}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">דיון</span>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      {event.court && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{event.court}</span>
                        </div>
                      )}
                      {event.judge && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-sm">{event.judge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )

                if (event.type === "meeting") return (
                  <div
                    key={`m-${index}`}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-purple-300 transition-all border-r-4 border-r-purple-500"
                  >
                    <h3 className={`font-semibold text-lg text-right mb-1 ${event.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">פגישה</span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-sm">{event.caseName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      )}
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm font-medium">הצטרף לפגישה</span>
                        </a>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{event.notes}</p>
                    )}
                  </div>
                )

                const mine = isMine(event.assignee)
                return (
                  <div
                    key={`t-${index}`}
                    className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all border-r-4 ${
                      mine
                        ? "hover:border-emerald-300 border-r-emerald-500"
                        : "hover:border-slate-400 border-r-slate-400"
                    }`}
                  >
                    <h3 className={`font-semibold text-lg text-right mb-1 ${event.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        mine ? "text-emerald-700 bg-emerald-50" : "text-slate-600 bg-slate-100"
                      }`}>
                        {mine ? "משימה שלי" : "הצד השני"}
                      </span>
                      {event.completed && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">הושלם</span>
                      )}
                      <div className="flex items-center gap-2 text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-sm">{event.caseName}</span>
                      </div>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{event.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
