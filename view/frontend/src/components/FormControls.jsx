import { compareJalaliDates, getCurrentTehranJalaliDateTime, getJalaliMonthLength, jalaliMonthNames } from '../utils/jalaliDate.js'

export function TextInput({ label, name, value, onChange, type = 'text', placeholder, dir = 'rtl', required = false, min, max, step }) {
  return (
    <label className="block text-[13px] font-bold text-[#536174]">
      {label}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        dir={dir}
        required={required}
        min={min}
        max={max}
        step={step}
        className="mt-2 h-[52px] w-full rounded-[16px] border border-[#dfe8ef] bg-white/84 px-4 text-[13px] font-semibold text-[#172033] shadow-[0_10px_22px_rgba(16,24,39,0.035)] outline-none transition placeholder:text-[#a9b6c6] hover:border-[#cfe1ec] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
      />
    </label>
  )
}


export function JalaliDateTimeInput({ label, dateName, timeName, dateValue, timeValue, onChange, required = false }) {
  const today = getCurrentTehranJalaliDateTime()
  const [todayYear, todayMonth, todayDay] = today.date.split('-').map(Number)
  const currentYear = todayYear

  const requestedDate = dateValue && compareJalaliDates(dateValue, today.date) >= 0 ? dateValue : today.date
  const [selectedYear = currentYear, selectedMonth = todayMonth, selectedDay = todayDay] = requestedDate.split('-').map(Number)
  const selectedTime = timeValue || today.time

  const years = Array.from({ length: 5 }, (_, index) => currentYear + index)
  const months = jalaliMonthNames
    .map((month, index) => ({ value: index + 1, label: month }))
    .filter((month) => selectedYear > todayYear || month.value >= todayMonth)

  const firstAllowedDay = selectedYear === todayYear && selectedMonth === todayMonth ? todayDay : 1
  const maxDay = getJalaliMonthLength(selectedYear, selectedMonth)
  const normalizedDay = Math.min(Math.max(selectedDay || firstAllowedDay, firstAllowedDay), maxDay)
  const days = Array.from({ length: maxDay - firstAllowedDay + 1 }, (_, index) => firstAllowedDay + index)

  const emitDate = (year, month, day) => {
    const safeMonth = year === todayYear ? Math.max(month, todayMonth) : month
    const safeFirstDay = year === todayYear && safeMonth === todayMonth ? todayDay : 1
    const safeMaxDay = getJalaliMonthLength(year, safeMonth)
    const safeDay = Math.min(Math.max(day, safeFirstDay), safeMaxDay)

    onChange({
      target: {
        name: dateName,
        value: `${year}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`,
      },
    })
  }

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value)
    const nextMonth = nextYear === todayYear ? Math.max(selectedMonth, todayMonth) : selectedMonth
    const nextFirstDay = nextYear === todayYear && nextMonth === todayMonth ? todayDay : 1
    const nextMaxDay = getJalaliMonthLength(nextYear, nextMonth)
    emitDate(nextYear, nextMonth, Math.min(Math.max(normalizedDay, nextFirstDay), nextMaxDay))
  }

  const handleMonthChange = (event) => {
    const nextMonth = Number(event.target.value)
    const nextFirstDay = selectedYear === todayYear && nextMonth === todayMonth ? todayDay : 1
    const nextMaxDay = getJalaliMonthLength(selectedYear, nextMonth)
    emitDate(selectedYear, nextMonth, Math.min(Math.max(normalizedDay, nextFirstDay), nextMaxDay))
  }

  const handleDayChange = (event) => {
    emitDate(selectedYear, selectedMonth, Number(event.target.value))
  }

  const handleTimeChange = (event) => {
    onChange({
      target: {
        name: timeName,
        value: event.target.value,
      },
    })
  }

  return (
    <fieldset className="rounded-[18px] border border-[#dfe8ef] bg-white/70 p-4 shadow-[0_10px_22px_rgba(16,24,39,0.035)] md:col-span-2">
      <legend className="px-2 text-[13px] font-bold text-[#536174]">{label}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <label className="block text-[12px] font-bold text-[#7b8796]">
          سال شمسی
          <select
            value={selectedYear}
            onChange={handleYearChange}
            required={required}
            className="mt-2 h-[48px] w-full rounded-[14px] border border-[#dfe8ef] bg-white px-3 text-[13px] font-semibold text-[#172033] outline-none transition focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-bold text-[#7b8796]">
          ماه
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            required={required}
            className="mt-2 h-[48px] w-full rounded-[14px] border border-[#dfe8ef] bg-white px-3 text-[13px] font-semibold text-[#172033] outline-none transition focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-bold text-[#7b8796]">
          روز
          <select
            value={normalizedDay}
            onChange={handleDayChange}
            required={required}
            className="mt-2 h-[48px] w-full rounded-[14px] border border-[#dfe8ef] bg-white px-3 text-[13px] font-semibold text-[#172033] outline-none transition focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
          >
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-bold text-[#7b8796]">
          ساعت تهران
          <input
            name={timeName}
            value={selectedTime}
            onChange={handleTimeChange}
            type="time"
            dir="ltr"
            required={required}
            className="mt-2 h-[48px] w-full rounded-[14px] border border-[#dfe8ef] bg-white px-3 text-[13px] font-semibold text-[#172033] outline-none transition focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
          />
        </label>
      </div>
      <p className="mt-3 text-[12px] leading-6 text-[#7b8796]">تاریخ از امروز به بعد و ساعت بر اساس تهران ثبت می‌شود.</p>
    </fieldset>
  )
}

export function SelectInput({ label, name, value, onChange, options, required = false }) {
  return (
    <label className="block text-[13px] font-bold text-[#536174]">
      {label}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 h-[52px] w-full rounded-[16px] border border-[#dfe8ef] bg-white/84 px-4 text-[13px] font-semibold text-[#172033] shadow-[0_10px_22px_rgba(16,24,39,0.035)] outline-none transition hover:border-[#cfe1ec] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TextArea({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block text-[13px] font-bold text-[#536174] md:col-span-2">
      {label}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className="mt-2 w-full resize-none rounded-[16px] border border-[#dfe8ef] bg-white/84 px-4 py-3 text-[13px] font-semibold leading-7 text-[#172033] shadow-[0_10px_22px_rgba(16,24,39,0.035)] outline-none transition placeholder:text-[#a9b6c6] hover:border-[#cfe1ec] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
      />
    </label>
  )
}

export function PrimaryButton({ children, type = 'button', disabled = false, danger = false, onClick }) {
  const colorClass = danger
    ? 'bg-[#ef7f7f] hover:bg-[#e66d6d] shadow-[0_12px_28px_rgba(239,127,127,0.26)]'
    : 'bg-[#8dc9c0] hover:bg-[#78bdb3] shadow-[0_12px_28px_rgba(141,201,192,0.28)]'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`shine-button inline-flex h-12 items-center justify-center rounded-full px-7 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(141,201,192,0.34)] disabled:cursor-not-allowed disabled:opacity-60 ${colorClass}`}
    >
      {children}
    </button>
  )
}

export function StatusMessage({ message, type = 'info' }) {
  if (!message) {
    return null
  }

  const classes = {
    info: 'border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]',
    success: 'border-[#d9f5eb] bg-[#effaf7] text-[#159272]',
    error: 'border-[#f6d3d3] bg-[#fff4f4] text-[#d94d4d]',
  }

  return <p className={`rounded-[18px] border px-5 py-4 text-[13px] font-bold shadow-[0_12px_28px_rgba(16,24,39,0.035)] ${classes[type]}`}>{message}</p>
}
