import { Link } from 'react-router-dom'
import authHero from '../assets/auth-hero.png'

function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7fcfd_0%,#ffffff_46%,#eef9f7_100%)] text-[#172033]" dir="rtl">
      <div className="orb fixed -right-32 top-10 h-96 w-96 bg-[#8dc9c0]/25" />
      <div className="orb fixed -left-28 bottom-8 h-96 w-96 bg-[#4db6f4]/14" />

      <Link to="/" className="absolute right-6 top-6 z-20 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/82 px-4 py-2.5 text-[14px] font-bold text-[#172033] shadow-[0_16px_40px_rgba(16,24,39,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-[#55b7ad]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef9f7] text-[#55b7ad]">م</span>
        مهرگام
      </Link>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1160px] items-center justify-center px-5 py-24 sm:px-8 lg:px-10">
        <section className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-20" dir="ltr">
          <div className="float-soft mx-auto hidden w-full max-w-[610px] lg:block">
            <img
              src={authHero}
              alt="همراهی داوطلب با سالمند"
              className="h-[704px] max-h-[calc(100vh-80px)] w-full rounded-[34px] object-cover object-[38%_center] drop-shadow-[0_28px_48px_rgba(16,24,39,0.16)]"
            />
          </div>

          <div className="relative flex justify-center lg:justify-start" dir="rtl">
            <div className="premium-card w-full max-w-[460px] px-6 py-9 md:px-9 lg:bg-white/88">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
