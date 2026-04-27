"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Briefcase, FolderOpen } from "lucide-react"

interface CaseOption {
  id: string
  name: string
  court: string
  client: string
}

interface PickCaseModalProps {
  isOpen: boolean
  onClose: () => void
  cases: CaseOption[]
  onSelectCase: (caseId: string, caseName: string) => void
  onSelectGeneral: () => void
}

export function PickCaseModal({ isOpen, onClose, cases, onSelectCase, onSelectGeneral }: PickCaseModalProps) {
  const [search, setSearch] = useState("")

  const filtered = cases.filter((c) =>
    c.name.includes(search) || c.court.includes(search) || c.client.includes(search)
  )

  const handleSelectCase = (c: CaseOption) => {
    onSelectCase(c.id, c.name)
    setSearch("")
    onClose()
  }

  const handleSelectGeneral = () => {
    onSelectGeneral()
    setSearch("")
    onClose()
  }

  const handleClose = () => {
    setSearch("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md bg-white p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-slate-800 text-center">
            בחר תיק להוספת משימה
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש תיק..."
              className="pr-9 text-right bg-slate-50 border-slate-200"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <button
            onClick={handleSelectGeneral}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-right border-b border-slate-100"
          >
            <FolderOpen className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800">משימות כלליות</div>
              <div className="text-xs text-slate-400">משימה לא קשורה לתיק ספציפי</div>
            </div>
          </button>

          {filtered.length > 0 && (
            <div className="px-6 py-2 text-xs text-slate-400 text-center border-b border-slate-100">
              או בחר תיק
            </div>
          )}

          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-right border-b border-slate-100 last:border-0"
            >
              <Briefcase className="h-5 w-5 text-primary/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-400">
                  {[c.client, c.court].filter(Boolean).join(" • ")}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
