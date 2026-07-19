import type { Metadata } from "next"

import { AuthGate } from "@/components/auth-gate"
import { SiteHeader } from "@/components/site-header"
import { getDataSource } from "@/lib/data"
import { getRemoteRuntimeConfig } from "@/lib/runtime-mode"

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
  const remoteConfig = getRemoteRuntimeConfig()
  const fixtureMode = remoteConfig ? false : getDataSource().fixtureMode
  return (
    <html lang="ja">
      <body className={fixtureMode ? "fixture-mode" : undefined}>
        {fixtureMode && (
          <div className="fixture-banner" role="status">
            fixtureデータ表示中(実台帳未接続)
          </div>
        )}
        <AuthGate config={remoteConfig}>
          <SiteHeader />
          {children}
          <footer className="site-footer">
            {remoteConfig
              ? "星図・報告・チューターは認証付きAstrolabe APIへ接続しています。"
              : "星図は静的exportを決定的コードで描画し、チューターはローカルcore APIへ接続します。"}
          </footer>
        </AuthGate>
      </body>
    </html>
  )
}
