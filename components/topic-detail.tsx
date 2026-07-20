import Link from "next/link"

import { FeedbackActions } from "@/components/feedback-actions"
import { LearningContent } from "@/components/learning-content"
import { TaskifyButton } from "@/components/taskify-button"
import { conceptIdFromName, conceptPath } from "@/lib/routes"
import type { Topic } from "@/lib/types"

export function TopicDetail({ topic, reportDate }: { topic: Topic; reportDate: string }) {
  const sources = (topic.source_urls ?? []).filter((url) => /^https?:\/\//.test(url))
  return (
    <main className="content-page reading-page topic-detail-page">
      <nav className="breadcrumbs" aria-label="パンくず">
        <Link href="/reports">今日の報告</Link><span>/</span>
        <Link href={`/reports/${reportDate}`}>{reportDate}</Link><span>/</span><span>{topic.name}</span>
      </nav>
      <div className="topic-meta"><span>{topic.kind ?? "concept"}</span><span>約{topic.est_minutes ?? 10}分</span></div>
      <h1>{topic.name}</h1>
      {topic.why_now && <aside className="why-callout"><strong>なぜ今</strong><p>{topic.why_now}</p></aside>}
      <p className="topic-lead">{topic.summary || "要約はありません。"}</p>
      {topic.learn_content && <section className="detail-block"><h2>学習コンテンツ</h2><LearningContent content={topic.learn_content} /></section>}
      {topic.practice_task && (
        <section className="practice-card">
          <div><p className="block-label">PRACTICE</p><h2>{topic.practice_task.title}</h2><p>{topic.practice_task.kind} · {topic.practice_task.est_minutes}分</p></div>
          <TaskifyButton topic={topic} />
        </section>
      )}
      {(topic.related ?? []).length > 0 && (
        <section className="detail-block"><h2>関連概念</h2><div className="related-chips">
          {(topic.related ?? []).map((related) => <Link href={conceptPath(related.concept_id ?? conceptIdFromName(related.name))} key={`${related.type}-${related.name}`}>{related.name}<small>{related.type}</small></Link>)}
        </div></section>
      )}
      {sources.length > 0 && <section className="detail-block topic-sources"><h2>出典</h2><ul>{sources.map((url) => <li key={url}><a href={url} rel="noreferrer" target="_blank">{url}</a></li>)}</ul></section>}
      <FeedbackActions conceptName={topic.name} reportDate={reportDate} />
    </main>
  )
}
