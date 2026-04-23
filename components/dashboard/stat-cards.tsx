"use client"

import { FolderOpen, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant: "default" | "success" | "warning" | "danger"
  topBorderColor: string
  onClick?: () => void
  isActive?: boolean
}

function StatCard({ title, value, icon, variant, topBorderColor, onClick, isActive }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-slate-200 px-5 py-4 transition-all hover:shadow-md cursor-pointer",
        "border-t-4",
        topBorderColor,
        isActive && "ring-2 ring-primary ring-offset-2"
      )}>
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2.5 rounded-xl",
          variant === "default" && "bg-blue-50 text-blue-600",
          variant === "success" && "bg-emerald-50 text-emerald-600",
          variant === "warning" && "bg-amber-50 text-amber-600",
          variant === "danger" && "bg-red-50 text-red-600"
        )}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-2xl sm:text-3xl font-bold",
            variant === "default" && "text-blue-600",
            variant === "success" && "text-emerald-600",
            variant === "warning" && "text-amber-600",
            variant === "danger" && "text-red-600"
          )}>{value}</span>
          <span className="text-sm text-slate-500">{title}</span>
        </div>
      </div>
    </div>
  )
}

interface StatsData {
  openCases: number
  todayTasks: number
  thisWeekTasks: number
  overdueTasks: number
}

export type TaskFilter = "all" | "today" | "week" | "overdue"

interface StatCardsProps {
  stats: StatsData
  activeFilter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

export function StatCards({ stats, activeFilter, onFilterChange }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" dir="rtl">
      <StatCard
        title="תיקים פתוחים"
        value={stats.openCases}
        icon={<FolderOpen className="h-5 w-5" />}
        variant="default"
        topBorderColor="border-t-blue-500"
        onClick={() => onFilterChange("all")}
        isActive={activeFilter === "all"}
      />
      <StatCard
        title="משימות להיום"
        value={stats.todayTasks}
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
        topBorderColor="border-t-emerald-500"
        onClick={() => onFilterChange("today")}
        isActive={activeFilter === "today"}
      />
      <StatCard
        title="משימות השבוע"
        value={stats.thisWeekTasks}
        icon={<Clock className="h-5 w-5" />}
        variant="warning"
        topBorderColor="border-t-amber-500"
        onClick={() => onFilterChange("week")}
        isActive={activeFilter === "week"}
      />
      <StatCard
        title="משימות באיחור"
        value={stats.overdueTasks}
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="danger"
        topBorderColor="border-t-red-500"
        onClick={() => onFilterChange("overdue")}
        isActive={activeFilter === "overdue"}
      />
    </div>
  )
}
