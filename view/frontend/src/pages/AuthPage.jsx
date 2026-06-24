import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import RoleSwitch from '../components/RoleSwitch.jsx'

function Divider() {
  return (
    <div className="flex items-center gap-4 text-[12px] text-[#59677c]">
      <span className="h-px flex-1 bg-[#dce5ee]" />
      <span>یا</span>
      <span className="h-px flex-1 bg-[#dce5ee]" />
    </div>
  )
}

function AuthPage({ mode }) {
  const [role, setRole] = useState('disabled')
  const isSignup = mode === 'signup'
  const isLogout = mode === 'logout'

  useEffect(() => {
    if (isLogout) {
      localStorage.removeItem('accessToken')
    }
  }, [isLogout])

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  if (isLogout) {
    return (
      <AuthLayout>
        <section className="w-full max-w-[308px] text-center">
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#172033] sm:text-[34px]">
            خارج شدید
          </h1>
          <p className="mt-5 text-[14px] leading-6 text-[#59677c]">
            شما با موفقیت از حساب کاربری مهرگام خارج شدید.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#8dc9c0] text-[14px] font-medium text-white shadow-[0_3px_5px_rgba(65,111,105,0.25)] transition hover:bg-[#7dbeb5] focus:outline-none focus:ring-4 focus:ring-[#9fd7cf]/35"
          >
            بازگشت به ورود
          </Link>
        </section>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <section className="w-full max-w-[308px] text-center">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#172033] sm:text-[34px]">
          خوش آمدید
        </h1>

        <div className="mt-8 flex justify-center">
          <RoleSwitch value={role} onChange={setRole} />
        </div>

        <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <FormField id="name" label="نام و نام خانوادگی" autoComplete="name" />
              <FormField id="number" label="شماره موبایل" type="tel" autoComplete="tel" inputDir="ltr" />
            </>
          )}

          <FormField
            id="email"
            label="ایمیل"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            inputDir="ltr"
          />
          <FormField
            id="password"
            label="رمز عبور"
            type="password"
            placeholder="حداقل ۸ کاراکتر"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />


          <button
            type="submit"
            className="h-[42px] w-full rounded-[10px] bg-[#8dc9c0] text-[14px] font-medium text-white shadow-[0_3px_5px_rgba(65,111,105,0.25)] transition hover:bg-[#7dbeb5] focus:outline-none focus:ring-4 focus:ring-[#9fd7cf]/35"
          >
            {isSignup ? 'ثبت‌نام' : 'ورود'}
          </button>
        </form>

        <div className="mt-12">
          <Divider />
        </div>

        <p className="mt-12 text-[13px] text-[#263246]">
          {isSignup ? 'قبلاً حساب کاربری دارید؟' : 'حساب کاربری ندارید؟'}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-[#00b7a8] hover:text-[#079b90]">
            {isSignup ? 'ورود' : 'ثبت‌نام'}
          </Link>
        </p>
      </section>
    </AuthLayout>
  )
}

export default AuthPage
