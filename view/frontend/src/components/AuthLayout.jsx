import authHero from '../assets/auth-hero.png'

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-white text-[#172033]" dir="rtl">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <section className="grid w-full items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16 xl:gap-24" dir="ltr">
          <div className="mx-auto hidden w-full max-w-[530px] lg:block">
            <img
              src={authHero}
              alt="همراهی داوطلب با سالمند"
              className="h-[704px] max-h-[calc(100vh-64px)] w-full rounded-[18px] object-cover shadow-[0_4px_8px_rgba(23,32,51,0.16)]"
            />
          </div>

          <div className="flex justify-center lg:justify-start" dir="rtl">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
