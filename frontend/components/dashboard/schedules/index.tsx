import { useState } from "react"
import { MOCK_SCHEDULES, getMockScheduleDetail } from "./fixtures/mock"
import type { ScheduleOut, ScheduleListOut } from "./types/schedule"
import { DAY_LABELS } from "~/utils"
import { ScheduleEditForm } from "./EditForm"
import { EmptyState } from "../common/EmptyState"
import { DetailView } from "./DetailView"
import { ScheduleListItem } from "./ScheduleListItem"
import { CreateButton } from "../common/CreateButton"

export default function SchedulesView() {
  const [schedules, setSchedules] = useState<ScheduleOut[]>(MOCK_SCHEDULES)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleOut | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const detail: ScheduleListOut | null =
    selectedSchedule ? getMockScheduleDetail(selectedSchedule) : null

  const handleDelete = (schedule: ScheduleOut, e: React.MouseEvent) => {
    e.stopPropagation()
    setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
    if (selectedScheduleId === schedule.id) setSelectedScheduleId(null)
    if (editingSchedule && editingSchedule.id === schedule.id) {
      setEditingSchedule(null)
      setIsCreating(false)
    }
  }

  const handleEdit = (schedule: ScheduleOut, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreating(false)
    setEditingSchedule(schedule)
  }

  const handleCreate = () => {
    const nextId =
      schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) + 1 : 1
    const userId = schedules[0]?.user_id ?? 1
    const draft: ScheduleOut = {
      id: nextId,
      user_id: userId,
      name: "",
      day_of_week: 0,
      start_time: "09:00",
      end_time: "17:00",
    }
    setIsCreating(true)
    setEditingSchedule(draft)
  }

  if (schedules.length === 0 && !isCreating) {
    return <EmptyState 
      onCreateSchedule={handleCreate} titleText="No schedules yet"
      descriptionText="Create your first schedule to control when tasks can be auto-planned." 
      buttonText="Create Schedule" 
    />
  }

  if (editingSchedule) {
    return (
      <ScheduleEditForm
        schedule={editingSchedule}
        dayLabels={DAY_LABELS}
        onSave={(updated) => {
          setSchedules((prev) => {
            const exists = prev.some((s) => s.id === updated.id)
            if (exists) {
              return prev.map((s) => (s.id === updated.id ? updated : s))
            }
            return [...prev, updated]
          })
          setEditingSchedule(null)
          setIsCreating(false)
        }}
        onCancel={() => {
          setEditingSchedule(null)
          setIsCreating(false)
        }}
      />
    )
  }

  if (detail) {
    return (
      <DetailView
        detail={detail}
        onBack={() => setSelectedScheduleId(null)}
        onUpdate={() => {
          setIsCreating(false)
          setEditingSchedule(detail)
        }}
      />
    )
  }

  return (
    <>
      {schedules.map((schedule) => (
        <ScheduleListItem
          key={schedule.id}
          schedule={schedule}
          onSelect={() => setSelectedScheduleId(schedule.id)}
          onEdit={(e) => handleEdit(schedule, e)}
          onDelete={(e) => handleDelete(schedule, e)}
        />
      ))}
      <CreateButton onClick={handleCreate} ariaLabel="Add Schedule" />
    </>
  )
}
