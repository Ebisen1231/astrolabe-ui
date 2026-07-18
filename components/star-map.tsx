"use client"

import cytoscape, { type Core, type StylesheetJson } from "cytoscape"
import { useEffect, useMemo, useRef, useState } from "react"

import { buildGraphElements } from "@/lib/graph"
import type { Concept, LayoutExport, MapExport } from "@/lib/types"

const MAP_STYLE: StylesheetJson = [
  {
    selector: "node",
    style: {
      width: 5,
      height: 5,
      "background-color": "#7C8FB8",
      label: "data(label)",
      color: "#6B7EA3",
      "font-size": 11,
      "font-family": "ui-sans-serif, system-ui, sans-serif",
      "text-valign": "bottom",
      "text-margin-y": 8,
      "text-wrap": "wrap",
      "text-max-width": "116px",
      "overlay-opacity": 0,
    },
  },
  {
    selector: "node.learned",
    style: {
      width: 9,
      height: 9,
      "background-color": "#E8B84B",
      color: "#E8E3D8",
    },
  },
  {
    selector: "node.today",
    style: {
      width: 18,
      height: 18,
      "background-color": "#F2E8D5",
      "border-color": "#D8A03D",
      "border-width": 1,
      color: "#E8E3D8",
      "font-weight": 600,
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.2,
      "curve-style": "bezier",
      "line-color": "#3A4E7E",
      opacity: 0.8,
    },
  },
  {
    selector: "edge.prerequisite",
    style: {
      "line-style": "solid",
      "line-color": "#5C74AB",
    },
  },
  {
    selector: "edge.related",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [2, 4],
      "line-color": "#3A4E7E",
    },
  },
]

export function StarMap({ map, layout }: { map: MapExport; layout: LayoutExport }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Core | null>(null)
  const firstId = map.today_node_ids[0] ?? map.concepts[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(firstId)
  const elements = useMemo(() => buildGraphElements(map, layout), [layout, map])

  useEffect(() => {
    if (!containerRef.current) return
    const graph = cytoscape({
      container: containerRef.current,
      elements,
      style: MAP_STYLE,
      layout: { name: "preset", fit: true, padding: 72 },
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.18,
      selectionType: "single",
    })
    graphRef.current = graph
    graph.on("tap", "node", (event) => setSelectedId(event.target.id()))

    const observer = new ResizeObserver(() => {
      graph.resize()
      graph.fit(undefined, 72)
    })
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      graph.destroy()
      graphRef.current = null
    }
  }, [elements])

  const selected = map.concepts.find((concept) => concept.id === selectedId) ?? null

  return (
    <div className="map-workspace">
      <section className="map-panel" aria-label="学習概念の星図">
        <div ref={containerRef} className="learning-map" />
        <MapLegend />
      </section>
      <NodeDetail concept={selected} isToday={selected ? map.today_node_ids.includes(selected.id) : false} />
    </div>
  )
}

function NodeDetail({ concept, isToday }: { concept: Concept | null; isToday: boolean }) {
  if (!concept) {
    return (
      <aside className="node-detail">
        <p className="eyebrow">STAR DETAIL</p>
        <h2>星を選択してください</h2>
        <p className="muted">マップ上の概念をクリックすると、学習状態と出典を確認できます。</p>
      </aside>
    )
  }
  return (
    <aside className="node-detail" aria-live="polite">
      <div className="detail-heading">
        <p className="eyebrow">{isToday ? "TODAY'S NEW STAR" : "CONCEPT"}</p>
        <span className={`status status-${concept.status}`}>{concept.status}</span>
      </div>
      <h2>{concept.name}</h2>
      <p className="detail-summary">{concept.summary || "この関連概念の要約はまだありません。"}</p>
      <dl className="detail-stats">
        <div>
          <dt>種別</dt>
          <dd>{concept.kind}</dd>
        </div>
        <div>
          <dt>理解度</dt>
          <dd>{Math.round(concept.confidence * 100)}%</dd>
        </div>
      </dl>
      {concept.source_urls.length > 0 && (
        <div className="detail-sources">
          <h3>出典</h3>
          <ul>
            {concept.source_urls.map((url) => (
              <li key={url}>
                <a href={url} rel="noreferrer" target="_blank">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

function MapLegend() {
  return (
    <div className="map-legend" aria-label="星図の凡例">
      <span><i className="legend-star legend-today" />今日の新規ノード</span>
      <span><i className="legend-star legend-unknown" />未学習</span>
      <span><i className="legend-star legend-learned" />習得済み</span>
      <span><i className="legend-line legend-prerequisite" />前提</span>
      <span><i className="legend-line legend-related" />関連</span>
    </div>
  )
}
