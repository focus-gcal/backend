import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

import type { ScheduleTimeBlock } from "~components/dashboard/schedules/types/schedule"

import { SCHEDULES_LIST_QUERY_KEY } from "./useSchedulesList"
import { scheduleDetailQueryKey } from "./useScheduleDetail"

const SCHEDULES_MESSAGE_NAME = "schedules" as Parameters<typeof sendToBackground>[0]["name"]

async function sendSchedulesMessage<T>(body: Parameters<typeof sendToBackground>[0]["body"]) {
  const res = await sendToBackground({
    name: SCHEDULES_MESSAGE_NAME,
    body: body!,
  })
  if (!res.ok) throw new Error(res.error)
  return res.data as T
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; blocks: ScheduleTimeBlock[] }) =>
      sendSchedulesMessage({ action: "create", ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      schedule_id: number
      name?: string
      blocks?: ScheduleTimeBlock[]
    }) => sendSchedulesMessage({ action: "update", ...payload }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({
        queryKey: scheduleDetailQueryKey(variables.schedule_id),
      })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (schedule_id: number) =>
      sendSchedulesMessage({ action: "delete", schedule_id }),
    onSuccess: (_, schedule_id) => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_LIST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: scheduleDetailQueryKey(schedule_id),
      })
    },
  })
}
