import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const loggedIn = await storage.get("loggedIn")
  if (loggedIn) {
    res.send({ valid: true })
  } else {
    res.send({ valid: false })
  }
}

export default handler
