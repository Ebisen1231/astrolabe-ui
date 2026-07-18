import { describe, expect, it } from "vitest"

import { DataContractError, assertSchemaVersion, resolveDataSource } from "@/lib/data"

describe("schema_version validation", () => {
  it("accepts schema version 1", () => {
    expect(() => assertSchemaVersion({ schema_version: 1 }, "map.json")).not.toThrow()
  })

  it("rejects unknown schema versions with an actionable message", () => {
    expect(() => assertSchemaVersion({ schema_version: 2 }, "map.json")).toThrow(
      new DataContractError(
        "map.json: schema_version 2 は未対応です。期待値は 1 です。coreとUIを同じ版へ更新してください。",
      ),
    )
  })
})

describe("data source", () => {
  it("uses fixture mode when ASTROLABE_EXPORTS_DIR is absent", () => {
    const source = resolveDataSource(undefined)
    expect(source.fixtureMode).toBe(true)
    expect(source.directory).toMatch(/fixtures[/\\]exports$/)
  })

  it("uses an explicit exports directory as real data", () => {
    const source = resolveDataSource("/tmp/private-ledger/exports")
    expect(source).toEqual({
      directory: "/tmp/private-ledger/exports",
      fixtureMode: false,
    })
  })
})
