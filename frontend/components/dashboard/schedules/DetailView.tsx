import { Button } from "antd"
import type { ScheduleListOut } from "./types/schedule"
import { formatDays, formatTime } from "~/utils"

interface DetailViewProps {
  detail: ScheduleListOut
  onBack: () => void
  onUpdate: () => void
}

export function DetailView({ detail, onBack, onUpdate }: DetailViewProps) {
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
          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 18,
              fontWeight: 600,
            }}>
            {detail.name}
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: 16,
              fontSize: 13,
              opacity: 0.85,
            }}>
            {formatDays(detail.days_of_week)} {formatTime(detail.start_time)} –{" "}
            {formatTime(detail.end_time)}
          </p>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Tasks</h3>
          {detail.tasks.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>No tasks</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {detail.tasks.map((t) => (
                <li key={t.id} style={{ marginBottom: 4 }}>
                  {t.title}
                </li>
              ))}
            </ul>
          )}
          <Button
            type="primary"
            shape="round"
            style={{ marginTop: 16 }}
            onClick={onUpdate}>
            Update
          </Button>
        </div>
    </div>
  )
}
