import { FEEDBACK_ACTIONS, feedbackIssueUrl } from "@/lib/feedback"

export function FeedbackActions({
  conceptName,
  reportDate,
}: {
  conceptName: string
  reportDate: string
}) {
  return (
    <nav className="feedback-actions" aria-label={`${conceptName}へのフィードバック`}>
      {FEEDBACK_ACTIONS.map(([action, label]) => (
        <a href={feedbackIssueUrl(action, conceptName, reportDate)} key={action} rel="noreferrer" target="_blank">
          {label}
        </a>
      ))}
    </nav>
  )
}
