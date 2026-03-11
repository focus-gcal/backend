import type { PlasmoMessaging } from "@plasmohq/messaging"

import config from "~/config"
import { getAuthToken } from "~/utils/auth-token"
import { invalidateScheduleDetailCache } from "./schedules"

type TaskPayload = {
  title?: string
  description?: string
  duration?: number
  priority?: number
  deadline?: string | null
  is_hard_deadline?: boolean
  status?: string
  start_date?: string | null
  min_chunk?: number | null
  max_duration_chunk?: number | null
  schedule_name?: string | null
}

export type TaskRequest =
  | { action: "list" }
  | { action: "get"; task_id: number }
  | { action: "create"; payload: TaskPayload, schedule_id: number | null }
  | { action: "update"; task_id: number; payload: TaskPayload, schedule_id: number | null, prev_schedule_id: number | null }
  | { action: "delete"; task_id: number, schedule_id: number | null }

type TaskResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

const LIST_TTL_MS = 60_000
const DETAIL_TTL_MS = 60_000

let listCache:
  | {
      data: unknown
      fetchedAt: number
    }
  | null = null

const detailCache = new Map<
  number,
  {
    data: unknown
    fetchedAt: number
  }
>()

function parseErrorResponse(err: unknown): string {
  const obj = err as { detail?: string; error?: string }
  return obj.detail ?? obj.error ?? "Request failed"
}

async function fetchTasksList(token: string): Promise<unknown> {
  const response = await fetch(`${config.backend.baseUrl}/tasks/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(parseErrorResponse(err))
  }
  return response.json()
}

async function fetchTaskDetail(token: string, task_id: number): Promise<unknown> {
  const response = await fetch(`${config.backend.baseUrl}/tasks/${task_id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(parseErrorResponse(err))
  }
  return response.json()
}

async function fetchCreateTask(token: string, payload: TaskPayload): Promise<unknown> {
  const response = await fetch(`${config.backend.baseUrl}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(parseErrorResponse(err))
  }
  return response.json()
}

async function fetchUpdateTask(token: string, task_id: number, payload: TaskPayload): Promise<unknown> {
  const response = await fetch(`${config.backend.baseUrl}/tasks/${task_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(parseErrorResponse(err))
  }
  return response.json()
}

async function fetchDeleteTask(token: string, task_id: number): Promise<void> {
  const response = await fetch(`${config.backend.baseUrl}/tasks/${task_id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(parseErrorResponse(err))
  }
}

const handler: PlasmoMessaging.MessageHandler<TaskRequest, TaskResponse> = async (req, res) => {
  const token = await getAuthToken()
  if (!token) {
    res.send({ ok: false, error: "Unauthorized" })
    return
  }

  const action = req.body?.action

  if (action === "list") {
    // if (listCache && listCache.fetchedAt > Date.now() - LIST_TTL_MS) {
    //   res.send({ ok: true, data: listCache.data })
    //   return
    // }
    try {
      const data = await fetchTasksList(token)
      listCache = { data, fetchedAt: Date.now() }
      res.send({ ok: true, data })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed"
      res.send({ ok: false, error: message })
    }
    return
  }

  if (action === "get") {
    const task_id = req.body?.task_id
    if (task_id == null || typeof task_id !== "number") {
      res.send({ ok: false, error: "task_id is required" })
      return
    }
    // if (detailCache.has(task_id) && detailCache.get(task_id)!.fetchedAt > Date.now() - DETAIL_TTL_MS) {
    //   res.send({ ok: true, data: detailCache.get(task_id)!.data })
    //   return
    // }
    try {
      const data = await fetchTaskDetail(token, task_id)
      detailCache.set(task_id, { data, fetchedAt: Date.now() })
      res.send({ ok: true, data })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed"
      res.send({ ok: false, error: message })
    }
    return
  }

  if (action === "create") {
    const payload = req.body?.payload
    const schedule_id = req.body?.schedule_id
    if (!payload) {
      res.send({ ok: false, error: "payload is required" })
      return
    }
    try {
      const data = await fetchCreateTask(token, payload)
      listCache = null
      if (schedule_id) {
        invalidateScheduleDetailCache(schedule_id)
      }
      res.send({ ok: true, data })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed"
      res.send({ ok: false, error: message })
    }
    return
  }

  if (action === "update") {
    const task_id = req.body?.task_id
    const payload = req.body?.payload
    const schedule_id = req.body?.schedule_id
    const prev_schedule_id = req.body?.prev_schedule_id
    if (task_id == null || typeof task_id !== "number") {
      res.send({ ok: false, error: "task_id is required" })
      return
    }
    if (!payload) {
      res.send({ ok: false, error: "payload is required" })
      return
    }
    try {
      const data = await fetchUpdateTask(token, task_id, payload)
      listCache = null
      detailCache.delete(task_id)
      if (schedule_id) {
        invalidateScheduleDetailCache(schedule_id)
      }
      if (prev_schedule_id) {
        invalidateScheduleDetailCache(prev_schedule_id)
      }
      res.send({ ok: true, data })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed"
      res.send({ ok: false, error: message })
    }
    return
  }

  if (action === "delete") {
    const task_id = req.body?.task_id
    const schedule_id = req.body?.schedule_id
    if (task_id == null || typeof task_id !== "number") {
      res.send({ ok: false, error: "task_id is required" })
      return
    }
    try {
      await fetchDeleteTask(token, task_id)
      listCache = null
      detailCache.delete(task_id)
      if (schedule_id) {
        invalidateScheduleDetailCache(schedule_id)
      }
      res.send({ ok: true, data: null })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed"
      res.send({ ok: false, error: message })
    }
    return
  }

  res.send({ ok: false, error: `Invalid action: ${action}` })
}

export default handler
