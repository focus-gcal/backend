import { useQuery } from "@tanstack/react-query"
import { sendToBackground } from "@plasmohq/messaging"

export const SCHEDULES_LIST_QUERY_KEY = ["schedules", "list"] as const
const SCHEDULES_MESSAGE_NAME = "schedules" as Parameters<typeof sendToBackground>[0]["name"]

export function useSchedulesList() {
  return useQuery({
    queryKey: SCHEDULES_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await sendToBackground({
        name: SCHEDULES_MESSAGE_NAME,
        body: { action: "list" },
      })
      if (!res.ok) throw new Error(res.error)
      return res.data
    },
  })
}