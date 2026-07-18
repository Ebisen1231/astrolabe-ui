import { describe, expect, it } from "vitest"

import { buildGraphElements } from "@/lib/graph"
import type { LayoutExport, MapExport } from "@/lib/types"

const map: MapExport = {
  schema_version: 1,
  latest_report_date: "2026-07-19",
  map_delta_text: "1ノード増えた。",
  today_node_ids: ["new"],
  concepts: [
    {
      id: "old",
      name: "既知概念",
      kind: "concept",
      status: "learned",
      confidence: 0.9,
      summary: "",
      source_urls: [],
      first_seen: null,
      last_touched: null,
    },
    {
      id: "new",
      name: "新規概念",
      kind: "concept",
      status: "unknown",
      confidence: 0,
      summary: "",
      source_urls: [],
      first_seen: null,
      last_touched: null,
    },
  ],
  edges: [
    {
      src: "new",
      dst: "old",
      type: "prerequisite",
      weight: 1,
      created_by: null,
      created_at: null,
    },
  ],
}

const layout: LayoutExport = {
  schema_version: 1,
  positions: { old: { x: 10, y: 20 }, new: { x: 30, y: 40 } },
}

describe("Cytoscape elements", () => {
  it("uses core positions and marks today/learned nodes", () => {
    const elements = buildGraphElements(map, layout)
    expect(elements[0]).toMatchObject({ position: { x: 10, y: 20 }, classes: "learned" })
    expect(elements[1]).toMatchObject({ position: { x: 30, y: 40 }, classes: "unknown today" })
    expect(elements[2]).toMatchObject({ classes: "prerequisite" })
  })
})
