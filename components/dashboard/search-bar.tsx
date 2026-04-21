"use client"

import { Search, Filter, SlidersHorizontal, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type TaskFilterOption = "all" | "mine" | "other" | "withDate" | "withoutDate" | "overdue"
export type SortOption = "dateAsc" | "dateDesc" | "caseName" | "taskName"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  filterOption: TaskFilterOption
  onFilterChange: (filter: TaskFilterOption) => void
  sortOption: SortOption
  onSortChange: (sort: SortOption) => void
}

const filterLabels: Record<TaskFilterOption, string> = {
  all: "כל המשימות",
  mine: "רק שלי",
  other: "רק הצד השני",
  withDate: "רק עם תאריך",
  withoutDate: "רק בלי תאריך",
  overdue: "רק באיחור",
}

const sortLabels: Record<SortOption, string> = {
  dateAsc: "לפי תאריך קרוב",
  dateDesc: "לפי תאריך רחוק",
  caseName: "לפי שם תיק",
  taskName: "לפי שם משימה",
}

export function SearchBar({
  value,
  onChange,
  filterOption,
  onFilterChange,
  sortOption,
  onSortChange
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-xl border border-border p-2">
      <div className="flex-1 relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="חיפוש לפי שם תיק, משימה או שם לקוח..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filterOption !== "all" ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            סינון
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" dir="rtl">
          {(Object.keys(filterLabels) as TaskFilterOption[]).map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => onFilterChange(option)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{filterLabels[option]}</span>
              {filterOption === option && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            מיון
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" dir="rtl">
          {(Object.keys(sortLabels) as SortOption[]).map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => onSortChange(option)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{sortLabels[option]}</span>
              {sortOption === option && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
