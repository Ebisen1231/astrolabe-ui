import { readFile } from "node:fs/promises"
import path from "node:path"

import { assertSchemaVersion, DataContractError } from "@/lib/contracts"
import type {
  DataSource,
  IndexExport,
  LayoutExport,
  MapExport,
  ReportExport,
} from "@/lib/types"
export { assertSchemaVersion, DataContractError } from "@/lib/contracts"

export function resolveDataSource(exportsDir: string | undefined): DataSource {
  const explicit = exportsDir?.trim()
  if (explicit) {
    return { directory: path.resolve(explicit), fixtureMode: false }
  }
  return {
    directory: path.join(process.cwd(), "fixtures", "exports"),
    fixtureMode: true,
  }
}

export function getDataSource(): DataSource {
  return resolveDataSource(process.env.ASTROLABE_EXPORTS_DIR)
}

async function readVersionedJson<T>(filePath: string, label: string): Promise<T> {
  let text: string
  try {
    text = await readFile(filePath, "utf-8")
  } catch {
    throw new DataContractError(`${label}: exportファイルを読み込めません。`)
  }

  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new DataContractError(`${label}: JSON形式が壊れています。`)
  }
  assertSchemaVersion(value, label)
  return value as T
}

export async function loadMapBundle(): Promise<{
  map: MapExport
  layout: LayoutExport
}> {
  const source = getDataSource()
  const [map, layout] = await Promise.all([
    readVersionedJson<MapExport>(path.join(source.directory, "map.json"), "map.json"),
    readVersionedJson<LayoutExport>(
      path.join(source.directory, "layout.json"),
      "layout.json",
    ),
  ])
  return { map, layout }
}

export async function loadIndex(): Promise<IndexExport> {
  const source = getDataSource()
  return readVersionedJson<IndexExport>(
    path.join(source.directory, "index.json"),
    "index.json",
  )
}

export async function loadReport(reportDate: string): Promise<ReportExport> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
    throw new DataContractError("報告日がYYYY-MM-DD形式ではありません。")
  }
  const source = getDataSource()
  return readVersionedJson<ReportExport>(
    path.join(source.directory, "reports", `${reportDate}.json`),
    `reports/${reportDate}.json`,
  )
}
