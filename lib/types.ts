export const SCHEMA_VERSION = 1 as const

export type Concept = {
  id: string
  name: string
  kind: string
  status: string
  confidence: number
  summary: string
  source_urls: string[]
  first_seen: string | null
  last_touched: string | null
}

export type Edge = {
  src: string
  dst: string
  type: string
  weight: number
  created_by: string | null
  created_at: string | null
}

export type Topic = {
  concept_id?: string
  name: string
  kind?: string
  summary?: string
  why_now?: string
  learn_content?: string
  practice_task?: {
    title: string
    kind: "read" | "implement" | "quiz" | "build_app_feature"
    est_minutes: number
  }
  est_minutes?: number
  source_urls?: string[]
  related?: Array<{ name: string; type: string; concept_id?: string }>
}

export type MapExport = {
  schema_version: typeof SCHEMA_VERSION
  latest_report_date: string | null
  map_delta_text: string
  today_node_ids: string[]
  concepts: Concept[]
  edges: Edge[]
}

export type LayoutExport = {
  schema_version: typeof SCHEMA_VERSION
  positions: Record<string, { x: number; y: number }>
}

export type ReportExport = {
  schema_version: typeof SCHEMA_VERSION
  date: string
  map_delta_text: string
  topics: Topic[]
  meta: Record<string, unknown>
}

export type IndexExport = {
  schema_version: typeof SCHEMA_VERSION
  dates: string[]
  reports?: ReportSummary[]
  concept_report_backlinks?: Record<string, ReportBacklink[]>
}

export type ReportBacklink = {
  date: string
  topic_name: string
}

export type ReportSummary = {
  date: string
  map_delta_text: string
  topics: Array<{ concept_id: string; name: string; summary: string }>
}

export type DataSource = {
  directory: string
  fixtureMode: boolean
}
