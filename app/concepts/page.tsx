import { ConceptListView } from "@/components/concept-pages"
import { DataError } from "@/components/data-error"
import { RemoteConcepts } from "@/components/remote-pages"
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

export default async function ConceptsPage() {
  if (getRemoteRuntimeConfig()) return <RemoteConcepts />
  const result = await loadPageData()
  if (!result.ok) return <DataError error={result.error} />
  return <ConceptListView map={result.data.map} />
}
