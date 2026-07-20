"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { AuthMenu } from "@/components/auth-menu"
import { useAuth } from "@/components/auth-gate"
import { RuntimeProvider } from "@/components/runtime-context"
import { loadRemoteIndex, loadRemoteMapBundle } from "@/lib/remote-data"
import { buildSearchEntries, searchEntries, type SearchEntry } from "@/lib/search"
import { tutorQuestionPath } from "@/lib/routes"
import { loadTutorTasks } from "@/lib/tutor-api"

function QuickSearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const results = useMemo(() => searchEntries(entries, query), [entries, query])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) queueMicrotask(() => inputRef.current?.focus())
  }, [open])

  function navigate(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <button className="search-trigger" type="button" onClick={() => setOpen(true)}>
        <span>検索</span><kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            aria-label="Astrolabe横断検索"
            aria-modal="true"
            className="command-palette"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              aria-label="概念・報告・タスクを検索"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) navigate(results[0].href)
              }}
              placeholder="概念、報告、タスクを検索…"
              value={query}
            />
            <div className="command-results">
              {results.map((entry) => (
                <button key={entry.id} type="button" onClick={() => navigate(entry.href)}>
                  <span><small>{entry.type}</small>{entry.title}</span>
                  <em>{entry.subtitle}</em>
                </button>
              ))}
              {query.trim() && results.length === 0 && (
                <div className="command-empty">
                  <p>一致する記録はありません。</p>
                  <button type="button" onClick={() => navigate(tutorQuestionPath(query.trim()))}>
                    「{query.trim()}」をチューターに聞く
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function Sidebar({
  dates,
  entries,
  open,
  onClose,
}: {
  dates: string[]
  entries: SearchEntry[]
  open: boolean
  onClose: () => void
}) {
  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="ページツリー">
      <div className="sidebar-head">
        <Link className="brand" href="/" onClick={onClose}>
          <span className="brand-mark" aria-hidden="true" />Astrolabe
        </Link>
        <button className="drawer-close" type="button" onClick={onClose} aria-label="メニューを閉じる">×</button>
      </div>
      <QuickSearch entries={entries} />
      <nav className="page-tree" aria-label="主要ナビゲーション">
        <Link href="/" onClick={onClose}>学習マップ</Link>
        <Link href="/reports" onClick={onClose}>今日の報告</Link>
        <details open>
          <summary>履歴</summary>
          <div className="history-tree">
            {dates.map((date) => <Link href={`/reports/${date}`} key={date} onClick={onClose}>{date}</Link>)}
            {dates.length === 0 && <span>報告なし</span>}
          </div>
        </details>
        <Link href="/concepts" onClick={onClose}>概念</Link>
        <Link href="/tasks" onClick={onClose}>タスク</Link>
        <Link href="/tutor" onClick={onClose}>チューター</Link>
      </nav>
      <div className="sidebar-auth"><AuthMenu /></div>
    </aside>
  )
}

export function AppShell({
  children,
  fixtureMode,
  initialDates,
  initialEntries,
}: {
  children: ReactNode
  fixtureMode: boolean
  initialDates: string[]
  initialEntries: SearchEntry[]
}) {
  const pathname = usePathname()
  const { accessToken, remote } = useAuth()
  const [dates, setDates] = useState(initialDates)
  const [entries, setEntries] = useState(initialEntries)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (fixtureMode || (remote && !accessToken)) return
    let active = true
    const load = async () => {
      if (remote && accessToken) {
        const [{ map }, index, tasks] = await Promise.all([
          loadRemoteMapBundle(accessToken),
          loadRemoteIndex(accessToken),
          loadTutorTasks(accessToken),
        ])
        return { dates: index.dates, entries: buildSearchEntries(map, index, tasks) }
      }
      const tasks = await loadTutorTasks(null)
      return {
        dates: initialDates,
        entries: [...initialEntries, ...tasks.map((task) => ({
          id: `task:${task.id}`,
          type: "task" as const,
          title: task.title,
          subtitle: `${task.kind} · ${task.status}`,
          keywords: `${task.title} ${task.kind} ${task.status} ${task.concept_id ?? ""}`,
          href: `/tasks#task-${task.id}`,
        }))],
      }
    }
    void load().then((value) => {
      if (active) { setDates(value.dates); setEntries(value.entries) }
    }).catch(() => undefined)
    return () => { active = false }
  }, [accessToken, fixtureMode, initialDates, initialEntries, remote])

  const mapRoute = pathname === "/"
  return (
    <RuntimeProvider fixtureMode={fixtureMode}>
      <div className={`app-shell ${mapRoute ? "map-route" : "reading-route"}`}>
        <Sidebar dates={dates} entries={entries} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        {drawerOpen && <button className="drawer-backdrop" aria-label="メニューを閉じる" onClick={() => setDrawerOpen(false)} />}
        <div className="app-column">
          <header className="mobile-bar">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="メニューを開く">☰</button>
            <Link href="/">Astrolabe</Link>
          </header>
          <div className="app-main">{children}</div>
          <footer className="site-footer">読む・辿る・記録するための、個人の学習台帳。</footer>
        </div>
      </div>
    </RuntimeProvider>
  )
}
