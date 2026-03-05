import { useState } from "react"
import { toast } from "react-hot-toast"
import { MOCK_TASKS } from "./fixtures/mock"
import type { TaskOut } from "./types/task"
import { EmptyState } from "../common/EmptyState"
import { CreateButton } from "../common/CreateButton"
import { TaskListItem } from "./TaskListItem"
import { DetailView } from "./DetailView"
import { TaskEditForm } from "./EditForm"

export default function TasksView() {
  const notifySuccess = (message: string) => {
    toast.success(message)
  }
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
    notifySuccess("Task deleted")
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


  let content

  if (tasks.length === 0 && !isCreating) {
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
        onSave={(updated) => {
          let exists = false
          setTasks((prev) => {
            exists = prev.some((t) => t.id === updated.id)
            if (exists) {
              return prev.map((t) => (t.id === updated.id ? updated : t))
            }
            return [...prev, updated]
          })
          notifySuccess(exists ? "Task updated" : "Task created")
          setEditingTask(null)
          setIsCreating(false)
          setSelectedTaskId(updated.id)
        }}
        onCancel={() => {
          setEditingTask(null)
          setIsCreating(false)
        }}
      />
    )
  } else if (detail) {
    content = (
      <DetailView
        detail={selectedTask}
        onBack={() => setSelectedTaskId(null)}
        onUpdate={(e) => handleEdit(selectedTask, e)}
        onDelete={(e) => handleDelete(selectedTask, e)}
      />
    )
  } else {
    content = (
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

  return (
    <>
      {content}
    </>
  )
}
