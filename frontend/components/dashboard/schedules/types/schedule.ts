// List item (what you get from GET /schedules/)
// interface describes the shape and exists at type check time and removed when code is compiled
export interface ScheduleOut {
  id: number
  user_id: number
  name: string
  /** Days of week this schedule applies to, 0 = Mon ... 6 = Sun */
  days_of_week: number[]
  start_time: string
  end_time: string
}

// Task shown inside a schedule detail
export interface ScheduleTaskOut {
  id: number
  title: string
}

// Single schedule with tasks (GET /schedules/{id})
export interface ScheduleListOut extends ScheduleOut {
  tasks: ScheduleTaskOut[]
}

// Create schedule (POST body)
export interface ScheduleCreateIn {
  name: string
  days_of_week: number[]
  start_time: string
  end_time: string
}

// Update schedule (PATCH body – all optional)
export interface ScheduleUpdateIn {
  name?: string
  days_of_week?: number[]
  start_time?: string
  end_time?: string
}