import {
  CalendarOutlined,
  ClockCircleOutlined,
  DashOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  NodeIndexOutlined,
  PartitionOutlined,
  ScheduleOutlined,
  StopOutlined,
} from "@ant-design/icons"
import { Button, Card, Popconfirm, Space, Tag, Typography } from "antd"
import type { TaskOut } from "./types/task"
import {
  formatChunkRange,
    formatDateCompact,
  formatDuration,
  getTaskPriorityColor,
  getTaskPriorityLabel,
  getTaskStatusColor,
  getTaskStatusLabel,
} from "~/utils"

interface DetailViewProps {
  detail: TaskOut
  onBack: () => void
  onUpdate: () => void
  onDelete: () => void
}


const getPriorityTagColor = (priority: number) => {
  const color = getTaskPriorityColor(priority)
  return color ?? "rgba(255,255,255,0.45)"
}

const getStatusTagColor = (status: string) => {
  const color = getTaskStatusColor(status)
  return color ?? "rgba(255,255,255,0.7)"
}

const toTagBackground = (rgbaColor: string) => {
  const match = rgbaColor.match(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\)/)
  if (!match) return "rgba(255,255,255,0.1)"
  const [, r, g, b] = match
  return `rgba(${r}, ${g}, ${b}, 0.16)`
}

export function DetailView({ detail, onBack, onUpdate, onDelete }: DetailViewProps) {
  const description = detail.description?.trim()
  const priorityLabel = getTaskPriorityLabel(detail.priority) ?? "Unknown"
  const statusLabel = getTaskStatusLabel(detail.status) ?? "Unknown"
  const chunkRange =
    formatChunkRange(detail.min_chunk, detail.max_duration_chunk) ?? "Not set"

  const renderSectionTitle = (title: string, compact = false) => (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 8 }}>
      <Typography.Text
        style={{
          fontSize: compact ? 13 : 14,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 600,
        }}>
        {title}
      </Typography.Text>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.14)" }} />
    </div>
  )

  const renderMetric = (
    icon: React.ReactNode,
    label: string,
    value: string,
    hasRightBorder: boolean,
    compact = false
  ) => (
    <div
      style={{
        minWidth: 0,
        padding: compact ? "1px 0" : "2px 0",
        borderRight: hasRightBorder ? "1px solid rgba(255,255,255,0.14)" : "none",
      }}>
      <Space size={compact ? 5 : 6} align="start" style={{ width: "100%" }}>
        <span style={{ color: "rgba(255,255,255,0.72)", marginTop: 1, fontSize: compact ? 12 : undefined }}>
          {icon}
        </span>
        <div style={{ minWidth: 0 }}>
          <Typography.Text style={{ color: "rgba(255,255,255,0.65)", fontSize: compact ? 12 : 13 }}>
            {label}
          </Typography.Text>
          <Typography.Text
            style={{
              display: "block",
              color: "rgba(255,255,255,0.9)",
              fontSize: compact ? 13 : 14,
              lineHeight: compact ? 1.25 : 1.3,
              marginTop: compact ? 1 : 2,
              whiteSpace: "normal",
              overflowWrap: "break-word",
              wordBreak: "normal",
            }}>
            {value || <DashOutlined />}
          </Typography.Text>
        </div>
      </Space>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Button
        type="text"
        onClick={onBack}
        style={{
          marginBottom: 10,
          marginTop: 0,
          color: "#40a9ff",
          padding: 0,
          alignSelf: "flex-start",
        }}>
        ← Back
      </Button>

      <Card style={{ background: "#262626", borderRadius: 16 }} styles={{ body: { padding: 16 } }}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography.Title level={4} style={{ margin: 0, marginBottom: 6, color: "rgba(255,255,255,0.92)", fontSize: 17 }}>
              {detail.title || "Untitled task"}
            </Typography.Title>
            <div style={{ display: "flex", gap: 8, marginLeft: "3px" }}>
                <Button
                  type="text"
                  aria-label="Edit task"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate()
                  }}
                  style={{ color: "rgba(255,255,255,0.85)" }}
                />
                <Popconfirm
                  title="Delete task?"
                  description="This cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  onConfirm={onDelete}>
                  <Button
                    type="text"
                    danger
                    aria-label="Delete task"
                    icon={<DeleteOutlined />}
                  />
              </Popconfirm>
            </div></div>
            <Space wrap size={6}>
              <Tag
                style={{
                  marginInlineEnd: 0,
                  color: getStatusTagColor(detail.status),
                  background: toTagBackground(getStatusTagColor(detail.status)),
                  border: `1px solid ${toTagBackground(getStatusTagColor(detail.status))}`,
                }}>
                {statusLabel}
              </Tag>
              <Tag
                style={{
                  marginInlineEnd: 0,
                  color: getPriorityTagColor(detail.priority),
                  background: toTagBackground(getPriorityTagColor(detail.priority)),
                  border: `1px solid ${toTagBackground(getPriorityTagColor(detail.priority))}`,
                }}>
                Priority: {priorityLabel}
              </Tag>
            </Space>
          </div>

          <Typography.Paragraph style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.4 }}>
            {description || "No description"}
          </Typography.Paragraph>

          {renderSectionTitle("Scheduling")}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 10,
              columnGap: 12,
            }}>
            {renderMetric(
              <ClockCircleOutlined />,
              "Duration",
              formatDuration(detail.duration),
              true
            )}
            {renderMetric(
              <CalendarOutlined />,
              "Deadline",
              formatDateCompact(detail.deadline),
              false
            )}
            {renderMetric(<ScheduleOutlined />, "Start", formatDateCompact(detail.start_date), true)}
            {renderMetric(<StopOutlined />, "Hard deadline", detail.is_hard_deadline ? "Yes" : "No", false)}
          </div>

          {renderSectionTitle("Preferences", true)}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 8,
              columnGap: 10,
            }}>
            {renderMetric(<FieldTimeOutlined />, "Chunk range", chunkRange, true, true)}
            {renderMetric(<NodeIndexOutlined />, "Schedule", detail.schedule_name ?? "Unassigned", false, true)}
          </div>

          {/* <Button type="primary" shape="round" onClick={onUpdate} style={{ marginTop: 2, alignSelf: "flex-start" }}>
            Update
          </Button> */}
        </Space>
      </Card>
    </div>
  )
}
