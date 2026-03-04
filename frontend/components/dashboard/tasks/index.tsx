import { useState } from "react"
import { MOCK_TASKS } from "./fixtures/mock"
import type { TaskOut } from "./types/task"
import { EmptyState } from "../common/EmptyState"
import { CreateButton } from "../common/CreateButton"
import { TaskListItem } from "./TaskListItem"
import { DetailView } from "./DetailView"

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskOut[]>(MOCK_TASKS)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<TaskOut | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  const detail: TaskOut | null =
    selectedTask ? selectedTask : null

  const handleDelete = (task: TaskOut, e: React.MouseEvent) => {
    e.stopPropagation()
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    if (selectedTaskId === task.id) setSelectedTaskId(null)
    if (editingTask && editingTask.id === task.id) {
      setEditingTask(null)
      setIsCreating(false)
    }
  }

  const handleEdit = (task: TaskOut, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreating(false)
    setEditingTask(task)
  }

  const handleCreate = () => {
    const nextId =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1
    const userId = tasks[0]?.user_id ?? 1
    const draft: TaskOut = {
      id: nextId,
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

  // const handleEdit = (task: TaskOut, e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   setIsCreating(false)
  //   setEditingTask(task)
  // }

  // const handleCreate = () => {
  //   const nextId =
  //     tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1
  //   const userId = tasks[0]?.user_id ?? 1
  //   const draft: TaskOut = {
  //     id: nextId,
  //     user_id: userId,
  //     title: "",
  //     description: "",
  //     duration: 0,
  //     priority: 0,
  //   }
  //   setIsCreating(true)
  //   setEditingTask(draft)
  // }

  if (tasks.length === 0 && !isCreating) {
    return <EmptyState
    onCreate={() => {}}
    titleText="No tasks yet"
    descriptionText="Create your first task to start focusing on what matters."
    buttonText="Create Task"
  />
  }

  if (editingTask) {
    return (
      // <ScheduleEditForm
      //   schedule={editingSchedule}
      //   dayLabels={DAY_LABELS}
      //   onSave={(updated) => {
      //     setSchedules((prev) => {
      //       const exists = prev.some((s) => s.id === updated.id)
      //       if (exists) {
      //         return prev.map((s) => (s.id === updated.id ? updated : s))
      //       }
      //       return [...prev, updated]
      //     })
      //     setEditingSchedule(null)
      //     setIsCreating(false)
      //   }}
      //   onCancel={() => {
      //     setEditingSchedule(null)
      //     setIsCreating(false)
      //   }}
      // />
      <>d</>
    )
  }

  if (detail) {
    return (
        <DetailView
          detail={selectedTask}
          onBack={() => setSelectedTaskId(null)}
          onUpdate={() => {}}
        />
    )
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          onSelect={() => setSelectedTaskId(task.id)}
          onEdit={(e) => handleEdit(task, e)}
          onDelete={(e) => handleDelete(task, e)}
        />
      ))}
      <CreateButton onClick={handleCreate} ariaLabel="Add Task" />
    </>
  )
}
