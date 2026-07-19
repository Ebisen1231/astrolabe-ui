import { requestJson } from "@/lib/api"
import { assertSchemaVersion } from "@/lib/contracts"
import type { IndexExport, LayoutExport, MapExport, ReportExport } from "@/lib/types"

async function versioned<T>(path: string, label: string, accessToken: string): Promise<T> {
  const value = await requestJson<unknown>(path, accessToken)
  assertSchemaVersion(value, label)
  return value as T
}

export async function loadRemoteMapBundle(accessToken: string): Promise<{
  map: MapExport
  layout: LayoutExport
}> {
  const [map, layout] = await Promise.all([
    versioned<MapExport>("/v1/map", "map", accessToken),
    versioned<LayoutExport>("/v1/layout", "layout", accessToken),
  ])
  return { map, layout }
}

export function loadRemoteIndex(accessToken: string): Promise<IndexExport> {
  return versioned<IndexExport>("/v1/index", "index", accessToken)
}

export function loadRemoteReport(
  reportDate: string,
  accessToken: string,
): Promise<ReportExport> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
    throw new Error("報告日が不正です。")
  }
  return versioned<ReportExport>(
    `/v1/reports/${reportDate}`,
    `report:${reportDate}`,
    accessToken,
  )
}
