import { useQuery } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

import type { TaskOut } from "~components/dashboard/tasks/types/task"

const TASK_MESSAGE_NAME = "task" as Parameters<typeof sendToBackground>[0]["name"]

export function taskDetailQueryKey(taskId: number | null) {
  return ["tasks", "detail", taskId] as const
}

function mapTaskResponse(raw: unknown): TaskOut {
  return raw as TaskOut
}

export function useTaskDetail(taskId: number | null) {
  return useQuery({
    queryKey: taskDetailQueryKey(taskId),
    queryFn: async () => {
      if (taskId == null) return null
      const res = await sendToBackground({
        name: TASK_MESSAGE_NAME,
        body: { action: "get", task_id: taskId },
      })
      if (!res.ok) throw new Error(res.error)
      return mapTaskResponse(res.data)
    },
    enabled: taskId != null && taskId > 0,
  })
}
