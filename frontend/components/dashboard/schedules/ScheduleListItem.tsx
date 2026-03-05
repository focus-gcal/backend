import type { MenuProps } from "antd"
import { Button, Dropdown } from "antd"
import type { ScheduleOut } from "./types/schedule"
import { getScheduleTotalHours, getScheduleDaySegments, DAY_LABELS } from "~/utils"

interface ScheduleListItemProps {
  schedule: ScheduleOut
  onSelect: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

function formatTotalHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function DayAllocationBar({ daySegments }: { daySegments: [number, number][][] }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
      {daySegments.map((segments, i) => {
        const totalPct = segments.reduce((sum, [s, e]) => sum + (e - s), 0)
        const title = segments.length
          ? `${DAY_LABELS[i]} ${totalPct.toFixed(0)}% of day`
          : DAY_LABELS[i]
        return (
          <div
            key={i}
            title={title}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}>
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 2,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
                position: "relative",
              }}>
              {segments.map(([startPct, endPct], j) => (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: `${startPct}%`,
                    width: `${Math.min(100 - startPct, endPct - startPct)}%`,
                    height: "100%",
                    background: "#3b82f6",
                    borderRadius: 1,
                    transition: "left 0.15s ease, width 0.15s ease",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 10,
                opacity: 0.7,
                whiteSpace: "nowrap",
              }}>
              {DAY_LABELS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ScheduleListItem({
  schedule,
  onSelect,
  onEdit,
  onDelete,
}: ScheduleListItemProps) {
  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit",
      onClick: (info) => onEdit(info.domEvent as React.MouseEvent),
    },
    {
      key: "delete",
      danger: true,
      label: "Delete",
      onClick: (info) => onDelete(info.domEvent as React.MouseEvent),
    },
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
        padding: 13,
        marginBottom: 12,
        cursor: "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span>{schedule.name}</span>
          <span style={{ fontWeight: 500, fontSize: 14, opacity: 0.85 }}>
            {formatTotalHours(getScheduleTotalHours(schedule))}
          </span>
        </div>
        <DayAllocationBar daySegments={getScheduleDaySegments(schedule)} />
      </div>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
        getPopupContainer={(node) => node.parentElement ?? document.body}>
        <Button
          type="text"
          shape="circle"
          aria-label="Schedule options"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          ⋮
        </Button>
      </Dropdown>
    </div>
  )
}
