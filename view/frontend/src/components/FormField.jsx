function FormField({ id, label, type = 'text', placeholder, autoComplete, inputDir = 'rtl' }) {
  return (
    <label htmlFor={id} className="block text-right text-[13px] font-medium text-[#172033]">
      {label}
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir={inputDir}
        className="mt-2 h-[40px] w-full rounded-[10px] border border-[#d8e1eb] bg-[#f5f9fc] px-4 text-[13px] text-[#172033] outline-none transition placeholder:text-[#9eafc3] focus:border-[#9fd7cf] focus:bg-white focus:ring-4 focus:ring-[#9fd7cf]/25"
      />
    </label>
  )
}

export default FormField
