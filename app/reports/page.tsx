import Link from "next/link"

import { DataError } from "@/components/data-error"
import { TopicCard } from "@/components/topic-card"
import { loadIndex, loadReport } from "@/lib/data"

export const dynamic = "force-dynamic"

async function loadPageData() {
  try {
    const index = await loadIndex()
    const latestDate = index.dates[0]
    return { ok: true as const, report: latestDate ? await loadReport(latestDate) : null }
  } catch (error) {
    return { ok: false as const, error }
  }
}

export default async function ReportsPage() {
  const result = await loadPageData()
  if (!result.ok) return <DataError error={result.error} />
  const report = result.report
  if (!report) {
    return (
      <main className="content-page">
        <p className="eyebrow">TODAY&apos;S REPORT</p>
        <h1>今日の報告</h1>
        <div className="empty-state">日次報告はまだありません。</div>
      </main>
    )
  }
  return (
    <main className="content-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">TODAY&apos;S REPORT</p>
          <h1>今日の報告</h1>
          <p className="lead">{report.map_delta_text}</p>
        </div>
        <div className="heading-meta">
          <time>{report.date}</time>
          <Link href="/history">過去の報告を見る</Link>
        </div>
      </header>
      <div className="topic-list">
        {report.topics.map((topic) => (
          <TopicCard key={topic.name} reportDate={report.date} topic={topic} />
        ))}
      </div>
    </main>
  )
}
