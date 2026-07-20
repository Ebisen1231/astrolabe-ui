"use client"

import { createContext, type ReactNode, useContext } from "react"

const RuntimeContext = createContext({ fixtureMode: false })

export function RuntimeProvider({
  fixtureMode,
  children,
}: {
  fixtureMode: boolean
  children: ReactNode
}) {
  return <RuntimeContext.Provider value={{ fixtureMode }}>{children}</RuntimeContext.Provider>
}

export function useRuntimeMode() {
  return useContext(RuntimeContext)
}
