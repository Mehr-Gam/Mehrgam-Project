import { Link } from 'react-router-dom'
import authHero from '../assets/auth-hero.png'
import SiteFooter from '../components/SiteFooter.jsx'
import { getStoredUser } from '../utils/auth.js'

const navItems = [
  { label: 'خانه', href: '#home' },
  { label: 'خدمات', href: '#services' },
  { label: 'فرایند', href: '#process' },
  { label: 'امنیت', href: '#trust' },
  { label: 'داستان‌ها', href: '#stories' },
]

const stats = [
  { value: '+۲۴/۷', label: 'پشتیبانی برای شرایط حساس' },
  { value: '۳ نقش', label: 'توان‌خواه، سرپرست و داوطلب' },
  { value: 'مکان‌محور', label: 'پیشنهاد داوطلب نزدیک' },
]

const services = [
  {
    icon: '🩺',
    title: 'همراهی پزشکی',
    description: 'هماهنگی داوطلب برای مراجعه به پزشک، درمانگاه، داروخانه یا انجام آزمایش‌های دوره‌ای.',
  },
  {
    icon: '🛒',
    title: 'خرید و امور روزمره',
    description: 'کمک برای خرید، کارهای اداری، پرداخت‌ها و رفت‌وآمدهای کوتاه شهری با زمان‌بندی مشخص.',
  },
  {
    icon: '🌳',
    title: 'پیاده‌روی و همراهی اجتماعی',
    description: 'کاهش تنهایی و افزایش حضور اجتماعی سالمندان و توانیابان با همراهی داوطلبان محلی.',
  },
  {
    icon: '🚨',
    title: 'هشدار اضطراری',
    description: 'ثبت موقعیت در شرایط حساس و پیگیری سریع توسط سرپرست یا تیم پشتیبانی سامانه.',
  },
]

const processSteps = [
  { number: '۰۱', title: 'ثبت نیاز', text: 'توان‌خواه یا سرپرست نوع خدمت، زمان و موقعیت را وارد می‌کند.' },
  { number: '۰۲', title: 'تطابق هوشمند', text: 'سامانه داوطلب نزدیک و دارای زمان آزاد را پیشنهاد می‌دهد.' },
  { number: '۰۳', title: 'پذیرش داوطلب', text: 'داوطلب تاییدشده درخواست را می‌پذیرد و وضعیت قابل پیگیری می‌شود.' },
  { number: '۰۴', title: 'ثبت پایان خدمت', text: 'پس از انجام همراهی، وضعیت درخواست تکمیل و سوابق نگهداری می‌شود.' },
]

const trustItems = [
  'احراز هویت و بررسی صلاحیت داوطلبان',
  'امکان ثبت و پیگیری هشدار اضطراری',
  'نمایش وضعیت درخواست برای خانواده',
  'ذخیره امن اطلاعات هویتی و موقعیتی',
]

const stories = [
  {
    name: 'مریم احمدی',
    role: 'سرپرست سالمند',
    text: 'برای مادرم درخواست همراهی پزشکی ثبت کردم. چیزی که برایم مهم بود، سادگی فرم و حس اعتماد به داوطلب بود.',
  },
  {
    name: 'رضا کریمی',
    role: 'داوطلب مهرگام',
    text: 'سامانه کمک می‌کند زمان آزادمان را هدفمندتر استفاده کنیم و بدانیم هر درخواست دقیقاً کجاست و چه نیازی دارد.',
  },
  {
    name: 'نرگس محمدی',
    role: 'توان‌خواه',
    text: 'برای کارهای بیرون از خانه احساس تنهایی کمتر شده و خانواده‌ام هم راحت‌تر وضعیت درخواست را دنبال می‌کنند.',
  },
]


