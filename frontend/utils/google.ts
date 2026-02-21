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
  url.searchParams.set("state", state)
  return url.toString()
}

function extractResponse(response: string, state: any) {

    if (!response) { throw new Error("No response from Google") }

    const redirectURL = new URL(response)
    const oauthError = redirectURL.searchParams.get("error")
    if (oauthError) { throw new Error(`OAuth error: ${oauthError}`) }
    
    const code = redirectURL.searchParams.get("code")
    const returned_state = redirectURL.searchParams.get("state")

    if (!code) { throw new Error("No code from Google") }
    if (!returned_state) { throw new Error("No state from Google") }
    if (state !== returned_state) { throw new Error("State mismatch") }

    return { code, state }
}

export { generateWebAppURL, extractResponse }
