"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/dashboard/header"
import { NavigationTabs } from "@/components/dashboard/navigation-tabs"
import { StatCards, type TaskFilter } from "@/components/dashboard/stat-cards"
import { RecommendedToday } from "@/components/dashboard/recommended-today"
import { GeneralTasksSection, type GeneralTask } from "@/components/dashboard/general-tasks"
import { SearchBar, type TaskFilterOption, type SortOption } from "@/components/dashboard/search-bar"
import { DateGroup } from "@/components/dashboard/date-group"
import { HearingsBoard } from "@/components/dashboard/hearings-board"
import { MeetingsBoard } from "@/components/dashboard/meetings-board"
import { DeadlinesBoard } from "@/components/dashboard/deadlines-board"
import { DatesBoard } from "@/components/dashboard/dates-board"
import { AddCaseModal, type NewCaseData, type CaseForEdit } from "@/components/dashboard/add-case-modal"
import { AddHearingModal, type NewHearingData, type HearingForEdit } from "@/components/dashboard/add-hearing-modal"
import { AddMeetingModal, type NewMeetingData, type MeetingForEdit } from "@/components/dashboard/add-meeting-modal"
import { AddTaskModal, type NewTaskData, type TaskForEdit } from "@/components/dashboard/add-task-modal"
import { AuthGuard } from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"
import type { CaseData } from "@/components/dashboard/case-card"

