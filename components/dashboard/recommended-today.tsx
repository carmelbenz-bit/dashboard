"use client"

import { useState, useEffect } from "react"
import { Sparkles, Clock, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendedTask {
  id: string
  title: string
  caseName: string
  urgency: "overdue" | "soon" | "normal" | "none"
  daysRemaining: number | null
  estimatedMinutes: number
  priorityScore: number
}

interface RecommendedTodayProps {
  tasks: RecommendedTask[]
  freeTime: string
  meetingsTime: string
  onEditTask: (taskId: string) => void
  onCompleteTask: (taskId: string, completed: boolean) => void
}

function getUrgencyLabel(daysRemaining: number | null, urgency: string): { text: string; className: string } {
  if (urgency === "overdue" || (daysRemaining !== null && daysRemaining < 0)) {
    return { text: "באיחור", className: "bg-red-100 text-red-700 border-red-200" }
  }
  if (daysRemaining === null) {
    return { text: "", className: "" }
  }
  if (daysRemaining === 0) {
    return { text: "היום", className: "bg-red-100 text-red-700 border-red-200" }
  }
  if (daysRemaining === 1) {
    return { text: "מחר", className: "bg-orange-100 text-orange-700 border-orange-200" }
  }
  if (daysRemaining <= 7) {
    return { text: `${daysRemaining} ימים`, className: "bg-amber-100 text-amber-700 border-amber-200" }
  }
  return { text: `${daysRemaining} ימים`, className: "bg-slate-100 text-slate-600 border-slate-200" }
}

export function RecommendedToday({ tasks, freeTime, meetingsTime, onEditTask, onCompleteTask }: RecommendedTodayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [orderedIds, setOrderedIds] = useState<string[]>(() => tasks.map(t => t.id))

  useEffect(() => {
    setOrderedIds(tasks.map(t => t.id))
  }, [tasks.map(t => t.id).join(",")])

  const orderedTasks = orderedIds
    .map(id => tasks.find(t => t.id === id))
    .filter(Boolean) as RecommendedTask[]

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...orderedIds]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setOrderedIds(next)
  }

  const moveDown = (index: number) => {
    if (index === orderedIds.length - 1) return
    const next = [...orderedIds]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setOrderedIds(next)
  }

  return (
    <div className="bg-white rounded-2xl border border-t-4 border-t-primary border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">מומלץ להיום</span>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>זמן פנוי: {freeTime}</span>
          <span className="text-slate-400">({meetingsTime})</span>
        </div>
      </div>

      {!isCollapsed && <div className="divide-y divide-slate-100">
        {orderedTasks.map((task, index) => {
          const urgencyLabel = getUrgencyLabel(task.daysRemaining, task.urgency)
          return (
            <div
              key={task.id}
              className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="text-slate-300 hover:text-slate-500 disabled:opacity-0 leading-none"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === orderedTasks.length - 1}
                    className="text-slate-300 hover:text-slate-500 disabled:opacity-0 leading-none"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => onCompleteTask(task.id, true)}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-400 flex items-center justify-center flex-shrink-0 transition-colors"
                />
                <button
                  onClick={() => onEditTask(task.id)}
                  className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-right"
                >
                  <span className="font-bold">{task.caseName}</span> — {task.title}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {urgencyLabel.text && (
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border",
                    urgencyLabel.className
                  )}>
                    {urgencyLabel.text}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="px-5 py-8 text-center text-slate-400">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>אין משימות מומלצות להיום</p>
          </div>
        )}
      </div>}
    </div>
  )
}
