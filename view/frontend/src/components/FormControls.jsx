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
