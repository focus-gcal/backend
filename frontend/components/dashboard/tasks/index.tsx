import { EmptyState } from "../common/EmptyState"
export default function TasksView() {
  return (
    <div>
      <EmptyState
        onCreate={() => {}}
        titleText="No tasks yet"
        descriptionText="Create your first task to start focusing on what matters."
        buttonText="Create Task"
      />
    </div>
  )
}