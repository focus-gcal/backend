import type { PlasmoMessaging } from "@plasmohq/messaging";
import config from "~/config"
import { getAuthToken } from "~/utils/auth-token"

export type ScheduleBlockBody = {
  day_of_week: number
  start_time: string
  end_time: string
}

export type ScheduleRequest =
  | { action: "list" }
  | { action: "get"; schedule_id: number }
  | { action: "create"; name: string; blocks: ScheduleBlockBody[] }
  | { action: "update"; schedule_id: number; name?: string; blocks?: ScheduleBlockBody[] }
  | { action: "delete"; schedule_id: number }
type ScheduleResponse<T = unknown> =
    |{ok: true, data: T}
    |{ok: false, error: string}


const DETAIL_TTL_MS = 60_000
const  detailCache = new Map<number,{data:unknown, fetchedAt: number}>()



const LIST_TTL_MS = 60_000

let listCache:
    |{
        data:unknown,
        fetchedAt: number,
    }
    |null = null

export function invalidateScheduleDetailCache(schedule_id: number){
    detailCache.delete(schedule_id)
}

async function fetchScheduleDetail(token:string, schedule_id:number): Promise<unknown>{
    const response = await fetch(`${config.backend.baseUrl}/schedules/${schedule_id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        if(response.status === 404){
            const err = await response.json().catch(() => ({}))
            const msg = (err as{detail?: string}).detail ?? "Not found"
            throw new Error(msg)
        }
        const err = await response.json().catch(() => ({}))
        const message = 
            (err as{detail?: string; error?: string}).detail ??
            (err as{error?: string}).error ??
            `HTTP ${response.status}`
        throw new Error(message)
    }
    return response.json()
    
}



async function fetchSchedulesList(token: string): Promise<unknown> {
    const response = await fetch(`${config.backend.baseUrl}/schedules/`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const message =
            (err as { detail?: string; error?: string }).detail ??
            (err as { error?: string }).error ??
            `HTTP ${response.status}`
        throw new Error(message)
    }
    return response.json()
}

function parseErrorResponse(err: unknown): string {
    const obj = err as { detail?: string; error?: string }
    return obj.detail ?? obj.error ?? "Request failed"
}

async function fetchCreateSchedule(
    token: string,
    body: { name: string; blocks: ScheduleBlockBody[] }
): Promise<unknown> {
    const response = await fetch(`${config.backend.baseUrl}/schedules/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(parseErrorResponse(err))
    }
    return response.json()
}

async function fetchUpdateSchedule(
    token: string,
    schedule_id: number,
    body: { name?: string; blocks?: ScheduleBlockBody[] }
): Promise<unknown> {
    const response = await fetch(`${config.backend.baseUrl}/schedules/${schedule_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(parseErrorResponse(err))
    }
    return response.json()
}

async function fetchDeleteSchedule(token: string, schedule_id: number): Promise<void> {
    const response = await fetch(`${config.backend.baseUrl}/schedules/${schedule_id}`, {
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

const handler: PlasmoMessaging.MessageHandler<ScheduleRequest, ScheduleResponse> = 
    async (req,res) => {
        const token = await getAuthToken()
        if (!token){
            res.send({ok: false, error: "Unauthorized"})
            return
        }
        const action = req.body?.action
        if (action === "list"){
            if (listCache && listCache.fetchedAt > Date.now() - LIST_TTL_MS){
                res.send({ok: true, data: listCache.data})
                return
            }
            try {
                const data = await fetchSchedulesList(token)
                listCache = {data, fetchedAt: Date.now()}
                res.send({ok: true, data})
            } catch (e) {
                const message = e instanceof Error ? e.message : "Request failed"
                res.send({ok: false, error: message})
            }
            return 
        }
        if (action === "get"){
            const schedule_id = req.body?.schedule_id
            if (schedule_id == null || typeof schedule_id !== "number"){
                res.send({ok: false, error: "Schedule ID is required"})
                return
            }
            if (detailCache.has(schedule_id) && detailCache.get(schedule_id)!.fetchedAt > Date.now() - DETAIL_TTL_MS){
                res.send({ok: true, data: detailCache.get(schedule_id)!.data})
                return
            }
            try {
                const data = await fetchScheduleDetail(token, schedule_id)
                detailCache.set(schedule_id, {data, fetchedAt: Date.now()})
                res.send({ok: true, data})
            } catch (e) {
                const message = e instanceof Error ? e.message : "Request failed"
                res.send({ok: false, error: message})
            }
            return
        }
        if (action === "create") {
            const { name, blocks } = req.body ?? {}
            if (!name || !blocks?.length) {
                res.send({ ok: false, error: "name and blocks are required" })
                return
            }
            try {
                const data = await fetchCreateSchedule(token, { name, blocks })
                listCache = null
                res.send({ ok: true, data })
            } catch (e) {
                const message = e instanceof Error ? e.message : "Request failed"
                res.send({ ok: false, error: message })
            }
            return
        }
        if (action === "update") {
            const schedule_id = req.body?.schedule_id
            if (schedule_id == null || typeof schedule_id !== "number") {
                res.send({ ok: false, error: "schedule_id is required" })
                return
            }
            const { name, blocks } = req.body ?? {}
            try {
                const data = await fetchUpdateSchedule(token, schedule_id, { name, blocks })
                listCache = null
                detailCache.delete(schedule_id)
                res.send({ ok: true, data })
            } catch (e) {
                const message = e instanceof Error ? e.message : "Request failed"
                res.send({ ok: false, error: message })
            }
            return
        }
        if (action === "delete") {
            const schedule_id = req.body?.schedule_id
            if (schedule_id == null || typeof schedule_id !== "number") {
                res.send({ ok: false, error: "schedule_id is required" })
                return
            }
            try {
                await fetchDeleteSchedule(token, schedule_id)
                listCache = null
                detailCache.delete(schedule_id)
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