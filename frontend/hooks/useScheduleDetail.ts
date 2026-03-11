import { useQuery } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

import type { ScheduleListOut } from "~components/dashboard/schedules/types/schedule"

const SCHEDULES_MESSAGE_NAME = "schedules" as Parameters<typeof sendToBackground>[0]["name"]

export function scheduleDetailQueryKey(scheduleId: number | null) {
  return ["schedules", "detail", scheduleId] as const
}

function mapDetailResponse(raw: unknown): ScheduleListOut {
  const s = raw as {
    id: number
    user_id: number
    name: string
    blocks?: Array<{ day_of_week: number; start_time: string; end_time: string }>
    tasks?: Array<{ id: number; title: string }>
  }
  const time_blocks = s.blocks ?? []
  return {
    id: s.id,
    user_id: s.user_id,
    name: s.name,
    time_blocks,
    tasks: s.tasks ?? [],
  }
}

export function useScheduleDetail(scheduleId: number | null) {
  return useQuery({
    queryKey: scheduleDetailQueryKey(scheduleId),
    queryFn: async () => {
      if (scheduleId == null) return null
      const res = await sendToBackground({
        name: SCHEDULES_MESSAGE_NAME,
        body: { action: "get", schedule_id: scheduleId },
      })
      if (!res.ok) throw new Error(res.error)
      return mapDetailResponse(res.data)
    },
    enabled: scheduleId != null && scheduleId > 0,
  })
}
