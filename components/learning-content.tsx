import katex from "katex"
import { Fragment, type ReactNode } from "react"

const MATH = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g

function formula(value: string): { expression: string; displayMode: boolean } | null {
  if (value.startsWith("$$") && value.endsWith("$$")) {
    return { expression: value.slice(2, -2), displayMode: true }
  }
  if (value.startsWith("\\[") && value.endsWith("\\]")) {
    return { expression: value.slice(2, -2), displayMode: true }
  }
  if (value.startsWith("$") && value.endsWith("$")) {
    return { expression: value.slice(1, -1), displayMode: false }
  }
  if (value.startsWith("\\(") && value.endsWith("\\)")) {
    return { expression: value.slice(2, -2), displayMode: false }
  }
  return null
}

export function renderMathText(text: string): ReactNode[] {
  return text.split(MATH).filter(Boolean).map((part, index) => {
    const parsed = formula(part)
    if (!parsed) return <Fragment key={`${index}-${part}`}>{part}</Fragment>
    const html = katex.renderToString(parsed.expression, {
      displayMode: parsed.displayMode,
      throwOnError: false,
      trust: false,
      strict: "warn",
    })
    return <span key={`${index}-${part}`} dangerouslySetInnerHTML={{ __html: html }} />
  })
}

export function LearningContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const bullets = lines.every((line) => line.startsWith("- "))
  if (bullets) {
    return <ul className="learning-block">{lines.map((line) => <li key={line}>{renderMathText(line.slice(2))}</li>)}</ul>
  }
  return <div className="learning-block">{lines.map((line) => <p key={line}>{renderMathText(line.replace(/^-\s*/, ""))}</p>)}</div>
}
