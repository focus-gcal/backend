import { useState } from "react"
import { toast } from "react-hot-toast"
import { MOCK_SCHEDULES, getMockScheduleDetail } from "./fixtures/mock"
import type { ScheduleOut, ScheduleListOut } from "./types/schedule"
import { DAY_LABELS } from "~/utils"
import { ScheduleEditForm } from "./EditForm"
import { EmptyState } from "../common/EmptyState"
import { DetailView } from "./DetailView"
import { ScheduleListItem } from "./ScheduleListItem"
import { CreateButton } from "../common/CreateButton"

export default function SchedulesView() {
  const notifySuccess = (message: string) => {
    toast.success(message)
  }
  const [schedules, setSchedules] = useState<ScheduleOut[]>(MOCK_SCHEDULES)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleOut | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const detail: ScheduleListOut | null =
    selectedSchedule ? getMockScheduleDetail(selectedSchedule) : null

  const deleteScheduleById = (scheduleId: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    if (selectedScheduleId === scheduleId) setSelectedScheduleId(null)
    if (editingSchedule && editingSchedule.id === scheduleId) {
      setEditingSchedule(null)
      setIsCreating(false)
    }
    notifySuccess("Schedule deleted")
  }

  const handleDelete = (schedule: ScheduleOut, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteScheduleById(schedule.id)
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
      time_blocks: [
        { day_of_week: 0, start_time: "09:00", end_time: "17:00" },
      ],
    }
    setIsCreating(true)
    setEditingSchedule(draft)
  }

  let content

  if (schedules.length === 0 && !isCreating) {
    content = (
      <EmptyState
        onCreate={handleCreate}
        titleText="No schedules yet"
        descriptionText="Create your first schedule to control when tasks can be auto-planned."
        buttonText="Create Schedule"
      />
    )
  } else if (editingSchedule) {
    content = (
      <ScheduleEditForm
        schedule={editingSchedule}
        dayLabels={DAY_LABELS}
        onSave={(updated) => {
          setSchedules((prev) => {
            const exists = prev.some((s) => s.id === updated.id)
            const next = exists
              ? prev.map((s) => (s.id === updated.id ? updated : s))
              : [...prev, updated]
            notifySuccess(exists ? "Schedule updated" : "Schedule created")
            return next
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
  } else if (detail) {
    content = (
      <DetailView
        detail={detail}
        onBack={() => setSelectedScheduleId(null)}
        onUpdate={() => {
          setIsCreating(false)
          setEditingSchedule(detail)
        }}
        onDelete={() => deleteScheduleById(detail.id)}
      />
    )
  } else {
    content = (
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

  return (
    <>
      {content}
    </>
  )
}
