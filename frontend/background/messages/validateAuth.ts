import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // want to store expiry date of token in local storage
  res.send({ valid: false })
}

export default handler