// Sample data
const initialCases: Record<string, CaseData[]> = {
  "07.05.2026": [
    {
      id: "1",
      name: "בן דוד",
      hearings: [
        { date: "07.05.2026", time: "09:30" },
        { date: "14.05.2026", time: "11:00" },
        { date: "28.05.2026", time: "14:30" },
      ],
      court: "מחוזי ת\"א",
      client: "סמית'",
      lawyer: "לירי קרן",
      tasks: [
        {
          id: "t1",
          title: "ניסיון",
          dueDate: "07.04.2026",
          urgency: "overdue",
          daysInfo: "איחור 12 ימים",
          tags: ["שלי", "ניסיון"],
        },
        {
          id: "t2",
          title: "להגיש בקשה לאיסור פרסום",
          dueDate: "28.04.2026",
          urgency: "normal",
          daysInfo: "9 ימים",
          tags: ["שלי"],
        },
        {
          id: "t3",
          title: "בדיקה בדיקה",
          dueDate: "06.05.2026",
          urgency: "soon",
          daysInfo: "מועד הצד השני",
          tags: ["הצד השני", "בדיקה"],
        },
        {
          id: "t4",
          title: "עגכעגכ",
          dueDate: null,
          urgency: "none",
          daysInfo: "",
          tags: ["שלי"],
          attachment: "טיוטת תצהיר אירים בן דוד- איסור פרסום.doc",
        },
      ],
    },
    {
      id: "2",
      name: "בג\"ץ הפועל",
      hearings: [
        { date: "07.05.2026", time: "14:00" },
      ],
      court: "בג\"ץ",
      client: "הפועל ת\"א",
      lawyer: "לירי קרן",
      tasks: [
        {
          id: "t5",
          title: "בדיקה בדיקה",
          dueDate: "21.04.2026",
          urgency: "soon",
          daysInfo: "2 ימים",
          tags: ["שלי", "בדיקה"],
        },
        {
          id: "t6",
          title: "להגיש תגובה על הוצאות",
          dueDate: "22.04.2026",
          urgency: "soon",
          daysInfo: "מועד הצד השני",
          tags: ["הצד השני"],
        },
      ],
    },
  ],
  "02.05.2026": [
    {
      id: "3",
      name: "תיק אזרחי כהן",
      hearings: [
        { date: "02.05.2026", time: "10:00" },
        { date: "15.05.2026", time: "09:00" },
      ],
      court: "שלום ת\"א",
      client: "כהן דוד",
      lawyer: "לירי קרן",
      tasks: [
        {
          id: "t7",
          title: "הכנת סיכומים",
          dueDate: "25.04.2026",
          urgency: "normal",
          daysInfo: "6 ימים",
          tags: ["שלי"],
        },
        {
          id: "t8",
          title: "תיאום עדים",
          dueDate: "28.04.2026",
          urgency: "normal",
          daysInfo: "9 ימים",
          tags: ["שלי"],
        },
      ],
    },
  ],
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilterOption, setSearchFilterOption] = useState<TaskFilterOption>("all")
  const [sortOption, setSortOption] = useState<SortOption>("dateAsc")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<Record<string, CaseData[]>>({ all: [] })
  const syncTimeout = useRef<ReturnType<typeof setTimeout>>()
  const dbReady = useRef(false)

  const rowToCase = (row: Record<string, unknown>): CaseData => ({
    id: row.id as string,
    name: row.name as string,
    court: (row.court as string) || "",
    client: (row.client as string) || "",
    lawyer: (row.lawyer as string) || "",
    judge: row.judge as string | undefined,
    notes: row.notes as string | undefined,
    status: row.status as string | undefined,
    hearings: (row.hearings as CaseData["hearings"]) || [],
    tasks: (row.tasks as CaseData["tasks"]) || [],
    meetings: (row.meetings as CaseData["meetings"]) || [],
    files: (row.files as CaseData["files"]) || [],
  })

  const caseToRow = (c: CaseData, uid: string) => ({
    id: c.id,
    user_id: uid,
    name: c.name,
    court: c.court,
    client: c.client,
    lawyer: c.lawyer,
    judge: c.judge,
    notes: c.notes,
    status: c.status,
    hearings: c.hearings,
    tasks: c.tasks,
    meetings: c.meetings || [],
    files: (c.files || []).filter(f => !f.url?.startsWith("blob:")),
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id
        setUserId(uid)
        const { data } = await supabase.from("cases").select("*").order("created_at", { ascending: true })
        if (data && data.length > 0) {
          setCases({ all: data.map(rowToCase) })
        } else {
          // migrate from localStorage if Supabase is empty
          try {
            const saved = localStorage.getItem(`dashboard-cases-${uid}`)
            if (saved) {
              const local: Record<string, CaseData[]> = JSON.parse(saved)
              const allLocal = Object.values(local).flat()
              if (allLocal.length > 0) {
                setCases({ all: allLocal })
                for (const c of allLocal) {
                  await supabase.from("cases").upsert(caseToRow(c, uid))
                }
              }
            }
          } catch {}
        }
        dbReady.current = true
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!userId || !dbReady.current) return
    clearTimeout(syncTimeout.current)
    syncTimeout.current = setTimeout(() => {
      const allCases = Object.values(cases).flat()
      allCases.forEach(c => supabase.from("cases").upsert(caseToRow(c, userId)).then())
    }, 800)
    return () => clearTimeout(syncTimeout.current)
  }, [cases, userId])
  const [activeTab, setActiveTab] = useState("cases")
  const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false)
  const [isAddHearingModalOpen, setIsAddHearingModalOpen] = useState(false)
  const [selectedCaseForHearing, setSelectedCaseForHearing] = useState<{ id: string; name: string } | null>(null)
  const [editingHearing, setEditingHearing] = useState<HearingForEdit | null>(null)
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false)
  const [selectedCaseForMeeting, setSelectedCaseForMeeting] = useState<{ id: string; name: string } | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<MeetingForEdit | null>(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [selectedCaseForTask, setSelectedCaseForTask] = useState<{ id: string; name: string } | null>(null)
  const [editingTask, setEditingTask] = useState<TaskForEdit | null>(null)
  const [editingCase, setEditingCase] = useState<CaseForEdit | null>(null)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all")
  const [generalTasks, setGeneralTasks] = useState<GeneralTask[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("general-tasks") : null
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const allCases = Object.values(cases).flat()
  const allTasks = allCases.flatMap((c) => c.tasks)

  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false
    const [day, month, year] = dateStr.split(".").map(Number)
    const taskDate = new Date(year, month - 1, day)
    const today = new Date()
    return taskDate.toDateString() === today.toDateString()
  }

  const isThisWeek = (dateStr: string | null) => {
    if (!dateStr) return false
    const [day, month, year] = dateStr.split(".").map(Number)
    const taskDate = new Date(year, month - 1, day)
    const today = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(today.getDate() + 7)
    return taskDate >= today && taskDate <= weekFromNow
  }

  const stats = {
    openCases: allCases.length,
    todayTasks: allTasks.filter((t) => isToday(t.dueDate)).length,
    thisWeekTasks: allTasks.filter((t) => isThisWeek(t.dueDate)).length,
    overdueTasks: allTasks.filter((t) => t.urgency === "overdue").length,
  }

  const getDaysRemaining = (dueDate: string | null): number | null => {
    if (!dueDate) return null
    const [day, month, year] = dueDate.split(".").map(Number)
    const due = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getTodayMeetingMinutes = (): number => {
    let totalMinutes = 0
    allCases.forEach(c => {
      c.hearings.forEach(h => {
        if (isToday(h.date)) totalMinutes += 60
      })
      c.meetings?.forEach(m => {
        if (isToday(m.date)) totalMinutes += 30
      })
    })
    return totalMinutes
  }

  const calculatePriorityScore = (task: typeof allTasks[0]): number => {
    const daysRemaining = getDaysRemaining(task.dueDate)
    if (task.urgency === "overdue") return 1000
    if (daysRemaining === null) return 0
    const estimatedDays = 60 / 60 / 8
    const bufferDays = daysRemaining - estimatedDays
    if (bufferDays <= 0) return 900 + (100 - daysRemaining)
    if (bufferDays <= 1) return 700 + (100 - daysRemaining)
    if (bufferDays <= 2) return 500 + (100 - daysRemaining)
    if (bufferDays <= 3) return 300 + (100 - daysRemaining)
    return Math.max(0, 100 - daysRemaining * 10)
  }

  const toRecommendedTask = (t: typeof allTasks[0], pinned = false) => {
    const parentCase = allCases.find((c) => c.tasks.some((task) => task.id === t.id))
    return {
      id: t.id,
      title: t.title,
      caseName: parentCase?.name || "",
      urgency: t.urgency,
      daysRemaining: getDaysRemaining(t.dueDate),
      estimatedMinutes: 60,
      priorityScore: pinned ? 9999 : calculatePriorityScore(t),
      pinned,
    }
  }

  const pinnedRecommended = [
    ...allTasks
      .filter((t) => !t.completed && t.pinned)
      .map((t) => toRecommendedTask(t, true)),
    ...generalTasks
      .filter((t) => !t.completed && t.pinned)
      .map((t) => ({
        id: t.id,
        title: t.title,
        caseName: "משימות כלליות",
        urgency: "none" as const,
        daysRemaining: getDaysRemaining(t.dueDate),
        estimatedMinutes: 60,
        priorityScore: 9999,
        pinned: true,
      })),
  ]

  const pinnedIds = new Set(pinnedRecommended.map((t) => t.id))

  const algorithmRecommended = allTasks
    .filter((t) => !t.completed && !pinnedIds.has(t.id) && t.tags.includes("שלי") && (t.dueDate !== null || t.urgency === "overdue"))
    .map((t) => toRecommendedTask(t, false))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, Math.max(0, 5 - pinnedRecommended.length))

  const recommendedTasks = [...pinnedRecommended, ...algorithmRecommended]

  const meetingMinutes = getTodayMeetingMinutes()
  const freeMinutes = Math.max(0, 8 * 60 - meetingMinutes)
  const freeHours = Math.floor(freeMinutes / 60)
  const freeMinutesRemainder = freeMinutes % 60
  const freeTimeStr = freeMinutesRemainder > 0
    ? `${freeHours}:${freeMinutesRemainder.toString().padStart(2, '0')}`
    : `${freeHours}:00`
  const meetingsTimeStr = meetingMinutes > 0
    ? `אחרי ${meetingMinutes} ד' פגישות/דיונים`
    : "ללא פגישות היום"

  const handleAddCase = () => {
    setEditingCase(null)
    setIsAddCaseModalOpen(true)
  }

  const handleEditCase = (caseId: string) => {
    let foundCase: CaseData | undefined
    Object.values(cases).forEach((dateCases) => {
      dateCases.forEach((c) => {
        if (c.id === caseId) foundCase = c
      })
    })
    if (foundCase) {
      setEditingCase({
        id: foundCase.id,
        name: foundCase.name,
        lawyer: foundCase.lawyer,
        court: foundCase.court,
        clientName: foundCase.client,
        judge: foundCase.judge,
        files: foundCase.files,
        notes: foundCase.notes,
      })
      setIsAddCaseModalOpen(true)
    }
  }

  const handleSaveNewCase = (newCaseData: NewCaseData) => {
    if (editingCase) {
      setCases((prevCases) => {
        const newCases = { ...prevCases }
        Object.keys(newCases).forEach((date) => {
          newCases[date] = newCases[date].map((c) => {
            if (c.id === editingCase.id) {
              return {
                ...c,
                name: newCaseData.name,
                court: newCaseData.court || c.court,
                client: newCaseData.clientName || c.client,
                lawyer: newCaseData.lawyer || c.lawyer,
                judge: newCaseData.judge,
                files: newCaseData.files || c.files,
                notes: newCaseData.notes,
              }
            }
            return c
          })
        })
        return newCases
      })
      setEditingCase(null)
    } else {
      const newCase: CaseData = {
        id: `case-${Date.now()}`,
        name: newCaseData.name,
        hearings: [],
        court: newCaseData.court || "לא צוין",
        client: newCaseData.clientName || "",
        lawyer: newCaseData.lawyer || "",
        judge: newCaseData.judge,
        tasks: [],
        files: newCaseData.files || [],
        notes: newCaseData.notes,
      }
      setCases((prevCases) => ({
        ...prevCases,
        all: [...(prevCases["all"] || []), newCase],
      }))
    }
  }

  const handleEditTask = (taskId: string) => {
    let foundCase: CaseData | undefined
    let foundTask: TaskForEdit | undefined
    Object.values(cases).forEach((dateCases) => {
      dateCases.forEach((c) => {
        const task = c.tasks.find((t) => t.id === taskId)
        if (task) {
          foundCase = c
          foundTask = {
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            time: task.time,
            tags: task.tags,
            files: task.files,
            notes: task.notes,
            estimatedDuration: task.estimatedDuration,
            reminders: task.reminders,
          }
        }
      })
    })
    if (foundCase && foundTask) {
      setSelectedCaseForTask({ id: foundCase.id, name: foundCase.name })
      setEditingTask(foundTask)
      setIsAddTaskModalOpen(true)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => ({
          ...c,
          tasks: c.tasks.filter((t) => t.id !== taskId),
        }))
      })
      return newCases
    })
  }

  const handlePinTask = (taskId: string, pinned: boolean) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => t.id === taskId ? { ...t, pinned } : t),
        }))
      })
      return newCases
    })
  }

  const handleCompleteTask = (taskId: string, completed: boolean) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => ({
          ...c,
          tasks: c.tasks.map((t) =>
            t.id === taskId ? { ...t, completed } : t
          ),
        }))
      })
      return newCases
    })
  }

  const handleCompleteMeeting = (meetingId: string, completed: boolean) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => ({
          ...c,
          meetings: c.meetings?.map((m) =>
            m.id === meetingId ? { ...m, completed } : m
          ),
        }))
      })
      return newCases
    })
  }

  const handleAddTask = (caseId: string) => {
    let caseName = ""
    Object.values(cases).forEach((dateCases) => {
      dateCases.forEach((c) => {
        if (c.id === caseId) caseName = c.name
      })
    })
    setSelectedCaseForTask({ id: caseId, name: caseName })
    setIsAddTaskModalOpen(true)
  }

  const handleSaveNewTask = (taskData: NewTaskData) => {
    if (!selectedCaseForTask) return

    const taskDate = taskData.dueDate
      ? new Date(taskData.dueDate).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }).replace(/\//g, ".")
      : null

    let urgency: "overdue" | "soon" | "normal" | "none" = "none"
    let daysInfo = ""

    if (taskDate) {
      const [day, month, year] = taskDate.split(".").map(Number)
      const dueDate = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) {
        urgency = "overdue"
        daysInfo = `איחור ${Math.abs(diffDays)} ימים`
      } else if (diffDays <= 7) {
        urgency = "soon"
        daysInfo = `עוד ${diffDays} ימים`
      } else {
        urgency = "normal"
        daysInfo = `עוד ${diffDays} ימים`
      }
    }

    const taskFiles = taskData.files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    const allFiles = [
      ...(taskData.existingFiles || []),
      ...taskFiles,
    ]

    let estimatedDuration: string | undefined
    if (taskData.assignee === "שלי") {
      if (taskData.durationType === "hours") {
        const h = parseInt(taskData.durationHours) || 0
        const m = taskData.durationMinutes
        if (h > 0 && m !== "00") estimatedDuration = `${h} שע' ${m} ד'`
        else if (h > 0) estimatedDuration = `${h} שע'`
        else if (m !== "00") estimatedDuration = `${m} ד'`
      } else {
        const d = parseInt(taskData.durationDays) || 0
        if (d > 0) estimatedDuration = `${d} ימי עבודה`
      }
    }

    const taskTime = taskData.dueHour && taskData.dueMinute
      ? `${taskData.dueHour}:${taskData.dueMinute}`
      : taskData.dueHour
        ? `${taskData.dueHour}:00`
        : undefined

    const newTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: taskData.title,
      dueDate: taskDate,
      time: taskTime,
      urgency,
      daysInfo,
      tags: [taskData.assignee],
      files: allFiles.length > 0 ? allFiles : undefined,
      notes: taskData.notes || undefined,
      estimatedDuration,
      reminders: (taskData.reminders ?? []).length > 0 ? taskData.reminders : undefined,
    }

    setCases((prevCases) => {
      const newCases = { ...prevCases }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => {
          if (c.id === selectedCaseForTask.id) {
            if (editingTask) {
              return {
                ...c,
                tasks: c.tasks.map((t) =>
                  t.id === editingTask.id ? newTask : t
                ),
              }
            } else {
              return { ...c, tasks: [...c.tasks, newTask] }
            }
          }
          return c
        })
      })
      return newCases
    })
    setEditingTask(null)
  }

  const handleDeleteCase = (caseId: string) => {
    const newCases = { ...cases }
    Object.keys(newCases).forEach((date) => {
      newCases[date] = newCases[date].filter((c) => c.id !== caseId)
      if (newCases[date].length === 0) delete newCases[date]
    })
    setCases(newCases)
    if (userId) supabase.from("cases").delete().eq("id", caseId).then()
  }

  const handleUpdateStatus = (caseId: string, status: string) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) =>
          c.id === caseId ? { ...c, status: status || undefined } : c
        )
      })
      return newCases
    })
  }

  const saveGeneralTasks = (next: GeneralTask[]) => {
    setGeneralTasks(next)
    try { localStorage.setItem("general-tasks", JSON.stringify(next)) } catch {}
  }

  const handleAddGeneralTask = (title: string, dueDate: string | null) => {
    saveGeneralTasks([...generalTasks, { id: `gt-${Date.now()}`, title, dueDate, completed: false, pinned: false }])
  }

  const handleCompleteGeneralTask = (taskId: string) => {
    saveGeneralTasks(generalTasks.map((t) => t.id === taskId ? { ...t, completed: true } : t))
  }

  const handlePinGeneralTask = (taskId: string, pinned: boolean) => {
    saveGeneralTasks(generalTasks.map((t) => t.id === taskId ? { ...t, pinned } : t))
  }

  const handleAddHearing = (caseId: string, caseName: string) => {
    setSelectedCaseForHearing({ id: caseId, name: caseName })
    setIsAddHearingModalOpen(true)
  }

  const handleSaveNewHearing = (hearingData: NewHearingData) => {
    if (!selectedCaseForHearing) return
    const hearingDate = hearingData.date
      ? new Date(hearingData.date).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }).replace(/\//g, ".")
      : ""
    const hearingTime = hearingData.hour && hearingData.minute
      ? `${hearingData.hour}:${hearingData.minute}`
      : "09:00"
    if (!hearingDate) return
    const updatedHearing = {
      date: hearingDate,
      time: hearingTime,
      court: hearingData.court,
      notes: hearingData.materials,
      reminders: hearingData.reminders.length > 0 ? hearingData.reminders : undefined,
    }
    setCases((prevCases) => {
      const newCases = { ...prevCases }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => {
          if (c.id === selectedCaseForHearing.id) {
            if (editingHearing !== null) {
              const newHearings = [...c.hearings]
              newHearings[editingHearing.index] = updatedHearing
              return { ...c, hearings: newHearings }
            }
            return { ...c, hearings: [...c.hearings, updatedHearing] }
          }
          return c
        })
      })
      return newCases
    })
    setEditingHearing(null)
  }

  const handleEditHearing = (caseId: string, hearingIndex: number) => {
    let foundCase: CaseData | undefined
    Object.values(cases).forEach((dateCases) => {
      dateCases.forEach((c) => { if (c.id === caseId) foundCase = c })
    })
    if (!foundCase) return
    const hearing = foundCase.hearings[hearingIndex]
    if (!hearing) return
    setSelectedCaseForHearing({ id: caseId, name: foundCase.name })
    setEditingHearing({ index: hearingIndex, date: hearing.date, time: hearing.time, court: hearing.court, notes: hearing.notes })
    setIsAddHearingModalOpen(true)
  }

  const handleDeleteHearing = (caseId: string, hearingIndex: number) => {
    setCases((prev) => {
      const newCases = { ...prev }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => {
          if (c.id === caseId) return { ...c, hearings: c.hearings.filter((_, i) => i !== hearingIndex) }
          return c
        })
      })
      return newCases
    })
  }

  const handleAddMeeting = (caseId: string, caseName: string) => {
    setSelectedCaseForMeeting({ id: caseId, name: caseName })
    setIsAddMeetingModalOpen(true)
  }

  const handleSaveNewMeeting = (meetingData: NewMeetingData) => {
    if (!selectedCaseForMeeting) return
    const meetingDate = meetingData.date
      ? new Date(meetingData.date).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }).replace(/\//g, ".")
      : ""
    const meetingTime = meetingData.hour && meetingData.minute
      ? `${meetingData.hour}:${meetingData.minute}`
      : ""
    const newMeeting = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title,
      date: meetingDate,
      time: meetingTime,
      location: meetingData.location,
      notes: meetingData.notes,
      link: meetingData.link,
      reminders: meetingData.reminders.length > 0 ? meetingData.reminders : undefined,
    }
    setCases((prevCases) => {
      const newCases = { ...prevCases }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => {
          if (c.id === selectedCaseForMeeting.id) {
            if (editingMeeting) {
              return {
                ...c,
                meetings: (c.meetings || []).map((m) =>
                  m.id === editingMeeting.id
                    ? { ...newMeeting, id: editingMeeting.id }
                    : m
                ),
              }
            } else {
              return { ...c, meetings: [...(c.meetings || []), newMeeting] }
            }
          }
          return c
        })
      })
      return newCases
    })
    setEditingMeeting(null)
  }

  const handleEditMeeting = (caseId: string, meetingId: string) => {
    let foundCase: CaseData | undefined
    let foundMeeting: MeetingForEdit | undefined
    Object.values(cases).forEach((dateCases) => {
      dateCases.forEach((c) => {
        if (c.id === caseId) {
          foundCase = c
          foundMeeting = c.meetings?.find((m) => m.id === meetingId) as MeetingForEdit | undefined
        }
      })
    })
    if (foundCase && foundMeeting) {
      setSelectedCaseForMeeting({ id: caseId, name: foundCase.name })
      setEditingMeeting(foundMeeting)
      setIsAddMeetingModalOpen(true)
    }
  }

  const handleDeleteMeeting = (caseId: string, meetingId: string) => {
    setCases((prevCases) => {
      const newCases = { ...prevCases }
      Object.keys(newCases).forEach((date) => {
        newCases[date] = newCases[date].map((c) => {
          if (c.id === caseId) {
            return { ...c, meetings: (c.meetings || []).filter((m) => m.id !== meetingId) }
          }
          return c
        })
      })
      return newCases
    })
  }

  const filteredCases = Object.entries(cases).reduce(
    (acc, [date, dateCases]) => {
      const filtered = dateCases
        .filter(
          (c) =>
            c.name.includes(searchQuery) ||
            c.client.includes(searchQuery) ||
            c.tasks.some((t) => t.title.includes(searchQuery))
        )
        .map((c) => {
          let filteredTasks = c.tasks
          if (taskFilter === "today") {
            filteredTasks = filteredTasks.filter((t) => isToday(t.dueDate))
          } else if (taskFilter === "week") {
            filteredTasks = filteredTasks.filter((t) => isThisWeek(t.dueDate))
          } else if (taskFilter === "overdue") {
            filteredTasks = filteredTasks.filter((t) => t.urgency === "overdue")
          }
          if (searchFilterOption === "mine") {
            filteredTasks = filteredTasks.filter((t) => t.tags.includes("שלי"))
          } else if (searchFilterOption === "other") {
            filteredTasks = filteredTasks.filter((t) => t.tags.includes("הצד השני"))
          } else if (searchFilterOption === "withDate") {
            filteredTasks = filteredTasks.filter((t) => t.dueDate !== null)
          } else if (searchFilterOption === "withoutDate") {
            filteredTasks = filteredTasks.filter((t) => t.dueDate === null)
          } else if (searchFilterOption === "overdue") {
            filteredTasks = filteredTasks.filter((t) => t.urgency === "overdue")
          }
          if (sortOption === "dateAsc") {
            filteredTasks = [...filteredTasks].sort((a, b) => {
              if (!a.dueDate) return 1
              if (!b.dueDate) return -1
              const [dayA, monthA, yearA] = a.dueDate.split(".").map(Number)
              const [dayB, monthB, yearB] = b.dueDate.split(".").map(Number)
              return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
            })
          } else if (sortOption === "dateDesc") {
            filteredTasks = [...filteredTasks].sort((a, b) => {
              if (!a.dueDate) return 1
              if (!b.dueDate) return -1
              const [dayA, monthA, yearA] = a.dueDate.split(".").map(Number)
              const [dayB, monthB, yearB] = b.dueDate.split(".").map(Number)
              return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime()
            })
          } else if (sortOption === "taskName") {
            filteredTasks = [...filteredTasks].sort((a, b) => a.title.localeCompare(b.title, "he"))
          }
          return { ...c, tasks: filteredTasks }
        })
        .filter((c) => {
          if (taskFilter === "all" && searchFilterOption === "all") return true
          return c.tasks.length > 0
        })
      if (filtered.length > 0) acc[date] = filtered
      return acc
    },
    {} as Record<string, CaseData[]>
  )

  const sortedFilteredCases = sortOption === "caseName"
    ? Object.entries(filteredCases).reduce((acc, [date, dateCases]) => {
        acc[date] = [...dateCases].sort((a, b) => a.name.localeCompare(b.name, "he"))
        return acc
      }, {} as Record<string, CaseData[]>)
    : filteredCases

  const getFilterLabel = () => {
    switch (taskFilter) {
      case "today": return "משימות להיום"
      case "week": return "משימות השבוע"
      case "overdue": return "משימות באיחור"
      default: return null
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground text-sm">טוען נתונים...</div>
    </div>
  )

  return (
    <AuthGuard>
    <div className="min-h-screen bg-background">
      <Header onAddCase={handleAddCase} />

      <main className="container mx-auto px-4 pt-6 pb-28 sm:py-8 space-y-6">
        <div className="flex justify-start">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === "cases" && (
          <StatCards
            stats={stats}
            activeFilter={taskFilter}
            onFilterChange={setTaskFilter}
          />
        )}

        {activeTab === "cases" && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            filterOption={searchFilterOption}
            onFilterChange={setSearchFilterOption}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        )}

        {activeTab === "cases" && taskFilter !== "all" && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
              <span>מציג: {getFilterLabel()}</span>
              <button
                onClick={() => setTaskFilter("all")}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === "cases" && (
          <>
            {taskFilter === "all" && !searchQuery && searchFilterOption === "all" && (
              <RecommendedToday
                tasks={recommendedTasks}
                freeTime={freeTimeStr}
                meetingsTime={meetingsTimeStr}
                onEditTask={handleEditTask}
                onCompleteTask={handleCompleteTask}
                storageKey={userId ? `recommended-order-${userId}` : undefined}
              />
            )}

            {taskFilter === "all" && !searchQuery && searchFilterOption === "all" && (
              <GeneralTasksSection
                tasks={generalTasks}
                onAdd={handleAddGeneralTask}
                onComplete={handleCompleteGeneralTask}
                onPin={handlePinGeneralTask}
              />
            )}

            <div className="space-y-8">
              {(() => {
                const getEarliestTaskTime = (c: CaseData): number => {
                  const myTasks = c.tasks.filter(t => !t.completed && t.dueDate)
                  if (myTasks.length === 0) return Infinity
                  return Math.min(...myTasks.map(t => {
                    const [day, month, year] = t.dueDate!.split(".").map(Number)
                    return new Date(year, month - 1, day).getTime()
                  }))
                }
                const allSortedCases = Object.values(sortedFilteredCases)
                  .flat()
                  .sort((a, b) => getEarliestTaskTime(a) - getEarliestTaskTime(b))
                return (
                  <DateGroup
                    key="all"
                    cases={allSortedCases}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onCompleteTask={handleCompleteTask}
                    onAddTask={handleAddTask}
                    onDeleteCase={handleDeleteCase}
                    onAddHearing={handleAddHearing}
                    onEditHearing={handleEditHearing}
                    onDeleteHearing={handleDeleteHearing}
                    onUpdateStatus={handleUpdateStatus}
                    onAddMeeting={handleAddMeeting}
                    onEditMeeting={handleEditMeeting}
                    onDeleteMeeting={handleDeleteMeeting}
                    onCompleteMeeting={handleCompleteMeeting}
                    onEditCase={handleEditCase}
                    onPinTask={handlePinTask}
                  />
                )
              })()}
            </div>

            {Object.values(sortedFilteredCases).flat().length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">לא נמצאו תיקים או משימות</p>
              </div>
            )}
          </>
        )}

        {activeTab === "hearings" && <HearingsBoard cases={cases} />}
        {activeTab === "meetings" && <MeetingsBoard cases={cases} />}
        {activeTab === "dates" && <DatesBoard cases={cases} />}
        {activeTab === "deadlines" && <DeadlinesBoard cases={cases} />}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleAddCase}
        className="sm:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center"
        aria-label="הוסף תיק"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <AddCaseModal
        isOpen={isAddCaseModalOpen}
        onClose={() => { setIsAddCaseModalOpen(false); setEditingCase(null) }}
        onSave={handleSaveNewCase}
        editingCase={editingCase}
      />
      <AddHearingModal
        isOpen={isAddHearingModalOpen}
        onClose={() => { setIsAddHearingModalOpen(false); setSelectedCaseForHearing(null); setEditingHearing(null) }}
        onSave={handleSaveNewHearing}
        caseName={selectedCaseForHearing?.name || ""}
        editingHearing={editingHearing}
      />
      <AddMeetingModal
        isOpen={isAddMeetingModalOpen}
        onClose={() => { setIsAddMeetingModalOpen(false); setSelectedCaseForMeeting(null); setEditingMeeting(null) }}
        onSave={handleSaveNewMeeting}
        caseName={selectedCaseForMeeting?.name || ""}
        editingMeeting={editingMeeting}
      />
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => { setIsAddTaskModalOpen(false); setSelectedCaseForTask(null); setEditingTask(null) }}
        onSave={handleSaveNewTask}
        caseName={selectedCaseForTask?.name || ""}
        editingTask={editingTask}
      />
    </div>
    </AuthGuard>
  )
}
