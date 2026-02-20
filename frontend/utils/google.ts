import config from "~config"

function generateWebAppURL(redirectURI: string, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", config.oauth.clientId)
  url.searchParams.set("redirect_uri", redirectURI)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("access_type", "offline")
  url.searchParams.set(
    "scope",
    "openid email profile https://www.googleapis.com/auth/calendar"
  )
  url.searchParams.set("prompt", "consent")
  url.searchParams.set("state", state)
  return url.toString()
}

export { generateWebAppURL }
