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

export interface NewHearingData {
  date: string
  hour: string
  minute: string
  court: string
  judge: string
  materials: string
}

export interface HearingForEdit {
  index: number
  date: string
  time: string
  court?: string
  notes?: string
}

interface AddHearingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: NewHearingData) => void
  caseName: string
  editingHearing?: HearingForEdit | null
}

export function AddHearingModal({ isOpen, onClose, onSave, caseName, editingHearing }: AddHearingModalProps) {
  const getInitialFormData = (): NewHearingData => {
    if (editingHearing) {
      const [hour, minute] = editingHearing.time?.split(":") || ["", "00"]
      let dateForInput = ""
      if (editingHearing.date) {
        const [day, month, year] = editingHearing.date.split(".")
        dateForInput = `${year}-${month}-${day}`
      }
      return { date: dateForInput, hour, minute: minute || "00", court: editingHearing.court || "", judge: "", materials: editingHearing.notes || "" }
    }
    return { date: "", hour: "", minute: "00", court: "", judge: "", materials: "" }
  }

  const [formData, setFormData] = useState<NewHearingData>(getInitialFormData)

  useEffect(() => {
    setFormData(getInitialFormData())
  }, [editingHearing])

  const handleClose = () => {
    setFormData({ date: "", hour: "", minute: "00", court: "", judge: "", materials: "" })
    onClose()
  }

  const handleSave = () => {
    onSave(formData)
    handleClose()
  }

  const updateField = (field: keyof NewHearingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const hours = Array.from({ length: 13 }, (_, i) => (i + 8).toString().padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            {editingHearing ? "עריכת דיון" : "דיון חדש"} — {caseName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <span className="text-sm font-medium text-slate-700">פרטי דיון</span>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">תאריך דיון</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="text-right bg-slate-50 border-slate-200 focus:bg-white"
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
              שם בית משפט <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              value={formData.court}
              onChange={(e) => updateField("court", e.target.value)}
              placeholder="לדוגמה: בית משפט שלום תל אביב"
              className="text-right bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              שם השופט/ת <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              value={formData.judge}
              onChange={(e) => updateField("judge", e.target.value)}
              placeholder="לדוגמה: כב' השופטת ישראלי"
              className="text-right bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              חומרים ומסמכים להכין <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Textarea
              value={formData.materials}
              onChange={(e) => updateField("materials", e.target.value)}
              placeholder="לדוגמה: תצהיר עדות ראשית, חוות דעת מומחה, מסמכי בנק..."
              className="text-right bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white px-8">
            שמור
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-8 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
