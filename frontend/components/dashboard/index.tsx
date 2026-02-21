import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })
import { useAuth } from "context/auth"

function Dashboard() {
  const { refreshAuth } = useAuth()
  return <div> ddd<button onClick={() => {
    storage.set("loggedIn", false)
    refreshAuth()
  }}>Sign Out</button></div>

}

export default Dashboard
