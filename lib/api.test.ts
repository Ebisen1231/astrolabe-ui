import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiError, requestJson, resolveApiUrl } from "@/lib/api"

afterEach(() => vi.unstubAllGlobals())

describe("authenticated API client", () => {
  it("prefers the public API and preserves the loopback fallback", () => {
    expect(resolveApiUrl("https://api.example/", "http://localhost:9000")).toBe(
      "https://api.example",
    )
    expect(resolveApiUrl(undefined, undefined)).toBe("http://localhost:8787")
  })

  it("sends the bearer token without exposing it in the URL", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal("fetch", fetch)
    await requestJson("/v1/map", "jwt-secret")
    const [url, init] = fetch.mock.calls[0]
    expect(url).not.toContain("jwt-secret")
    expect(init.headers.Authorization).toBe("Bearer jwt-secret")
  })

  it("does not surface an internal upstream error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "https://secret.supabase.co /internal/path" }),
      }),
    )
    await expect(requestJson("/v1/map", "jwt")).rejects.toEqual(
      new ApiError(500, "Astrolabe APIの処理に失敗しました。"),
    )
  })
})