function Header() {
  const user = getStoredUser()
  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.nationalCode || 'حساب کاربری' : ''

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/78 shadow-[0_16px_40px_rgba(16,24,39,0.06)] backdrop-blur-2xl">
      <div className="hidden border-b border-[#edf4f8] bg-[#f8fcfd]/80 text-[12px] font-bold text-[#6c7a8c] lg:block">
        <div className="mx-auto flex h-10 w-full max-w-[1180px] items-center justify-between px-10">
          <span>سامانه همیاری سالمندان و توانیابان</span>
          <span>پشتیبانی: <span className="text-[#55b7ad]" dir="ltr">۰۲۱ ۳۸۴ ۹۴۵۲</span></span>
        </div>
      </div>
      <nav className="mx-auto flex h-20 w-full max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#home" className="group inline-flex items-center gap-3 text-[22px] font-bold tracking-[-0.04em] text-[#172033]">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef9f7] text-[#55b7ad] shadow-inner transition group-hover:rotate-6 group-hover:scale-105">م</span>
          مهرگام
        </a>

        <div className="hidden items-center gap-8 text-[13px] font-bold text-[#536174] md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="relative py-2 transition hover:text-[#55b7ad] after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-0 after:rounded-full after:bg-[#8dc9c0] after:transition-all hover:after:w-full">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#dff3f0] bg-[#eef9f7] px-5 py-2.5 text-[13px] font-bold text-[#159272] shadow-[0_12px_28px_rgba(85,183,173,0.15)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_40px_rgba(85,183,173,0.22)]"
              title="رفتن به داشبورد"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[12px]">👤</span>
              {userName}
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#55b7ad] transition hover:-translate-y-0.5 hover:bg-[#eef9f7]">
                ورود
              </Link>
              <Link to="/signup" className="shine-button rounded-full bg-[#4db6f4] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_30px_rgba(77,182,244,0.25)] transition hover:-translate-y-0.5 hover:bg-[#36a7e7]">
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  const user = getStoredUser()

  return (
    <section id="home" className="relative overflow-hidden bg-[linear-gradient(135deg,#f7fcfd_0%,#ffffff_45%,#eef9f7_100%)]">
      <div className="orb absolute -right-32 top-8 h-80 w-80 bg-[#8dc9c0]/28" />
      <div className="orb absolute -left-32 bottom-0 h-96 w-96 bg-[#4db6f4]/14" />

      <div className="relative mx-auto grid min-h-[690px] w-full max-w-[1180px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
        <div className="relative order-2 mx-auto w-full max-w-[660px] lg:order-1">
          <div className="float-soft relative overflow-visible">
            <img
              src={authHero}
              alt="همراهی داوطلب مهرگام با سالمند"
              className="h-[460px] w-full rounded-[32px] object-cover object-[36%_center] drop-shadow-[0_28px_48px_rgba(16,24,39,0.16)] sm:h-[560px] lg:h-[650px]"
            />
          </div>
        </div>

        <div className="order-1 text-center lg:order-2 lg:text-right">
          <span className="section-tag mx-auto lg:mx-0">شبکه همیاری امن و مکان‌محور</span>
          <h1 className="mt-6 text-[42px] font-bold leading-[1.18] tracking-[-0.06em] text-[#172033] sm:text-[58px] lg:text-[64px]">
            همراهی مطمئن، نزدیک و انسانی برای هر روز
          </h1>
          <p className="mx-auto mt-6 max-w-[570px] text-[15px] leading-9 text-[#667386] lg:mx-0">
            مهرگام سالمندان و توانیابان را به داوطلبان تاییدشده محلی وصل می‌کند تا مراجعه پزشکی، خرید، پیاده‌روی و کارهای روزمره با آرامش و پیگیری خانواده انجام شود.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link to={user ? '/requests' : '/signup'} className="shine-button inline-flex h-[52px] items-center justify-center rounded-full bg-[#8dc9c0] px-8 text-[14px] font-bold text-white shadow-[0_18px_38px_rgba(141,201,192,0.35)] transition hover:-translate-y-1 hover:bg-[#78bdb3]">
              {user ? 'ثبت درخواست جدید' : 'شروع کنید'}
            </Link>
            <Link to={user ? '/dashboard' : '/login'} className="inline-flex h-[52px] items-center justify-center rounded-full border border-[#dfe8ef] bg-white/88 px-8 text-[14px] font-bold text-[#172033] shadow-[0_14px_32px_rgba(16,24,39,0.07)] transition hover:-translate-y-1 hover:border-[#9fd7cf] hover:text-[#55b7ad]">
              {user ? 'ورود به داشبورد' : 'ورود کاربران'}
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(16,24,39,0.06)] backdrop-blur-md">
                <p className="text-[22px] font-bold text-[#172033]">{stat.value}</p>
                <p className="mt-2 text-[12px] font-bold leading-6 text-[#7b8796]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="section-tag">خدمات مهرگام</span>
            <h2 className="mt-5 max-w-[560px] text-[38px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033]">خدماتی که برای زندگی روزمره طراحی شده‌اند</h2>
          </div>
          <p className="max-w-[420px] text-[14px] leading-8 text-[#7b8796]">
            طراحی هر خدمت بر اساس نیازهای اصلی سالمندان، توانیابان و خانواده‌هاست؛ ساده، قابل پیگیری و مناسب استفاده روزمره.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <article key={service.title} className="premium-card group min-h-[280px] p-7" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-[#eef9f7] text-[30px] transition group-hover:scale-105 group-hover:bg-[#dff3f0]">
                {service.icon}
              </div>
              <h3 className="mt-7 text-[19px] font-bold text-[#172033]">{service.title}</h3>
              <p className="mt-4 text-[13px] leading-8 text-[#7b8796]">{service.description}</p>
              <Link to="/requests" className="mt-7 inline-flex text-[13px] font-bold text-[#55b7ad] transition group-hover:translate-x-[-4px]">
                مشاهده جریان خدمت ←
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section id="process" className="relative overflow-hidden bg-[#f7fbfd] py-24">
      <div className="soft-grid absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div>
          <span className="section-tag">فرایند کار سامانه</span>
          <h2 className="mt-5 text-[38px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033]">از ثبت نیاز تا همراهی، همه چیز قابل پیگیری است</h2>
          <p className="mt-5 text-[14px] leading-8 text-[#7b8796]">
            صفحه‌های داخلی پروژه برای نقش‌های مختلف طراحی شده‌اند: توان‌خواه درخواست می‌سازد، داوطلب درخواست‌های نزدیک را می‌بیند و سرپرست می‌تواند وضعیت را پیگیری کند.
          </p>
          <Link to="/dashboard" className="shine-button mt-8 inline-flex rounded-full bg-[#172033] px-7 py-3 text-[13px] font-bold text-white transition hover:-translate-y-1">
            رفتن به داشبورد
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {processSteps.map((step) => (
            <article key={step.number} className="premium-card p-6">
              <span className="text-[13px] font-bold text-[#4db6f4]">{step.number}</span>
              <h3 className="mt-4 text-[19px] font-bold text-[#172033]">{step.title}</h3>
              <p className="mt-3 text-[13px] leading-8 text-[#7b8796]">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section id="trust" className="bg-white py-24">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="relative">
          <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-[42px] bg-[#8dc9c0]/24 blur-[2px]" />
          <div className="absolute -right-6 top-10 h-24 w-24 rounded-full bg-[#4db6f4]/12" />
          <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#f7fcfd,#eef9f7_55%,#ffffff)] p-8 shadow-[0_28px_70px_rgba(16,24,39,0.1)]">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#8dc9c0]/24" />
            <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#4db6f4]/14" />
            <div className="relative mx-auto grid h-[460px] max-w-[500px] place-items-center">
              <div className="absolute inset-6 rounded-full border border-[#d7efeb]" />
              <div className="absolute inset-16 rounded-full border border-dashed border-[#c5e7e1]" />
              <div className="relative grid h-40 w-40 place-items-center rounded-[46px] bg-white text-[70px] shadow-[0_24px_60px_rgba(85,183,173,0.22)]">
                🛡️
              </div>
              <div className="absolute right-6 top-16 rounded-[22px] bg-white/86 px-5 py-4 text-right shadow-[0_18px_44px_rgba(16,24,39,0.08)] backdrop-blur-xl">
                <p className="text-[12px] font-medium text-[#7b8796]">احراز هویت</p>
                <p className="mt-1 text-[16px] font-bold text-[#172033]">بررسی داوطلبان</p>
              </div>
              <div className="absolute bottom-14 left-8 rounded-[22px] bg-white/86 px-5 py-4 text-right shadow-[0_18px_44px_rgba(16,24,39,0.08)] backdrop-blur-xl">
                <p className="text-[12px] font-medium text-[#7b8796]">پشتیبانی</p>
                <p className="mt-1 text-[16px] font-bold text-[#172033]">پیگیری خانواده</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className="section-tag">امنیت و اعتماد</span>
          <h2 className="mt-5 text-[38px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033]">اعتماد خانواده، بخش اصلی تجربه مهرگام است</h2>
          <p className="mt-5 text-[14px] leading-8 text-[#7b8796]">
            در مهرگام، تجربه کاربر فقط ظاهر ساده نیست؛ هر درخواست باید قابل پیگیری، قابل اعتماد و متناسب با محدودیت‌های کاربر باشد.
          </p>

          <div className="mt-8 space-y-4">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[20px] border border-[#edf3f8] bg-[#fbfdff] p-4 shadow-[0_12px_28px_rgba(16,24,39,0.04)]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef9f7] text-[#55b7ad]">✓</span>
                <p className="text-[14px] font-bold text-[#536174]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RoleSection() {
  const roles = [
    { title: 'توان‌خواه', text: 'ثبت درخواست همراهی، مشاهده وضعیت و ارسال هشدار اضطراری.', to: '/requests', icon: '🧭' },
    { title: 'سرپرست', text: 'مدیریت افراد تحت سرپرستی و ثبت درخواست برای اعضای خانواده.', to: '/supervisor', icon: '👥' },
    { title: 'داوطلب', text: 'ثبت موقعیت، زمان آزاد و پذیرش درخواست‌های نزدیک.', to: '/volunteer', icon: '🤝' },
  ]

  return (
    <section className="bg-[#f7fbfd] py-24">
      <div className="mx-auto w-full max-w-[1180px] px-5 text-center sm:px-8 lg:px-10">
        <span className="section-tag mx-auto">نقش‌های سامانه</span>
        <h2 className="mx-auto mt-5 max-w-[620px] text-[38px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033]">برای هر نقش، یک مسیر جدا و روشن طراحی شده است</h2>
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {roles.map((role) => (
            <article key={role.title} className="premium-card p-8 text-right">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[#eef9f7] text-[30px]">{role.icon}</div>
              <h3 className="mt-7 text-[22px] font-bold text-[#172033]">{role.title}</h3>
              <p className="mt-4 min-h-[84px] text-[13px] leading-8 text-[#7b8796]">{role.text}</p>
              <Link to={role.to} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-[13px] font-bold text-[#55b7ad] shadow-[0_12px_28px_rgba(16,24,39,0.06)] transition hover:-translate-y-1 hover:bg-[#8dc9c0] hover:text-white">
                ورود به بخش
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StoriesSection() {
  return (
    <section id="stories" className="bg-white py-24">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-[620px]">
          <span className="section-tag">داستان کاربران</span>
          <h2 className="mt-5 text-[38px] font-bold leading-[1.25] tracking-[-0.06em] text-[#172033]">مهرگام برای آرامش خانواده‌ها ساخته شده است</h2>
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {stories.map((story) => (
            <article key={story.name} className="premium-card p-7">
              <div className="text-[14px] tracking-[0.12em] text-[#ffbf3f]">★★★★★</div>
              <p className="mt-5 min-h-[120px] text-[14px] leading-8 text-[#536174]">{story.text}</p>
              <div className="mt-7 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef9f7] text-[20px]">👤</div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#172033]">{story.name}</h3>
                  <p className="mt-1 text-[12px] font-bold text-[#7b8796]">{story.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


function FinalCtaSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[36px] bg-[#101827] p-8 text-center text-white shadow-[0_30px_80px_rgba(16,24,39,0.18)] md:p-14">
          <div className="orb absolute -right-24 top-0 h-72 w-72 bg-[#8dc9c0]/25" />
          <div className="orb absolute -left-24 bottom-0 h-72 w-72 bg-[#4db6f4]/18" />
          <div className="relative mx-auto max-w-[720px]">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold text-white/76">آماده شروع هستید؟</span>
            <h2 className="mt-6 text-[34px] font-bold leading-[1.35] tracking-[-0.05em] md:text-[44px]">با مهرگام یک شبکه همیاری مطمئن بسازید</h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-8 text-white/68">
              چه به همراهی نیاز دارید، چه می‌خواهید داوطلب شوید، مسیر شروع در چند قدم ساده آماده است.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/signup" className="shine-button rounded-full bg-[#8dc9c0] px-8 py-3.5 text-[13px] font-bold text-white transition hover:-translate-y-1 hover:bg-[#78bdb3]">
                ثبت‌نام در مهرگام
              </Link>
              <Link to="/login" className="rounded-full border border-white/14 bg-white/8 px-8 py-3.5 text-[13px] font-bold text-white transition hover:-translate-y-1 hover:bg-white/14">
                ورود به حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#172033]" dir="rtl">
      <Header />
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <TrustSection />
      <RoleSection />
      <StoriesSection />
      <FinalCtaSection />
      <SiteFooter />
    </main>
  )
}

export default HomePage
