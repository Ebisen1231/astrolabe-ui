import type { ElementDefinition } from "cytoscape"

import type { LayoutExport, MapExport } from "@/lib/types"

export function buildGraphElements(
  map: MapExport,
  layout: LayoutExport,
): ElementDefinition[] {
  const today = new Set(map.today_node_ids)
  const knownIds = new Set(map.concepts.map((concept) => concept.id))
  const nodes: ElementDefinition[] = map.concepts.map((concept) => ({
    data: {
      id: concept.id,
      label: concept.name,
      status: concept.status,
      kind: concept.kind,
    },
    position: layout.positions[concept.id] ?? { x: 0, y: 0 },
    classes: [
      concept.status === "learned" ? "learned" : "unknown",
      today.has(concept.id) ? "today" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }))
  const edges: ElementDefinition[] = map.edges
    .filter((edge) => knownIds.has(edge.src) && knownIds.has(edge.dst))
    .map((edge, index) => ({
      data: {
        id: `edge-${index}-${edge.src}-${edge.dst}-${edge.type}`,
        source: edge.src,
        target: edge.dst,
        type: edge.type,
        weight: edge.weight,
      },
      classes: edge.type === "prerequisite" ? "prerequisite" : "related",
    }))
  return [...nodes, ...edges]
}
