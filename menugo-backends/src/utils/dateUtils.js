const moment = require('moment');

// Format date to string
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).format(format);
};

// Format date only (YYYY-MM-DD)
const formatDateOnly = (date) => {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD');
};

// Format time only (HH:mm:ss)
const formatTimeOnly = (date) => {
  if (!date) return null;
  return moment(date).format('HH:mm:ss');
};

// Format time with meridiem (hh:mm A)
const formatTimeMeridiem = (date) => {
  if (!date) return null;
  return moment(date).format('hh:mm A');
};

// Get start of day (00:00:00)
const startOfDay = (date) => {
  return moment(date).startOf('day').toDate();
};

// Get end of day (23:59:59)
const endOfDay = (date) => {
  return moment(date).endOf('day').toDate();
};

// Get start of week (Sunday)
const startOfWeek = (date) => {
  return moment(date).startOf('week').toDate();
};

// Get end of week (Saturday)
const endOfWeek = (date) => {
  return moment(date).endOf('week').toDate();
};

// Get start of month
const startOfMonth = (date) => {
  return moment(date).startOf('month').toDate();
};

// Get end of month
const endOfMonth = (date) => {
  return moment(date).endOf('month').toDate();
};

// Get start of quarter
const startOfQuarter = (date) => {
  return moment(date).startOf('quarter').toDate();
};

// Get end of quarter
const endOfQuarter = (date) => {
  return moment(date).endOf('quarter').toDate();
};

// Get start of year
const startOfYear = (date) => {
  return moment(date).startOf('year').toDate();
};

// Get end of year
const endOfYear = (date) => {
  return moment(date).endOf('year').toDate();
};

// Add time units
const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

const addHours = (date, hours) => {
  return moment(date).add(hours, 'hours').toDate();
};

const addMinutes = (date, minutes) => {
  return moment(date).add(minutes, 'minutes').toDate();
};

const addMonths = (date, months) => {
  return moment(date).add(months, 'months').toDate();
};

const addYears = (date, years) => {
  return moment(date).add(years, 'years').toDate();
};

// Subtract time units
const subtractDays = (date, days) => {
  return moment(date).subtract(days, 'days').toDate();
};

const subtractHours = (date, hours) => {
  return moment(date).subtract(hours, 'hours').toDate();
};

const subtractMinutes = (date, minutes) => {
  return moment(date).subtract(minutes, 'minutes').toDate();
};

const subtractMonths = (date, months) => {
  return moment(date).subtract(months, 'months').toDate();
};

const subtractYears = (date, years) => {
  return moment(date).subtract(years, 'years').toDate();
};

// Calculate differences
const daysDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'days');
};

const hoursDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'hours');
};

const minutesDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'minutes');
};

const secondsDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'seconds');
};

const monthsDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'months');
};

const yearsDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'years');
};

// Check date comparisons
const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

const isYesterday = (date) => {
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
};

const isTomorrow = (date) => {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
};

const isThisWeek = (date) => {
  return moment(date).isSame(moment(), 'week');
};

const isThisMonth = (date) => {
  return moment(date).isSame(moment(), 'month');
};

const isThisYear = (date) => {
  return moment(date).isSame(moment(), 'year');
};

const isPast = (date) => {
  return moment(date).isBefore(moment());
};

const isFuture = (date) => {
  return moment(date).isAfter(moment());
};

const isSameDay = (date1, date2) => {
  return moment(date1).isSame(moment(date2), 'day');
};

const isSameWeek = (date1, date2) => {
  return moment(date1).isSame(moment(date2), 'week');
};

const isSameMonth = (date1, date2) => {
  return moment(date1).isSame(moment(date2), 'month');
};

const isSameYear = (date1, date2) => {
  return moment(date1).isSame(moment(date2), 'year');
};

const isBetween = (date, startDate, endDate, inclusivity = '[]') => {
  return moment(date).isBetween(moment(startDate), moment(endDate), null, inclusivity);
};

// Get date ranges
const getCurrentWeekRange = () => {
  return {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  };
};

const getCurrentMonthRange = () => {
  return {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  };
};

const getCurrentYearRange = () => {
  return {
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  };
};

const getLastNDays = (n = 7) => {
  return {
    start: subtractDays(new Date(), n),
    end: new Date(),
  };
};

