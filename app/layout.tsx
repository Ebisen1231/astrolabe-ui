import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { getDataSource } from "@/lib/data"

import "./globals.css"

export const metadata: Metadata = {
  title: "Astrolabe — 学習マップ",
  description: "学んだ概念の成長差分を毎朝観測する星図型の学習マップ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { fixtureMode } = getDataSource()
  return (
    <html lang="ja">
      <body className={fixtureMode ? "fixture-mode" : undefined}>
        {fixtureMode && (
          <div className="fixture-banner" role="status">
            fixtureデータ表示中(実台帳未接続)
          </div>
        )}
        <SiteHeader />
        {children}
        <footer className="site-footer">
          星図は静的exportを決定的コードで描画し、チューターはローカルcore APIへ接続します。
        </footer>
      </body>
    </html>
  )
}
