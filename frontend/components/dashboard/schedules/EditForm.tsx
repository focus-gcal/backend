import { useMemo, useState } from "react"
import { Button, Form, Input, Select, TimePicker, Typography } from "antd"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import type { ScheduleOut, ScheduleTimeBlock } from "./types/schedule"
import { DAY_LABELS } from "~/utils"

dayjs.extend(customParseFormat)

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [timeBlocks, setTimeBlocks] = useState<ScheduleTimeBlock[]>(() => {
    const norm = (s: string) => (s || "09:00").slice(0, 5)
    if (schedule.time_blocks && schedule.time_blocks.length > 0) {
      return schedule.time_blocks.map((b) => ({
        ...b,
        start_time: norm(b.start_time),
        end_time: norm(b.end_time),
      }))
    }
    const start = norm(schedule.start_time)
    const end = norm(schedule.end_time)
    return (schedule.days_of_week ?? [0]).map((day) => ({
      day_of_week: day,
      start_time: start,
      end_time: end,
    }))
  })

  const isValidBlock = (block: ScheduleTimeBlock) =>
    block.start_time < block.end_time &&
    block.day_of_week >= 0 &&
    block.day_of_week <= 6

  const normalizedBlocks = useMemo(
    () => timeBlocks.filter(isValidBlock),
    [timeBlocks]
  )

  const toTimeValue = (s: string | undefined | null) => {
    if (!s || !s.trim()) return null
    const raw = s.trim()
    const normalized = raw.length > 5 ? raw.slice(0, 5) : raw
    const parsed = dayjs(normalized, "HH:mm", true)
    return parsed.isValid() ? parsed : null
  }

  const boxStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    minHeight: 35,
    padding: "2px 5px",
    borderRadius: 8,
    border: "1px solid #404040",
    background: "#212121",
    color: "#fff",
    fontSize: 8,
    boxSizing: "border-box",
  }

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage("Title is required.")
      return
    }
    if (normalizedBlocks.length === 0) {
      setErrorMessage("At least one valid time block is required.")
      return
    }

    const daysOfWeek = Array.from(
      new Set(normalizedBlocks.map((b) => b.day_of_week))
    ).sort()

    const earliestStart = normalizedBlocks
      .map((b) => b.start_time)
      .sort()[0]
    const latestEnd = normalizedBlocks
      .map((b) => b.end_time)
      .sort()
      .slice(-1)[0]

    setErrorMessage(null)
    onSave({
      ...schedule,
      name: trimmedName,
      days_of_week: daysOfWeek,
      start_time: earliestStart,
      end_time: latestEnd,
      time_blocks: normalizedBlocks,
    })
  }

  return (
    <div
      style={{
        maxWidth: 520,
        width: "100%",
        paddingTop: 0,
      }}>
      <style>{`
        .schedule-time-picker-dropdown .ant-picker-time-panel-column:first-child {
          display: flex;
          flex-direction: column;
        }
        .schedule-time-picker-dropdown .ant-picker-time-panel-column:first-child .ant-picker-time-panel-cell:first-child {
          order: 12;
        }
      `}</style>
      <Button
        type="text"
        onClick={onCancel}
        style={{ marginBottom: 16, color: "#40a9ff", padding: 0 }}>
        ← Back
      </Button>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          background: "#262626",
          borderRadius: 16,
          padding: 7,
          paddingTop: 10,
        }}>
        <Form.Item label="Name">
          <Input
            size="large"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Schedule name"
            style={{ fontSize: 15 }}
          />
        </Form.Item>
        <Form.Item label="Time blocks">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 16,
              padding: 5,
              borderRadius: 8,
              border: "1px solid #404040",
              background: "rgba(0,0,0,0.2)",
            }}>
            {timeBlocks.length === 0 && (
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                No time blocks yet. Add at least one day and time range.
              </p>
            )}
            {timeBlocks.map((block, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
                  gap: 8,
                  alignItems: "center",
                }}>
                <Select
                  size="large"
                  value={block.day_of_week}
                  onChange={(day) => {
                    setTimeBlocks((prev) =>
                      prev.map((b, i) =>
                        i === index ? { ...b, day_of_week: day } : b
                      )
                    )
                  }}
                  options={DAY_LABELS.map((label, i) => ({ label, value: i }))}
                  style={{ width: "100%" , padding: "4px 5px"}}
                />
                <TimePicker
                  value={toTimeValue(block.start_time)}
                  format="h:mm A"
                  use12Hours
                  minuteStep={1}
                  placement="bottomLeft"
                  popupClassName="schedule-time-picker-dropdown"
                  onChange={(time) => {
                    setTimeBlocks((prev) =>
                      prev.map((b, i) =>
                        i === index
                          ? {
                              ...b,
                              start_time: time ? time.format("HH:mm") : "",
                            }
                          : b
                      )
                    )
                  }}
                  style={boxStyle}
                />
                <TimePicker
                  value={toTimeValue(block.end_time)}
                  format="h:mm A"
                  use12Hours
                  minuteStep={1}
                  placement="bottomLeft"
                  popupClassName="schedule-time-picker-dropdown"
                  onChange={(time) => {
                    setTimeBlocks((prev) =>
                      prev.map((b, i) =>
                        i === index
                          ? {
                              ...b,
                              end_time: time ? time.format("HH:mm") : "",
                            }
                          : b
                      )
                    )
                  }}
                  style={boxStyle}
                />
                <Button
                  type="text"
                  danger
                  aria-label="Remove time block"
                  size="small"
                  onClick={() =>
                    setTimeBlocks((prev) => prev.filter((_, i) => i !== index))
                  }>
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                setTimeBlocks((prev) => [
                  ...prev,
                  {
                    day_of_week: 0,
                    start_time: "09:00",
                    end_time: "17:00",
                  },
                ])
              }
              style={{ marginTop: 4 }}
              block>
              + Add time block
            </Button>
          </div>
        </Form.Item>
        
        <Form.Item>
        {errorMessage ? (
          <Typography.Text style={{ color: "#ff7875", fontSize: 12, marginBottom: 10 }}>{errorMessage}</Typography.Text>
        ) : null}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button type="primary" htmlType="submit" shape="round">
              Save
            </Button>
            <Button type="default" onClick={onCancel} shape="round">
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

