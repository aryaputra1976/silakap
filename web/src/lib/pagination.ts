export const getVisiblePages = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set([1, 2, total, current - 1, current, current + 1])
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  return sorted.reduce<(number | 'ellipsis')[]>((items, p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) items.push('ellipsis')
    items.push(p)
    return items
  }, [])
}
