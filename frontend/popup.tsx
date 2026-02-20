import { AuthState } from "types/user"

import { Dashboard, Loading, Login } from "~components"

import "./popup.css"

import { AuthProvider, useAuth } from "context/auth"

function PopupContent() {
  const { authState } = useAuth()

  return (
    <div
      style={{
        padding: 20,
        minWidth: 320,
        minHeight: 500,
        width: 320,
        height: 500,
        overflow: "hidden"
      }}>
      {authState === AuthState.LOADING && <Loading />}
      {authState === AuthState.AUTHENTICATED && <Dashboard />}
      {authState === AuthState.UNAUTHENTICATED && <Login />}
    </div>
  )
}

export default function IndexPopup() {
  return (
    <AuthProvider>
      <PopupContent />
    </AuthProvider>
  )
}
