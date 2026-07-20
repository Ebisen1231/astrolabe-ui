import { afterEach, describe, expect, it, vi } from "vitest"

import {
  completeTutorTask,
  createTutorTask,
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
    await sendTutorTurn("tutor-a", [{ role: "user", content: "RoPE?" }], "jwt")
    const [, init] = fetch.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({
      session_id: "tutor-a",
      history: [{ role: "user", content: "RoPE?" }],
    })
    expect(init.headers.Authorization).toBe("Bearer jwt")
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

  it("creates a task through the authenticated direct task route", async () => {
    const task = { id: 2, concept_id: "リランキング", title: "並べ替える", kind: "implement", status: "open", est_minutes: 10, evidence: null, created_at: null, done_at: null }
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ task }) })
    vi.stubGlobal("fetch", fetch)
    await expect(createTutorTask({ concept_id: "リランキング", concept_name: "リランキング", title: "並べ替える", kind: "implement", est_minutes: 10, edges: [] }, "jwt")).resolves.toEqual(task)
    const [, init] = fetch.mock.calls[0]
    expect(init.method).toBe("POST")
    expect(init.headers.Authorization).toBe("Bearer jwt")
    expect(JSON.parse(init.body).kind).toBe("implement")
  })
})
