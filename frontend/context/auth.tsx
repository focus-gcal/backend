import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { AuthState } from "~types/user"

type AuthContextValue = {
  authState: AuthState
  refreshAuth: () => Promise<void>
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const storage = new Storage({ area: "local" })
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(
    AuthState.UNAUTHENTICATED
  )

  const refreshAuth = async () => {
    const authInProgress = await storage.get("authInProgress")
    if (authInProgress) {
      setAuthState(AuthState.LOADING)
      return
    }
    try {
      const res = await sendToBackground({ name: "validateAuth" })
      setAuthState(
        res.valid ? AuthState.AUTHENTICATED : AuthState.UNAUTHENTICATED
      )
    } catch {
      setAuthState(AuthState.LOADING)
    }
  }

  useEffect(() => {
    void refreshAuth()
  }, [])

  const value = useMemo(
    () => ({ authState, refreshAuth, setAuthState }),
    [authState]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
