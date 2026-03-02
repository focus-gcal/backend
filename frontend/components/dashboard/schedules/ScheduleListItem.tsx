import type { MenuProps } from "antd"
import { Dropdown } from "antd"
import type { ScheduleOut } from "./types/schedule"
import { DAY_LABELS, formatTime } from "~/utils"

interface ScheduleListItemProps {
  schedule: ScheduleOut
  onSelect: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

export function ScheduleListItem({
  schedule,
  onSelect,
  onEdit,
  onDelete,
}: ScheduleListItemProps) {
  const menuItems: MenuProps["items"] = [
    { key: "edit", label: "Edit", onClick: (info) => onEdit(info.domEvent as React.MouseEvent) },
    { key: "delete", label: "Delete", onClick: (info) => onDelete(info.domEvent as React.MouseEvent) },
  ]

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
        padding: 16,
        marginBottom: 12,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{schedule.name}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          {DAY_LABELS[schedule.day_of_week]} {formatTime(schedule.start_time)} –{" "}
          {formatTime(schedule.end_time)}
        </div>
      </div>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={(node) => node.parentElement ?? document.body}>
        <button
          type="button"
          aria-label="Schedule options"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: 18,
            lineHeight: 1,
            borderRadius: 4,
          }}>
          ⋮
        </button>
      </Dropdown>
    </div>
  )
}
