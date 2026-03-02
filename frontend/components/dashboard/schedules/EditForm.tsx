import { useState } from "react"
import { Button } from "antd"
import type { ScheduleOut } from "./types/schedule"

interface ScheduleEditFormProps {
  schedule: ScheduleOut
  dayLabels: string[]
  onSave: (updated: ScheduleOut) => void
  onCancel: () => void
}

export function ScheduleEditForm({
  schedule,
  dayLabels,
  onSave,
  onCancel,
}: ScheduleEditFormProps) {
  const [name, setName] = useState(schedule.name)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    schedule.days_of_week ?? []
  )
  const [startTime, setStartTime] = useState(schedule.start_time.slice(0, 5))
  const [endTime, setEndTime] = useState(schedule.end_time.slice(0, 5))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (daysOfWeek.length === 0 || endTime <= startTime) return
    onSave({
      ...schedule,
      name: name.trim(),
      days_of_week: daysOfWeek,
      start_time: startTime,
      end_time: endTime,
    })
  }

  return (
    <div
      style={{
        maxWidth: 400,
        width: "100%",
        paddingTop: 0,
      }}>
      <Button
        type="text"
        onClick={onCancel}
        style={{ marginBottom: 16, color: "#40a9ff", padding: 0 }}>
        ← Back
      </Button>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#262626",
          borderRadius: 16,
          padding: 24,
        }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #404040",
            background: "#212121",
            color: "#fff",
          }}
        />
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
          Days
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}>
          {dayLabels.map((label, i) => {
            const checked = daysOfWeek.includes(i)
            return (
              <label
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const { checked } = e.target
                    setDaysOfWeek((prev) => {
                      if (checked) {
                        return [...prev, i].sort()
                      }
                      return prev.filter((d) => d !== i)
                    })
                  }}
                  style={{ accentColor: "#1677ff" }}
                />
                {label}
              </label>
            )
          })}
        </div>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>Start time</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #404040",
            background: "#212121",
            color: "#fff",
          }}
        />
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>End time</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 20,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #404040",
            background: "#212121",
            color: "#fff",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="primary" htmlType="submit" shape="round">
            Save
          </Button>
          <Button type="default" onClick={onCancel} shape="round">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

