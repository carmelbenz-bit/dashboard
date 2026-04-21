"use client"

import { Clock, MapPin, FileText, ExternalLink, User } from "lucide-react"
import type { CaseData } from "./case-card"

type ItemType = "meeting" | "hearing"

interface DeadlineItem {
  id: string
  type: ItemType
  date: string
  time: string
  title: string
  caseName: string
  court?: string
  location?: string
  notes?: string
  link?: string
  judge?: string
}

interface DeadlinesBoardProps {
  cases: Record<string, CaseData[]>
}

export function DeadlinesBoard({ cases }: DeadlinesBoardProps) {
  const allItems: DeadlineItem[] = []

  Object.values(cases).forEach((dateCases) => {
    dateCases.forEach((caseData) => {
      caseData.hearings.forEach((hearing) => {
        allItems.push({
          id: `hearing-${caseData.id}-${hearing.date}-${hearing.time}`,
          type: "hearing",
          date: hearing.date,
          time: hearing.time,
          title: caseData.name,
          caseName: caseData.name,
          court: hearing.court || caseData.court,
          judge: hearing.notes,
        })
      })

      if (caseData.meetings) {
        caseData.meetings.forEach((meeting) => {
          if (meeting.date) {
            allItems.push({
              id: meeting.id,
              type: "meeting",
              date: meeting.date,
              time: meeting.time,
              title: meeting.title,
              caseName: caseData.name,
              location: meeting.location,
              notes: meeting.notes,
              link: meeting.link,
            })
          }
        })
      }
    })
  })

  allItems.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(".").map(Number)
    const [dayB, monthB, yearB] = b.date.split(".").map(Number)
    const dateA = new Date(yearA, monthA - 1, dayA)
    const dateB = new Date(yearB, monthB - 1, dayB)
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
    return a.time.localeCompare(b.time)
  })

  const itemsByDate: Record<string, DeadlineItem[]> = {}
  allItems.forEach((item) => {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = []
    itemsByDate[item.date].push(item)
  })

  const formatDateDisplay = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".").map(Number)
    const date = new Date(year, month - 1, day)
    const dayName = date.toLocaleDateString("he-IL", { weekday: "long" })
    const monthName = date.toLocaleDateString("he-IL", { month: "long" })
    return { day, dayName, monthName, year }
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">אין מועדים מתוכננים</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {Object.entries(itemsByDate).map(([date, items]) => {
        const { day, dayName, monthName, year } = formatDateDisplay(date)
        return (
          <div key={date} className="flex gap-6">
            <div className="flex-shrink-0 w-24 text-center">
              <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200">
                <div className="text-3xl font-bold text-slate-700">{day}</div>
                <div className="text-xs text-slate-600 font-medium">{dayName}</div>
                <div className="text-xs text-slate-500 mt-1">{monthName} {year}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                    item.type === "hearing"
                      ? "border-primary/30 hover:border-primary/50"
                      : "border-purple-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      item.type === "hearing"
                        ? "bg-primary/10 text-primary"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {item.type === "hearing" ? "דיון" : "פגישה"}
                    </span>
                    {item.type === "meeting" && (
                      <>
                        <span className="text-sm text-slate-400">•</span>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="text-sm">{item.caseName}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-lg mb-3">{item.title}</h3>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className={`h-4 w-4 ${item.type === "hearing" ? "text-primary" : "text-purple-500"}`} />
                      <span className="text-sm">{item.time}</span>
                    </div>
                    {item.type === "hearing" && item.court && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">{item.court}</span>
                      </div>
                    )}
                    {item.type === "meeting" && item.location && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                    )}
                    {item.type === "hearing" && item.judge && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">{item.judge}</span>
                      </div>
                    )}
                    {item.type === "meeting" && item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm font-medium">הצטרף לפגישה</span>
                      </a>
                    )}
                  </div>

                  {item.type === "meeting" && item.notes && (
                    <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
