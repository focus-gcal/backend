import { Button } from "antd"

interface EmptyStateProps {
  onCreate: () => void
  titleText: string
  descriptionText: string
  buttonText: string
}

export function EmptyState({ onCreate, titleText, descriptionText, buttonText }: EmptyStateProps) {
  return (
    <div
      style={{
        background: "#262626",
        borderRadius: 16,
        padding: 24,
        maxWidth: 320,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
      }}>
      <h2 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
        {titleText}
      </h2>
      <p style={{ margin: 0, marginBottom: 16, fontSize: 13, opacity: 0.85 }}>
        {descriptionText}
      </p>
      <Button
        type="primary"
        shape="round"
        style={{ paddingInline: 24 }}
        onClick={onCreate}>
        {buttonText}
      </Button>
    </div>
  )
}
