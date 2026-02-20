interface Config {
  oauth: {
    clientId: string
    redirectURI: string
  }
}

const config: Config = {
  oauth: {
    clientId: process.env.PLASMO_PUBLIC_OAUTH_CLIENT_ID,
    redirectURI: process.env.PLASMO_PUBLIC_OAUTH_REDIRECT_URI
  }
}

if (!config.oauth.clientId) {
  throw new Error("Missing OAuth client ID")
}

export default config
