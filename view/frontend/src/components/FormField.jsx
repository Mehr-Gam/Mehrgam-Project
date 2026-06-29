function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  inputDir = 'rtl',
  value,
  onChange,
  required = true,
  error,
}) {
  const inputClass = error
    ? 'border-[#ef8f8f] bg-[#fffafa] focus:border-[#ef7f7f] focus:ring-[#ef7f7f]/20'
    : 'border-[#d8e1eb] bg-white/88 focus:border-[#9fd7cf] focus:bg-white focus:ring-[#9fd7cf]/25'

  return (
    <label htmlFor={id} className="block text-right text-[13px] font-bold text-[#172033]">
      {label}
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir={inputDir}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 h-[48px] w-full rounded-[16px] border px-4 text-[13px] font-semibold text-[#172033] shadow-[0_10px_24px_rgba(16,24,39,0.035)] outline-none transition placeholder:text-[#9eafc3] focus:ring-4 ${inputClass}`}
      />
      {error && (
        <span id={`${id}-error`} className="mt-2 block rounded-[12px] bg-[#fff4f4] px-3 py-2 text-[11px] font-bold leading-5 text-[#d94d4d]">
          {error}
        </span>
      )}
    </label>
  )
}

export default FormField
