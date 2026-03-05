import { ClockCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Typography } from "antd"
import type { ScheduleListOut } from "./types/schedule"
import { DAY_LABELS, formatTime } from "~/utils"

const FULL_DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function getRangesByDay(detail: ScheduleListOut): Map<number, { start_time: string; end_time: string }[]> {
  const byDay = new Map<number, { start_time: string; end_time: string }[]>()
  const detailWithDays = detail as ScheduleListOut & { days_of_week?: number[] }
  if (detail.time_blocks && detail.time_blocks.length > 0) {
    for (const b of detail.time_blocks) {
      if (b.start_time >= b.end_time) continue
      if (!byDay.has(b.day_of_week)) byDay.set(b.day_of_week, [])
      byDay.get(b.day_of_week)!.push({ start_time: b.start_time, end_time: b.end_time })
    }
  } else {
    const days = detailWithDays.days_of_week ?? [detail.day_of_week]
    if (days.length && detail.start_time != null && detail.end_time != null) {
      const start = detail.start_time
      const end = detail.end_time
      if (start < end) {
        for (const d of days) {
          if (d >= 0 && d <= 6) byDay.set(d, [{ start_time: start, end_time: end }])
        }
      }
    }
  }
  byDay.forEach((ranges) => ranges.sort((a, b) => a.start_time.localeCompare(b.start_time)))
  return byDay
}

interface DetailViewProps {
  detail: ScheduleListOut
  onBack: () => void
  onUpdate: () => void
  onDelete: () => void
}

export function DetailView({ detail, onBack, onUpdate, onDelete }: DetailViewProps) {
  const byDay = getRangesByDay(detail)
  const dayEntries = Array.from(byDay.entries()).sort(([a], [b]) => a - b)

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Button
        type="text"
        onClick={onBack}
        style={{
          marginBottom: 16,
          marginTop: 0,
          color: "#40a9ff",
          padding: 0,
          alignSelf: "flex-start",
        }}>
        ← Back
      </Button>
      <div
        style={{
          background: "#262626",
          borderRadius: 16,
          padding: 24,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 24,
          }}>
          <Typography.Title level={4} style={{ margin: 0, marginBottom: 6, color: "rgba(255,255,255,0.92)", fontSize: 20 }}>
            {detail.name}
          </Typography.Title>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="text"
              aria-label="Edit schedule"
              icon={<EditOutlined />}
              onClick={onUpdate}
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
            <Popconfirm
              title="Delete schedule?"
              description="This cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={onDelete}>
              <Button
                type="text"
                danger
                aria-label="Delete schedule"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: "1px solid rgba(255,255,255,0.15)",
            }}>
            Schedule
          </h3>
          {dayEntries.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>No times set</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dayEntries.map(([dayIndex, ranges]) => {
                const dayName = FULL_DAY_LABELS[dayIndex] ?? DAY_LABELS[dayIndex] ?? ""
                const isMultiple = ranges.length > 1
                return (
                  <div key={dayIndex} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <ClockCircleOutlined
                      style={{ color: "#3b82f6", marginTop: 2, fontSize: 14 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isMultiple ? (
                        <>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>{dayName}</div>
                          <div
                            style={{
                              paddingLeft: 11.5,
                              borderLeft: "1px solid #3b82f6",
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}>
                            {ranges.map((r, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 13,
                                  opacity: 0.9,
                                }}>
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#3b82f6",
                                    flexShrink: 0,
                                    marginLeft: -15,
                                  }}
                                />
                                {formatTime(r.start_time)} – {formatTime(r.end_time)}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13 }}>
                          {dayName} {formatTime(ranges[0].start_time)} – {formatTime(ranges[0].end_time)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 16,
          }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, marginBottom: 8 }}>
            Tasks
          </h3>
          {detail.tasks.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>No tasks</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {detail.tasks.map((t) => (
                <li key={t.id} style={{ marginBottom: 4, fontSize: 13 }}>
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
