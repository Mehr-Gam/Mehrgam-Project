import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { PrimaryButton, SelectInput, StatusMessage, TextArea, TextInput } from '../components/FormControls.jsx'
import { serviceRequestApi } from '../services/api.js'
import { getStoredUser } from '../utils/auth.js'
import { formatDate, formatMeters, requestTypeLabels, statusLabels } from '../utils/labels.js'

const initialRequestForm = {
  disId: '',
  requestType: 'medical',
  requestedTime: '',
  originAddress: '',
  originLat: '35.6892',
  originLng: '51.3890',
  destinationAddress: '',
  destinationLat: '',
  destinationLng: '',
  description: '',
}

const typeOptions = Object.entries(requestTypeLabels).map(([value, label]) => ({ value, label }))

const toOptionalNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(value))
const toOptionalText = (value) => (value ? value : undefined)

function RequestCard({ request, onCancel, onAccept, onFinish, isVolunteer, isBusy }) {
  return (
    <article className="rounded-[20px] border border-[#eff4f8] bg-[#fbfdff] p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef9f7] px-3 py-1 text-[12px] font-bold text-[#55b7ad]">
              {requestTypeLabels[request.requestType] || request.requestType}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#7b8796]">
              {statusLabels[request.status] || request.status}
            </span>
          </div>
          <h3 className="mt-4 text-[18px] font-extrabold text-[#172033]">{request.originAddress || 'مبدأ ثبت‌شده روی نقشه'}</h3>
          <p className="mt-2 text-[13px] leading-7 text-[#7b8796]">
            زمان: {formatDate(request.requestedTime)} {request.destinationAddress ? ` • مقصد: ${request.destinationAddress}` : ''}
          </p>
          {request.disabled && (
            <p className="mt-1 text-[13px] text-[#7b8796]">
              توان‌خواه: {request.disabled.firstName} {request.disabled.lastName}
            </p>
          )}
          {request.description && <p className="mt-3 text-[13px] leading-7 text-[#536174]">{request.description}</p>}
          {isVolunteer && (
            <p className="mt-3 text-[13px] font-bold text-[#55b7ad]">
              فاصله تقریبی: {formatMeters(request.approxDistanceMeters)} • زمان تقریبی: {request.approxDurationMinutes || '—'} دقیقه
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {isVolunteer ? (
            <>
              <PrimaryButton disabled={isBusy} onClick={() => onAccept(request.requestId)}>پذیرش</PrimaryButton>
              <PrimaryButton disabled={isBusy} onClick={() => onFinish(request.requestId)}>اتمام</PrimaryButton>
              <PrimaryButton disabled={isBusy} danger onClick={() => onCancel(request.requestId)}>لغو</PrimaryButton>
            </>
          ) : (
            <PrimaryButton disabled={isBusy || request.status === 'cancelled' || request.status === 'finished'} danger onClick={() => onCancel(request.requestId)}>
              لغو درخواست
            </PrimaryButton>
          )}
        </div>
      </div>
    </article>
  )
}

function RequestsPage() {
  const user = getStoredUser()
  const [form, setForm] = useState(initialRequestForm)
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [isBusy, setIsBusy] = useState(false)

  const isRequester = user?.role === 'disabled' || user?.role === 'supervisor'
  const isVolunteer = user?.role === 'volunteer'

  const setSuccess = (text) => {
    setMessageType('success')
    setMessage(text)
  }

  const setError = (text) => {
    setMessageType('error')
    setMessage(text)
  }

  const loadRequests = async () => {
    setIsBusy(true)
    setMessage('')

    try {
      const result = isVolunteer ? await serviceRequestApi.getAvailable() : await serviceRequestApi.getMy()
      setRequests(result.data.requests || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchRequests = async () => {
      try {
        const result = isVolunteer ? await serviceRequestApi.getAvailable() : await serviceRequestApi.getMy()

        if (isMounted) {
          setRequests(result.data.requests || [])
        }
      } catch (error) {
        if (isMounted) {
          setMessageType('error')
          setMessage(error.message)
        }
      }
    }

    fetchRequests()

    return () => {
      isMounted = false
    }
  }, [isVolunteer])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      const payload = {
        requestType: form.requestType,
        requestedTime: new Date(form.requestedTime).toISOString(),
        originAddress: toOptionalText(form.originAddress),
        originLat: Number(form.originLat),
        originLng: Number(form.originLng),
        destinationAddress: toOptionalText(form.destinationAddress),
        destinationLat: toOptionalNumber(form.destinationLat),
        destinationLng: toOptionalNumber(form.destinationLng),
        description: toOptionalText(form.description),
      }

      if (user.role === 'supervisor') {
        payload.disId = Number(form.disId)
      }

      await serviceRequestApi.create(payload)
      setForm(initialRequestForm)
      setSuccess('درخواست همراهی با موفقیت ثبت شد.')
      await loadRequests()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleCancel = async (requestId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await serviceRequestApi.cancel(requestId)
      setSuccess('درخواست لغو شد.')
      await loadRequests()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleAccept = async (requestId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await serviceRequestApi.accept(requestId)
      setSuccess('درخواست پذیرفته شد.')
      await loadRequests()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleFinish = async (requestId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await serviceRequestApi.finish(requestId)
      setSuccess('درخواست به عنوان تمام‌شده ثبت شد.')
      await loadRequests()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <PageLayout
      eyebrow="درخواست‌های همراهی"
      title={isVolunteer ? 'درخواست‌های قابل پذیرش' : 'ثبت و پیگیری درخواست همراهی'}
      description="این صفحه بر اساس endpointهای service-requests ساخته شده و برای نیازهای پزشکی، خرید، تفریحی و اداری قابل استفاده است."
    >
      <div className="space-y-7">
        <StatusMessage message={message} type={messageType} />

        {isRequester && (
          <Panel title="ثبت درخواست جدید" description="برای سرپرست، وارد کردن شناسه توان‌خواه الزامی است؛ برای توان‌خواه، شناسه از توکن کاربر خوانده می‌شود.">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              {user.role === 'supervisor' && (
                <TextInput label="شناسه توان‌خواه" name="disId" value={form.disId} onChange={handleChange} dir="ltr" required />
              )}
              <SelectInput label="نوع درخواست" name="requestType" value={form.requestType} onChange={handleChange} options={typeOptions} required />
              <TextInput
                label="زمان موردنظر"
                name="requestedTime"
                type="datetime-local"
                value={form.requestedTime}
                onChange={handleChange}
                dir="ltr"
                required
              />
              <TextInput label="آدرس مبدأ" name="originAddress" value={form.originAddress} onChange={handleChange} required={false} />
              <TextInput label="عرض جغرافیایی مبدأ" name="originLat" value={form.originLat} onChange={handleChange} dir="ltr" required />
              <TextInput label="طول جغرافیایی مبدأ" name="originLng" value={form.originLng} onChange={handleChange} dir="ltr" required />
              <TextInput label="آدرس مقصد" name="destinationAddress" value={form.destinationAddress} onChange={handleChange} required={false} />
              <TextInput label="عرض جغرافیایی مقصد" name="destinationLat" value={form.destinationLat} onChange={handleChange} dir="ltr" required={false} />
              <TextInput label="طول جغرافیایی مقصد" name="destinationLng" value={form.destinationLng} onChange={handleChange} dir="ltr" required={false} />
              <TextArea label="توضیحات" name="description" value={form.description} onChange={handleChange} placeholder="مثلاً نیاز به ویلچر یا زمان تقریبی انجام کار" />
              <div className="md:col-span-2">
                <PrimaryButton type="submit" disabled={isBusy}>ثبت درخواست</PrimaryButton>
              </div>
            </form>
          </Panel>
        )}

        <Panel
          title={isVolunteer ? 'درخواست‌های نزدیک و قابل پذیرش' : 'درخواست‌های من'}
          description={isVolunteer ? 'برای نمایش این لیست، داوطلب باید تأییدشده، آنلاین و دارای موقعیت تازه باشد.' : 'درخواست‌های ثبت‌شده خود را می‌توانید از همین بخش لغو کنید.'}
          action={<PrimaryButton disabled={isBusy} onClick={loadRequests}>به‌روزرسانی</PrimaryButton>}
        >
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="rounded-[18px] bg-[#fbfdff] p-5 text-[13px] text-[#7b8796]">در حال حاضر موردی برای نمایش وجود ندارد.</p>
            ) : (
              requests.map((request) => (
                <RequestCard
                  key={request.requestId}
                  request={request}
                  isVolunteer={isVolunteer}
                  isBusy={isBusy}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                  onFinish={handleFinish}
                />
              ))
            )}
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default RequestsPage
