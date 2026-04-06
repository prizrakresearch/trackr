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

export function isSameLocalDay(dateInput, referenceDate = new Date()) {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return false

  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  )
}

export function isToday(dateInput) {
  return isSameLocalDay(dateInput)
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