import { Link } from 'react-router-dom'

function DashboardCard({ icon, title, description, to, buttonLabel }) {
  return (
    <article className="rounded-[22px] border border-[#eff4f8] bg-white p-6 shadow-[0_14px_34px_rgba(23,32,51,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(23,32,51,0.09)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef9f7] text-[26px]">{icon}</div>
      <h3 className="mt-5 text-[18px] font-extrabold text-[#172033]">{title}</h3>
      <p className="mt-3 min-h-[72px] text-[13px] leading-7 text-[#7b8796]">{description}</p>
      {to && (
        <Link
          to={to}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#8dc9c0] px-6 text-[13px] font-bold text-white transition hover:bg-[#78bdb3]"
        >
          {buttonLabel || 'مشاهده'}
        </Link>
      )}
    </article>
  )
}

export default DashboardCard
