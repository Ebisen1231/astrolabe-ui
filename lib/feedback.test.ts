import { describe, expect, it } from "vitest"

import { conceptIdFromName, feedbackIssueUrl } from "@/lib/feedback"

describe("GitHub feedback links", () => {
  it("matches the core concept id normalization for fixture topics", () => {
    expect(conceptIdFromName("検証器つきRAG(Self-Correcting RAG)")).toBe(
      "検証器つきrag-self-correcting-rag",
    )
  })

  it("prefills the M1 issue title and report date", () => {
    const url = new URL(feedbackIssueUrl("selected-later", "RAG", "2026-07-18"))
    expect(url.hostname).toBe("github.com")
    expect(url.pathname).toBe("/Ebisen1231/astrolabe-ledger/issues/new")
    expect(url.searchParams.get("title")).toBe("[fb] selected-later rag")
    expect(url.searchParams.get("body")).toContain("report_date: 2026-07-18")
  })
})
