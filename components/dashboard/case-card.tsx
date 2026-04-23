"use client"

import {
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Building2,
  Plus,
  Pencil,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  ExternalLink,
  Download,
  Paperclip,
  Tag,
  Gavel
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface TaskFile {
  name: string
  url: string
}

export interface Task {
  id: string
  title: string
  dueDate: string | null
  urgency: "overdue" | "soon" | "normal" | "none"
  daysInfo: string
  tags: string[]
  assignee?: string
  attachment?: string
  files?: TaskFile[]
  notes?: string
  completed?: boolean
  estimatedDuration?: string
}

export interface Hearing {
  date: string
  time: string
  court?: string
  notes?: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  time: string
  location?: string
  notes?: string
  link?: string
  completed?: boolean
}

export interface CaseFile {
  name: string
  url: string
}

export interface CaseData {
  id: string
  name: string
  hearings: Hearing[]
  meetings?: Meeting[]
  court: string
  client: string
  lawyer: string
  judge?: string
  tasks: Task[]
  files?: CaseFile[]
  notes?: string
  status?: string
}

interface CaseCardProps {
  caseData: CaseData
  onEditTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string, completed: boolean) => void
  onAddTask: () => void
  onDeleteCase: () => void
  onAddHearing: () => void
  onEditHearing?: (hearingIndex: number) => void
  onDeleteHearing?: (hearingIndex: number) => void
  onAddMeeting: () => void
  onEditMeeting?: (meetingId: string) => void
  onDeleteMeeting?: (meetingId: string) => void
  onCompleteMeeting?: (meetingId: string, completed: boolean) => void
  onEditCase: () => void
  onUpdateStatus?: (status: string) => void
}

function UrgencyBadge({ urgency, daysInfo }: { urgency: Task["urgency"], daysInfo: string }) {
  if (urgency === "none" || !daysInfo) {
    return <span className="text-xs text-muted-foreground/60">ללא מועד</span>
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
        urgency === "overdue" && "bg-red-100 text-red-800",
        urgency === "soon" && "bg-amber-100 text-amber-800",
        urgency === "normal" && "bg-emerald-100 text-emerald-800"
      )}
    >
      {urgency === "overdue" && <AlertCircle className="h-3.5 w-3.5" />}
      {urgency === "soon" && <Clock className="h-3.5 w-3.5" />}
      {urgency === "normal" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {daysInfo}
    </div>
  )
}

function AssigneeBadge({ assignee }: { assignee: "שלי" | "הצד השני" }) {
  const isMe = assignee === "שלי"

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
      isMe
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-slate-100 text-slate-600 border border-slate-200"
    )}>
      <User className="h-3 w-3" />
      {assignee}
    </div>
  )
}

function TaskTag({ tag }: { tag: string }) {
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "בדיקה":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "ניסיון":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-secondary text-secondary-foreground border-border"
    }
  }

  return (
    <Badge variant="outline" className={cn("text-xs", getTagStyle(tag))}>
      {tag}
    </Badge>
  )
}

