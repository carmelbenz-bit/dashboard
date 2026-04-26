"use client"

import { useState, useRef } from "react"
import { ChevronUp, ChevronDown, Plus, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GeneralTask {
  id: string
  title: string
  dueDate: string | null
  completed: boolean
}

interface GeneralTasksSectionProps {
  tasks: GeneralTask[]
  onAdd: (title: string, dueDate: string | null) => void
  onComplete: (taskId: string) => void
}

function getDaysInfo(dueDate: string | null): { label: string; badgeClass: string; borderClass: string } {
  if (!dueDate) return { label: "", badgeClass: "", borderClass: "border-l-slate-200" }
  const [day, month, year] = dueDate.split(".").map(Number)
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) return { label: `${Math.abs(days)} ימים`, badgeClass: "bg-red-50 text-red-600", borderClass: "border-l-red-500" }
  if (days === 0) return { label: "היום", badgeClass: "bg-red-50 text-red-600", borderClass: "border-l-red-500" }
  if (days === 1) return { label: "מחר", badgeClass: "bg-orange-50 text-orange-600", borderClass: "border-l-orange-400" }
  if (days <= 7) return { label: `${days} ימים`, badgeClass: "bg-amber-50 text-amber-600", borderClass: "border-l-amber-400" }
  return { label: `${days} ימים`, badgeClass: "bg-green-50 text-green-600", borderClass: "border-l-green-500" }
}

export function GeneralTasksSection({ tasks, onAdd, onComplete }: GeneralTasksSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTasks = tasks.filter((t) => !t.completed)

  const openAddForm = () => {
    setIsAdding(true)
    setIsCollapsed(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSubmit = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) { cancelAdd(); return }
    let formatted: string | null = null
    if (newDate) {
      const d = new Date(newDate)
      formatted = d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")
    }
    onAdd(trimmed, formatted)
    setNewTitle("")
    setNewDate("")
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setNewTitle("")
    setNewDate("")
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-700 text-white">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 font-semibold hover:text-slate-200 transition-colors"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <span>משימות כלליות</span>
          {activeTasks.length > 0 && (
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
              {activeTasks.length}
            </span>
          )}
        </button>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>הוסף משימה</span>
        </button>
      </div>

      {!isCollapsed && (
        <div>
          <div className="divide-y divide-slate-100">
            {activeTasks.map((task) => {
              const { label, badgeClass, borderClass } = getDaysInfo(task.dueDate)
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors border-l-4",
                    borderClass
                  )}
                >
                  {/* Right: checkbox + title */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onComplete(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-400 flex-shrink-0 transition-colors"
                    />
                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                  </div>
                  {/* Left: days badge */}
                  {label && (
                    <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", badgeClass)}>
                      <Clock className="h-3 w-3" />
                      {label}
                    </span>
                  )}
                </div>
              )
            })}

            {activeTasks.length === 0 && !isAdding && (
              <div className="px-5 py-6 text-center text-slate-400 text-sm">
                אין משימות כלליות
              </div>
            )}
          </div>

          {/* Inline add form */}
          {isAdding && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="text-sm text-primary font-medium hover:text-primary/80 transition-colors whitespace-nowrap"
              >
                שמור
              </button>
              <button
                onClick={cancelAdd}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
              >
                ביטול
              </button>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 bg-white"
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="שם המשימה..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                  if (e.key === "Escape") cancelAdd()
                }}
                className="flex-1 text-sm border border-slate-200 rounded-md px-3 py-1.5 text-right bg-white min-w-0"
                dir="rtl"
              />
            </div>
          )}

          {/* Footer add button */}
          {!isAdding && (
            <div className="px-5 py-2.5 border-t border-slate-100 flex justify-start">
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>משימה</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
