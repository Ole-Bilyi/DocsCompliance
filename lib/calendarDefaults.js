export const CALENDAR_DEFAULT_DEADLINE_DAYS = 7

export function normalizeDeadlineDays(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed)
  }

  return CALENDAR_DEFAULT_DEADLINE_DAYS
}


