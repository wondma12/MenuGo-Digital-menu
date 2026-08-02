import {
  format,
  parse,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isToday,
  isYesterday,
  isFuture,
  isPast,
  isValid,
  parseISO,
} from 'date-fns'

export const safeParseDate = (value) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      const parsed = parseISO(trimmed)
      if (isValid(parsed)) return parsed
    } catch (e) {
      // fall through to manual parsing
    }
  }

  try {
    const parsed = value instanceof Date ? value : new Date(value)
    return isValid(parsed) ? parsed : null
  } catch (e) {
    return null
  }
}

export const getRelativeTime = (date) => {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return 'Just now'

  const now = new Date()
  const diffMinutes = differenceInMinutes(now, parsedDate)
  const diffHours = differenceInHours(now, parsedDate)
  const diffDays = differenceInDays(now, parsedDate)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return format(parsedDate, 'MMM dd, yyyy')
}

export const getDateRange = (range) => {
  const now = new Date()
  switch (range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    case 'this_week':
      return { start: startOfWeek(now), end: endOfWeek(now) }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_7_days':
      return { start: subDays(now, 7), end: now }
    case 'last_30_days':
      return { start: subDays(now, 30), end: now }
    default:
      return { start: null, end: null }
  }
}

export const isDateInRange = (date, startDate, endDate) => {
  const d = safeParseDate(date)
  const start = safeParseDate(startDate)
  const end = safeParseDate(endDate)
  if (!d || !start || !end) return false
  return d >= start && d <= end
}

export const getDaysBetween = (startDate, endDate) => {
  const start = safeParseDate(startDate)
  const end = safeParseDate(endDate)
  if (!start || !end) return 0
  return differenceInDays(end, start)
}

export const getHoursBetween = (startDate, endDate) => {
  const start = safeParseDate(startDate)
  const end = safeParseDate(endDate)
  if (!start || !end) return 0
  return differenceInHours(end, start)
}

export const getMinutesBetween = (startDate, endDate) => {
  const start = safeParseDate(startDate)
  const end = safeParseDate(endDate)
  if (!start || !end) return 0
  return differenceInMinutes(end, start)
}

export const addDaysToDate = (date, days) => {
  const parsedDate = safeParseDate(date)
  return parsedDate ? addDays(parsedDate, days) : null
}

export const subtractDaysFromDate = (date, days) => {
  const parsedDate = safeParseDate(date)
  return parsedDate ? subDays(parsedDate, days) : null
}

export const formatDateRange = (startDate, endDate, formatStr = 'MMM dd') => {
  if (!startDate || !endDate) return ''
  const start = safeParseDate(startDate)
  const end = safeParseDate(endDate)
  if (!start || !end) return ''

  if (isSameDay(start, end)) {
    return format(start, formatStr)
  }

  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`
  }

  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
}

export const isDateToday = (date) => {
  const parsedDate = safeParseDate(date)
  return Boolean(parsedDate && isToday(parsedDate))
}

export const isDateYesterday = (date) => {
  const parsedDate = safeParseDate(date)
  return Boolean(parsedDate && isYesterday(parsedDate))
}

export const isDateFuture = (date) => {
  const parsedDate = safeParseDate(date)
  return Boolean(parsedDate && isFuture(parsedDate))
}

export const isDatePast = (date) => {
  const parsedDate = safeParseDate(date)
  return Boolean(parsedDate && isPast(parsedDate))
}

export const getWeekNumber = (date) => {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return 0
  const d = new Date(parsedDate)
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

export const getMonthName = (date, short = false) => {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return ''
  return parsedDate.toLocaleString('default', { month: short ? 'short' : 'long' })
}

export const getDayName = (date, short = false) => {
  const parsedDate = safeParseDate(date)
  if (!parsedDate) return ''
  return parsedDate.toLocaleString('default', { weekday: short ? 'short' : 'long' })
}