import { describe, expect, it } from "vitest"

import { resolveRemoteRuntimeConfig } from "@/lib/runtime-mode"

describe("remote runtime config", () => {
  it("keeps local fixture/exports mode when no public env exists", () => {
    expect(resolveRemoteRuntimeConfig({})).toBeNull()
  })

  it("requires all three public variables", () => {
    expect(() =>
      resolveRemoteRuntimeConfig({ NEXT_PUBLIC_ASTROLABE_API_URL: "https://api.example" }),
    ).toThrow("環境変数3件")
  })

  it("accepts only complete https production config", () => {
    expect(
      resolveRemoteRuntimeConfig({
        NEXT_PUBLIC_ASTROLABE_API_URL: "https://api.example/",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co/",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toEqual({
      apiUrl: "https://api.example",
      supabaseUrl: "https://project.supabase.co",
      supabaseAnonKey: "anon",
    })
  })
})