function HearingsDisplay({ hearings, onEditHearing, onDeleteHearing }: {
  hearings: Hearing[]
  onEditHearing?: (index: number) => void
  onDeleteHearing?: (index: number) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (hearings.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-1.5">
        <Calendar className="h-3.5 w-3.5 text-sidebar-foreground/60" />
        <span className="text-sm text-sidebar-foreground/60">אין דיונים קבועים</span>
      </div>
    )
  }

  const sortedHearings = [...hearings].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split(".").map(Number)
    const [dayB, monthB, yearB] = b.date.split(".").map(Number)
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
  })
  const nextHearing = sortedHearings[0]
  const hasMoreHearings = sortedHearings.length > 1

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-1.5">
        <Calendar className="h-3.5 w-3.5 text-sidebar-foreground/60" />
        <span className="text-xs text-sidebar-foreground/60">דיון קרוב:</span>
        <span className="text-sm font-medium text-sidebar-foreground">{nextHearing.date}</span>
        <span className="text-sidebar-foreground/40 mx-1">|</span>
        <Clock className="h-3.5 w-3.5 text-sidebar-foreground/60" />
        <span className="text-sm font-medium text-sidebar-foreground">{nextHearing.time}</span>
        <button onClick={() => onEditHearing?.(hearings.indexOf(sortedHearings[0]))} className="p-0.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors mr-1">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={() => onDeleteHearing?.(hearings.indexOf(sortedHearings[0]))} className="p-0.5 text-sidebar-foreground/40 hover:text-red-400 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {hasMoreHearings && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 hover:text-amber-100"
            >
              +{sortedHearings.length - 1} דיונים נוספים
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b border-border bg-muted/50">
              <h4 className="font-semibold text-sm">כל הדיונים בתיק</h4>
            </div>
            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {sortedHearings.map((hearing, sortedIndex) => {
                const originalIndex = hearings.indexOf(hearing)
                return (
                <div
                  key={sortedIndex}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm",
                    sortedIndex === 0 ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <button onClick={() => { onEditHearing?.(originalIndex); setIsOpen(false) }} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { onDeleteHearing?.(originalIndex); setIsOpen(false) }} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{hearing.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{hearing.date}</span>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export function CaseCard({ caseData, onEditTask, onDeleteTask, onCompleteTask, onAddTask, onDeleteCase, onAddHearing, onEditHearing, onDeleteHearing, onAddMeeting, onEditMeeting, onDeleteMeeting, onCompleteMeeting, onEditCase, onUpdateStatus }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [statusInput, setStatusInput] = useState(caseData.status || "")
  const [statusOpen, setStatusOpen] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Case Header */}
      <div className="bg-sidebar p-4">
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mt-0.5 flex-shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            {/* Top row: name + actions */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-base sm:text-lg font-semibold text-sidebar-foreground flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={onEditCase}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                {caseData.name}
              </h3>

              <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                {caseData.files && caseData.files.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-1.5"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="text-xs">{caseData.files.length}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-2" dir="rtl">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-600 px-2 py-1">קבצים מצורפים</div>
                        {caseData.files.map((file, index) => (
                          <a
                            key={index}
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors group"
                          >
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                            <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Hearings: desktop only (right side) */}
                <div className="hidden sm:flex">
                  <HearingsDisplay hearings={caseData.hearings} onEditHearing={onEditHearing} onDeleteHearing={onDeleteHearing} />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-right text-red-600">מחיקת תיק</AlertDialogTitle>
                      <AlertDialogDescription className="text-right">
                        האם אתה בטוח שברצונך למחוק את התיק <span className="font-semibold text-foreground">{caseData.name}</span>?
                        <br />
                        פעולה זו תמחק את כל המשימות, הפגישות והדיונים בתיק ולא ניתן לשחזר אותם.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-start">
                      <AlertDialogCancel className="m-0">ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={onDeleteCase} className="m-0 bg-red-600 hover:bg-red-700 text-white">
                        מחק תיק
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {caseData.notes && (
              <p className="text-sm text-sidebar-foreground/50 mt-0.5 font-normal">{caseData.notes}</p>
            )}
            {caseData.status && (
              <p className="text-sm text-sidebar-foreground/60 mt-0.5 font-normal italic">{caseData.status}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-sidebar-foreground/70">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {caseData.court}
              </span>
              {caseData.judge && (
                <span className="flex items-center gap-1">
                  <Gavel className="h-4 w-4" />
                  {caseData.judge}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-primary-foreground/90">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">{caseData.lawyer}</span>
              </span>
            </div>

            {/* Hearings: mobile only (below case info) */}
            <div className="sm:hidden mt-2">
              <HearingsDisplay hearings={caseData.hearings} onEditHearing={onEditHearing} onDeleteHearing={onDeleteHearing} />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {isExpanded && (
        <div className="p-5">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 rounded-t-lg border border-b-0 border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-4">משימה</div>
            <div className="col-span-2 text-center">אחראי</div>
            <div className="col-span-2 text-center">מועד ביצוע</div>
            <div className="col-span-2 text-center">סטטוס</div>
            <div className="col-span-2 text-center">פעולות</div>
          </div>

          <div className="border border-slate-200 rounded-lg sm:rounded-t-none sm:rounded-b-lg overflow-hidden">
            {caseData.tasks.map((task, index) => {
              const assigneeTag = task.tags.find(t => t === "שלי" || t === "הצד השני")
              const otherTags = task.tags.filter(t => t !== "שלי" && t !== "הצד השני")
              const isOverdue = task.urgency === "overdue"
              const isSoon = task.urgency === "soon"

              const checkboxButton = (
                <button
                  onClick={() => onCompleteTask(task.id, !task.completed)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-emerald-400"
                  )}
                >
                  {task.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              )
              const colorBar = (
                <div className={cn(
                  "w-1 rounded-full flex-shrink-0",
                  task.completed && "bg-slate-300",
                  !task.completed && isOverdue && "bg-red-500",
                  !task.completed && isSoon && "bg-amber-400",
                  !task.completed && task.urgency === "normal" && "bg-emerald-500",
                  !task.completed && task.urgency === "none" && "bg-slate-300"
                )} />
              )

              return (
                <div
                  key={task.id}
                  className={cn(
                    "transition-colors",
                    index !== caseData.tasks.length - 1 && "border-b border-slate-100",
                    isOverdue && "bg-red-50/50",
                    isSoon && !isOverdue && "bg-amber-50/30",
                    !isOverdue && !isSoon && "bg-white hover:bg-slate-50/50"
                  )}
                >
                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      {checkboxButton}
                      <div className="h-10">{colorBar}</div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <button
                          onClick={() => onEditTask(task.id)}
                          className={cn(
                            "font-medium text-sm hover:text-primary hover:underline transition-colors text-right",
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {task.title}
                        </button>
                        {task.notes && <span className="text-xs text-muted-foreground">{task.notes}</span>}
                        {task.files && task.files.length > 0 && (
                          <div className="flex flex-col gap-0.5 mt-1">
                            {task.files.map((file, fileIndex) => (
                              <a key={fileIndex} href={file.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 hover:underline flex items-center gap-1">
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                        {task.attachment && !task.files && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{task.attachment}</span>
                          </span>
                        )}
                        {otherTags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {otherTags.map((tag) => <TaskTag key={tag} tag={tag} />)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {assigneeTag ? <AssigneeBadge assignee={assigneeTag as "שלי" | "הצד השני"} /> : <span className="text-xs text-muted-foreground/50">—</span>}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={cn("text-sm", task.dueDate ? "text-foreground" : "text-muted-foreground/50")}>
                        {task.dueDate || "—"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <UrgencyBadge urgency={task.urgency} daysInfo={task.daysInfo} />
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => onEditTask(task.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="sm:hidden flex items-start gap-2 px-3 py-3">
                    <div className="mt-1">{checkboxButton}</div>
                    <div className="h-auto self-stretch w-1 my-0.5">{colorBar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <button
                          onClick={() => onEditTask(task.id)}
                          className={cn(
                            "font-medium text-sm text-right leading-snug",
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {task.title}
                        </button>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10" onClick={() => onEditTask(task.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteTask(task.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                        {assigneeTag && <AssigneeBadge assignee={assigneeTag as "שלי" | "הצד השני"} />}
                        {task.dueDate && <span className="text-xs text-slate-400">{task.dueDate}</span>}
                        {task.urgency !== "none" && task.daysInfo && <UrgencyBadge urgency={task.urgency} daysInfo={task.daysInfo} />}
                      </div>
                      {task.notes && <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {caseData.meetings && caseData.meetings.length > 0 && (
            <div className="mt-4 space-y-2">
              {caseData.meetings.map((meeting) => {
                const getMeetingUrgency = () => {
                  if (!meeting.date) return { urgency: "none" as const, daysInfo: "" }
                  const [day, month, year] = meeting.date.split(".")
                  const meetingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const diffDays = Math.ceil((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  if (diffDays < 0) return { urgency: "overdue" as const, daysInfo: `איחור ${Math.abs(diffDays)} ימים` }
                  if (diffDays <= 7) return { urgency: "soon" as const, daysInfo: `עוד ${diffDays} ימים` }
                  return { urgency: "normal" as const, daysInfo: `עוד ${diffDays} ימים` }
                }
                const { urgency, daysInfo } = getMeetingUrgency()

                const meetingCheckbox = (
                  <button
                    onClick={() => onCompleteMeeting?.(meeting.id, !meeting.completed)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      meeting.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-purple-300 hover:border-emerald-400"
                    )}
                  >
                    {meeting.completed && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                )
                return (
                  <div key={meeting.id} className="bg-purple-50 border border-purple-100 rounded-lg mt-2 overflow-hidden">
                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        {meetingCheckbox}
                        <div className={cn("w-1 h-10 rounded-full flex-shrink-0", meeting.completed ? "bg-slate-300" : "bg-purple-400")} />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", meeting.completed ? "text-slate-500 bg-slate-100" : "text-purple-600 bg-purple-100")}>פגישה</span>
                            <span className={cn("text-sm font-medium", meeting.completed ? "text-slate-400 line-through" : "text-slate-700")}>{meeting.title}</span>
                          </div>
                          {meeting.notes && <span className="text-xs text-muted-foreground mr-1">{meeting.notes}</span>}
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {meeting.link && (
                          <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700">
                            <ExternalLink className="h-3.5 w-3.5" />קישור
                          </a>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-foreground">{meeting.date || "—"}</span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <UrgencyBadge urgency={urgency} daysInfo={daysInfo} />
                      </div>
                      <div className="col-span-2 flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-purple-600 hover:bg-purple-100" onClick={() => onEditMeeting?.(meeting.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteMeeting?.(meeting.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden flex items-start gap-2 px-3 py-3">
                      <div className="mt-1">{meetingCheckbox}</div>
                      <div className={cn("w-1 self-stretch rounded-full flex-shrink-0 my-0.5", meeting.completed ? "bg-slate-300" : "bg-purple-400")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0", meeting.completed ? "text-slate-500 bg-slate-100" : "text-purple-600 bg-purple-100")}>פגישה</span>
                            <span className={cn("text-sm font-medium", meeting.completed ? "text-slate-400 line-through" : "text-slate-700")}>{meeting.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-100" onClick={() => onEditMeeting?.(meeting.id)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteMeeting?.(meeting.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                          {meeting.date && <span className="text-xs text-slate-500">{meeting.date}</span>}
                          <UrgencyBadge urgency={urgency} daysInfo={daysInfo} />
                          {meeting.link && (
                            <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-600">
                              <ExternalLink className="h-3 w-3" />קישור
                            </a>
                          )}
                        </div>
                        {meeting.notes && <p className="text-xs text-muted-foreground mt-1">{meeting.notes}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-500 hover:text-primary hover:bg-primary/5"
              onClick={onAddTask}
            >
              <Plus className="h-4 w-4" />
              משימה
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
              onClick={onAddMeeting}
            >
              <Plus className="h-4 w-4" />
              פגישה
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-500 hover:text-primary hover:bg-primary/5"
              onClick={onAddHearing}
            >
              <Plus className="h-4 w-4" />
              דיון
            </Button>
            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                >
                  <Tag className="h-4 w-4" />
                  סטטוס
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start" dir="rtl">
                <p className="text-sm font-medium text-slate-700 mb-2">סטטוס תיק</p>
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onUpdateStatus?.(statusInput)
                      setStatusOpen(false)
                    }
                  }}
                  placeholder="לדוגמה: ממתין למתן פסק דין"
                  className="w-full text-sm text-right bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => { onUpdateStatus?.(statusInput); setStatusOpen(false) }}
                  >
                    שמור
                  </Button>
                  {caseData.status && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => { setStatusInput(""); onUpdateStatus?.(""); setStatusOpen(false) }}
                    >
                      נקה
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  )
}
