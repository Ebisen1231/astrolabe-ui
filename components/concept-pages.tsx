"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/components/auth-gate"
import { useRuntimeMode } from "@/components/runtime-context"
import { conceptPath } from "@/lib/routes"
import { loadTutorTasks, type TutorTask } from "@/lib/tutor-api"
import type { IndexExport, MapExport } from "@/lib/types"

export function ConceptListView({ map }: { map: MapExport }) {
  return (
    <main className="content-page reading-page concept-list-page">
      <header className="page-heading"><div><p className="eyebrow">KNOWLEDGE INDEX</p><h1>概念</h1><p className="lead">星図に現れた概念を、状態と理解度から辿れます。</p></div><span className="record-count">{map.concepts.length} concepts</span></header>
      <div className="concept-grid">
        {map.concepts.map((concept) => (
          <Link href={conceptPath(concept.id)} key={concept.id}>
            <span className={`status status-${concept.status}`}>{concept.status}</span>
            <h2>{concept.name}</h2>
            <p>{concept.summary || "要約はまだありません。"}</p>
            <small>理解度 {Math.round(concept.confidence * 100)}%</small>
          </Link>
        ))}
      </div>
    </main>
  )
}

export function ConceptDetailView({
  map,
  index,
  conceptId,
}: {
  map: MapExport
  index: IndexExport
  conceptId: string
}) {
  const { accessToken } = useAuth()
  const { fixtureMode } = useRuntimeMode()
  const [tasks, setTasks] = useState<TutorTask[]>([])
  const [taskError, setTaskError] = useState("")
  const concept = map.concepts.find((item) => item.id === conceptId)
  const adjacent = useMemo(() => {
    const ids = new Set<string>()
    for (const edge of map.edges) {
      if (edge.src === conceptId) ids.add(edge.dst)
      if (edge.dst === conceptId) ids.add(edge.src)
    }
    return map.concepts.filter((item) => ids.has(item.id))
  }, [conceptId, map.concepts, map.edges])

  useEffect(() => {
    if (fixtureMode) return
    let active = true
    void loadTutorTasks(accessToken).then((rows) => {
      if (active) setTasks(rows.filter((task) => task.concept_id === conceptId))
    }).catch(() => {
      if (active) setTaskError("関連タスクを取得できませんでした。")
    })
    return () => { active = false }
  }, [accessToken, conceptId, fixtureMode])

  if (!concept) return <main className="content-page reading-page"><div className="empty-state">概念が見つかりません。</div></main>
  const backlinks = index.concept_report_backlinks?.[conceptId] ?? []
  return (
    <main className="content-page reading-page concept-detail-page">
      <nav className="breadcrumbs"><Link href="/concepts">概念</Link><span>/</span><span>{concept.name}</span></nav>
      <div className="detail-heading"><p className="eyebrow">CONCEPT</p><span className={`status status-${concept.status}`}>{concept.status}</span></div>
      <h1>{concept.name}</h1>
      <p className="topic-lead">{concept.summary || "この概念の要約はまだありません。"}</p>
      <dl className="concept-stats"><div><dt>種別</dt><dd>{concept.kind}</dd></div><div><dt>理解度</dt><dd>{Math.round(concept.confidence * 100)}%</dd></div><div><dt>初出</dt><dd>{concept.first_seen ?? "—"}</dd></div><div><dt>最終更新</dt><dd>{concept.last_touched ?? "—"}</dd></div></dl>
      <section className="detail-block"><h2>この概念が登場した報告</h2>{backlinks.length ? <ul className="backlink-list">{backlinks.map((link) => <li key={`${link.date}-${link.topic_name}`}><Link href={`/reports/${link.date}/topics/${encodeURIComponent(conceptId)}`}><time>{link.date}</time><span>{link.topic_name}</span></Link></li>)}</ul> : <p className="muted">報告バックリンクはまだありません。</p>}</section>
      <section className="detail-block"><h2>関連タスク</h2>{fixtureMode ? <p className="muted">fixtureでは実台帳のタスクを読みません。</p> : taskError ? <p className="form-error">{taskError}</p> : tasks.length ? <ul className="related-task-list">{tasks.map((task) => <li key={task.id}><Link href={`/tasks#task-${task.id}`}>{task.title}</Link><span>{task.status}</span></li>)}</ul> : <p className="muted">関連タスクはありません。</p>}</section>
      <section className="detail-block"><h2>隣接概念</h2>{adjacent.length ? <div className="related-chips">{adjacent.map((item) => <Link href={conceptPath(item.id)} key={item.id}>{item.name}<small>{item.status}</small></Link>)}</div> : <p className="muted">隣接概念はありません。</p>}</section>
      {concept.source_urls.length > 0 && <section className="detail-block topic-sources"><h2>出典</h2><ul>{concept.source_urls.map((url) => <li key={url}><a href={url} rel="noreferrer" target="_blank">{url}</a></li>)}</ul></section>}
    </main>
  )
}
