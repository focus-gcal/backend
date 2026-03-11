// Enum-like unions based on backend TaskStatus and TaskPriority.
export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked"
export type TaskPriority = 1 | 2 | 3

// Create task payload (POST /tasks/)
export interface TaskCreateIn {
  title: string
  description?: string
  duration: number
  priority?: TaskPriority
  deadline?: string | null
  is_hard_deadline?: boolean
  status?: TaskStatus
  start_date?: string | null
  min_chunk?: number | null
  max_duration_chunk?: number | null
  schedule_name?: string | null
  schedule_id?: number | null
  prev_schedule_id?: number | null
}

// Update task payload (PATCH /tasks/{task_id})
export interface TaskUpdateIn {
  title?: string
  description?: string
  duration?: number
  priority?: TaskPriority
  deadline?: string | null
  is_hard_deadline?: boolean
  status?: TaskStatus
  start_date?: string | null
  min_chunk?: number | null
  max_duration_chunk?: number | null
  schedule_name?: string | null
  schedule_id?: number | null
  prev_schedule_id?: number | null
}

// Task returned by API responses (GET/POST/PATCH /tasks)
export interface TaskOut {
  id: number
  user_id: number
  title: string
  description: string
  duration: number
  priority: TaskPriority
  deadline: string | null
  is_hard_deadline: boolean
  status: TaskStatus
  start_date: string | null
  min_chunk: number | null
  max_duration_chunk: number | null
  schedule_id: number | null
  schedule_name: string | null
  prev_schedule_id: number | null
}

