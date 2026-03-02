interface CreateButtonProps {
  onClick: () => void
  ariaLabel?: string
}

export function CreateButton({
  onClick,
  ariaLabel = "Add",
}: CreateButtonProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 16,
        marginBottom: 8,
        position: "fixed",
        bottom: 24,
        right: 24,
      }}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          background: "#1677ff",
          color: "#ffffff",
          fontSize: 24,
          lineHeight: 1,
          cursor: "pointer",
        }}>
        +
      </button>
    </div>
  )
}
