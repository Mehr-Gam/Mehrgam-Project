import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField, { SelectFormField } from '../components/FormField.jsx'
import RoleSwitch from '../components/RoleSwitch.jsx'
import { authApi } from '../services/api.js'
import { clearSession, saveSession } from '../utils/auth.js'
import { getCityOptions, getProvinceOptions } from '../utils/iranLocations.js'

const initialSignup = {
  firstName: '',
  lastName: '',
  nationalCode: '',
  phone: '',
  province: '',
  city: '',
  homeAddress: '',
  password: '',
  confirmPassword: '',
}

const codeFieldMap = {
  NATIONAL_CODE_ALREADY_EXISTS: 'nationalCode',
  PHONE_ALREADY_EXISTS: 'phone',
  DUPLICATE_USER: 'nationalCode',
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpiredMessage = searchParams.get('expired') === '1' ? 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.' : ''
  const [loginForm, setLoginForm] = useState({ nationalCode: '', password: '' })
  const [signupForm, setSignupForm] = useState(initialSignup)
  const [message, setMessage] = useState(sessionExpiredMessage)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignup = mode === 'signup'
  const isLogout = mode === 'logout'
  const provinceOptions = getProvinceOptions()
  const cityOptions = getCityOptions(signupForm.province)

  useEffect(() => {
    if (isLogout || searchParams.get('expired') === '1') {
      clearSession()
    }
  }, [isLogout, searchParams])

  const clearFieldError = (name) => {
    setFieldErrors((current) => {
      if (!current[name]) {
        return current
      }

      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    clearFieldError(name)
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignupChange = (event) => {
    const { name, value } = event.target
    clearFieldError(name)

    if (name === 'province') {
      clearFieldError('city')
      setSignupForm((current) => ({ ...current, province: value, city: '' }))
      return
    }

    setSignupForm((current) => ({ ...current, [name]: value }))
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    setMessage('')
    setFieldErrors({})
  }

  const getFieldError = (name) => fieldErrors[name]

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const result = isSignup
        ? await authApi.register({
            ...signupForm,
            role,
            homeAddress: signupForm.homeAddress || undefined,
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
      const nextFieldErrors = { ...(error.fields || {}) }
      const mappedField = codeFieldMap[error.code]

      if (mappedField && !nextFieldErrors[mappedField]) {
        nextFieldErrors[mappedField] = error.message
      }

      setFieldErrors(nextFieldErrors)
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLogout) {
    return (
      <AuthLayout>
        <section className="w-full text-center">
          <h1 className="text-[34px] font-bold tracking-[-0.03em] text-[#172033] sm:text-[34px]">خارج شدید</h1>
          <p className="mt-5 text-[14px] leading-6 text-[#59677c]">شما با موفقیت از حساب کاربری مهرگام خارج شدید.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#8dc9c0] text-[14px] font-medium text-white shadow-[0_3px_5px_rgba(65,111,105,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7dbeb5] hover:shadow-[0_10px_22px_rgba(65,111,105,0.22)] focus:outline-none focus:ring-4 focus:ring-[#9fd7cf]/35"
          >
            بازگشت به ورود
          </Link>
        </section>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <section className="w-full text-center animate-fade-in">
        <h1 className="text-[34px] font-bold tracking-[-0.03em] text-[#172033] sm:text-[34px]">خوش آمدید</h1>

        {isSignup && (
          <div className="mt-8 flex justify-center">
            <RoleSwitch value={role} onChange={handleRoleChange} />
          </div>
        )}

        <form className={isSignup ? 'mt-9 space-y-5' : 'mt-10 space-y-5'} onSubmit={handleSubmit} noValidate>
          {isSignup ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="firstName" label="نام" value={signupForm.firstName} onChange={handleSignupChange} autoComplete="given-name" error={getFieldError('firstName')} />
                <FormField id="lastName" label="نام خانوادگی" value={signupForm.lastName} onChange={handleSignupChange} autoComplete="family-name" error={getFieldError('lastName')} />
              </div>
              <FormField
                id="nationalCode"
                label="کد ملی"
                value={signupForm.nationalCode}
                onChange={handleSignupChange}
                placeholder="۱۰ رقم"
                autoComplete="off"
                inputDir="ltr"
                error={getFieldError('nationalCode')}
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
                error={getFieldError('phone')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectFormField
                  id="province"
                  label="استان"
                  value={signupForm.province}
                  onChange={handleSignupChange}
                  options={provinceOptions}
                  required={false}
                  error={getFieldError('province')}
                />
                <SelectFormField
                  id="city"
                  label="شهر"
                  value={signupForm.city}
                  onChange={handleSignupChange}
                  options={cityOptions}
                  required={false}
                  disabled={!signupForm.province}
                  error={getFieldError('city')}
                />
              </div>
              {role !== 'supervisor' && (
                <FormField id="homeAddress" label="آدرس منزل" value={signupForm.homeAddress} onChange={handleSignupChange} error={getFieldError('homeAddress')} />
              )}
              <FormField
                id="password"
                label="رمز عبور"
                type="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="حداقل ۶ کاراکتر"
                autoComplete="new-password"
                error={getFieldError('password')}
              />
              <FormField
                id="confirmPassword"
                label="تکرار رمز عبور"
                type="password"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                placeholder="تکرار رمز عبور"
                autoComplete="new-password"
                error={getFieldError('confirmPassword')}
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
                error={getFieldError('nationalCode')}
              />
              <FormField
                id="password"
                label="رمز عبور"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="حداقل ۶ کاراکتر"
                autoComplete="current-password"
                error={getFieldError('password')}
              />
            </>
          )}

          {message && <p className="rounded-[12px] bg-[#fff4f4] px-4 py-3 text-[12px] font-semibold leading-6 text-[#d94d4d]">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="shine-button h-[42px] w-full rounded-[10px] bg-[#8dc9c0] text-[14px] font-medium text-white shadow-[0_3px_5px_rgba(65,111,105,0.25)] transition hover:-translate-y-0.5 hover:bg-[#7dbeb5] hover:shadow-[0_12px_26px_rgba(65,111,105,0.24)] focus:outline-none focus:ring-4 focus:ring-[#9fd7cf]/35 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'در حال ارسال...' : isSignup ? 'ثبت‌نام' : 'ورود'}
          </button>
        </form>

        <div className="mt-12">
          <Divider />
        </div>

        <p className="mt-12 text-[13px] text-[#263246]">
          {isSignup ? 'قبلاً حساب کاربری دارید؟' : 'حساب کاربری ندارید؟'}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-bold text-[#00b7a8] transition hover:text-[#079b90]">
            {isSignup ? 'ورود' : 'ثبت‌نام'}
          </Link>
        </p>
      </section>
    </AuthLayout>
  )
}

export default AuthPage
