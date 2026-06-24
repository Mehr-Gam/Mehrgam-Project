import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { PrimaryButton, SelectInput, StatusMessage, TextInput } from '../components/FormControls.jsx'
import { adminApi } from '../services/api.js'
import { formatDate, formatName, roleLabels, statusLabels } from '../utils/labels.js'

const initialAdminForm = {
  firstName: '',
  lastName: '',
  nationalCode: '',
  phone: '',
  province: '',
  city: '',
  password: '',
  confirmPassword: '',
}

const roleOptions = [
  { value: '', label: 'همه نقش‌ها' },
  { value: 'disabled', label: 'توان‌خواه' },
  { value: 'supervisor', label: 'سرپرست' },
  { value: 'volunteer', label: 'داوطلب' },
  { value: 'admin', label: 'مدیر سامانه' },
]

function UserRow({ user, onActivate, onDeactivate, isBusy }) {
  return (
    <tr className="border-b border-[#edf3f8] last:border-0">
      <td className="px-4 py-4 text-right">
        <p className="font-extrabold text-[#172033]">{formatName(user)}</p>
        <p className="mt-1 text-[12px] text-[#7b8796]" dir="ltr">{user.phone || '—'}</p>
      </td>
      <td className="px-4 py-4 text-right">{roleLabels[user.role] || user.role}</td>
      <td className="px-4 py-4 text-right" dir="ltr">{user.nationalCode || '—'}</td>
      <td className="px-4 py-4 text-right">{user.isActive ? 'فعال' : 'غیرفعال'}</td>
      <td className="px-4 py-4 text-right">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-4 text-right">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isBusy || user.isActive}
            onClick={() => onActivate(user.userId)}
            className="rounded-full bg-[#eef9f7] px-4 py-2 text-[12px] font-bold text-[#55b7ad] disabled:opacity-50"
          >
            فعال‌سازی
          </button>
          <button
            type="button"
            disabled={isBusy || !user.isActive || user.role === 'admin'}
            onClick={() => onDeactivate(user.userId)}
            className="rounded-full bg-[#fff4f4] px-4 py-2 text-[12px] font-bold text-[#d94d4d] disabled:opacity-50"
          >
            غیرفعال‌سازی
          </button>
        </div>
      </td>
    </tr>
  )
}

