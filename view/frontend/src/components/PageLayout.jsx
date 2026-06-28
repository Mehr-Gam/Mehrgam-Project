import { Link, NavLink, useNavigate } from 'react-router-dom'
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

  return (
    <main className="min-h-screen bg-[#f7fbfd] text-[#172033]" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-[#eaf1f7] bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex min-h-20 w-full max-w-[1180px] flex-col justify-between gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center justify-between gap-5">
            <Link to="/" className="text-[21px] font-extrabold tracking-tight text-[#172033]">
              مهرگام
            </Link>
            {user && (
              <span className="rounded-full bg-[#eef9f7] px-4 py-2 text-[12px] font-bold text-[#55b7ad]">
                {roleLabels[user.role] || user.role}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#536174]">
            {availableNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? 'bg-[#8dc9c0] text-white shadow-[0_8px_18px_rgba(141,201,192,0.24)]' : 'hover:bg-[#eef9f7] hover:text-[#55b7ad]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#dfe8ef] bg-white px-4 py-2 text-[13px] font-semibold text-[#536174] transition hover:border-[#ef8f8f] hover:text-[#d94d4d]"
            >
              خروج
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
        {(title || description || eyebrow) && (
          <div className="mb-8 rounded-[28px] border border-[#eaf1f7] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.05)] md:p-8">
            {eyebrow && <span className="text-[13px] font-bold text-[#4db6f4]">{eyebrow}</span>}
            {title && <h1 className="mt-3 text-[32px] font-extrabold tracking-[-0.04em] text-[#172033] md:text-[42px]">{title}</h1>}
            {description && <p className="mt-4 max-w-[720px] text-[14px] leading-8 text-[#7b8796]">{description}</p>}
          </div>
        )}

        {children}
      </section>
    </main>
  )
}

export default PageLayout
