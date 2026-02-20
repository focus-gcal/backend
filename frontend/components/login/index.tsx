import { Button, ConfigProvider } from "antd"
import logoUrl from "raw:~assets/logo.png"

import SignInButton from "./signInButton"

function Login() {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8
          // optional: customize colors
        }
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100%",
          position: "relative",
          top: 25
        }}>
        <img src={logoUrl} alt="Logo" style={{ width: 200, height: "auto" }} />
        <SignInButton style={{ position: "relative", bottom: 10 }} />
      </div>
    </ConfigProvider>
  )
}

export default Login
