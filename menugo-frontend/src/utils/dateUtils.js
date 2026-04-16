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
} from 'date-fns'

export const getRelativeTime = (date) => {
  const now = new Date()
  const diffMinutes = differenceInMinutes(now, new Date(date))
  const diffHours = differenceInHours(now, new Date(date))
  const diffDays = differenceInDays(now, new Date(date))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return format(new Date(date), 'MMM dd, yyyy')
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
  const d = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  return d >= start && d <= end
}

export const getDaysBetween = (startDate, endDate) => {
  return differenceInDays(new Date(endDate), new Date(startDate))
}

export const getHoursBetween = (startDate, endDate) => {
  return differenceInHours(new Date(endDate), new Date(startDate))
}

export const getMinutesBetween = (startDate, endDate) => {
  return differenceInMinutes(new Date(endDate), new Date(startDate))
}

export const addDaysToDate = (date, days) => {
  return addDays(new Date(date), days)
}

export const subtractDaysFromDate = (date, days) => {
  return subDays(new Date(date), days)
}

export const formatDateRange = (startDate, endDate, formatStr = 'MMM dd') => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isSameDay(start, end)) {
    return format(start, formatStr)
  }
  
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`
  }
  
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
}

export const isDateToday = (date) => {
  return isToday(new Date(date))
}

export const isDateYesterday = (date) => {
  return isYesterday(new Date(date))
}

export const isDateFuture = (date) => {
  return isFuture(new Date(date))
}

export const isDatePast = (date) => {
  return isPast(new Date(date))
}

export const getWeekNumber = (date) => {
  const d = new Date(date)
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

export const getMonthName = (date, short = false) => {
  const d = new Date(date)
  return d.toLocaleString('default', { month: short ? 'short' : 'long' })
}

export const getDayName = (date, short = false) => {
  const d = new Date(date)
  return d.toLocaleString('default', { weekday: short ? 'short' : 'long' })
}