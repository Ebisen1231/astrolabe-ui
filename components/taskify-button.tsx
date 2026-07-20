"use client"

import Link from "next/link"
import { useState } from "react"

import { useAuth } from "@/components/auth-gate"
import { useRuntimeMode } from "@/components/runtime-context"
import { conceptIdFromName } from "@/lib/routes"
import { createTutorTask } from "@/lib/tutor-api"
import type { Topic } from "@/lib/types"

export function TaskifyButton({ topic }: { topic: Topic }) {
  const { accessToken } = useAuth()
  const { fixtureMode } = useRuntimeMode()
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle")
  const task = topic.practice_task
  if (!task) return null
  const conceptId = topic.concept_id ?? conceptIdFromName(topic.name)

  async function create() {
    if (fixtureMode || state === "pending") return
    setState("pending")
    try {
      await createTutorTask({
        concept_id: conceptId,
        concept_name: topic.name,
        title: task!.title,
        kind: task!.kind,
        est_minutes: task!.est_minutes,
        edges: (topic.related ?? []).map((related) => ({
          src: conceptId,
          src_name: topic.name,
          dst: related.concept_id ?? conceptIdFromName(related.name),
          dst_name: related.name,
          type: related.type,
          weight: 1,
        })),
      }, accessToken)
      setState("done")
    } catch {
      setState("error")
    }
  }

  if (fixtureMode) {
    return (
      <div>
        <button className="taskify-button" disabled type="button">タスク化</button>
        <p className="fixture-write-note">fixtureではタスクを記録しません。</p>
      </div>
    )
  }
  if (state === "done") return <p className="taskify-success">タスクを作成しました。 <Link href="/tasks">タスクを見る</Link></p>
  return (
    <div>
      <button className="taskify-button" disabled={state === "pending"} type="button" onClick={() => void create()}>
        {state === "pending" ? "作成中…" : "タスク化"}
      </button>
      {state === "error" && <p className="form-error" role="alert">タスクを作成できませんでした。もう一度お試しください。</p>}
    </div>
  )
}
