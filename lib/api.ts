export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function resolveApiUrl(
  publicUrl: string | undefined,
  legacyTutorUrl: string | undefined,
): string {
  return (
    publicUrl?.trim().replace(/\/$/, "") ||
    legacyTutorUrl?.trim().replace(/\/$/, "") ||
    "http://localhost:8787"
  )
}

export const ASTROLABE_API_URL = resolveApiUrl(
  process.env.NEXT_PUBLIC_ASTROLABE_API_URL,
  process.env.NEXT_PUBLIC_ASTROLABE_TUTOR_URL,
)

export async function requestJson<T>(
  path: string,
  accessToken: string | null,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${ASTROLABE_API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })
  let value: (T & { error?: string }) | null = null
  try {
    value = (await response.json()) as T & { error?: string }
  } catch {
    // 内部HTMLやproxyの本文は利用者へ表示しない。
  }
  if (!response.ok) {
    const message =
      response.status === 401
        ? "利用者を確認できません。再ログインしてください。"
        : "Astrolabe APIの処理に失敗しました。"
    throw new ApiError(response.status, message)
  }
  if (value === null) throw new ApiError(response.status, "API応答がJSONではありません。")
  return value
}
