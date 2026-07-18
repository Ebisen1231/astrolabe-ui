import Link from "next/link"

import { DataError } from "@/components/data-error"
import { loadIndex } from "@/lib/data"

export const dynamic = "force-dynamic"

async function loadPageData() {
  try {
    return { ok: true as const, index: await loadIndex() }
  } catch (error) {
    return { ok: false as const, error }
  }
}

export default async function HistoryPage() {
  const result = await loadPageData()
  if (!result.ok) return <DataError error={result.error} />
  const index = result.index
  return (
    <main className="content-page narrow-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">OBSERVATION ARCHIVE</p>
          <h1>履歴</h1>
          <p className="lead">これまでに届いた朝の観測報告です。</p>
        </div>
        <span className="record-count">{index.dates.length} reports</span>
      </header>
      {index.dates.length > 0 ? (
        <ol className="history-list">
          {index.dates.map((date, indexNumber) => (
            <li key={date}>
              <Link href={`/reports/${date}`}>
                <span>{date}</span>
                <span>{indexNumber === 0 ? "最新" : "報告を開く"} →</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-state">日次報告はまだありません。</div>
      )}
    </main>
  )
}
