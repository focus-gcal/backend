import { useState } from "react"
import { toast } from "react-hot-toast"
import type { TaskCreateIn, TaskOut, TaskUpdateIn } from "./types/task"
import { EmptyState } from "../common/EmptyState"
import { CreateButton } from "../common/CreateButton"
import { TaskListItem } from "./TaskListItem"
import { DetailView } from "./DetailView"
import { TaskEditForm } from "./EditForm"
import { useTasksList } from "~/hooks/useTasksList"
import { useTaskDetail } from "~/hooks/useTaskDetail"
import { useCreateTask, useDeleteTask, useUpdateTask } from "~/hooks/useTaskMutations"
import { useSchedulesList } from "~/hooks/useSchedulesList"

const NEW_TASK_ID = 0

export default function TasksView() {
  const notifySuccess = (message: string) => toast.success(message)
  const notifyError = (message: string) => toast.error(message)

  const { data, isLoading, error } = useTasksList()
  const tasks: TaskOut[] = (data ?? []) as TaskOut[]
  const { data: schedulesData } = useSchedulesList()

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<TaskOut | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const detailQuery = useTaskDetail(selectedTaskId)
  const detail: TaskOut | null = detailQuery.data ?? null

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const schedules = ((schedulesData ?? []) as Array<{ id: number; name: string }>).map((schedule) => ({
    id: schedule.id,
    name: schedule.name,
  }))

  const deleteTaskById = async (taskId: number) => {
    try {
      await deleteTask.mutateAsync(taskId)
      if (selectedTaskId === taskId) setSelectedTaskId(null)
      if (editingTask?.id === taskId) {
        setEditingTask(null)
        setIsCreating(false)
      }
      notifySuccess("Task deleted")
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Failed to delete task")
    }
  }

  const handleDelete = (task: TaskOut, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteTaskById(task.id)
  }

  const handleEdit = (task: TaskOut, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreating(false)
    setEditingTask(task)
  }

  const handleToggleStatus = async (task: TaskOut, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus = task.status === "completed" ? "todo" : "completed"
    try {
      await updateTask.mutateAsync({
        task_id: task.id,
        payload: { status: nextStatus },
      })
      notifySuccess(nextStatus === "completed" ? "Task completed" : "Task marked to do")
      if (selectedTaskId === task.id) {
        setSelectedTaskId(task.id)
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update task status")
    }
  }

  const handleCreate = () => {
    const userId = tasks[0]?.user_id ?? 1
    const draft: TaskOut = {
      id: NEW_TASK_ID,
      user_id: userId,
      title: "",
      description: "",
      duration: 0,  
      priority: 1,
      deadline: null,
      is_hard_deadline: false,
      status: "todo",
      start_date: null,
      min_chunk: null,
      max_duration_chunk: null,
      schedule_id: null,
      schedule_name: null,
    }
    setIsCreating(true)
    setEditingTask(draft)
  }

  const handleSave = async (updated: TaskOut) => {
    const basePayload: TaskCreateIn = {
      title: updated.title.trim(),
      description: updated.description,
      duration: updated.duration,
      priority: updated.priority,
      deadline: updated.deadline,
      is_hard_deadline: updated.is_hard_deadline,
      status: updated.status,
      start_date: updated.start_date,
      min_chunk: updated.min_chunk,
      max_duration_chunk: updated.max_duration_chunk,
      schedule_name: updated.schedule_name,
    }

    try {
      if (updated.id === NEW_TASK_ID) {
        const created = (await createTask.mutateAsync(basePayload)) as TaskOut
        notifySuccess("Task created")
        setSelectedTaskId(created.id)
      } else {
        const updatePayload: TaskUpdateIn = { ...basePayload }
        await updateTask.mutateAsync({
          task_id: updated.id,
          payload: updatePayload,
        })
        notifySuccess("Task updated")
        setSelectedTaskId(updated.id)
      }
      setEditingTask(null)
      setIsCreating(false)
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Failed to save task")
    }
  }

  let content

  if (isLoading) {
    content = <div style={{ padding: 16, textAlign: "center" }}>Loading tasks...</div>
  } else if (error) {
    content = (
      <div style={{ padding: 16, color: "red" }}>
        Failed to load tasks: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    )
  } else if (tasks.length === 0 && !isCreating) {
    content = (
      <EmptyState
        onCreate={handleCreate}
        titleText="No tasks yet"
        descriptionText="Create your first task to start focusing on what matters."
        buttonText="Create Task"
      />
    )
  } else if (editingTask) {
    content = (
      <TaskEditForm
        task={editingTask}
        schedules={schedules}
        onSave={handleSave}
        onCancel={() => {
          setEditingTask(null)
          setIsCreating(false)
        }}
      />
    )
  } else if (selectedTaskId != null) {
    if (detailQuery.isLoading) {
      content = <div style={{ padding: 16, textAlign: "center" }}>Loading task...</div>
    } else if (detailQuery.error) {
      content = (
        <div style={{ padding: 16 }}>
          <div style={{ color: "red", marginBottom: 8 }}>
            {detailQuery.error instanceof Error ? detailQuery.error.message : "Failed to load task"}
          </div>
          <button
            type="button"
            onClick={() => setSelectedTaskId(null)}
            style={{ cursor: "pointer" }}>
            Back to list
          </button>
        </div>
      )
    } else if (detail) {
      content = (
        <DetailView
          detail={detail}
          onBack={() => setSelectedTaskId(null)}
          onUpdate={() => {
            setIsCreating(false)
            setEditingTask(detail)
          }}
          onDelete={async () => {
            await deleteTaskById(detail.id)
          }}
        />
      )
    } else {
      content = (
        <div style={{ padding: 16 }}>
          <button
            type="button"
            onClick={() => setSelectedTaskId(null)}
            style={{ cursor: "pointer" }}>
            Back to list
          </button>
        </div>
      )
    }
  } else {
    content = (
      <>
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onSelect={() => setSelectedTaskId(task.id)}
            onToggleStatus={(e) => handleToggleStatus(task, e)}
            onEdit={(e) => handleEdit(task, e)}
            onDelete={(e) => handleDelete(task, e)}
          />
        ))}
        <CreateButton onClick={handleCreate} ariaLabel="Add Task" />
      </>
    )
  }

  return (
    <>
      {content}
    </>
  )
}
