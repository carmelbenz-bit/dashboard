"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, FileText, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface CaseFile {
  name: string
  url: string
}

export interface CaseForEdit {
  id: string
  name: string
  lawyer?: string
  caseNumber?: string
  clientName?: string
  phone?: string
  email?: string
  court?: string
  judge?: string
  notes?: string
  files?: CaseFile[]
}

interface AddCaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (caseData: NewCaseData) => void
  editingCase?: CaseForEdit | null
}

export interface NewCaseData {
  name: string
  lawyer?: string
  caseNumber?: string
  clientName?: string
  phone?: string
  email?: string
  court?: string
  judge?: string
  files?: CaseFile[]
  notes?: string
}

const initialFormData: NewCaseData = {
  name: "",
  lawyer: "",
  caseNumber: "",
  clientName: "",
  phone: "",
  email: "",
  court: "",
  judge: "",
  files: [],
  notes: "",
}

export function AddCaseModal({ isOpen, onClose, onSave, editingCase }: AddCaseModalProps) {
  const getInitialFormData = (): NewCaseData => {
    if (editingCase) {
      return {
        name: editingCase.name,
        lawyer: editingCase.lawyer || "",
        caseNumber: editingCase.caseNumber || "",
        clientName: editingCase.clientName || "",
        phone: editingCase.phone || "",
        email: editingCase.email || "",
        court: editingCase.court || "",
        judge: editingCase.judge || "",
        files: editingCase.files || [],
        notes: editingCase.notes || "",
      }
    }
    return initialFormData
  }

  const [formData, setFormData] = useState<NewCaseData>(getInitialFormData())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormData(getInitialFormData())
  }, [editingCase])

  const handleSave = () => {
    if (!formData.name.trim()) return
    onSave(formData)
    setFormData(initialFormData)
    onClose()
  }

  const handleClose = () => {
    setFormData(initialFormData)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles: CaseFile[] = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
      setFormData({ ...formData, files: [...(formData.files || []), ...newFiles] })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...(formData.files || [])]
    URL.revokeObjectURL(newFiles[index].url)
    newFiles.splice(index, 1)
    setFormData({ ...formData, files: newFiles })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            {editingCase ? "עריכת תיק" : "הוספת תיק חדש"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600 text-right">שם התיק</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="לדוגמה: כהן נ' לוי"
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              עו״ד / מתמחה מטפל <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              value={formData.lawyer}
              onChange={(e) => setFormData({ ...formData, lawyer: e.target.value })}
              placeholder="לדוגמה: עו״ד כהן"
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              מספר הליך <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              placeholder="לדוגמה: 12345-06-24"
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              שם לקוח <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              טלפון <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              מייל <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              בית משפט <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              placeholder="לדוגמה: בית משפט שלום תל אביב"
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              שופט/ת <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Input
              value={formData.judge}
              onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
              placeholder="לדוגמה: כב' השופטת ישראלי"
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              קבצים <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg gap-2"
                >
                  <Upload className="h-4 w-4" />
                  הוסף קובץ
                </Button>
              </div>

              {formData.files && formData.files.length > 0 && (
                <div className="space-y-1">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 py-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={file.url}
                          download={file.name}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                          title="הורד קובץ"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="הסר קובץ"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-500 text-right">
              הערות <span className="text-slate-400">(אופציונלי)</span>
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="text-right border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-slate-100 flex gap-3 justify-start">
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="bg-primary hover:bg-primary/90 text-white px-6 rounded-lg"
          >
            שמור
          </Button>
          <Button
            variant="secondary"
            onClick={handleClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 rounded-lg"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
