import { useQuery } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

export const TASKS_LIST_QUERY_KEY = ["tasks", "list"] as const
const TASK_MESSAGE_NAME = "task" as Parameters<typeof sendToBackground>[0]["name"]

export function useTasksList() {
  return useQuery({
    queryKey: TASKS_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await sendToBackground({
        name: TASK_MESSAGE_NAME,
        body: { action: "list" },
      })
      if (!res.ok) throw new Error(res.error)
      return res.data
    },
  })
}
