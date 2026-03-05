import { useState } from "react"
import { useAuth } from "context/auth"
import { Storage } from "@plasmohq/storage"
import { Button, ConfigProvider, Dropdown, Layout, Menu } from "antd"
import { Toaster } from "react-hot-toast"
import logUrl from "raw:~assets/logo.png"
import SchedulesView from "./schedules"
import TasksView from "./tasks"
import { theme } from "antd"
type DashboardView = "tasks" | "schedules" | "settings"

const headerMenuItems = [
  { key: "tasks", label: "Tasks" },
  { key: "schedules", label: "Schedules" },
]

const settingsDropdownItems = [
  { key: "settings", label: "Settings" },
  { type: "divider" as const },
  { key: "sign-out", label: "Sign Out" },
]
const storage = new Storage({ area: "local" })

function Dashboard() {
  const { refreshAuth } = useAuth()
  const [view, setView] = useState<DashboardView>("tasks")

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 8,
          colorBgContainer: "#212121",
          colorText: "#ffffff",
        },
        components: {
          Menu: {
            colorBgContainer: "#212121",
            itemColor: "#ffffff",
            horizontalItemSelectedColor: "#40a9ff",
            horizontalItemHoverColor: "#40a9ff",
          },
          Dropdown: {
            colorBgElevated: "#212121",
            colorText: "#ffffff",
            controlItemBgHover: "#383838",
            controlItemBgActive: "#404040",
          },
        },        
      }}>
      <Layout
        style={{
          minHeight: "100%",
          flexDirection: "column",
          background: "#212121",
          color: "#ffffff",
        }}>
        <Layout.Header
          style={{
            height: 60,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#212121",
            borderBottom: "1px solid #333333",
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginRight: 0,
              position: "relative",
              right:10,
            }}>
            <img
              src={logUrl}
              alt="Focus"
              style={{ height: 58, width: "auto", marginTop: 2 }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.92)",
              }}>
              Focus
            </span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={view === "settings" ? [] : [view]}
            items={headerMenuItems}
            onClick={({ key }) => setView(key as DashboardView)}
            style={{
              background: "transparent",
              borderBottom: "none",
            }}
          />
          <Dropdown

          menu={{
            items: settingsDropdownItems,
            onClick: ({ key }) => {
              if (key === "sign-out") {
                storage.remove("user_auth")
                refreshAuth()
              } else {
                setView(key as DashboardView)
              }
            },
            style: { background: "#212121", minWidth: 120 },
          }}
          trigger={["click"]}
          placement="bottomRight"
          >
            <Button
              type="text"
              shape="circle"
              aria-label="Settings"
              style={{
                color: "#ffffff",
                fontSize: 18,
                lineHeight: 1,
                position: "relative",
                right: 10,
              }}>
              ⋮
            </Button>
          </Dropdown>
        </Layout.Header>

        <Layout.Content
          style={{
            padding: "80px 32px 40px",
            flex: 1,
            background: "#212121",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            position: "relative",
          }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                maxWidth: 480,
                width: "100%",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div
              className="schedule-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                paddingTop: 12,
                paddingBottom: 8,
              }}>
              {view === "tasks" && <TasksView />}

              {view === "schedules" && <SchedulesView />}

              {view === "settings" && (
                <div>
                  <div>Settings</div>
                  <button
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      storage.remove("user_auth")
                      refreshAuth()
                    }}>
                    Sign Out
                  </button>
                </div>
              )}
              </div>
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2500,
                style: {
                  width: "200px",
                  minHeight: "40px",
                  background: "#3a3a3a",
                  color: "white",
                },
                success: {
                  iconTheme: {
                    primary: "#52c41a",
                    secondary: "white",
                  },
                },
              }}
            />
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default Dashboard