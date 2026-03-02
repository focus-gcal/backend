export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function formatTime(s: string): string {
  const [h, m] = s.split(":").map(Number)
  if (h === 0) return `12:${m.toString().padStart(2, "0")} AM`
  if (h < 12) return `${h}:${m.toString().padStart(2, "0")} AM`
  if (h === 12) return `12:${m.toString().padStart(2, "0")} PM`
  return `${h - 12}:${m.toString().padStart(2, "0")} PM`
}
