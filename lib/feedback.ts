const LEDGER_REPOSITORY = "Ebisen1231/astrolabe-ledger"

export const FEEDBACK_ACTIONS = [
  ["selected", "学ぶ"],
  ["selected-later", "気になる"],
  ["marked_known", "もう知っている"],
  ["dismissed", "興味がない"],
] as const

export function conceptIdFromName(name: string): string {
  const normalized = name
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}_]+/gu, "-")
    .replace(/^-+|-+$/g, "")
  return normalized || "unnamed"
}

export function feedbackIssueUrl(
  action: string,
  conceptName: string,
  reportDate: string,
): string {
  const conceptId = conceptIdFromName(conceptName)
  const title = `[fb] ${action} ${conceptId}`
  const body = [
    "[astrolabe-feedback-v1]",
    `concept: ${conceptName}`,
    `report_date: ${reportDate}`,
    "このIssueは次回の朝ジョブで学習台帳へ取り込まれます。",
  ].join("\n")
  const query = new URLSearchParams({ title, body })
  return `https://github.com/${LEDGER_REPOSITORY}/issues/new?${query.toString()}`
}
