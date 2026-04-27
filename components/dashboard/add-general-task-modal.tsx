"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddGeneralTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, dueDate: string | null) => void
}

export function AddGeneralTaskModal({ isOpen, onClose, onSave }: AddGeneralTaskModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")

  const handleSave = () => {
    if (!title.trim()) return
    let formatted: string | null = null
    if (date) {
      const d = new Date(date)
      formatted = d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")
    }
    onSave(title.trim(), formatted)
    handleClose()
  }

  const handleClose = () => {
    setTitle("")
    setDate("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent
        className="sm:max-w-sm bg-white p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            משימה כללית חדשה
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">שם המשימה</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              placeholder="לדוגמה: שיחת טלפון עם לקוח..."
              className="bg-slate-50 border-slate-200 focus:bg-white text-right"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-500 block text-right">
              תאריך יעד <span className="text-slate-400">(אופציונלי)</span>
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
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
