"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReminderSelector, type Reminder } from "./reminder-selector"

export interface NewMeetingData {
  title: string
  date: string
  hour: string
  minute: string
  location: string
  notes: string
  link: string
  reminders: Reminder[]
}

export interface MeetingForEdit {
  id: string
  title: string
  date: string
  time: string
  location?: string
  notes?: string
  link?: string
  reminders?: Reminder[]
}

interface AddMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: NewMeetingData) => void
  caseName: string
  editingMeeting?: MeetingForEdit | null
}

export function AddMeetingModal({ isOpen, onClose, onSave, caseName, editingMeeting }: AddMeetingModalProps) {
  const getInitialFormData = (): NewMeetingData => {
    if (editingMeeting) {
      const [hour, minute] = editingMeeting.time?.split(":") || ["", ""]
      let dateForInput = ""
      if (editingMeeting.date) {
        const [day, month, year] = editingMeeting.date.split(".")
        dateForInput = `${year}-${month}-${day}`
      }
      return {
        title: editingMeeting.title,
        date: dateForInput,
        hour: hour || "",
        minute: minute || "",
        location: editingMeeting.location || "",
        notes: editingMeeting.notes || "",
        link: editingMeeting.link || "",
        reminders: editingMeeting.reminders || [],
      }
    }
    return { title: "", date: "", hour: "", minute: "", location: "", notes: "", link: "", reminders: [] }
  }

  const [formData, setFormData] = useState<NewMeetingData>(getInitialFormData())

  useEffect(() => {
    setFormData(getInitialFormData())
  }, [editingMeeting])

  const updateField = (field: keyof NewMeetingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.title.trim()) return
    onSave(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({ title: "", date: "", hour: "", minute: "", location: "", notes: "", link: "", reminders: [] })
    onClose()
  }

  const hours = Array.from({ length: 13 }, (_, i) => (i + 8).toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            {editingMeeting ? "עריכת פגישה" : "פגישה חדשה"} — {caseName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">כותרת הפגישה</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="לדוגמה: שיחת הכנה עם הלקוח"
              className="bg-slate-50 border-slate-200 focus:bg-white text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">תאריך</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">שעה</Label>
            <div className="flex gap-1 justify-end">
              <Select value={formData.minute} onValueChange={(v) => updateField("minute", v)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="00" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formData.hour} onValueChange={(v) => updateField("hour", v)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="00" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              מיקום <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="לדוגמה: משרד, זום, בית קפה..."
              className="bg-slate-50 border-slate-200 focus:bg-white text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              הערות <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="הערות חופשיות..."
              className="bg-slate-50 border-slate-200 focus:bg-white text-right min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              קישור לפגישה <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              type="url"
              value={formData.link}
              onChange={(e) => updateField("link", e.target.value)}
              placeholder="https://..."
              className="bg-slate-50 border-slate-200 focus:bg-white text-left"
              dir="ltr"
            />
          </div>

          {formData.date && (
            <ReminderSelector
              reminders={formData.reminders}
              onChange={(reminders) => setFormData(prev => ({ ...prev, reminders }))}
            />
          )}
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            שמור
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
