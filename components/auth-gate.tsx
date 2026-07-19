"use client"

import type { Session } from "@supabase/supabase-js"
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { RemoteRuntimeConfig } from "@/lib/runtime-mode"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

type AuthContextValue = {
  accessToken: string | null
  email: string | null
  remote: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error("AuthGateの外でuseAuthは使えません。")
  return value
}

function LoginForm({
  config,
  onSession,
}: {
  config: RemoteRuntimeConfig
  onSession: (session: Session) => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const { data, error: authError } = await getSupabaseBrowserClient(
      config,
    ).auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (authError || !data.session) {
      setError("ログインに失敗しました。入力内容を確認してください。")
      return
    }
    onSession(data.session)
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">PRIVATE OBSERVATORY</p>
        <h1 id="login-title">Astrolabeへログイン</h1>
        <p className="lead">施主専用の学習星図です。</p>
        <form onSubmit={submit}>
          <label htmlFor="login-email">メールアドレス</label>
          <input
            id="login-email"
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <label htmlFor="login-password">パスワード</label>
          <input
            id="login-password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && <p className="form-error">{error}</p>}
          <button disabled={submitting} type="submit">
            {submitting ? "確認中…" : "ログイン"}
          </button>
        </form>
      </section>
    </main>
  )
}

export function AuthGate({
  config,
  children,
}: {
  config: RemoteRuntimeConfig | null
  children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(config))

  useEffect(() => {
    if (!config) return
    const supabase = getSupabaseBrowserClient(config)
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        setLoading(false)
      }
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [config])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.access_token ?? null,
      email: session?.user.email ?? null,
      remote: Boolean(config),
      signOut: async () => {
        if (config) await getSupabaseBrowserClient(config).auth.signOut()
        setSession(null)
      },
    }),
    [config, session],
  )

  if (loading) {
    return <main className="login-page"><p>星図を確認しています…</p></main>
  }
  if (config && !session) {
    return <LoginForm config={config} onSession={setSession} />
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