function VolunteerCard({ volunteer, onApprove, onReject, isBusy }) {
  return (
    <article className="rounded-[20px] border border-[#eff4f8] bg-[#fbfdff] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef9f7] px-3 py-1 text-[12px] font-bold text-[#55b7ad]">شناسه: {volunteer.volId}</span>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#7b8796]">
              {statusLabels[volunteer.verificationStatus] || volunteer.verificationStatus}
            </span>
          </div>
          <h3 className="mt-4 text-[18px] font-extrabold text-[#172033]">{formatName(volunteer.user)}</h3>
          <p className="mt-2 text-[13px] leading-7 text-[#7b8796]">
            موبایل: <span dir="ltr">{volunteer.user?.phone || '—'}</span> • شهر: {volunteer.user?.city || '—'}
          </p>
          <p className="mt-1 text-[13px] leading-7 text-[#7b8796]">آدرس: {volunteer.homeAddress || '—'}</p>
          <p className="mt-1 text-[13px] leading-7 text-[#7b8796]">وضعیت آنلاین: {volunteer.isOnline ? 'آنلاین' : 'آفلاین'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton disabled={isBusy} onClick={() => onApprove(volunteer.volId)}>تأیید</PrimaryButton>
          <PrimaryButton disabled={isBusy} danger onClick={() => onReject(volunteer.volId)}>رد</PrimaryButton>
        </div>
      </div>
    </article>
  )
}

function AdminPage() {
  const [users, setUsers] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [filters, setFilters] = useState({ role: '', search: '' })
  const [adminForm, setAdminForm] = useState(initialAdminForm)
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

  const loadUsers = async () => {
    setIsBusy(true)
    setMessage('')

    try {
      const params = {
        limit: 50,
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.search ? { search: filters.search } : {}),
      }
      const result = await adminApi.listUsers(params)
      setUsers(result.data.users || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const loadPendingVolunteers = async () => {
    setIsBusy(true)
    setMessage('')

    try {
      const result = await adminApi.listPendingVolunteers({ limit: 50 })
      setVolunteers(result.data.volunteers || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchAdminData = async () => {
      try {
        const [usersResult, volunteersResult] = await Promise.all([
          adminApi.listUsers({ limit: 50 }),
          adminApi.listPendingVolunteers({ limit: 50 }),
        ])

        if (isMounted) {
          setUsers(usersResult.data.users || [])
          setVolunteers(volunteersResult.data.volunteers || [])
        }
      } catch (error) {
        if (isMounted) {
          setMessageType('error')
          setMessage(error.message)
        }
      }
    }

    fetchAdminData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleAdminFormChange = (event) => {
    const { name, value } = event.target
    setAdminForm((current) => ({ ...current, [name]: value }))
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    loadUsers()
  }

  const activateUser = async (userId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await adminApi.activateUser(userId)
      setSuccess('کاربر فعال شد.')
      await loadUsers()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const deactivateUser = async (userId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await adminApi.deactivateUser(userId)
      setSuccess('کاربر غیرفعال شد.')
      await loadUsers()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const approveVolunteer = async (volunteerId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await adminApi.approveVolunteer(volunteerId)
      setSuccess('داوطلب تأیید شد.')
      await loadPendingVolunteers()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const rejectVolunteer = async (volunteerId) => {
    setIsBusy(true)
    setMessage('')

    try {
      await adminApi.rejectVolunteer(volunteerId)
      setSuccess('داوطلب رد شد.')
      await loadPendingVolunteers()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const createAdmin = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    setMessage('')

    try {
      await adminApi.createAdmin({
        ...adminForm,
        province: adminForm.province || undefined,
        city: adminForm.city || undefined,
      })
      setAdminForm(initialAdminForm)
      setSuccess('مدیر جدید ساخته شد.')
      await loadUsers()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <PageLayout
      eyebrow="مدیریت سامانه"
      title="داشبورد مدیر ارشد"
      description="این صفحه بر اساس routeهای admin ساخته شده و مدیریت کاربران، داوطلبان در انتظار تأیید و ساخت مدیر جدید را پوشش می‌دهد."
    >
      <div className="space-y-7">
        <StatusMessage message={message} type={messageType} />

        <Panel title="داوطلبان در انتظار تأیید" description="مطابق بخش احراز هویت، داوطلبان قبل از فعالیت باید توسط مدیر بررسی و تأیید شوند." action={<PrimaryButton disabled={isBusy} onClick={loadPendingVolunteers}>به‌روزرسانی</PrimaryButton>}>
          <div className="space-y-4">
            {volunteers.length === 0 ? (
              <p className="rounded-[18px] bg-[#fbfdff] p-5 text-[13px] text-[#7b8796]">داوطلب در انتظار بررسی وجود ندارد.</p>
            ) : (
              volunteers.map((volunteer) => (
                <VolunteerCard key={volunteer.volId} volunteer={volunteer} isBusy={isBusy} onApprove={approveVolunteer} onReject={rejectVolunteer} />
              ))
            )}
          </div>
        </Panel>

        <Panel title="مدیریت کاربران" description="کاربران را بر اساس نقش یا متن جست‌وجو فیلتر کنید و وضعیت فعال/غیرفعال را تغییر دهید.">
          <form className="mb-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={handleFilterSubmit}>
            <SelectInput label="نقش" name="role" value={filters.role} onChange={handleFilterChange} options={roleOptions} />
            <TextInput label="جست‌وجو" name="search" value={filters.search} onChange={handleFilterChange} required={false} />
            <PrimaryButton type="submit" disabled={isBusy}>اعمال فیلتر</PrimaryButton>
          </form>

          <div className="overflow-x-auto rounded-[18px] border border-[#edf3f8]">
            <table className="min-w-[760px] w-full border-collapse bg-white text-[13px] text-[#536174]">
              <thead className="bg-[#fbfdff] text-[#172033]">
                <tr>
                  <th className="px-4 py-4 text-right">کاربر</th>
                  <th className="px-4 py-4 text-right">نقش</th>
                  <th className="px-4 py-4 text-right">کد ملی</th>
                  <th className="px-4 py-4 text-right">وضعیت</th>
                  <th className="px-4 py-4 text-right">تاریخ ساخت</th>
                  <th className="px-4 py-4 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-[#7b8796]" colSpan="6">کاربری برای نمایش وجود ندارد.</td>
                  </tr>
                ) : (
                  users.map((user) => <UserRow key={user.userId} user={user} isBusy={isBusy} onActivate={activateUser} onDeactivate={deactivateUser} />)
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="ساخت مدیر جدید" description="این فرم به endpoint /admin/admins متصل است و فقط مدیر فعلی اجازه استفاده از آن را دارد.">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={createAdmin}>
            <TextInput label="نام" name="firstName" value={adminForm.firstName} onChange={handleAdminFormChange} required />
            <TextInput label="نام خانوادگی" name="lastName" value={adminForm.lastName} onChange={handleAdminFormChange} required />
            <TextInput label="کد ملی" name="nationalCode" value={adminForm.nationalCode} onChange={handleAdminFormChange} dir="ltr" required />
            <TextInput label="شماره موبایل" name="phone" value={adminForm.phone} onChange={handleAdminFormChange} dir="ltr" required />
            <TextInput label="استان" name="province" value={adminForm.province} onChange={handleAdminFormChange} required={false} />
            <TextInput label="شهر" name="city" value={adminForm.city} onChange={handleAdminFormChange} required={false} />
            <TextInput label="رمز عبور" name="password" type="password" value={adminForm.password} onChange={handleAdminFormChange} required />
            <TextInput label="تکرار رمز عبور" name="confirmPassword" type="password" value={adminForm.confirmPassword} onChange={handleAdminFormChange} required />
            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={isBusy}>ساخت مدیر</PrimaryButton>
            </div>
          </form>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default AdminPage
