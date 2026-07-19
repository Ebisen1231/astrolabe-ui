export const DEFAULT_TUTOR_API_URL = "http://localhost:8787"

export type TutorCard = {
  type: string
  [key: string]: unknown
}

export type TutorMessage = {
  role: "user" | "assistant"
  content: string
  cards?: TutorCard[]
}

export type TutorTurnResponse = {
  session_id: string
  message: string
  cards: TutorCard[]
  budget_exhausted: boolean
}

export type TutorTask = {
  id: number
  concept_id: string | null
  title: string
  kind: "read" | "implement" | "quiz" | "build_app_feature"
  status: "open" | "done"
  est_minutes: number | null
  evidence: string | null
  created_at: string | null
  done_at: string | null
}

export function resolveTutorApiUrl(value: string | undefined): string {
  return value?.trim().replace(/\/$/, "") || DEFAULT_TUTOR_API_URL
}

const TUTOR_API_URL = resolveTutorApiUrl(
  process.env.NEXT_PUBLIC_ASTROLABE_TUTOR_URL,
)

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${TUTOR_API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const value = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(value.error || `Tutor API: HTTP ${response.status}`)
  }
  return value
}

export function sendTutorTurn(
  sessionId: string,
  history: TutorMessage[],
): Promise<TutorTurnResponse> {
  return requestJson<TutorTurnResponse>("/v1/tutor/turn", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, history }),
  })
}

export async function loadTutorTasks(): Promise<TutorTask[]> {
  const value = await requestJson<{ tasks: TutorTask[] }>("/v1/tasks")
  return value.tasks
}

export async function completeTutorTask(
  taskId: number,
  evidence: string,
): Promise<TutorTask> {
  const value = await requestJson<{ task: TutorTask }>(
    `/v1/tasks/${taskId}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ evidence, confidence_delta: 0.2 }),
    },
  )
  return value.task
}
