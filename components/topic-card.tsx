import Link from "next/link"

import { conceptIdFromName, topicPath } from "@/lib/routes"
import type { Topic } from "@/lib/types"

export function TopicCard({ topic, reportDate }: { topic: Topic; reportDate: string }) {
  const conceptId = topic.concept_id ?? conceptIdFromName(topic.name)
  return (
    <article className="topic-card">
      <div className="topic-meta">
        <span>{topic.kind ?? "concept"}</span>
        {topic.est_minutes && <span>約{topic.est_minutes}分</span>}
      </div>
      <h2><Link href={topicPath(reportDate, conceptId)}>{topic.name}</Link></h2>
      <p className="topic-summary">{topic.summary || "要約はありません。"}</p>
      <Link className="topic-open" href={topicPath(reportDate, conceptId)}>詳細を読む →</Link>
    </article>
  )
}
