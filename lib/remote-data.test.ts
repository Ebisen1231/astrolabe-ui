import { afterEach, describe, expect, it, vi } from "vitest"

import { loadRemoteMapBundle } from "@/lib/remote-data"

afterEach(() => vi.unstubAllGlobals())

describe("remote export loader", () => {
  it("loads versioned map and layout with the same bearer token", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          schema_version: 1,
          latest_report_date: null,
          map_delta_text: "",
          today_node_ids: [],
          concepts: [],
          edges: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ schema_version: 1, positions: {} }),
      })
    vi.stubGlobal("fetch", fetch)
    const result = await loadRemoteMapBundle("jwt")
    expect(result.map.schema_version).toBe(1)
    expect(result.layout.schema_version).toBe(1)
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer jwt")
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer jwt")
  })

  it("rejects a remote artifact with a mismatched schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ schema_version: 9 }),
      }),
    )
    await expect(loadRemoteMapBundle("jwt")).rejects.toThrow("schema_version 9")
  })
})
