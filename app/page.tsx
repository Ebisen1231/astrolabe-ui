import { DataError } from "@/components/data-error"
import { RemoteHome } from "@/components/remote-pages"
import { StarMap } from "@/components/star-map"
import { loadMapBundle } from "@/lib/data"
import { getRemoteRuntimeConfig } from "@/lib/runtime-mode"

export const dynamic = "force-dynamic"

async function loadPageData() {
  try {
    return { ok: true as const, data: await loadMapBundle() }
  } catch (error) {
    return { ok: false as const, error }
  }
}

export default async function Home() {
  if (getRemoteRuntimeConfig()) return <RemoteHome />
  const result = await loadPageData()
  if (!result.ok) return <DataError error={result.error} />
  const { map, layout } = result.data
  return (
    <main className="map-page">
      <header className="map-intro">
        <div>
          <p className="eyebrow">LEARNING CONSTELLATION</p>
          <h1>学習マップ</h1>
        </div>
        <time>{map.latest_report_date ?? "報告なし"}</time>
      </header>
      <section className="change-card" aria-labelledby="change-title">
        <p className="eyebrow" id="change-title">
          今日の変化
        </p>
        <p>{map.map_delta_text || "まだマップ差分はありません。"}</p>
      </section>
      <StarMap layout={layout} map={map} />
    </main>
  )
}
