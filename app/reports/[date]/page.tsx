import Link from "next/link"

import { DataError } from "@/components/data-error"
import { TopicCard } from "@/components/topic-card"
import { loadReport } from "@/lib/data"

export const dynamic = "force-dynamic"

async function loadPageData(date: string) {
  try {
    return { ok: true as const, report: await loadReport(date) }
  } catch (error) {
    return { ok: false as const, error }
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const result = await loadPageData(date)
  if (!result.ok) return <DataError error={result.error} />
  const report = result.report
  return (
    <main className="content-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">OBSERVATION ARCHIVE</p>
          <h1>{report.date}の報告</h1>
          <p className="lead">{report.map_delta_text}</p>
        </div>
        <Link className="back-link" href="/history">
          ← 履歴へ戻る
        </Link>
      </header>
      <div className="topic-list">
        {report.topics.map((topic) => (
          <TopicCard key={topic.name} reportDate={report.date} topic={topic} />
        ))}
      </div>
    </main>
  )
}
