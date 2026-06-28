export const roleLabels = {
  disabled: 'توان‌خواه',
  supervisor: 'سرپرست',
  volunteer: 'داوطلب',
  admin: 'مدیر سامانه',
}

export const requestTypeLabels = {
  medical: 'همراهی پزشکی',
  shopping: 'خرید روزانه',
  entertainment: 'تفریح و پیاده‌روی',
  administrative: 'امور اداری',
}

export const statusLabels = {
  pending: 'در انتظار',
  accepted: 'پذیرفته‌شده',
  in_progress: 'در حال انجام',
  finished: 'تمام‌شده',
  cancelled: 'لغوشده',
  sent: 'ارسال‌شده',
  resolved: 'رسیدگی‌شده',
  approved: 'تأییدشده',
  rejected: 'ردشده',
}

export const weekDayLabels = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

export const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export const formatName = (user) => {
  if (!user) {
    return '—'
  }

  return [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'
}

export const formatMeters = (value) => {
  if (!value && value !== 0) {
    return '—'
  }

  if (value >= 1000) {
    return `${Math.round(value / 100) / 10} کیلومتر`
  }

  return `${Math.round(value)} متر`
}
