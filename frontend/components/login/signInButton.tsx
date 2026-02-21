import { Button } from "antd"
import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import {Storage} from "@plasmohq/storage"

type SignInButtonProps = {
  style?: React.CSSProperties
}

const storage = new Storage({ area: "local" })

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4 5.5l6.3 5.2C37.2 38.4 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

export default function SignInButton({ style }: SignInButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await sendToBackground({ name: "signInGoogle" })
    } finally {
      setLoading(false)
      storage.set("loggedIn", true)

    }
  }
  return (
    <Button
      type="default"
      size="large"
      loading={loading}
      onClick={handleClick}
      block
      icon={<GoogleIcon />}
      style={{
        ...style,
        height: 44,
        borderRadius: 10,
        border: "1px solid #3a3a3a",
        background: "#2a2a2a",
        color: "#f5f5f5",
        fontWeight: 500
      }}>
      Continue with Google
    </Button>
  )
}
