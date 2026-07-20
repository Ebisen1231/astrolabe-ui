"use client"

import { FormEvent, useRef, useState } from "react"

import { useAuth } from "@/components/auth-gate"
import {
  sendTutorTurn,
  type TutorCard,
  type TutorMessage,
  type TutorTask,
} from "@/lib/tutor-api"

function isTask(value: unknown): value is TutorTask {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "number" &&
    typeof (value as { title?: unknown }).title === "string"
  )
}

function ToolCard({ card, onAnswer }: { card: TutorCard; onAnswer: (v: string) => void }) {
  const task = isTask(card.task) ? card.task : null
  if (card.type === "task_created" && task) {
    return (
      <section className="tool-card task-tool-card">
        <p className="tool-label">BRIDGE TASK CREATED</p>
        <h3>{task.title}</h3>
        <p>
          {task.kind} · {task.est_minutes ?? "?"}分 · #{task.id}
        </p>
      </section>
    )
  }
  if (card.type === "task_completed" && task) {
    return (
      <section className="tool-card">
        <p className="tool-label">TASK COMPLETED</p>
        <h3>{task.title}</h3>
        <p>{task.evidence}</p>
      </section>
    )
  }
  if (card.type === "quiz") {
    const options = Array.isArray(card.options)
      ? card.options.filter((value): value is string => typeof value === "string")
      : []
    return (
      <section className="tool-card quiz-tool-card">
        <p className="tool-label">QUICK QUIZ</p>
        <h3>{String(card.question ?? "理解度クイズ")}</h3>
        <div className="quiz-options">
          {options.map((option) => (
            <button key={option} type="button" onClick={() => onAnswer(option)}>
              {option}
            </button>
          ))}
        </div>
      </section>
    )
  }
  if (card.type === "quiz_result") {
    return (
      <section className="tool-card">
        <p className="tool-label">QUIZ RESULT</p>
        <h3>Score {Math.round(Number(card.score ?? 0) * 100)}%</h3>
        <p>{String(card.feedback ?? "")}</p>
      </section>
    )
  }
  if (card.type === "profile_updated" || card.type === "feedback_recorded") {
    return (
      <section className="tool-card">
        <p className="tool-label">LEDGER UPDATED</p>
        <p>{card.type === "profile_updated" ? "プロファイルを更新しました。" : "記録しました。"}</p>
      </section>
    )
  }
  return null
}

export function TutorChat({ initialQuery = "" }: { initialQuery?: string }) {
  const { accessToken } = useAuth()
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [input, setInput] = useState(initialQuery)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const sessionId = useRef<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = input.trim()
    if (!content || pending) return
    if (!sessionId.current) {
      sessionId.current = `tutor-${crypto.randomUUID()}`
    }
    const nextHistory: TutorMessage[] = [...messages, { role: "user", content }]
    setMessages(nextHistory)
    setInput("")
    setPending(true)
    setError("")
    try {
      const result = await sendTutorTurn(sessionId.current, nextHistory, accessToken)
      setMessages([
        ...nextHistory,
        { role: "assistant", content: result.message, cards: result.cards },
      ])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tutor APIへ接続できません。")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="tutor-shell" aria-label="常駐チューター">
      <div className="chat-log" aria-live="polite">
        {messages.length === 0 && (
          <div className="tutor-empty">
            <span className="stub-star" aria-hidden="true" />
            <h2>未知語から、次の一歩へ</h2>
            <p>「RoPEって何？」のように聞くと、台帳を確認して橋渡しタスクを作ります。</p>
          </div>
        )}
        {messages.map((message, index) => (
          <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
            <p className="chat-role">{message.role === "user" ? "YOU" : "ASTROLABE"}</p>
            <p className="chat-text">{message.content}</p>
            {message.cards?.map((card, cardIndex) => (
              <ToolCard
                card={card}
                key={`${card.type}-${cardIndex}`}
                onAnswer={setInput}
              />
            ))}
          </article>
        ))}
        {pending && <p className="chat-pending">星図と台帳を確認中…</p>}
        {error && <p className="chat-error">{error}</p>}
      </div>
      <form className="chat-composer" onSubmit={submit}>
        <label htmlFor="tutor-message">チューターへ質問</label>
        <div>
          <textarea
            id="tutor-message"
            onChange={(event) => setInput(event.target.value)}
            placeholder="未知語、学習相談、クイズ、面談…"
            rows={3}
            value={input}
          />
          <button disabled={pending || !input.trim()} type="submit">
            送信
          </button>
        </div>
      </form>
    </section>
  )
}
