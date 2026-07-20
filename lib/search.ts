import { conceptPath, topicPath } from "@/lib/routes"
import type { IndexExport, MapExport } from "@/lib/types"
import type { TutorTask } from "@/lib/tutor-api"

export type SearchEntry = {
  id: string
  type: "concept" | "report" | "task"
  title: string
  subtitle: string
  keywords: string
  href: string
}

export function buildSearchEntries(
  map: MapExport,
  index: IndexExport,
  tasks: TutorTask[] = [],
): SearchEntry[] {
  const concepts: SearchEntry[] = map.concepts.map((concept) => ({
    id: `concept:${concept.id}`,
    type: "concept",
    title: concept.name,
    subtitle: `${concept.kind} · ${concept.status}`,
    keywords: `${concept.id} ${concept.name} ${concept.summary}`,
    href: conceptPath(concept.id),
  }))
  const reports: SearchEntry[] = (index.reports ?? index.dates.map((date) => ({
    date,
    map_delta_text: "",
    topics: [],
  }))).flatMap((report) => {
    const base: SearchEntry = {
      id: `report:${report.date}`,
      type: "report",
      title: `${report.date}の報告`,
      subtitle: report.map_delta_text,
      keywords: `${report.date} ${report.map_delta_text} ${report.topics.map((topic) => `${topic.name} ${topic.summary}`).join(" ")}`,
      href: `/reports/${report.date}`,
    }
    const topics = report.topics.map<SearchEntry>((topic) => ({
      id: `report:${report.date}:${topic.concept_id}`,
      type: "report",
      title: topic.name,
      subtitle: `${report.date}のトピック`,
      keywords: `${report.date} ${topic.name} ${topic.summary}`,
      href: topicPath(report.date, topic.concept_id),
    }))
    return [base, ...topics]
  })
  const taskEntries: SearchEntry[] = tasks.map((task) => ({
    id: `task:${task.id}`,
    type: "task",
    title: task.title,
    subtitle: `${task.kind} · ${task.status}`,
    keywords: `${task.title} ${task.kind} ${task.status} ${task.concept_id ?? ""}`,
    href: `/tasks#task-${task.id}`,
  }))
  return [...concepts, ...reports, ...taskEntries]
}

export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const needle = query.normalize("NFKC").toLocaleLowerCase().trim()
  if (!needle) return entries.slice(0, 8)
  return entries
    .filter((entry) => entry.keywords.normalize("NFKC").toLocaleLowerCase().includes(needle))
    .slice(0, 12)
}
