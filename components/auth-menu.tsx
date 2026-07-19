"use client"

import { useAuth } from "@/components/auth-gate"

export function AuthMenu() {
  const { email, remote, signOut } = useAuth()
  if (!remote) return null
  return (
    <div className="auth-menu">
      <span>{email}</span>
      <button onClick={() => void signOut()} type="button">
        ログアウト
      </button>
    </div>
  )
}
