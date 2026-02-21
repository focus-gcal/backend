import { type PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { extractResponse, generateWebAppURL } from "~utils/google"

const storage = new Storage({ area: "local" })
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const authInProgress = await storage.get("authInProgress")
  if (authInProgress) {
    res.send({ valid: false, isInProgress: true })
    return
  }
  await storage.set("authInProgress", true)
  try {
    const state = crypto.randomUUID()
    const AuthURL = generateWebAppURL(chrome.identity.getRedirectURL(), state)
    const response = await chrome.identity.launchWebAuthFlow({
      url: AuthURL,
      interactive: true
    })

    const { code, state:returned_state } = extractResponse(response, state)

    console.log(response)
    res.send({ valid: true, isInProgress: false })
  } catch (error) {
    console.error(error)
    res.send({ valid: false, isInProgress: false })
  } finally {
    await storage.set("authInProgress", false)
  }
}

export default handler
