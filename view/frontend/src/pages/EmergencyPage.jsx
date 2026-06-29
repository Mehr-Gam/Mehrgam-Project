import { useEffect, useState } from 'react'
import LocationPicker from '../components/LocationPicker.jsx'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { PrimaryButton, StatusMessage, TextInput } from '../components/FormControls.jsx'
import { emergencyApi } from '../services/api.js'
import { getStoredUser } from '../utils/auth.js'
import { formatDate, statusLabels } from '../utils/labels.js'

const initialAlertForm = {
  disId: '',
  alertLat: '',
  alertLng: '',
  address: '',
}

function AlertCard({ alert, onResolve, onCancel, isBusy }) {
  return (
    <article className="rounded-[20px] border border-[#eff4f8] bg-[#fbfdff] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fff4f4] px-3 py-1 text-[12px] font-bold text-[#d94d4d]">هشدار اضطراری</span>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#7b8796]">
              {statusLabels[alert.alertStatus] || alert.alertStatus}
            </span>
          </div>
          <h3 className="mt-4 text-[18px] font-bold text-[#172033]">{alert.address || 'موقعیت اضطراری ثبت‌شده'}</h3>
          <p className="mt-2 text-[13px] leading-7 text-[#7b8796]">
            زمان ارسال: {formatDate(alert.triggeredAt)} • مختصات: <span dir="ltr">{alert.alertLat}, {alert.alertLng}</span>
          </p>
          {alert.disabled && (
            <p className="mt-1 text-[13px] text-[#7b8796]">
              توان‌خواه: {alert.disabled.firstName} {alert.disabled.lastName}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton disabled={isBusy || alert.alertStatus === 'resolved'} onClick={() => onResolve(alert.alertId)}>رسیدگی شد</PrimaryButton>
          <PrimaryButton disabled={isBusy || alert.alertStatus === 'cancelled'} danger onClick={() => onCancel(alert.alertId)}>لغو هشدار</PrimaryButton>
        </div>
      </div>
    </article>
  )
}

function EmergencyPage() {
  const user = getStoredUser()
  const [form, setForm] = useState(initialAlertForm)
  const [alerts, setAlerts] = useState([])
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

  const loadAlerts = async () => {
    setIsBusy(true)
    setMessage('')

    try {
      const result = await emergencyApi.getMy()
      setAlerts(result.data.alerts || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchAlerts = async () => {
      try {
        const result = await emergencyApi.getMy()

        if (isMounted) {
          setAlerts(result.data.alerts || [])
        }
      } catch (error) {
        if (isMounted) {
          setMessageType('error')
          setMessage(error.message)
        }
      }
    }

    fetchAlerts()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleLocationChange = (updates) => {
    setForm((current) => ({ ...current, ...updates }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      if (!form.alertLat || !form.alertLng) {
        setError('لطفاً موقعیت اضطراری را از بخش نقشه انتخاب کنید.')
        return
      }

      const payload = {
        alertLat: Number(form.alertLat),
        alertLng: Number(form.alertLng),
        address: form.address || undefined,
      }

      if (user?.role === 'supervisor') {
        payload.disId = Number(form.disId)
      }

      await emergencyApi.create(payload)
      setForm(initialAlertForm)
      setSuccess('هشدار اضطراری با موفقیت ثبت شد.')
      await loadAlerts()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleResolve = async (alertId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await emergencyApi.resolve(alertId)
      setSuccess('هشدار به عنوان رسیدگی‌شده ثبت شد.')
      await loadAlerts()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleCancel = async (alertId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await emergencyApi.cancel(alertId)
      setSuccess('هشدار لغو شد.')
      await loadAlerts()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <PageLayout
      eyebrow="ایمنی و پشتیبانی"
      title="هشدار اضطراری"
      description="در شرایط حساس می‌توانید موقعیت اضطراری را ثبت و وضعیت هشدارهای خود را پیگیری کنید."
    >
      <div className="space-y-7">
        <StatusMessage message={message} type={messageType} />

        <Panel title="ثبت هشدار جدید" description="در نسخه MVP هشدار در سیستم ثبت می‌شود؛ اتصال واقعی به پلیس، اورژانس یا پیامک می‌تواند در فاز بعدی اضافه شود.">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            {user?.role === 'supervisor' && (
              <TextInput label="شناسه توان‌خواه" name="disId" value={form.disId} onChange={handleChange} dir="ltr" required />
            )}
            <LocationPicker
              title="انتخاب موقعیت اضطراری"
              description="موقعیت را با جستجو یا دکمه موقعیت فعلی انتخاب کنید."
              lat={form.alertLat}
              lng={form.alertLng}
              address={form.address}
              latName="alertLat"
              lngName="alertLng"
              addressName="address"
              onChange={handleLocationChange}
              required
            />
            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={isBusy} danger>ارسال هشدار اضطراری</PrimaryButton>
            </div>
          </form>
        </Panel>

        <Panel title="هشدارهای من" description="آخرین هشدارهای ثبت‌شده را می‌توانید از این بخش پیگیری کنید." action={<PrimaryButton disabled={isBusy} onClick={loadAlerts}>به‌روزرسانی</PrimaryButton>}>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="rounded-[18px] bg-[#fbfdff] p-5 text-[13px] text-[#7b8796]">هنوز هشداری ثبت نشده است.</p>
            ) : (
              alerts.map((alert) => (
                <AlertCard key={alert.alertId} alert={alert} isBusy={isBusy} onResolve={handleResolve} onCancel={handleCancel} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default EmergencyPage
