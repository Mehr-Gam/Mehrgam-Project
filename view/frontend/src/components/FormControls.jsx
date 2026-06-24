export function TextInput({ label, name, value, onChange, type = 'text', placeholder, dir = 'rtl', required = false, min, max, step }) {
  return (
    <label className="block text-[13px] font-semibold text-[#536174]">
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
        className="mt-2 h-12 w-full rounded-[12px] border border-[#dfe8ef] bg-[#fbfdff] px-4 text-[13px] text-[#172033] outline-none transition placeholder:text-[#a9b6c6] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
      />
    </label>
  )
}

export function SelectInput({ label, name, value, onChange, options, required = false }) {
  return (
    <label className="block text-[13px] font-semibold text-[#536174]">
      {label}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 h-12 w-full rounded-[12px] border border-[#dfe8ef] bg-[#fbfdff] px-4 text-[13px] text-[#172033] outline-none transition focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
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
    <label className="block text-[13px] font-semibold text-[#536174] md:col-span-2">
      {label}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="4"
        className="mt-2 w-full resize-none rounded-[12px] border border-[#dfe8ef] bg-[#fbfdff] px-4 py-3 text-[13px] leading-7 text-[#172033] outline-none transition placeholder:text-[#a9b6c6] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/20"
      />
    </label>
  )
}

export function PrimaryButton({ children, type = 'button', disabled = false, danger = false, onClick }) {
  const colorClass = danger ? 'bg-[#ef7f7f] hover:bg-[#e66d6d]' : 'bg-[#8dc9c0] hover:bg-[#78bdb3]'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center rounded-full px-7 text-[13px] font-bold text-white shadow-[0_10px_25px_rgba(141,201,192,0.28)] transition disabled:cursor-not-allowed disabled:opacity-60 ${colorClass}`}
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

  return <p className={`rounded-[14px] border px-4 py-3 text-[13px] font-semibold ${classes[type]}`}>{message}</p>
}
