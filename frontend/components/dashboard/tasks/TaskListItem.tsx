import { useState } from "react"
import type { MenuProps } from "antd"
import { Button, Dropdown, Popconfirm, Space, Typography } from "antd"
import { CheckOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, FlagOutlined, ScheduleOutlined, TagOutlined } from "@ant-design/icons"
import type { TaskOut } from "./types/task"
import { formatDateCompact, formatDuration , compactTitle, getTaskStatusLabel, getTaskStatusColor, getTaskPriorityColor, getTaskPriorityLabel} from "~/utils"


type TaskListItemProps = {
  task: TaskOut
  onSelect: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}
const getCheckMarkButtonCSS = (status: string) => {
    if (status === "completed") {
        return {
            border: "2px solid rgba(16,185,129,1)",
            background: "rgba(16,185,129,1)"
          }
    }
    if (status === "in_progress") {
        return {
            border: "2px solid rgba(245, 158, 11, 1)",
            background: "rgba(245, 158, 11, 0.2)"
          }
    }
    if (status === "blocked") {
        return {
            border: "2px solid rgba(239, 68, 68, 1)",
            background: "rgba(239, 68, 68, 0.2)"
          }
    }
    return {
        border: "2px solid rgba(255,255,255,0.35)",
        background: "rgba(255,255,255,0.08)"
    }
}
export function TaskListItem({ task, onSelect, onEdit, onDelete }: TaskListItemProps) {
  const [isCheckHovered, setIsCheckHovered] = useState(false)
  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit Task",
      onClick: (info) => onEdit(info.domEvent as React.MouseEvent),
    },
    {
      key: "delete",
      label: "Delete Task",
      danger: true,
      onClick: (info) => onDelete(info.domEvent as React.MouseEvent),
    },
    {
      key: "cancel",
      label: "Cancel",
      onClick: (info) => (info.domEvent as React.MouseEvent).stopPropagation(),
    },
  ]
  const isCompleted = task.status === "completed"
  const checkButtonCss = getCheckMarkButtonCSS(task.status)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        background: "#262626",
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        cursor: "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <Space align="start" size={12} style={{ flex: 1, minWidth: 0 }}>
        <Button
          type="text"
          shape="circle"
          aria-label="Mark task complete"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsCheckHovered(true)}
          onMouseLeave={() => setIsCheckHovered(false)}
          style={{
            width: 18,
            height: 18,
            minWidth: 18,
            marginTop: 3,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            ...checkButtonCss,
            background: isCheckHovered ? "transparent" : checkButtonCss.background,
          }}
          icon={isCompleted ? <CheckOutlined style={{ color: "#ffffff", fontSize: 10, lineHeight: 1, position: "relative", top: -0.5 }} /> : undefined}
        />

        <Space orientation="vertical" size={2} style={{ minWidth: 0, flex: 1 }}>
        <Space size={5}>
            <Typography.Text
                ellipsis={{ tooltip: task.title || "Untitled task" }}
                style={{ color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 1.25 }}>
                {compactTitle(task.title) || "Untitled task"}
            </Typography.Text>
        </Space>
          

          <Space size={6} wrap>
                <Space size={4}>
                    <ScheduleOutlined style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 1 }} />
                    <Typography.Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 11 , position: "relative", top: 1}}>
                    {formatDateCompact(task.deadline)}
                    </Typography.Text>
                </Space>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>    </span>
                <Space size={4} style={{position: "relative", top:0.2}}>
                    <ClockCircleOutlined style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, lineHeight: 1 }} />
                    <Typography.Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 11 , position: "relative", top: 1.2}}>
                    {formatDuration(task.duration)}
                    </Typography.Text>
                </Space>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>    </span>
                {/* <Space size={4} style={{position: "relative", top:0.2}}>
                    <TagOutlined style={{ color: getTaskStatusColor(task.status), fontSize: 10, lineHeight: 1 }} />
                    <Typography.Text style={{ color: getTaskStatusColor(task.status), fontSize: 11 , position: "relative", top: 1.2}}>
                    {getTaskStatusLabel(task.status)}
                    </Typography.Text>
                </Space> */}
                <Space size={4} style={{}}>
                    <FlagOutlined style={{ color: getTaskPriorityColor(task.priority), fontSize: 10, lineHeight: 1}} />
                    <Typography.Text style={{ color: getTaskPriorityColor(task.priority), fontSize: 11 , position: "relative", top: 1.2, textShadow: task.priority === 3 ? "0 0 2px rgba(168, 85, 247, 0.6)" : undefined }}>
                    P{task.priority}
                    </Typography.Text>
                </Space>
          </Space>
        </Space>
      </Space>

      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={(node) => node.parentElement ?? document.body}>
        <Button
          type="text"
          shape="circle"
          aria-label="Task options"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            lineHeight: 1,
          }}>
          ⋮
        </Button>
      </Dropdown>
    </div>
  )
}