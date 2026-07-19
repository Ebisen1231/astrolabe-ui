import { SCHEMA_VERSION } from "@/lib/types"

export class DataContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DataContractError"
  }
}

export function assertSchemaVersion(
  value: unknown,
  label: string,
): asserts value is { schema_version: typeof SCHEMA_VERSION } {
  if (typeof value !== "object" || value === null) {
    throw new DataContractError(`${label}: JSONのルートがオブジェクトではありません。`)
  }
  const actual = (value as { schema_version?: unknown }).schema_version
  if (actual !== SCHEMA_VERSION) {
    throw new DataContractError(
      `${label}: schema_version ${String(actual)} は未対応です。期待値は ${SCHEMA_VERSION} です。coreとUIを同じ版へ更新してください。`,
    )
  }
}
