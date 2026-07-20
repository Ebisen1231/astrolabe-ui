export function encodeConceptId(conceptId: string): string {
  return encodeURIComponent(conceptId)
}

export function decodeConceptId(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function conceptPath(conceptId: string): string {
  return `/concepts/${encodeConceptId(conceptId)}`
}

export function topicPath(reportDate: string, conceptId: string): string {
  return `/reports/${reportDate}/topics/${encodeConceptId(conceptId)}`
}

export function tutorQuestionPath(query: string): string {
  return `/tutor?q=${encodeURIComponent(query)}`
}

export function conceptIdFromName(name: string): string {
  const normalized = name.normalize("NFKC").toLocaleLowerCase().trim()
  return normalized.replace(/[^\p{L}\p{N}_]+/gu, "-").replace(/^-+|-+$/g, "") || "unnamed"
}
