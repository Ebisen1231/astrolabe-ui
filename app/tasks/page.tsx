import { TaskList } from "@/components/task-list"

export default function TasksPage() {
  return (
    <main className="content-page narrow-page">
      <p className="eyebrow">LEARNING TASKS</p>
      <h1>タスク</h1>
      <p className="tutor-lead">チューターが作った橋渡しタスクを、evidence付きで完了します。</p>
      <TaskList />
    </main>
  )
}
