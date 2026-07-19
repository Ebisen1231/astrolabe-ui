export type PublicRuntimeEnv = {
  NEXT_PUBLIC_ASTROLABE_API_URL?: string
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
}

export type RemoteRuntimeConfig = {
  apiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
}

export function resolveRemoteRuntimeConfig(
  env: PublicRuntimeEnv,
): RemoteRuntimeConfig | null {
  const values = {
    apiUrl: env.NEXT_PUBLIC_ASTROLABE_API_URL?.trim().replace(/\/$/, "") ?? "",
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") ?? "",
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  }
  const configured = Object.values(values).filter(Boolean).length
  if (configured === 0) return null
  if (configured !== 3) {
    throw new Error("公開モードの環境変数3件をすべて設定してください。")
  }
  if (!values.apiUrl.startsWith("https://") || !values.supabaseUrl.startsWith("https://")) {
    throw new Error("公開モードのURLはhttpsで指定してください。")
  }
  return values
}

export function getRemoteRuntimeConfig(): RemoteRuntimeConfig | null {
  return resolveRemoteRuntimeConfig({
    NEXT_PUBLIC_ASTROLABE_API_URL: process.env.NEXT_PUBLIC_ASTROLABE_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
