import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { PrimaryButton, StatusMessage, TextInput } from '../components/FormControls.jsx'
import { supervisorApi } from '../services/api.js'
import { formatDate, formatName } from '../utils/labels.js'

function DisabledCard({ item, onRemove, isBusy }) {
  return (
    <article className="rounded-[20px] border border-[#eff4f8] bg-[#fbfdff] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef9f7] px-3 py-1 text-[12px] font-bold text-[#55b7ad]">شناسه: {item.disId}</span>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#7b8796]">{item.user?.isActive ? 'فعال' : 'غیرفعال'}</span>
          </div>
          <h3 className="mt-4 text-[18px] font-bold text-[#172033]">{formatName(item.user)}</h3>
          <p className="mt-2 text-[13px] leading-7 text-[#7b8796]">
            شماره تماس: <span dir="ltr">{item.user?.phone || '—'}</span> • شهر: {item.user?.city || '—'}
          </p>
          <p className="mt-1 text-[13px] leading-7 text-[#7b8796]">آدرس: {item.homeAddress || '—'}</p>
          {item.accessibilityNeed && <p className="mt-1 text-[13px] leading-7 text-[#536174]">نیاز: {item.accessibilityNeed}</p>}
          <p className="mt-2 text-[12px] text-[#9aa9ba]">افزوده‌شده: {formatDate(item.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/requests"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#8dc9c0] px-7 text-[13px] font-bold text-white transition hover:bg-[#78bdb3]"
          >
            ثبت درخواست
          </Link>
          <PrimaryButton disabled={isBusy} danger onClick={() => onRemove(item.disId)}>حذف از سرپرستی</PrimaryButton>
        </div>
      </div>
    </article>
  )
}

function SupervisorPage() {
  const [disabled, setDisabled] = useState([])
  const [search, setSearch] = useState('')
  const [nationalCode, setNationalCode] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [isBusy, setIsBusy] = useState(false)

  const setSuccess = (text) => {
    setMessageType('success')
    setMessage(text)
  }

  const setError = (text) => {
    setMessageType('error')
    setMessage(text)
  }

  const loadDisabled = async (searchText = search) => {
    setIsBusy(true)
    setMessage('')

    try {
      const params = searchText ? { search: searchText, limit: 50 } : { limit: 50 }
      const result = await supervisorApi.getMyDisabled(params)
      setDisabled(result.data.disabled || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchDisabled = async () => {
      try {
        const result = await supervisorApi.getMyDisabled({ limit: 50 })

        if (isMounted) {
          setDisabled(result.data.disabled || [])
        }
      } catch (error) {
        if (isMounted) {
          setMessageType('error')
          setMessage(error.message)
        }
      }
    }

    fetchDisabled()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAttach = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      await supervisorApi.attachDisabled({ nationalCode })
      setNationalCode('')
      setSuccess('توان‌خواه با موفقیت به لیست شما اضافه شد.')
      await loadDisabled('')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleRemove = async (disabledId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await supervisorApi.removeDisabled(disabledId)
      setSuccess('توان‌خواه از لیست سرپرستی شما حذف شد.')
      await loadDisabled('')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()
    loadDisabled(search)
  }

  return (
    <PageLayout
      eyebrow="پنل سرپرست"
      title="مدیریت توان‌خواهان تحت سرپرستی"
      description="سرپرست می‌تواند توان‌خواه را با کد ملی به لیست خود اضافه کند و برای او درخواست همراهی یا هشدار اضطراری بسازد."
    >
      <div className="space-y-7">
        <StatusMessage message={message} type={messageType} />

        <Panel title="افزودن توان‌خواه" description="کد ملی توان‌خواه باید قبلاً در سامانه با نقش توان‌خواه ثبت‌نام شده باشد.">
          <form className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" onSubmit={handleAttach}>
            <TextInput
              label="کد ملی توان‌خواه"
              name="nationalCode"
              value={nationalCode}
              onChange={(event) => setNationalCode(event.target.value)}
              placeholder="۱۰ رقم"
              dir="ltr"
              required
            />
            <PrimaryButton type="submit" disabled={isBusy}>افزودن</PrimaryButton>
          </form>
        </Panel>

        <Panel
          title="لیست توان‌خواهان"
          description="برای ثبت درخواست به شناسه توان‌خواه نیاز دارید؛ شناسه هر نفر روی کارت نمایش داده شده است."
          action={
            <form className="flex gap-2" onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو"
                className="h-11 rounded-full border border-[#dfe8ef] bg-[#fbfdff] px-4 text-[13px] outline-none focus:border-[#9fd7cf]"
              />
              <PrimaryButton type="submit" disabled={isBusy}>جست‌وجو</PrimaryButton>
            </form>
          }
        >
          <div className="space-y-4">
            {disabled.length === 0 ? (
              <p className="rounded-[18px] bg-[#fbfdff] p-5 text-[13px] text-[#7b8796]">هنوز توان‌خواهی به لیست شما اضافه نشده است.</p>
            ) : (
              disabled.map((item) => <DisabledCard key={item.disId} item={item} isBusy={isBusy} onRemove={handleRemove} />)
            )}
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default SupervisorPage
