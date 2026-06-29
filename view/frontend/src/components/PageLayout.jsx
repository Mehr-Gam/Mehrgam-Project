import { Link, NavLink, useNavigate } from 'react-router-dom'
import SiteFooter from './SiteFooter.jsx'
import { authApi } from '../services/api.js'
import { clearSession, getStoredUser } from '../utils/auth.js'
import { roleLabels } from '../utils/labels.js'

const navItems = [
  { to: '/dashboard', label: 'داشبورد', roles: ['admin', 'disabled', 'supervisor', 'volunteer'] },
  { to: '/requests', label: 'درخواست‌ها', roles: ['disabled', 'supervisor', 'volunteer'] },
  { to: '/emergency', label: 'اضطراری', roles: ['disabled', 'supervisor'] },
  { to: '/volunteer', label: 'پنل داوطلب', roles: ['volunteer'] },
  { to: '/supervisor', label: 'پنل سرپرست', roles: ['supervisor'] },
  { to: '/admin', label: 'مدیریت', roles: ['admin'] },
]

function PageLayout({ children, eyebrow, title, description }) {
  const user = getStoredUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the refresh cookie is already expired, the local session should be cleared.
    } finally {
      clearSession()
      navigate('/login')
    }
  }

  const availableNavItems = navItems.filter((item) => !user?.role || item.roles.includes(user.role))
  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.nationalCode || 'حساب کاربری' : ''

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbfd] text-[#172033]" dir="rtl">
      <div className="pointer-events-none fixed -right-36 top-16 h-96 w-96 rounded-full bg-[#8dc9c0]/20 blur-3xl" />
      <div className="pointer-events-none fixed -left-40 top-[36rem] h-96 w-96 rounded-full bg-[#4db6f4]/12 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/78 shadow-[0_16px_40px_rgba(16,24,39,0.06)] backdrop-blur-2xl">
        <div className="hidden border-b border-[#edf4f8] bg-[#f8fcfd]/80 text-[12px] font-bold text-[#6c7a8c] lg:block">
          <div className="mx-auto flex h-10 w-full max-w-[1180px] items-center justify-between px-10">
            <span>پنل عملیاتی مهرگام</span>
            {user && <span>{roleLabels[user.role] || user.role} • {userName}</span>}
          </div>
        </div>

        <nav className="mx-auto flex min-h-20 w-full max-w-[1180px] flex-col justify-between gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center justify-between gap-5">
            <Link to="/" className="group inline-flex items-center gap-3 text-[22px] font-bold tracking-[-0.04em] text-[#172033]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef9f7] text-[#55b7ad] shadow-inner transition group-hover:rotate-6 group-hover:scale-105">م</span>
              مهرگام
            </Link>
            {user && (
              <span className="rounded-full border border-[#dff3f0] bg-[#eef9f7] px-4 py-2 text-[12px] font-bold text-[#159272] lg:hidden">
                {roleLabels[user.role] || user.role}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#536174]">
            {availableNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2.5 transition ${
                    isActive
                      ? 'bg-[#172033] text-white shadow-[0_12px_28px_rgba(16,24,39,0.18)]'
                      : 'hover:-translate-y-0.5 hover:bg-[#eef9f7] hover:text-[#55b7ad]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#dfe8ef] bg-white px-4 py-2.5 text-[13px] font-bold text-[#536174] shadow-[0_10px_24px_rgba(16,24,39,0.04)] transition hover:-translate-y-0.5 hover:border-[#ef8f8f] hover:text-[#d94d4d]"
            >
              خروج
            </button>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {(title || description || eyebrow) && (
          <div className="animate-fade-in relative mb-8 overflow-hidden rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_26px_70px_rgba(16,24,39,0.075)] backdrop-blur-xl md:p-8 lg:p-10">
            <div className="orb absolute -left-20 -top-24 h-56 w-56 bg-[#4db6f4]/18" />
            <div className="orb absolute -right-20 bottom-0 h-56 w-56 bg-[#8dc9c0]/22" />
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                {eyebrow && <span className="section-tag">{eyebrow}</span>}
                {title && <h1 className="mt-5 max-w-[760px] text-[34px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033] md:text-[46px]">{title}</h1>}
                {description && <p className="mt-5 max-w-[760px] text-[14px] leading-8 text-[#7b8796]">{description}</p>}
              </div>
              {user && (
                <div className="min-w-[210px] rounded-[24px] border border-[#edf3f8] bg-white/80 p-5 shadow-[0_18px_42px_rgba(16,24,39,0.06)]">
                  <p className="text-[12px] font-bold text-[#7b8796]">کاربر فعال</p>
                  <p className="mt-2 text-[18px] font-bold text-[#172033]">{userName}</p>
                  <p className="mt-1 text-[12px] font-bold text-[#55b7ad]">{roleLabels[user.role] || user.role}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="animate-fade-in">{children}</div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default PageLayout
