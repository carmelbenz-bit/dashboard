"use client"

import { Clock, FileText, ExternalLink, MapPin } from "lucide-react"
import type { CaseData } from "./case-card"

interface MeetingWithCase {
  id: string
  date: string
  time: string
  title: string
  caseName: string
  location?: string
  notes?: string
  link?: string
  completed?: boolean
}

interface MeetingsBoardProps {
  cases: Record<string, CaseData[]>
}

export function MeetingsBoard({ cases }: MeetingsBoardProps) {
  const allMeetings: MeetingWithCase[] = []

  Object.values(cases).forEach((dateCases) => {
    dateCases.forEach((caseData) => {
      if (caseData.meetings) {
        caseData.meetings.forEach((meeting) => {
          allMeetings.push({
            id: meeting.id,
            date: meeting.date,
            time: meeting.time,
            title: meeting.title,
            caseName: caseData.name,
            location: meeting.location,
            notes: meeting.notes,
            link: meeting.link,
            completed: meeting.completed,
          })
        })
      }
    })
  })

  allMeetings.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(".").map(Number)
    const [dayB, monthB, yearB] = b.date.split(".").map(Number)
    const dateA = new Date(yearA, monthA - 1, dayA)
    const dateB = new Date(yearB, monthB - 1, dayB)
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
    return a.time.localeCompare(b.time)
  })

  const meetingsByDate: Record<string, MeetingWithCase[]> = {}
  allMeetings.forEach((meeting) => {
    if (!meetingsByDate[meeting.date]) meetingsByDate[meeting.date] = []
    meetingsByDate[meeting.date].push(meeting)
  })

  const formatDateDisplay = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".").map(Number)
    const date = new Date(year, month - 1, day)
    const dayName = date.toLocaleDateString("he-IL", { weekday: "long" })
    const monthName = date.toLocaleDateString("he-IL", { month: "long" })
    return { day, dayName, monthName, year }
  }

  if (allMeetings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">אין פגישות מתוכננות</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {Object.entries(meetingsByDate).map(([date, meetings]) => {
        const { day, dayName, monthName, year } = formatDateDisplay(date)
        return (
          <div key={date} className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {/* Mobile: compact date strip */}
            <div className="sm:hidden flex items-center gap-2 px-1">
              <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-600 text-sm flex-shrink-0">
                {day}
              </div>
              <span className="text-sm font-semibold text-slate-700">{dayName}, {day} ב{monthName} {year}</span>
            </div>

            {/* Desktop: vertical date card */}
            <div className="hidden sm:block flex-shrink-0 w-24 text-center">
              <div className="bg-purple-100 rounded-2xl p-3 border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{day}</div>
                <div className="text-xs text-purple-600/80 font-medium">{dayName}</div>
                <div className="text-xs text-slate-500 mt-1">{monthName} {year}</div>
              </div>
            </div>

            <div className="flex-1 space-y-2 sm:space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
                >
                  <h3 className={`font-semibold text-base sm:text-lg mb-1 ${meeting.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{meeting.title}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-sm">{meeting.caseName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{meeting.time}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{meeting.location}</span>
                      </div>
                    )}
                    {meeting.link && (
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm font-medium">הצטרף לפגישה</span>
                      </a>
                    )}
                  </div>
                  {meeting.notes && (
                    <p className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      {meeting.notes}
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
