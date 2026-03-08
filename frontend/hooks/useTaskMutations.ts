import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

import type { TaskCreateIn, TaskUpdateIn } from "~components/dashboard/tasks/types/task"

import { TASKS_LIST_QUERY_KEY } from "./useTasksList"
import { taskDetailQueryKey } from "./useTaskDetail"

const TASK_MESSAGE_NAME = "task" as Parameters<typeof sendToBackground>[0]["name"]

async function sendTaskMessage<T>(body: Parameters<typeof sendToBackground>[0]["body"]) {
  const res = await sendToBackground({
    name: TASK_MESSAGE_NAME,
    body: body!,
  })
  if (!res.ok) throw new Error(res.error)
  return res.data as T
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskCreateIn) => sendTaskMessage({ action: "create", payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { task_id: number; payload: TaskUpdateIn }) =>
      sendTaskMessage({ action: "update", ...payload }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({
        queryKey: taskDetailQueryKey(variables.task_id),
      })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task_id: number) => sendTaskMessage({ action: "delete", task_id }),
    onSuccess: (_, task_id) => {
      queryClient.invalidateQueries({ queryKey: TASKS_LIST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: taskDetailQueryKey(task_id),
      })
    },
  })
}
