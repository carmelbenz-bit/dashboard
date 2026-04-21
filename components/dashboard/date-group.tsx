"use client"

import { CaseCard, type CaseData } from "./case-card"

interface DateGroupProps {
  cases: CaseData[]
  onEditTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string, completed: boolean) => void
  onAddTask: (caseId: string) => void
  onDeleteCase: (caseId: string) => void
  onAddHearing: (caseId: string, caseName: string) => void
  onEditHearing: (caseId: string, hearingIndex: number) => void
  onDeleteHearing: (caseId: string, hearingIndex: number) => void
  onAddMeeting: (caseId: string, caseName: string) => void
  onEditMeeting: (caseId: string, meetingId: string) => void
  onDeleteMeeting: (caseId: string, meetingId: string) => void
  onCompleteMeeting: (meetingId: string, completed: boolean) => void
  onEditCase: (caseId: string) => void
}

export function DateGroup({
  cases,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onAddTask,
  onDeleteCase,
  onAddHearing,
  onEditHearing,
  onDeleteHearing,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting,
  onCompleteMeeting,
  onEditCase
}: DateGroupProps) {
  return (
    <div className="space-y-4">
      {cases.map((caseData) => (
        <CaseCard
          key={caseData.id}
          caseData={caseData}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onCompleteTask={onCompleteTask}
          onAddTask={() => onAddTask(caseData.id)}
          onDeleteCase={() => onDeleteCase(caseData.id)}
          onAddHearing={() => onAddHearing(caseData.id, caseData.name)}
          onEditHearing={(index) => onEditHearing(caseData.id, index)}
          onDeleteHearing={(index) => onDeleteHearing(caseData.id, index)}
          onAddMeeting={() => onAddMeeting(caseData.id, caseData.name)}
          onEditMeeting={(meetingId) => onEditMeeting(caseData.id, meetingId)}
          onDeleteMeeting={(meetingId) => onDeleteMeeting(caseData.id, meetingId)}
          onCompleteMeeting={onCompleteMeeting}
          onEditCase={() => onEditCase(caseData.id)}
        />
      ))}
    </div>
  )
}
