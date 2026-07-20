import { describe, expect, it } from "vitest"

import {
  conceptPath,
  decodeConceptId,
  encodeConceptId,
  topicPath,
  tutorQuestionPath,
} from "@/lib/routes"

describe("concept URL round trip", () => {
  it("round-trips a Japanese concept id across concept and report routes", () => {
    const conceptId = "リランキング"
    const encoded = encodeConceptId(conceptId)
    expect(encoded).toBe("%E3%83%AA%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0")
    expect(decodeConceptId(encoded)).toBe(conceptId)
    expect(conceptPath(conceptId)).toBe(`/concepts/${encoded}`)
    expect(topicPath("2026-07-20", conceptId)).toBe(`/reports/2026-07-20/topics/${encoded}`)
  })

  it("encodes a Japanese no-hit query for the tutor", () => {
    expect(tutorQuestionPath("未知の概念")).toContain("q=%E6%9C%AA%E7%9F%A5")
  })
})
