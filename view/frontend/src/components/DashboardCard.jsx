import { Link } from 'react-router-dom'

function DashboardCard({ icon, title, description, to, buttonLabel }) {
  return (
    <article className="premium-card group p-7">
      <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-[#eef9f7] text-[29px] transition group-hover:scale-105 group-hover:bg-[#dff3f0]">{icon}</div>
      <h3 className="mt-6 text-[20px] font-bold tracking-[-0.03em] text-[#172033]">{title}</h3>
      <p className="mt-4 min-h-[84px] text-[13px] leading-8 text-[#7b8796]">{description}</p>
      {to && (
        <Link
          to={to}
          className="shine-button mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#8dc9c0] px-6 text-[13px] font-bold text-white shadow-[0_12px_28px_rgba(141,201,192,0.26)] transition hover:-translate-y-0.5 hover:bg-[#78bdb3]"
        >
          {buttonLabel || 'مشاهده'}
        </Link>
      )}
    </article>
  )
}

export default DashboardCard
