const gregorianMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export const jalaliMonthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

const pad = (value) => String(value).padStart(2, '0')

const div = (a, b) => Math.floor(a / b)

const isGregorianLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export const gregorianToJalali = (gy, gm, gd) => {
  const gYear = Number(gy) - 1600
  const gMonth = Number(gm) - 1
  const gDay = Number(gd) - 1

  let gregorianDayNo = 365 * gYear + div(gYear + 3, 4) - div(gYear + 99, 100) + div(gYear + 399, 400)

  for (let index = 0; index < gMonth; index += 1) {
    gregorianDayNo += gregorianMonthDays[index]
  }

  if (gMonth > 1 && isGregorianLeap(Number(gy))) {
    gregorianDayNo += 1
  }

  gregorianDayNo += gDay

  let jalaliDayNo = gregorianDayNo - 79
  const jalaliCycle = div(jalaliDayNo, 12053)
  jalaliDayNo %= 12053

  let jy = 979 + 33 * jalaliCycle + 4 * div(jalaliDayNo, 1461)
  jalaliDayNo %= 1461

  if (jalaliDayNo >= 366) {
    jy += div(jalaliDayNo - 1, 365)
    jalaliDayNo = (jalaliDayNo - 1) % 365
  }

  let jm = 0
  while (jm < 11 && jalaliDayNo >= jalaliMonthDays[jm]) {
    jalaliDayNo -= jalaliMonthDays[jm]
    jm += 1
  }

  return { jy, jm: jm + 1, jd: jalaliDayNo + 1 }
}

export const jalaliToGregorian = (jy, jm, jd) => {
  const jYear = Number(jy) - 979
  const jMonth = Number(jm) - 1
  const jDay = Number(jd) - 1

  let jalaliDayNo = 365 * jYear + div(jYear, 33) * 8 + div((jYear % 33) + 3, 4)

  for (let index = 0; index < jMonth; index += 1) {
    jalaliDayNo += jalaliMonthDays[index]
  }

  jalaliDayNo += jDay

  let gregorianDayNo = jalaliDayNo + 79
  let gy = 1600 + 400 * div(gregorianDayNo, 146097)
  gregorianDayNo %= 146097

  let leap = true

  if (gregorianDayNo >= 36525) {
    gregorianDayNo -= 1
    gy += 100 * div(gregorianDayNo, 36524)
    gregorianDayNo %= 36524

    if (gregorianDayNo >= 365) {
      gregorianDayNo += 1
    } else {
      leap = false
    }
  }

  gy += 4 * div(gregorianDayNo, 1461)
  gregorianDayNo %= 1461

  if (gregorianDayNo >= 366) {
    leap = false
    gregorianDayNo -= 1
    gy += div(gregorianDayNo, 365)
    gregorianDayNo %= 365
  }

  let gm = 0
  while (gm < 11 && gregorianDayNo >= gregorianMonthDays[gm] + (gm === 1 && leap ? 1 : 0)) {
    gregorianDayNo -= gregorianMonthDays[gm] + (gm === 1 && leap ? 1 : 0)
    gm += 1
  }

  return { gy, gm: gm + 1, gd: gregorianDayNo + 1 }
}

export const isJalaliLeapYear = (jy) => {
  const currentYearStart = jalaliToGregorian(Number(jy), 1, 1)
  const nextYearStart = jalaliToGregorian(Number(jy) + 1, 1, 1)
  const currentUtc = Date.UTC(currentYearStart.gy, currentYearStart.gm - 1, currentYearStart.gd)
  const nextUtc = Date.UTC(nextYearStart.gy, nextYearStart.gm - 1, nextYearStart.gd)

  return Math.round((nextUtc - currentUtc) / 86400000) === 366
}

export const getJalaliMonthLength = (jy, jm) => {
  if (Number(jm) <= 6) {
    return 31
  }

  if (Number(jm) <= 11) {
    return 30
  }

  return isJalaliLeapYear(Number(jy)) ? 30 : 29
}

const getTehranGregorianParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  return parts.reduce((result, part) => {
    if (part.type !== 'literal') {
      result[part.type] = Number(part.value)
    }

    return result
  }, {})
}

export const getCurrentTehranJalaliDateTime = () => {
  const tehran = getTehranGregorianParts()
  const jalali = gregorianToJalali(tehran.year, tehran.month, tehran.day)

  return {
    date: `${jalali.jy}-${pad(jalali.jm)}-${pad(jalali.jd)}`,
    time: `${pad(tehran.hour)}:${pad(tehran.minute)}`,
  }
}

export const parseJalaliDate = (jalaliDate) => {
  const [year, month, day] = String(jalaliDate || '').split('-').map(Number)

  return { year, month, day }
}

export const compareJalaliDates = (firstDate, secondDate) => {
  const first = parseJalaliDate(firstDate)
  const second = parseJalaliDate(secondDate)

  if (!first.year || !first.month || !first.day || !second.year || !second.month || !second.day) {
    return 0
  }

  if (first.year !== second.year) {
    return first.year - second.year
  }

  if (first.month !== second.month) {
    return first.month - second.month
  }

  return first.day - second.day
}

export const isJalaliDateBeforeToday = (jalaliDate) => compareJalaliDates(jalaliDate, getCurrentTehranJalaliDateTime().date) < 0

export const toIsoFromJalaliTehranDateTime = (jalaliDate, tehranTime) => {
  const [jy, jm, jd] = String(jalaliDate || '').split('-').map(Number)
  const [hour = 0, minute = 0] = String(tehranTime || '').split(':').map(Number)

  if (!jy || !jm || !jd || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('تاریخ یا ساعت واردشده معتبر نیست.')
  }

  const maxDay = getJalaliMonthLength(jy, jm)

  if (jm < 1 || jm > 12 || jd < 1 || jd > maxDay || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('تاریخ یا ساعت واردشده معتبر نیست.')
  }

  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd)

  return `${gy}-${pad(gm)}-${pad(gd)}T${pad(hour)}:${pad(minute)}:00`
}
