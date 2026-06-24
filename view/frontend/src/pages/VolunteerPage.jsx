import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { PrimaryButton, SelectInput, StatusMessage, TextInput } from '../components/FormControls.jsx'
import { volunteerApi } from '../services/api.js'
import { formatDate, statusLabels, weekDayLabels } from '../utils/labels.js'

const initialLocationForm = {
  currentLat: '35.6892',
  currentLng: '51.3890',
}

const initialAvailabilityForm = {
  weekday: '0',
  startTime: '09:00',
  endTime: '12:00',
}

const weekdayOptions = weekDayLabels.map((label, index) => ({ value: String(index), label }))

function VolunteerPage() {
  const [profile, setProfile] = useState(null)
  const [availability, setAvailability] = useState([])
  const [locationForm, setLocationForm] = useState(initialLocationForm)
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailabilityForm)
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

  const loadProfile = async () => {
    setIsBusy(true)
    setMessage('')

    try {
      const [profileResult, availabilityResult] = await Promise.all([volunteerApi.getMe(), volunteerApi.getAvailability()])
      setProfile(profileResult.data.volunteer)
      setAvailability(availabilityResult.data.availability || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        const [profileResult, availabilityResult] = await Promise.all([volunteerApi.getMe(), volunteerApi.getAvailability()])

        if (isMounted) {
          setProfile(profileResult.data.volunteer)
          setAvailability(availabilityResult.data.availability || [])
        }
      } catch (error) {
        if (isMounted) {
          setMessageType('error')
          setMessage(error.message)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLocationChange = (event) => {
    const { name, value } = event.target
    setLocationForm((current) => ({ ...current, [name]: value }))
  }

  const handleAvailabilityChange = (event) => {
    const { name, value } = event.target
    setAvailabilityForm((current) => ({ ...current, [name]: value }))
  }

  const updateLocation = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      await volunteerApi.updateLocation({
        currentLat: Number(locationForm.currentLat),
        currentLng: Number(locationForm.currentLng),
      })
      setSuccess('موقعیت داوطلب با موفقیت ثبت شد.')
      await loadProfile()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const setOnline = async (isOnline) => {
    setIsBusy(true)
    setMessage('')

    try {
      if (isOnline) {
        await volunteerApi.goOnline()
        setSuccess('وضعیت شما آنلاین شد.')
      } else {
        await volunteerApi.goOffline()
        setSuccess('وضعیت شما آفلاین شد.')
      }

      await loadProfile()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const createAvailability = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      await volunteerApi.createAvailability({
        weekday: Number(availabilityForm.weekday),
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
      })
      setSuccess('زمان آزاد جدید ثبت شد.')
      await loadProfile()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const deactivateAvailability = async (availabilityId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await volunteerApi.deactivateAvailability(availabilityId)
      setSuccess('زمان آزاد غیرفعال شد.')
      await loadProfile()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <PageLayout
      eyebrow="پنل داوطلب"
      title="وضعیت، موقعیت و زمان‌های آزاد"
      description="داوطلبان برای دریافت درخواست‌های نزدیک باید تأییدشده، آنلاین، دارای موقعیت تازه و زمان آزاد فعال باشند."
    >
      <div className="space-y-7">
        <StatusMessage message={message} type={messageType} />

        <Panel title="پروفایل داوطلب" description="اطلاعات این کارت از endpoint /volunteers/me دریافت می‌شود." action={<PrimaryButton disabled={isBusy} onClick={loadProfile}>به‌روزرسانی</PrimaryButton>}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <p className="text-[12px] font-bold text-[#7b8796]">وضعیت احراز صلاحیت</p>
              <p className="mt-2 text-[15px] font-extrabold text-[#172033]">{statusLabels[profile?.verificationStatus] || profile?.verificationStatus || '—'}</p>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <p className="text-[12px] font-bold text-[#7b8796]">وضعیت آنلاین</p>
              <p className="mt-2 text-[15px] font-extrabold text-[#172033]">{profile?.isOnline ? 'آنلاین' : 'آفلاین'}</p>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <p className="text-[12px] font-bold text-[#7b8796]">آخرین موقعیت</p>
              <p className="mt-2 text-[15px] font-extrabold text-[#172033]" dir="ltr">{profile?.currentLat || '—'}, {profile?.currentLng || '—'}</p>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <p className="text-[12px] font-bold text-[#7b8796]">زمان ثبت موقعیت</p>
              <p className="mt-2 text-[15px] font-extrabold text-[#172033]">{formatDate(profile?.locationUpdatedAt)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton disabled={isBusy} onClick={() => setOnline(true)}>آنلاین شو</PrimaryButton>
            <PrimaryButton disabled={isBusy} danger onClick={() => setOnline(false)}>آفلاین شو</PrimaryButton>
          </div>
        </Panel>

        <Panel title="ثبت موقعیت فعلی" description="برای MVP فعلاً مختصات را دستی وارد می‌کنیم؛ بعداً می‌توان آن را به نقشه یا GPS مرورگر وصل کرد.">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={updateLocation}>
            <TextInput label="عرض جغرافیایی" name="currentLat" value={locationForm.currentLat} onChange={handleLocationChange} dir="ltr" required />
            <TextInput label="طول جغرافیایی" name="currentLng" value={locationForm.currentLng} onChange={handleLocationChange} dir="ltr" required />
            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={isBusy}>ثبت موقعیت</PrimaryButton>
            </div>
          </form>
        </Panel>

        <Panel title="زمان‌های آزاد" description="این زمان‌ها در الگوریتم تطابق درخواست با داوطلب استفاده می‌شود.">
          <form className="mb-6 grid gap-4 md:grid-cols-3" onSubmit={createAvailability}>
            <SelectInput label="روز هفته" name="weekday" value={availabilityForm.weekday} onChange={handleAvailabilityChange} options={weekdayOptions} required />
            <TextInput label="ساعت شروع" name="startTime" type="time" value={availabilityForm.startTime} onChange={handleAvailabilityChange} dir="ltr" required />
            <TextInput label="ساعت پایان" name="endTime" type="time" value={availabilityForm.endTime} onChange={handleAvailabilityChange} dir="ltr" required />
            <div className="md:col-span-3">
              <PrimaryButton type="submit" disabled={isBusy}>افزودن زمان آزاد</PrimaryButton>
            </div>
          </form>

          <div className="space-y-3">
            {availability.length === 0 ? (
              <p className="rounded-[18px] bg-[#fbfdff] p-5 text-[13px] text-[#7b8796]">هنوز زمانی ثبت نشده است.</p>
            ) : (
              availability.map((item) => (
                <div key={item.availabilityId || item.availId} className="flex flex-col justify-between gap-3 rounded-[18px] bg-[#fbfdff] p-4 md:flex-row md:items-center">
                  <p className="text-[14px] font-bold text-[#172033]">
                    {weekDayLabels[item.weekday]}، از <span dir="ltr">{item.startTime}</span> تا <span dir="ltr">{item.endTime}</span>
                  </p>
                  <PrimaryButton disabled={isBusy || item.isActive === false} danger onClick={() => deactivateAvailability(item.availabilityId || item.availId)}>
                    غیرفعال‌سازی
                  </PrimaryButton>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default VolunteerPage
