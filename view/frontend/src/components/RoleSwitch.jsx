const roles = [
  { key: 'volunteer', label: 'داوطلب' },
  { key: 'disabled', label: 'توان‌خواه' },
  { key: 'supervisor', label: 'سرپرست' },
]

function RoleSwitch({ value, onChange }) {
  return (
    <div
      className="flex h-[34px] w-full max-w-[308px] items-center rounded-full bg-[#edf1f4] p-1 shadow-inner"
      aria-label="انتخاب نوع حساب کاربری"
      role="group"
      dir="rtl"
    >
      {roles.map((role) => {
        const isSelected = role.key === value

        return (
          <button
            key={role.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(role.key)}
            className={`h-full flex-1 rounded-full text-[13px] font-medium leading-normal transition ${
              isSelected
                ? 'bg-[#9fd7cf] text-white shadow-[0_2px_6px_rgba(85,146,138,0.25)]'
                : 'text-[#263246] hover:bg-white/70'
            }`}
          >
            {role.label}
          </button>
        )
      })}
    </div>
  )
}

export default RoleSwitch
