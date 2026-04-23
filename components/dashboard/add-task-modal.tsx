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
import { X } from "lucide-react"
import { ReminderSelector, type Reminder } from "./reminder-selector"

export interface NewTaskData {
  assignee: "שלי" | "הצד השני"
  title: string
  dueDate: string
  dueHour: string
  dueMinute: string
  files: File[]
  existingFiles?: { name: string; url: string }[]
  notes: string
  durationType: "hours" | "days"
  durationHours: string
  durationMinutes: string
  durationDays: string
  reminders: Reminder[]
}

export interface TaskForEdit {
  id: string
  title: string
  dueDate: string | null
  tags: string[]
  files?: { name: string; url: string }[]
  notes?: string
  estimatedDuration?: string
  reminders?: Reminder[]
}

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: NewTaskData) => void
  caseName: string
  editingTask?: TaskForEdit | null
}

export function AddTaskModal({ isOpen, onClose, onSave, caseName, editingTask }: AddTaskModalProps) {
  const getInitialFormData = (): NewTaskData => {
    if (editingTask) {
      const assignee = editingTask.tags.includes("הצד השני") ? "הצד השני" : "שלי"
      let dateForInput = ""
      if (editingTask.dueDate) {
        const [day, month, year] = editingTask.dueDate.split(".")
        dateForInput = `${year}-${month}-${day}`
      }
      return {
        assignee: assignee as "שלי" | "הצד השני",
        title: editingTask.title,
        dueDate: dateForInput,
        dueHour: "",
        dueMinute: "",
        files: [],
        existingFiles: editingTask.files || [],
        notes: editingTask.notes || "",
        durationType: "hours",
        durationHours: "0",
        durationMinutes: "00",
        durationDays: "0",
        reminders: editingTask.reminders || [],
      }
    }
    return {
      assignee: "שלי",
      title: "",
      dueDate: "",
      dueHour: "",
      dueMinute: "",
      files: [],
      existingFiles: [],
      notes: "",
      durationType: "hours",
      durationHours: "0",
      durationMinutes: "00",
      durationDays: "0",
      reminders: [],
    }
  }

  const [formData, setFormData] = useState<NewTaskData>(getInitialFormData())

  useEffect(() => {
    setFormData(getInitialFormData())
  }, [editingTask])

  const hours = Array.from({ length: 13 }, (_, i) => (i + 8).toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  const updateField = <K extends keyof NewTaskData>(field: K, value: NewTaskData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      updateField("files", [...formData.files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    updateField("files", formData.files.filter((_, i) => i !== index))
  }

  const removeExistingFile = (index: number) => {
    updateField("existingFiles", (formData.existingFiles || []).filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setFormData({
      assignee: "שלי",
      title: "",
      dueDate: "",
      dueHour: "",
      dueMinute: "",
      files: [],
      notes: "",
      durationType: "hours",
      durationHours: "0",
      durationMinutes: "00",
      durationDays: "0",
      reminders: [],
    })
    onClose()
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    onSave(formData)
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent
        className="sm:max-w-md bg-white p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            {editingTask ? "עריכת משימה" : "משימה חדשה"} — {caseName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Assignee Toggle */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">שייך ל</Label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <button
                type="button"
                onClick={() => updateField("assignee", "שלי")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  formData.assignee === "שלי"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                שלי
              </button>
              <button
                type="button"
                onClick={() => updateField("assignee", "הצד השני")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  formData.assignee === "הצד השני"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                הצד השני
              </button>
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">פעולה</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="לדוגמה: הגשת כתב הגנה"
              className="bg-slate-50 border-slate-200 focus:bg-white text-right"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              מועד ביצוע <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Due Time */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              שעה <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <div className="flex gap-1 justify-end">
              <select
                value={formData.dueMinute}
                onChange={(e) => updateField("dueMinute", e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={formData.dueHour}
                onChange={(e) => updateField("dueHour", e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">--</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              קבצים מצורפים <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <div className="relative">
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="bg-slate-50 border-slate-200 focus:bg-white opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" className="text-sm">
                  בחר קבצים
                </Button>
                <span className="text-sm text-slate-400">
                  {formData.files.length > 0 ? `${formData.files.length} קבצים נבחרו` : "בחר קובץ"}
                </span>
              </div>
            </div>
            {(formData.existingFiles || []).length > 0 && (
              <div className="space-y-1 mt-2">
                {(formData.existingFiles || []).map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-1.5">
                    <button
                      type="button"
                      onClick={() => removeExistingFile(index)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600 truncate flex-1 text-right mr-2">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            {formData.files.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-1.5">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600 truncate flex-1 text-right mr-2">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              הערות <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="הוסף הערות למשימה..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Reminders */}
          {formData.assignee === "שלי" && formData.dueDate && (
            <ReminderSelector
              reminders={formData.reminders}
              onChange={(reminders) => updateField("reminders", reminders)}
            />
          )}

          {/* Estimated Duration */}
          {formData.assignee === "שלי" && (
            <div className="space-y-2">
              <Label className="text-sm text-slate-500 block text-right">
                משך משוער <span className="text-slate-400">(אופציונלי)</span>
              </Label>

              <div className="flex rounded-lg overflow-hidden border border-slate-200 w-fit ml-auto">
                <button
                  type="button"
                  onClick={() => updateField("durationType", "hours")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    formData.durationType === "hours"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  שעות
                </button>
                <button
                  type="button"
                  onClick={() => updateField("durationType", "days")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    formData.durationType === "days"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ימי עבודה
                </button>
              </div>

              {formData.durationType === "hours" ? (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-slate-500">ד'</span>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => updateField("durationMinutes", e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-500">שע'</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.durationHours}
                    onChange={(e) => updateField("durationHours", e.target.value)}
                    className="w-20 bg-slate-50 border-slate-200 text-center"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-slate-500">ימים</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.durationDays}
                    onChange={(e) => updateField("durationDays", e.target.value)}
                    className="w-20 bg-slate-50 border-slate-200 text-center"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3">
          <Button
            onClick={handleSubmit}
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
