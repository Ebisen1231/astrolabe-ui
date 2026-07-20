import { describe, expect, it } from "vitest"

import { buildSearchEntries, searchEntries } from "@/lib/search"
import type { IndexExport, MapExport } from "@/lib/types"

const map = {
  schema_version: 1,
  latest_report_date: "2026-07-20",
  map_delta_text: "",
  today_node_ids: [],
  concepts: [{ id: "リランキング", name: "リランキング", kind: "concept", status: "unknown", confidence: 0, summary: "検索結果を並べ替える", source_urls: [], first_seen: null, last_touched: null }],
  edges: [],
} satisfies MapExport

const index = {
  schema_version: 1,
  dates: ["2026-07-20"],
  reports: [{ date: "2026-07-20", map_delta_text: "順位学習", topics: [{ concept_id: "リランキング", name: "リランキング", summary: "検索品質" }] }],
} satisfies IndexExport

describe("cross-resource search", () => {
  it("finds concepts, report topics, and tasks", () => {
    const entries = buildSearchEntries(map, index, [{ id: 7, concept_id: "リランキング", title: "10件を並べ替える", kind: "implement", status: "open", est_minutes: 10, evidence: null, created_at: null, done_at: null }])
    const resultTypes = searchEntries(entries, "リランキング").map((entry) => entry.type)
    expect(resultTypes).toContain("concept")
    expect(resultTypes).toContain("report")
    expect(resultTypes).toContain("task")
    expect(searchEntries(entries, "存在しない語")).toEqual([])
  })
})
