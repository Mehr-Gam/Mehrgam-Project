function Panel({ title, description, children, action }) {
  return (
    <section className="rounded-[24px] border border-[#eaf1f7] bg-white p-5 shadow-[0_18px_45px_rgba(23,32,51,0.05)] md:p-7">
      {(title || description || action) && (
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#edf3f8] pb-5 lg:flex-row lg:items-start">
          <div>
            {title && <h2 className="text-[21px] font-extrabold tracking-[-0.03em] text-[#172033]">{title}</h2>}
            {description && <p className="mt-2 text-[13px] leading-7 text-[#7b8796]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default Panel
