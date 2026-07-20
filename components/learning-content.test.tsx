import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { LearningContent } from "@/components/learning-content"

describe("learning math rendering", () => {
  it("renders inline and display formulas with KaTeX while escaping plain HTML", () => {
    const html = renderToStaticMarkup(<LearningContent content={"- 計算量は $O(n^2)$\n- $$x = y + 1$$\n- <script>alert(1)</script>"} />)
    expect(html).toContain("class=\"katex\"")
    expect(html).toContain("katex-display")
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })
})
