export function getDateLabel(dateInput) {
  const date = new Date(dateInput)
  const now = new Date()

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (startOfDate.getTime() === startOfToday.getTime()) return "Today"
  if (startOfDate.getTime() === startOfYesterday.getTime()) return "Yesterday"

  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

export function groupByDate(items = []) {
  const groups = []
  const seen = new Map()

  for (const item of items) {
    const label = getDateLabel(item.published_at)
    if (!seen.has(label)) {
      const group = { label, items: [] }
      seen.set(label, group)
      groups.push(group)
    }
    seen.get(label).items.push(item)
  }

  return groups
}