import { afterEach, describe, expect, it, vi } from "vitest"

import {
  completeTutorTask,
  DEFAULT_TUTOR_API_URL,
  loadTutorTasks,
  resolveTutorApiUrl,
  sendTutorTurn,
} from "@/lib/tutor-api"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("tutor api", () => {
  it("uses the loopback default and trims one trailing slash", () => {
    expect(resolveTutorApiUrl(undefined)).toBe(DEFAULT_TUTOR_API_URL)
    expect(resolveTutorApiUrl(" http://localhost:9000/ ")).toBe(
      "http://localhost:9000",
    )
  })

  it("sends the complete client-held history", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session_id: "tutor-a",
        message: "ok",
        cards: [],
        budget_exhausted: false,
      }),
    })
    vi.stubGlobal("fetch", fetch)
    await sendTutorTurn("tutor-a", [{ role: "user", content: "RoPE?" }])
    const [, init] = fetch.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({
      session_id: "tutor-a",
      history: [{ role: "user", content: "RoPE?" }],
    })
  })

  it("loads and completes tasks through the local API", async () => {
    const task = {
      id: 1,
      concept_id: "rope",
      title: "read",
      kind: "read",
      status: "open",
      est_minutes: 10,
      evidence: null,
      created_at: null,
      done_at: null,
    }
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [task] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...task, status: "done", evidence: "note" } }),
      })
    vi.stubGlobal("fetch", fetch)
    expect(await loadTutorTasks()).toEqual([task])
    expect((await completeTutorTask(1, "note")).status).toBe("done")
    expect(fetch.mock.calls[1][0]).toContain("/v1/tasks/1/complete")
  })
})
