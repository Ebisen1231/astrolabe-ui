import { notFound } from "next/navigation"

import { RemoteTopicDetail } from "@/components/remote-pages"
import { TopicDetail } from "@/components/topic-detail"
import { loadReport } from "@/lib/data"
import { conceptIdFromName, decodeConceptId } from "@/lib/routes"
import { getRemoteRuntimeConfig } from "@/lib/runtime-mode"

export const dynamic = "force-dynamic"

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ date: string; conceptId: string }>
}) {
  const { date, conceptId: rawConceptId } = await params
  const conceptId = decodeConceptId(rawConceptId)
  if (getRemoteRuntimeConfig()) return <RemoteTopicDetail date={date} conceptId={conceptId} />
  const report = await loadReport(date).catch(() => null)
  const topic = report?.topics.find(
    (item) => (item.concept_id ?? conceptIdFromName(item.name)) === conceptId,
  )
  if (!report || !topic) notFound()
  return <TopicDetail reportDate={report.date} topic={topic} />
}