const getLastNWeeks = (n = 4) => {
  return {
    start: subtractWeeks(new Date(), n),
    end: new Date(),
  };
};

const getLastNMonths = (n = 12) => {
  return {
    start: subtractMonths(new Date(), n),
    end: new Date(),
  };
};

// Helper function for subtract weeks
const subtractWeeks = (date, weeks) => {
  return moment(date).subtract(weeks, 'weeks').toDate();
};

// Get age from birthdate
const getAge = (birthdate) => {
  if (!birthdate) return null;
  return moment().diff(moment(birthdate), 'years');
};

// Get relative time (e.g., "2 hours ago", "in 3 days")
const getRelativeTime = (date) => {
  if (!date) return null;
  return moment(date).fromNow();
};

// Get calendar time (e.g., "Today at 2:30 PM", "Yesterday at 10:15 AM")
const getCalendarTime = (date) => {
  if (!date) return null;
  return moment(date).calendar();
};

// Parse date string
const parseDate = (dateString, format = 'YYYY-MM-DD') => {
  const parsed = moment(dateString, format);
  return parsed.isValid() ? parsed.toDate() : null;
};

// Validate date string
const isValidDate = (dateString, format = 'YYYY-MM-DD') => {
  return moment(dateString, format, true).isValid();
};

// Get day of week (0-6, Sunday-Saturday)
const getDayOfWeek = (date) => {
  return moment(date).day();
};

// Get day of month (1-31)
const getDayOfMonth = (date) => {
  return moment(date).date();
};

// Get month (0-11)
const getMonth = (date) => {
  return moment(date).month();
};

// Get year
const getYear = (date) => {
  return moment(date).year();
};

// Get hour (0-23)
const getHour = (date) => {
  return moment(date).hour();
};

// Get minute (0-59)
const getMinute = (date) => {
  return moment(date).minute();
};

// Get second (0-59)
const getSecond = (date) => {
  return moment(date).second();
};

// Get timestamp in milliseconds
const getTimestamp = (date) => {
  return moment(date).valueOf();
};

// Get ISO string
const toISOString = (date) => {
  return moment(date).toISOString();
};

// Get Unix timestamp (seconds)
const toUnixTimestamp = (date) => {
  return moment(date).unix();
};

// Create date from Unix timestamp
const fromUnixTimestamp = (timestamp) => {
  return moment.unix(timestamp).toDate();
};

// Get business days between dates (excluding weekends)
const getBusinessDaysBetween = (startDate, endDate) => {
  let start = moment(startDate);
  let end = moment(endDate);
  let businessDays = 0;
  
  while (start.isBefore(end)) {
    if (start.day() !== 0 && start.day() !== 6) {
      businessDays++;
    }
    start.add(1, 'day');
  }
  
  return businessDays;
};

// Check if date is weekend
const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6;
};

// Check if date is weekday
const isWeekday = (date) => {
  return !isWeekend(date);
};

// Get next occurrence of day of week
const getNextDayOfWeek = (date, dayOfWeek) => {
  return moment(date).day(dayOfWeek).toDate();
};

// Get previous occurrence of day of week
const getPreviousDayOfWeek = (date, dayOfWeek) => {
  return moment(date).day(dayOfWeek - 7).toDate();
};

module.exports = {
  // Format functions
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatTimeMeridiem,
  
  // Range start/end functions
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  
  // Add functions
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  
  // Subtract functions
  subtractDays,
  subtractHours,
  subtractMinutes,
  subtractMonths,
  subtractYears,
  
  // Difference functions
  daysDiff,
  hoursDiff,
  minutesDiff,
  secondsDiff,
  monthsDiff,
  yearsDiff,
  
  // Comparison functions
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isBetween,
  
  // Range functions
  getCurrentWeekRange,
  getCurrentMonthRange,
  getCurrentYearRange,
  getLastNDays,
  getLastNWeeks,
  getLastNMonths,
  
  // Utility functions
  getAge,
  getRelativeTime,
  getCalendarTime,
  parseDate,
  isValidDate,
  getDayOfWeek,
  getDayOfMonth,
  getMonth,
  getYear,
  getHour,
  getMinute,
  getSecond,
  getTimestamp,
  toISOString,
  toUnixTimestamp,
  fromUnixTimestamp,
  getBusinessDaysBetween,
  isWeekend,
  isWeekday,
  getNextDayOfWeek,
  getPreviousDayOfWeek,
};