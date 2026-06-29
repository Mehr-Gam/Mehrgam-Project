import { useEffect, useState } from 'react'
import DashboardCard from '../components/DashboardCard.jsx'
import PageLayout from '../components/PageLayout.jsx'
import Panel from '../components/Panel.jsx'
import { StatusMessage } from '../components/FormControls.jsx'
import { authApi } from '../services/api.js'
import { getStoredUser, saveSession } from '../utils/auth.js'
import { roleLabels } from '../utils/labels.js'

const cardsByRole = {
  disabled: [
    {
      icon: '🧭',
      title: 'ثبت درخواست همراهی',
      description: 'برای مراجعه پزشکی، خرید، پیاده‌روی یا امور اداری درخواست همراهی ثبت کنید.',
      to: '/requests',
      buttonLabel: 'ثبت درخواست',
    },
    {
      icon: '🚨',
      title: 'دکمه اضطراری',
      description: 'در شرایط حساس، موقعیت و آدرس خود را برای سرپرست و تیم پشتیبانی ثبت کنید.',
      to: '/emergency',
      buttonLabel: 'ارسال هشدار',
    },
  ],
  supervisor: [
    {
      icon: '👥',
      title: 'مدیریت توان‌خواهان',
      description: 'توان‌خواهان تحت سرپرستی خود را اضافه، مشاهده یا از لیست خارج کنید.',
      to: '/supervisor',
      buttonLabel: 'مدیریت افراد',
    },
    {
      icon: '🧭',
      title: 'درخواست برای توان‌خواه',
      description: 'برای والدین یا توان‌خواه تحت سرپرستی خود درخواست همراهی بسازید.',
      to: '/requests',
      buttonLabel: 'ثبت درخواست',
    },
    {
      icon: '🚨',
      title: 'هشدار اضطراری',
      description: 'برای توان‌خواه انتخاب‌شده هشدار اضطراری ثبت و پیگیری کنید.',
      to: '/emergency',
      buttonLabel: 'پیگیری هشدارها',
    },
  ],
  volunteer: [
    {
      icon: '📍',
      title: 'موقعیت و وضعیت آنلاین',
      description: 'برای دریافت درخواست‌های نزدیک، موقعیت فعلی را ثبت و وضعیت را آنلاین کنید.',
      to: '/volunteer',
      buttonLabel: 'پنل داوطلب',
    },
    {
      icon: '🗓️',
      title: 'زمان‌های آزاد',
      description: 'زمان‌های آزاد خود را ثبت کنید تا سامانه بتواند درخواست‌های مناسب را پیشنهاد دهد.',
      to: '/volunteer',
      buttonLabel: 'ثبت زمان آزاد',
    },
    {
      icon: '🤝',
      title: 'درخواست‌های قابل پذیرش',
      description: 'درخواست‌های نزدیک و هماهنگ با زمان آزاد خود را ببینید و بپذیرید.',
      to: '/requests',
      buttonLabel: 'مشاهده درخواست‌ها',
    },
  ],
  admin: [
    {
      icon: '🛡️',
      title: 'احراز صلاحیت داوطلبان',
      description: 'داوطلبان در انتظار بررسی را تأیید یا رد کنید و وضعیت اعتبارشان را ببینید.',
      to: '/admin',
      buttonLabel: 'مدیریت داوطلبان',
    },
    {
      icon: '👤',
      title: 'مدیریت کاربران',
      description: 'کاربران سامانه را بر اساس نقش، وضعیت و جست‌وجو مدیریت کنید.',
      to: '/admin',
      buttonLabel: 'مشاهده کاربران',
    },
  ],
}

function DashboardPage() {
  const [user, setUser] = useState(getStoredUser())
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    authApi
      .me()
      .then((result) => {
        if (!isMounted) {
          return
        }

        saveSession({ user: result.data.user })
        setUser(result.data.user)
      })
      .catch((error) => {
        if (isMounted) {
          setMessage(error.message)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const cards = cardsByRole[user?.role] || []

  return (
    <PageLayout
      eyebrow="پنل مهرگام"
      title={`سلام ${user?.firstName || 'کاربر عزیز'}`}
      description={`نقش فعلی شما در سامانه: ${roleLabels[user?.role] || 'نامشخص'}. از این بخش می‌توانید جریان اصلی نقش خود را شروع کنید.`}
    >
      <div className="space-y-7">
        <StatusMessage message={message} type="error" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>

        <Panel title="اطلاعات حساب">
          <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <dt className="text-[12px] font-bold text-[#7b8796]">نام</dt>
              <dd className="mt-2 text-[15px] font-bold text-[#172033]">{user?.firstName || '—'} {user?.lastName || ''}</dd>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <dt className="text-[12px] font-bold text-[#7b8796]">کد ملی</dt>
              <dd className="mt-2 text-[15px] font-bold text-[#172033]" dir="ltr">{user?.nationalCode || '—'}</dd>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <dt className="text-[12px] font-bold text-[#7b8796]">شماره موبایل</dt>
              <dd className="mt-2 text-[15px] font-bold text-[#172033]" dir="ltr">{user?.phone || '—'}</dd>
            </div>
            <div className="rounded-[18px] bg-[#fbfdff] p-4">
              <dt className="text-[12px] font-bold text-[#7b8796]">وضعیت داوطلب</dt>
              <dd className="mt-2 text-[15px] font-bold text-[#172033]">{user?.verificationStatus || '—'}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default DashboardPage
