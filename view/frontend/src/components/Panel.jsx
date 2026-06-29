function Panel({ title, description, children, action }) {
  return (
    <section className="premium-card rounded-[30px] p-5 md:p-7">
      {(title || description || action) && (
        <div className="relative z-[1] mb-7 flex flex-col justify-between gap-4 border-b border-[#edf3f8] pb-6 lg:flex-row lg:items-start">
          <div>
            {title && <h2 className="text-[22px] font-bold tracking-[-0.04em] text-[#172033]">{title}</h2>}
            {description && <p className="mt-3 max-w-[760px] text-[13px] leading-7 text-[#7b8796]">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </section>
  )
}

export default Panel
