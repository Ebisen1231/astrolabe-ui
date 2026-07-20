import { ConceptDetailView } from "@/components/concept-pages"
import { DataError } from "@/components/data-error"
import { RemoteConceptDetail } from "@/components/remote-pages"
import { loadIndex, loadMapBundle } from "@/lib/data"
import { decodeConceptId } from "@/lib/routes"
import { getRemoteRuntimeConfig } from "@/lib/runtime-mode"

export const dynamic = "force-dynamic"

async function loadPageData() {
  try {
    const [{ map }, index] = await Promise.all([loadMapBundle(), loadIndex()])
    return { ok: true as const, map, index }
  } catch (error) {
    return { ok: false as const, error }
  }
}

export default async function ConceptPage({ params }: { params: Promise<{ conceptId: string }> }) {
  const conceptId = decodeConceptId((await params).conceptId)
  if (getRemoteRuntimeConfig()) return <RemoteConceptDetail conceptId={conceptId} />
  const result = await loadPageData()
  if (!result.ok) return <DataError error={result.error} />
  return <ConceptDetailView conceptId={conceptId} index={result.index} map={result.map} />
}
