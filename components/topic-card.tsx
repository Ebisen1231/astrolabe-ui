import { FEEDBACK_ACTIONS, feedbackIssueUrl } from "@/lib/feedback"
import type { Topic } from "@/lib/types"

export function TopicCard({ topic, reportDate }: { topic: Topic; reportDate: string }) {
  const sources = (topic.source_urls ?? []).filter((url) => /^https?:\/\//.test(url))
  return (
    <article className="topic-card">
      <div className="topic-meta">
        <span>{topic.kind ?? "concept"}</span>
        {topic.est_minutes && <span>約{topic.est_minutes}分</span>}
      </div>
      <h2>{topic.name}</h2>
      <p className="topic-summary">{topic.summary || "要約はありません。"}</p>
      {topic.why_now && (
        <section>
          <h3>なぜ今か</h3>
          <p>{topic.why_now}</p>
        </section>
      )}
      {topic.learn_content && (
        <section>
          <h3>学習コンテンツ</h3>
          <div className="learn-content">{topic.learn_content}</div>
        </section>
      )}
      {sources.length > 0 && (
        <section className="topic-sources">
          <h3>出典</h3>
          <ul>
            {sources.map((url) => (
              <li key={url}>
                <a href={url} rel="noreferrer" target="_blank">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <nav className="feedback-actions" aria-label={`${topic.name}へのフィードバック`}>
        {FEEDBACK_ACTIONS.map(([action, label]) => (
          <a
            href={feedbackIssueUrl(action, topic.name, reportDate)}
            key={action}
            rel="noreferrer"
            target="_blank"
          >
            {label}
          </a>
        ))}
      </nav>
    </article>
  )
}
