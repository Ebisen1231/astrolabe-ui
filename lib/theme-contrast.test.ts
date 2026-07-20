import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

function channel(value: number) {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string) {
  const [r, g, b] = hex.slice(1).match(/../g)!.map((part) => channel(Number.parseInt(part, 16)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe("reading surface WCAG AA tokens", () => {
  it("keeps every primary text/background pair at 4.5:1 or higher", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")
    const tokens = Object.fromEntries(
      [...css.matchAll(/--(paper|paper-ground|ink|ink-support|callout|ring|reading-link):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]),
    )
    const pairs = [
      ["ink", "paper"], ["ink", "paper-ground"], ["ink", "callout"],
      ["ink-support", "paper"], ["ink-support", "paper-ground"],
      ["reading-link", "paper"], ["reading-link", "paper-ground"],
      ["ink", "ring"],
    ]
    for (const [foreground, background] of pairs) {
      expect(contrast(tokens[foreground], tokens[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})
