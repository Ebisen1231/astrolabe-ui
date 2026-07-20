"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@/components/auth-gate"
import { StarMap } from "@/components/star-map"
import { TopicCard } from "@/components/topic-card"
import { TopicDetail } from "@/components/topic-detail"
import { ConceptDetailView, ConceptListView } from "@/components/concept-pages"
import { conceptIdFromName } from "@/lib/routes"
import {
  loadRemoteIndex,
  loadRemoteMapBundle,
  loadRemoteReport,
} from "@/lib/remote-data"
import type { IndexExport, LayoutExport, MapExport, ReportExport } from "@/lib/types"

function useRemoteResource<T>(loader: (token: string) => Promise<T>) {
  const { accessToken } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!accessToken) return
    let active = true
    void loader(accessToken)
      .then((value) => {
        if (active) setData(value)
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "データを取得できません。")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, loader])
  return { data, error, loading }
}

function RemoteStatus({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <main className="content-page"><p>観測データを読み込み中…</p></main>
  if (error) return <main className="content-page"><div className="empty-state">{error}</div></main>
  return null
}

export function RemoteHome() {
  const loader = useCallback((token: string) => loadRemoteMapBundle(token), [])
  const { data, error, loading } = useRemoteResource<{
    map: MapExport
    layout: LayoutExport
  }>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  const { map, layout } = data
  return (
    <main className="map-page">
      <header className="map-intro">
        <div><p className="eyebrow">LEARNING CONSTELLATION</p><h1>学習マップ</h1></div>
        <time>{map.latest_report_date ?? "報告なし"}</time>
      </header>
      <section className="change-card" aria-labelledby="change-title">
        <p className="eyebrow" id="change-title">今日の変化</p>
        <p>{map.map_delta_text || "まだマップ差分はありません。"}</p>
      </section>
      <StarMap layout={layout} map={map} />
    </main>
  )
}

function ReportView({ report, archive = false }: { report: ReportExport; archive?: boolean }) {
  return (
    <main className="content-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{archive ? "OBSERVATION ARCHIVE" : "TODAY'S REPORT"}</p>
          <h1>{archive ? `${report.date}の報告` : "今日の報告"}</h1>
          <p className="lead">{report.map_delta_text}</p>
        </div>
        {archive ? (
          <Link className="back-link" href="/history">← 履歴へ戻る</Link>
        ) : (
          <div className="heading-meta"><time>{report.date}</time><Link href="/history">過去の報告を見る</Link></div>
        )}
      </header>
      <div className="topic-list">
        {report.topics.map((topic) => (
          <TopicCard key={topic.name} reportDate={report.date} topic={topic} />
        ))}
      </div>
    </main>
  )
}

export function RemoteReports() {
  const loader = useCallback(async (token: string) => {
    const index = await loadRemoteIndex(token)
    return index.dates[0] ? loadRemoteReport(index.dates[0], token) : null
  }, [])
  const { data, error, loading } = useRemoteResource<ReportExport | null>(loader)
  if (loading || error) return <RemoteStatus loading={loading} error={error} />
  if (!data) return <main className="content-page"><div className="empty-state">日次報告はまだありません。</div></main>
  return <ReportView report={data} />
}

export function RemoteHistory() {
  const loader = useCallback((token: string) => loadRemoteIndex(token), [])
  const { data, error, loading } = useRemoteResource<IndexExport>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  return (
    <main className="content-page narrow-page">
      <header className="page-heading">
        <div><p className="eyebrow">OBSERVATION ARCHIVE</p><h1>履歴</h1><p className="lead">これまでに届いた朝の観測報告です。</p></div>
        <span className="record-count">{data.dates.length} reports</span>
      </header>
      {data.dates.length > 0 ? (
        <ol className="history-list">
          {data.dates.map((date, index) => (
            <li key={date}><Link href={`/reports/${date}`}><span>{date}</span><span>{index === 0 ? "最新" : "報告を開く"} →</span></Link></li>
          ))}
        </ol>
      ) : <div className="empty-state">日次報告はまだありません。</div>}
    </main>
  )
}

export function RemoteReportDetail({ date }: { date: string }) {
  const loader = useCallback(
    (token: string) => loadRemoteReport(date, token),
    [date],
  )
  const { data, error, loading } = useRemoteResource<ReportExport>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  return <ReportView archive report={data} />
}

export function RemoteTopicDetail({ date, conceptId }: { date: string; conceptId: string }) {
  const loader = useCallback((token: string) => loadRemoteReport(date, token), [date])
  const { data, error, loading } = useRemoteResource<ReportExport>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  const topic = data.topics.find((item) => (item.concept_id ?? conceptIdFromName(item.name)) === conceptId)
  if (!topic) return <main className="content-page"><div className="empty-state">トピックが見つかりません。</div></main>
  return <TopicDetail reportDate={data.date} topic={topic} />
}

export function RemoteConcepts() {
  const loader = useCallback((token: string) => loadRemoteMapBundle(token), [])
  const { data, error, loading } = useRemoteResource<{ map: MapExport; layout: LayoutExport }>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  return <ConceptListView map={data.map} />
}

export function RemoteConceptDetail({ conceptId }: { conceptId: string }) {
  const loader = useCallback(async (token: string) => {
    const [{ map }, index] = await Promise.all([loadRemoteMapBundle(token), loadRemoteIndex(token)])
    return { map, index }
  }, [])
  const { data, error, loading } = useRemoteResource<{ map: MapExport; index: IndexExport }>(loader)
  if (!data) return <RemoteStatus loading={loading} error={error} />
  return <ConceptDetailView conceptId={conceptId} index={data.index} map={data.map} />
}
