import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import RoleSwitch from '../components/RoleSwitch.jsx'
import { authApi } from '../services/api.js'
import { clearSession, saveSession } from '../utils/auth.js'

const initialSignup = {
  firstName: '',
  lastName: '',
  nationalCode: '',
  phone: '',
  province: '',
  city: '',
  homeAddress: '',
  accessibilityNeed: '',
  password: '',
  confirmPassword: '',
}

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
  const [loginForm, setLoginForm] = useState({ nationalCode: '', password: '' })
  const [signupForm, setSignupForm] = useState(initialSignup)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const isLogout = mode === 'logout'

  useEffect(() => {
    if (isLogout) {
      clearSession()
    }
  }, [isLogout])

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignupChange = (event) => {
    const { name, value } = event.target
    setSignupForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const result = isSignup
        ? await authApi.register({
            ...signupForm,
            role,
            homeAddress: signupForm.homeAddress || undefined,
            accessibilityNeed: signupForm.accessibilityNeed || undefined,
            province: signupForm.province || undefined,
            city: signupForm.city || undefined,
          })
        : await authApi.login(loginForm)

      saveSession({
        accessToken: result.data.accessToken,
        user: result.data.user,
      })

      navigate('/dashboard')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLogout) {
    return (
      <AuthLayout>
        <section className="w-full max-w-[308px] text-center">
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#172033] sm:text-[34px]">خارج شدید</h1>
          <p className="mt-5 text-[14px] leading-6 text-[#59677c]">شما با موفقیت از حساب کاربری مهرگام خارج شدید.</p>
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
      <section className="w-full max-w-[340px] text-center">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#172033] sm:text-[34px]">خوش آمدید</h1>

        <div className="mt-8 flex justify-center">
          <RoleSwitch value={role} onChange={setRole} />
        </div>

        <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="firstName" label="نام" value={signupForm.firstName} onChange={handleSignupChange} autoComplete="given-name" />
                <FormField id="lastName" label="نام خانوادگی" value={signupForm.lastName} onChange={handleSignupChange} autoComplete="family-name" />
              </div>
              <FormField
                id="nationalCode"
                label="کد ملی"
                value={signupForm.nationalCode}
                onChange={handleSignupChange}
                placeholder="۱۰ رقم"
                autoComplete="off"
                inputDir="ltr"
              />
              <FormField
                id="phone"
                label="شماره موبایل"
                type="tel"
                value={signupForm.phone}
                onChange={handleSignupChange}
                placeholder="09xxxxxxxxx"
                autoComplete="tel"
                inputDir="ltr"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="province" label="استان" value={signupForm.province} onChange={handleSignupChange} required={false} />
                <FormField id="city" label="شهر" value={signupForm.city} onChange={handleSignupChange} required={false} />
              </div>
              {role !== 'supervisor' && (
                <FormField id="homeAddress" label="آدرس منزل" value={signupForm.homeAddress} onChange={handleSignupChange} />
              )}
              {role === 'disabled' && (
                <FormField
                  id="accessibilityNeed"
                  label="نیاز دسترس‌پذیری"
                  value={signupForm.accessibilityNeed}
                  onChange={handleSignupChange}
                  placeholder="مثلاً ویلچر، کم‌بینایی یا همراهی بیشتر"
                  required={false}
                />
              )}
              <FormField
                id="password"
                label="رمز عبور"
                type="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="حداقل ۶ کاراکتر"
                autoComplete="new-password"
              />
              <FormField
                id="confirmPassword"
                label="تکرار رمز عبور"
                type="password"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                placeholder="تکرار رمز عبور"
                autoComplete="new-password"
              />
            </>
          ) : (
            <>
              <FormField
                id="nationalCode"
                label="کد ملی"
                value={loginForm.nationalCode}
                onChange={handleLoginChange}
                placeholder="۱۰ رقم"
                autoComplete="off"
                inputDir="ltr"
              />
              <FormField
                id="password"
                label="رمز عبور"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="حداقل ۶ کاراکتر"
                autoComplete="current-password"
              />
            </>
          )}

          {message && <p className="rounded-[12px] bg-[#fff4f4] px-4 py-3 text-[12px] font-semibold text-[#d94d4d]">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[42px] w-full rounded-[10px] bg-[#8dc9c0] text-[14px] font-medium text-white shadow-[0_3px_5px_rgba(65,111,105,0.25)] transition hover:bg-[#7dbeb5] focus:outline-none focus:ring-4 focus:ring-[#9fd7cf]/35 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'در حال ارسال...' : isSignup ? 'ثبت‌نام' : 'ورود'}
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
