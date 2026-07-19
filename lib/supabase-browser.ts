"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { RemoteRuntimeConfig } from "@/lib/runtime-mode"

let client: SupabaseClient | null = null

export function getSupabaseBrowserClient(config: RemoteRuntimeConfig): SupabaseClient {
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  }
  return client
}
