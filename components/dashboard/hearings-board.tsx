"use client"

import { Clock, MapPin, User } from "lucide-react"
import type { CaseData } from "./case-card"

interface HearingWithCase {
  date: string
  time: string
  caseName: string
  court?: string
  judge?: string
}

interface HearingsBoardProps {
  cases: Record<string, CaseData[]>
}

export function HearingsBoard({ cases }: HearingsBoardProps) {
  const allHearings: HearingWithCase[] = []

  Object.values(cases).forEach((dateCases) => {
    dateCases.forEach((caseData) => {
      caseData.hearings.forEach((hearing) => {
        allHearings.push({
          date: hearing.date,
          time: hearing.time,
          caseName: caseData.name,
          court: hearing.court || caseData.court,
          judge: hearing.notes,
        })
      })
    })
  })

  allHearings.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(".").map(Number)
    const [dayB, monthB, yearB] = b.date.split(".").map(Number)
    const dateA = new Date(yearA, monthA - 1, dayA)
    const dateB = new Date(yearB, monthB - 1, dayB)
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
    return a.time.localeCompare(b.time)
  })

  const hearingsByDate: Record<string, HearingWithCase[]> = {}
  allHearings.forEach((hearing) => {
    if (!hearingsByDate[hearing.date]) hearingsByDate[hearing.date] = []
    hearingsByDate[hearing.date].push(hearing)
  })

  const formatDateDisplay = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".").map(Number)
    const date = new Date(year, month - 1, day)
    const dayName = date.toLocaleDateString("he-IL", { weekday: "long" })
    const monthName = date.toLocaleDateString("he-IL", { month: "long" })
    return { day, dayName, monthName, year }
  }

  if (allHearings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">אין דיונים מתוכננים</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {Object.entries(hearingsByDate).map(([date, hearings]) => {
        const { day, dayName, monthName, year } = formatDateDisplay(date)
        return (
          <div key={date} className="flex gap-6">
            <div className="flex-shrink-0 w-24 text-center">
              <div className="bg-primary/10 rounded-2xl p-3 border border-primary/20">
                <div className="text-3xl font-bold text-primary">{day}</div>
                <div className="text-xs text-primary/80 font-medium">{dayName}</div>
                <div className="text-xs text-slate-500 mt-1">{monthName} {year}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {hearings.map((hearing, index) => (
                <div
                  key={`${hearing.caseName}-${index}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 text-lg mb-1 text-right">{hearing.caseName}</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{hearing.time}</span>
                    </div>
                    {hearing.court && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">{hearing.court}</span>
                      </div>
                    )}
                    {hearing.judge && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm">{hearing.judge}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
