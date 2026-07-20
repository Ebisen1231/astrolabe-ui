import type { Metadata } from "next"

import { AppShell } from "@/components/app-shell"
import { AuthGate } from "@/components/auth-gate"
import { getDataSource, loadIndex, loadMapBundle } from "@/lib/data"
import { getRemoteRuntimeConfig } from "@/lib/runtime-mode"
import { buildSearchEntries } from "@/lib/search"

import "katex/dist/katex.min.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Astrolabe — 学習マップ",
  description: "学んだ概念の成長差分を毎朝観測する星図型の学習マップ",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const remoteConfig = getRemoteRuntimeConfig()
  const fixtureMode = remoteConfig ? false : getDataSource().fixtureMode
  let initialDates: string[] = []
  let initialEntries = [] as ReturnType<typeof buildSearchEntries>
  if (!remoteConfig) {
    try {
      const [{ map }, index] = await Promise.all([loadMapBundle(), loadIndex()])
      initialDates = index.dates
      initialEntries = buildSearchEntries(map, index)
    } catch {
      // 各pageのDataErrorに任せ、共通shellは空の索引でも描画する。
    }
  }
  return (
    <html lang="ja">
      <body className={fixtureMode ? "fixture-mode" : undefined}>
        {fixtureMode && (
          <div className="fixture-banner" role="status">
            fixtureデータ表示中(実台帳未接続)
          </div>
        )}
        <AuthGate config={remoteConfig}>
          <AppShell
            fixtureMode={fixtureMode}
            initialDates={initialDates}
            initialEntries={initialEntries}
          >
            {children}
          </AppShell>
        </AuthGate>
      </body>
    </html>
  )
}
