"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { NavigationTabs } from "@/components/dashboard/navigation-tabs"
import { StatCards, type TaskFilter } from "@/components/dashboard/stat-cards"
import { RecommendedToday } from "@/components/dashboard/recommended-today"
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
  const [cases, setCases] = useState<Record<string, CaseData[]>>(() => {
    if (typeof window === "undefined") return initialCases
    try {
      const saved = localStorage.getItem("dashboard-cases")
      return saved ? JSON.parse(saved) : initialCases
    } catch {
      return initialCases
    }
  })

  useEffect(() => {
    localStorage.setItem("dashboard-cases", JSON.stringify(cases))
  }, [cases])
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

  const recommendedTasks = allTasks
    .filter((t) => !t.completed && (t.dueDate !== null || t.urgency === "overdue"))
    .map((t) => {
      const parentCase = allCases.find((c) => c.tasks.some((task) => task.id === t.id))
      const daysRemaining = getDaysRemaining(t.dueDate)
      const priorityScore = calculatePriorityScore(t)
      return {
        id: t.id,
        title: t.title,
        caseName: parentCase?.name || "",
        urgency: t.urgency,
        daysRemaining,
        estimatedMinutes: 60,
        priorityScore,
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)

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
        tasks: [],
        files: newCaseData.files || [],
        notes: newCaseData.notes,
      }
      setCases((prevCases) => {
        const dateKey = "ללא תאריך"
        return {
          ...prevCases,
          [dateKey]: [...(prevCases[dateKey] || []), newCase],
        }
      })
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
            tags: task.tags,
            files: task.files,
            notes: task.notes,
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

    const newTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: taskData.title,
      dueDate: taskDate,
      urgency,
      daysInfo,
      tags: [taskData.assignee],
      files: allFiles.length > 0 ? allFiles : undefined,
      notes: taskData.notes || undefined,
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

  return (
    <div className="min-h-screen bg-background">
      <Header onAddCase={handleAddCase} />

      <main className="container mx-auto px-4 py-8 space-y-6">
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
              />
            )}

            <div className="space-y-8">
              {Object.entries(sortedFilteredCases)
                .sort(([a], [b]) => {
                  const [dayA, monthA, yearA] = a.split(".").map(Number)
                  const [dayB, monthB, yearB] = b.split(".").map(Number)
                  return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
                })
                .map(([date, dateCases]) => (
                  <DateGroup
                    key={date}
                    cases={dateCases}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onCompleteTask={handleCompleteTask}
                    onAddTask={handleAddTask}
                    onDeleteCase={handleDeleteCase}
                    onAddHearing={handleAddHearing}
                    onEditHearing={handleEditHearing}
                    onDeleteHearing={handleDeleteHearing}
                    onAddMeeting={handleAddMeeting}
                    onEditMeeting={handleEditMeeting}
                    onDeleteMeeting={handleDeleteMeeting}
                    onCompleteMeeting={handleCompleteMeeting}
                    onEditCase={handleEditCase}
                  />
                ))}
            </div>

            {Object.keys(sortedFilteredCases).length === 0 && (
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
  )
}
