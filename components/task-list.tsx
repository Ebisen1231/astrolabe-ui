"use client"

import { FormEvent, useEffect, useState } from "react"

import { useAuth } from "@/components/auth-gate"
import {
  completeTutorTask,
  loadTutorTasks,
  type TutorTask,
} from "@/lib/tutor-api"

export function TaskList() {
  const { accessToken } = useAuth()
  const [tasks, setTasks] = useState<TutorTask[]>([])
  const [evidence, setEvidence] = useState<Record<number, string>>({})
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function refresh() {
    setLoading(true)
    setError("")
    try {
      setTasks(await loadTutorTasks(accessToken))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "タスクを取得できません。")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    loadTutorTasks(accessToken)
      .then((rows) => {
        if (active) setTasks(rows)
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "タスクを取得できません。")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken])

  async function complete(event: FormEvent, task: TutorTask) {
    event.preventDefault()
    const value = evidence[task.id]?.trim()
    if (!value) return
    setPendingId(task.id)
    setError("")
    try {
      const updated = await completeTutorTask(task.id, value, accessToken)
      setTasks((current) => current.map((row) => (row.id === updated.id ? updated : row)))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "タスクを完了できません。")
    } finally {
      setPendingId(null)
    }
  }

  if (loading) return <p className="task-status">タスクを読み込み中…</p>

  return (
    <>
      {error && (
        <div className="task-api-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void refresh()}>
            再試行
          </button>
        </div>
      )}
      {tasks.length === 0 ? (
        <section className="task-stub">
          <span className="stub-star" aria-hidden="true" />
          <h2>橋渡しタスクはまだありません</h2>
          <p>チューターへ未知語を聞くと、ここに学習タスクが生まれます。</p>
        </section>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <article className={`task-row ${task.status}`} key={task.id}>
              <div className="task-row-heading">
                <div>
                  <p className="tool-label">{task.kind.replaceAll("_", " ")}</p>
                  <h2>{task.title}</h2>
                </div>
                <span className="task-state">{task.status}</span>
              </div>
              <p className="task-meta">
                #{task.id} · {task.est_minutes ?? "?"}分
                {task.concept_id ? ` · ${task.concept_id}` : ""}
              </p>
              {task.status === "done" ? (
                <p className="task-evidence">Evidence: {task.evidence}</p>
              ) : (
                <form className="task-complete-form" onSubmit={(event) => complete(event, task)}>
                  <label htmlFor={`evidence-${task.id}`}>完了evidence</label>
                  <div>
                    <input
                      id={`evidence-${task.id}`}
                      onChange={(event) =>
                        setEvidence((current) => ({
                          ...current,
                          [task.id]: event.target.value,
                        }))
                      }
                      placeholder="例: ノートを3行作成"
                      required
                      value={evidence[task.id] ?? ""}
                    />
                    <button disabled={pendingId === task.id} type="submit">
                      完了
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  )
}
