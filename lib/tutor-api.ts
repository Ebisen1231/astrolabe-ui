import { requestJson, resolveApiUrl } from "@/lib/api"

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
  return resolveApiUrl(value, undefined)
}

export function sendTutorTurn(
  sessionId: string,
  history: TutorMessage[],
  accessToken: string | null = null,
): Promise<TutorTurnResponse> {
  return requestJson<TutorTurnResponse>("/v1/tutor/turn", accessToken, {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, history }),
  })
}

export async function loadTutorTasks(accessToken: string | null = null): Promise<TutorTask[]> {
  const value = await requestJson<{ tasks: TutorTask[] }>("/v1/tasks", accessToken)
  return value.tasks
}

export async function completeTutorTask(
  taskId: number,
  evidence: string,
  accessToken: string | null = null,
): Promise<TutorTask> {
  const value = await requestJson<{ task: TutorTask }>(
    `/v1/tasks/${taskId}/complete`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ evidence, confidence_delta: 0.2 }),
    },
  )
  return value.task
}
