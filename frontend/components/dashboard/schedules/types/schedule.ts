// One concrete time range on a specific day (used by the UI editor)
export interface ScheduleTimeBlock {
  /** 0 = Mon ... 6 = Sun */
  day_of_week: number
  /** "HH:MM" in 24h format */
  start_time: string
  /** "HH:MM" in 24h format */
  end_time: string
}

// ----- Backend API shapes (mirror Django / Ninja schemas) -----

// List item (GET /schedules/)
export interface ScheduleApiOut {
  id: number
  user_id: number
  name: string
  /** Single day of week from the backend, 0 = Mon ... 6 = Sun */
  day_of_week: number
  start_time: string
  end_time: string
}

// Single schedule with tasks (GET /schedules/{id})
export interface ScheduleApiListOut extends ScheduleApiOut {
  tasks: ScheduleTaskOut[]
}

// Create schedule (POST body)
export interface ScheduleApiCreateIn {
  name: string
  day_of_week: number
  start_time: string
  end_time: string
}

// Update schedule (PATCH body – all optional)
export interface ScheduleApiUpdateIn {
  name?: string
  day_of_week?: number
  start_time?: string
  end_time?: string
}

// ----- Frontend-only shapes used by the dashboard UI -----

// What the dashboard stores in state / mocks (can aggregate multiple blocks, etc.)
export interface ScheduleOut extends Omit<ScheduleApiOut, "day_of_week"> {
  /** Legacy single day; required if days_of_week/time_blocks not used. */
  day_of_week?: number
  /** Optional: multiple days (0 = Mon ... 6 = Sun) when using template/block shape. */
  days_of_week?: number[]
  /** Optional detailed per-day time blocks for the rich editor UI. */
  time_blocks?: ScheduleTimeBlock[]
}

// Task shown inside a schedule detail
export interface ScheduleTaskOut {
  id: number
  title: string
}

// Single schedule with tasks in the dashboard UI
export interface ScheduleListOut extends ScheduleOut {
  tasks: ScheduleTaskOut[]
}
