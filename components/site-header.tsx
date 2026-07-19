import Link from "next/link"

import { AuthMenu } from "@/components/auth-menu"

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Astrolabe 学習マップ">
        <span className="brand-mark" aria-hidden="true" />
        <span>Astrolabe</span>
      </Link>
      <nav className="site-nav" aria-label="主要ナビゲーション">
        <Link href="/">学習マップ</Link>
        <Link href="/reports">今日の報告</Link>
        <Link href="/history">履歴</Link>
        <Link href="/tasks">タスク</Link>
        <Link href="/tutor">チューター</Link>
      </nav>
      <AuthMenu />
    </header>
  )
}
