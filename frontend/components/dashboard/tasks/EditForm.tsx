import { Button, Input, InputNumber, Select, Space, Switch, Typography } from "antd"
import { useState } from "react"
import type { TaskOut, TaskPriority, TaskStatus } from "./types/task"
import { CHUNK_MINUTES } from "~/utils"

interface TaskEditFormProps {
  task: TaskOut
  onSave: (updated: TaskOut) => void
  onCancel: () => void
}

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Blocked", value: "blocked" },
]

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 2 },
  { label: "High", value: 3 },
]

const toInputDateValue = (value: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const fromInputDateValue = (value: string) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function TaskEditForm({ task, onSave, onCancel }: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [duration, setDuration] = useState<number>(task.duration || 15)
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 1)
  const [status, setStatus] = useState<TaskStatus>(task.status || "todo")
  const [deadline, setDeadline] = useState<string>(toInputDateValue(task.deadline))
  const [startDate, setStartDate] = useState<string>(toInputDateValue(task.start_date))
  const [isHardDeadline, setIsHardDeadline] = useState(task.is_hard_deadline)
  const [minChunk, setMinChunk] = useState<number | null>(task.min_chunk)
  const [maxDurationChunk, setMaxDurationChunk] = useState<number | null>(task.max_duration_chunk)
  const [scheduleName, setScheduleName] = useState(task.schedule_name ?? "")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setErrorMessage("Title is required.")
      return
    }
    if (duration <= 0) {
      setErrorMessage("Duration must be greater than 0.")
      return
    }
    if (minChunk != null && minChunk <= 0) {
      setErrorMessage("Min chunk must be greater than 0.")
      return
    }
    if (maxDurationChunk != null && maxDurationChunk <= 0) {
      setErrorMessage("Max chunk must be greater than 0.")
      return
    }
    if (minChunk != null && maxDurationChunk != null && maxDurationChunk < minChunk) {
      setErrorMessage("Max chunk must be greater than or equal to min chunk.")
      return
    }

    setErrorMessage(null)
    onSave({
      ...task,
      title: trimmedTitle,
      description: description.trim(),
      duration,
      priority,
      status,
      deadline: fromInputDateValue(deadline),
      start_date: fromInputDateValue(startDate),
      is_hard_deadline: isHardDeadline,
      min_chunk: minChunk,
      max_duration_chunk: maxDurationChunk,
      schedule_name: scheduleName.trim() || null,
    })
  }

  return (
    <div style={{ maxWidth: 460, width: "100%", paddingTop: 0 }}>
      <Button type="text" onClick={onCancel} style={{ marginBottom: 16, color: "#40a9ff", padding: 0 }}>
        ← Back
      </Button>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#262626",
          borderRadius: 16,
          padding: 20,
        }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Title</Typography.Text>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>

          <div>
            <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Description</Typography.Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder="Task description"
            />
          </div>

          <Space size={10} style={{ width: "100%" }} align="start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Duration (minutes)</Typography.Text>
              <InputNumber
                min={1}
                value={duration}
                onChange={(value) => setDuration(typeof value === "number" ? value : 15)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Priority</Typography.Text>
              <Select value={priority} options={priorityOptions} onChange={setPriority} style={{ width: "100%" }} />
            </div>
          </Space>

          <Space size={10} style={{ width: "100%" }} align="start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Status</Typography.Text>
              <Select value={status} options={statusOptions} onChange={setStatus} style={{ width: "100%" }} />
            </div>
            <div style={{ width: 120, minWidth: 120 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Hard deadline</Typography.Text>
              <div style={{ height: 32, display: "flex", alignItems: "center" }}>
                <Switch checked={isHardDeadline} onChange={setIsHardDeadline} size="small" />
              </div>
            </div>
          </Space>

          <Space size={10} style={{ width: "100%" }} align="start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Start date</Typography.Text>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Deadline</Typography.Text>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </Space>

          <Space size={10} style={{ width: "100%" }} align="start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Min chunk (count)</Typography.Text>
              <InputNumber
                min={1}
                value={minChunk}
                onChange={(value) => setMinChunk(typeof value === "number" ? value : null)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Max chunk (count)</Typography.Text>
              <InputNumber
                min={1}
                value={maxDurationChunk}
                onChange={(value) => setMaxDurationChunk(typeof value === "number" ? value : null)}
                style={{ width: "100%" }}
              />
            </div>
          </Space>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            1 chunk = {CHUNK_MINUTES} minutes
          </Typography.Text>

          <div>
            <Typography.Text style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Schedule name (optional)</Typography.Text>
            <Input value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} placeholder="e.g. Workday Focus" />
          </div>

          {errorMessage ? (
            <Typography.Text style={{ color: "#ff7875", fontSize: 12 }}>{errorMessage}</Typography.Text>
          ) : null}

          <Space size={8}>
            <Button type="primary" htmlType="submit" shape="round">
              Save
            </Button>
            <Button onClick={onCancel} shape="round">
              Cancel
            </Button>
          </Space>
        </Space>
      </form>
    </div>
  )
}
