"use client"

import { useState } from "react"
import { Bell, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface Reminder {
  id: string
  minutesBefore: number
  sent?: boolean
}

export const REMINDER_OPTIONS = [
  { label: "שעה לפני", minutesBefore: 60 },
  { label: "3 שעות לפני", minutesBefore: 180 },
  { label: "יום לפני", minutesBefore: 1440 },
  { label: "3 ימים לפני", minutesBefore: 4320 },
  { label: "שבוע לפני", minutesBefore: 10080 },
  { label: "שבועיים לפני", minutesBefore: 20160 },
]

export function getLabelForMinutes(minutesBefore: number): string {
  return REMINDER_OPTIONS.find(o => o.minutesBefore === minutesBefore)?.label ?? `${minutesBefore} דקות לפני`
}

interface ReminderSelectorProps {
  reminders: Reminder[]
  onChange: (reminders: Reminder[]) => void
}

export function ReminderSelector({ reminders, onChange }: ReminderSelectorProps) {
  const [adding, setAdding] = useState(false)

  const usedMinutes = new Set(reminders.map(r => r.minutesBefore))
  const available = REMINDER_OPTIONS.filter(o => !usedMinutes.has(o.minutesBefore))

  const addReminder = (minutesBefore: number) => {
    onChange([...reminders, { id: `r-${Date.now()}`, minutesBefore }])
    setAdding(false)
  }

  const removeReminder = (id: string) => {
    onChange(reminders.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm text-slate-500 flex items-center gap-1 justify-end">
        <Bell className="h-3.5 w-3.5" />
        תזכורות <span className="text-slate-400">(אופציונלי)</span>
      </Label>

      {reminders.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {[...reminders]
            .sort((a, b) => b.minutesBefore - a.minutesBefore)
            .map(reminder => (
              <div key={reminder.id} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1.5 rounded-full">
                <button
                  type="button"
                  onClick={() => removeReminder(reminder.id)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                <span>{getLabelForMinutes(reminder.minutesBefore)}</span>
              </div>
            ))}
        </div>
      )}

      {available.length > 0 && (
        adding ? (
          <div className="flex gap-2 justify-end">
            <Select onValueChange={(v) => addReminder(parseInt(v))}>
              <SelectTrigger className="w-44 bg-slate-50 border-slate-200 text-sm">
                <SelectValue placeholder="בחרי מתי" />
              </SelectTrigger>
              <SelectContent>
                {available.map(option => (
                  <SelectItem key={option.minutesBefore} value={option.minutesBefore.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)} className="text-slate-400 px-2">
              ביטול
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="gap-1.5 text-slate-500 hover:text-primary hover:bg-primary/5 text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              הוסף תזכורת
            </Button>
          </div>
        )
      )}
    </div>
  )
}
