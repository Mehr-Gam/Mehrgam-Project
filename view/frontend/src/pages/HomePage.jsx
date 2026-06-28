import { Link } from 'react-router-dom'
import authHero from '../assets/auth-hero.png'

const navItems = [
  { label: 'خانه', href: '#home' },
  { label: 'خدمات', href: '#services' },
  { label: 'ثبت درخواست', href: '#request' },
  { label: 'نظرات', href: '#reviews' },
]

const services = [
  {
    icon: '🩺',
    title: 'همراهی پزشکی',
    description: 'ثبت درخواست همراه برای مراجعه به پزشک، درمانگاه یا داروخانه با زمان‌بندی مشخص.',
  },
  {
    icon: '🛒',
    title: 'خرید و امور روزمره',
    description: 'کمک داوطلبان محلی برای خرید، انجام کارهای اداری و رفت‌وآمدهای کوتاه.',
  },
  {
    icon: '🚨',
    title: 'پشتیبانی اضطراری',
    description: 'دسترسی سریع به سرپرست، داوطلب نزدیک و سرویس‌های ضروری در شرایط حساس.',
  },
]

const reviews = [
  {
    name: 'مریم احمدی',
    role: 'سرپرست سالمند',
    text: 'ثبت درخواست خیلی ساده بود و داوطلب نزدیک ما در زمان مناسب هماهنگ شد.',
  },
  {
    name: 'رضا کریمی',
    role: 'داوطلب مهرگام',
    text: 'مهرگام کمک می‌کند زمان آزادمان را برای یک کار مفید و قابل اعتماد استفاده کنیم.',
  },
  {
    name: 'نرگس محمدی',
    role: 'توان‌خواه',
    text: 'حس امنیت و همراهی برای کارهای بیرون از خانه برای من خیلی ارزشمند است.',
  },
]

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eaf1f7]/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 w-full max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#home" className="text-[20px] font-extrabold tracking-tight text-[#172033]">
          مهرگام
        </a>

        <div className="hidden items-center gap-9 text-[13px] font-medium text-[#536174] md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-[#55b7ad]">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-[#55b7ad] transition hover:bg-[#eef9f7]"
          >
            ورود
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[#4db6f4] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(77,182,244,0.25)] transition hover:bg-[#36a7e7]"
          >
            ثبت‌نام
          </Link>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-52 w-52 rounded-bl-[90px] bg-[#9fd7cf] opacity-90" />
      <div className="mx-auto grid min-h-[620px] w-full max-w-[1180px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">
        <div className="relative order-2 mx-auto w-full max-w-[430px] lg:order-2">
          <div className="absolute -bottom-5 -right-5 h-36 w-36 rounded-br-[64px] bg-[#9fd7cf]" />
          <div className="relative overflow-hidden rounded-tl-[34px] rounded-tr-[34px] rounded-br-[96px] rounded-bl-[34px] bg-[#9fd7cf] p-4 shadow-[0_18px_45px_rgba(23,32,51,0.12)]">
            <img
              src={authHero}
              alt="همراهی داوطلب مهرگام با سالمند"
              className="h-[420px] w-full rounded-tl-[28px] rounded-tr-[28px] rounded-br-[84px] rounded-bl-[28px] object-cover object-[38%_center]"
            />
          </div>
        </div>

        <div className="order-1 text-center lg:order-1 lg:text-right">
          <span className="text-[13px] font-bold text-[#4db6f4]">به مهرگام خوش آمدید</span>
          <h1 className="mt-4 text-[42px] font-extrabold leading-[1.25] tracking-[-0.04em] text-[#172033] sm:text-[56px]">
            همراه مطمئن برای سالمندان و توانیابان
          </h1>
          <p className="mx-auto mt-5 max-w-[540px] text-[15px] leading-8 text-[#7b8796] lg:mx-0">
            مهرگام بستری امن و مکان‌محور برای اتصال افراد نیازمند همراهی به داوطلبان تاییدصلاحیت‌شده است؛ از مراجعه پزشکی
            تا خرید روزانه و پیاده‌روی.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <a
              href="#request"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#8dc9c0] px-8 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(141,201,192,0.35)] transition hover:bg-[#78bdb3]"
            >
              ثبت درخواست همراهی
            </a>
            <Link
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#dfe8ef] bg-white px-8 text-[14px] font-bold text-[#172033] transition hover:border-[#9fd7cf] hover:text-[#55b7ad]"
            >
              داوطلب می‌شوم
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="bg-white py-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 text-center sm:px-8 lg:px-10">
        <span className="text-[13px] font-bold text-[#4db6f4]">خدمات مهرگام</span>
        <h2 className="mt-3 text-[34px] font-extrabold tracking-[-0.04em] text-[#172033]">چه کمکی نیاز دارید؟</h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-7 text-[#7b8796]">
          خدمات اصلی پروژه بر اساس نیازهای روزمره سالمندان، توانیابان و سرپرستان طراحی شده است.
        </p>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group rounded-[18px] border border-[#eff4f8] bg-white p-8 text-center shadow-[0_14px_34px_rgba(23,32,51,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(23,32,51,0.1)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#eef9f7] text-[28px] transition group-hover:bg-[#dff3f0]">
                {service.icon}
              </div>
              <h3 className="mt-6 text-[18px] font-extrabold text-[#172033]">{service.title}</h3>
              <p className="mt-4 text-[13px] leading-7 text-[#7b8796]">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function RequestSection() {
  return (
    <section id="request" className="bg-[#fbfdff] py-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="text-[13px] font-bold text-[#4db6f4]">ثبت سریع</span>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-[-0.04em] text-[#172033]">
              درخواست همراهی ثبت کنید یا تماس بگیرید: <span className="text-[#8dc9c0]" dir="ltr">۰۲۱ ۳۸۴ ۹۴۵۲</span>
            </h2>
          </div>
          <p className="max-w-[410px] text-[14px] leading-7 text-[#7b8796]">
            فرم زیر نمونه‌ای از جریان ثبت درخواست در صفحه خانه است و می‌تواند بعداً به API پروژه متصل شود.
          </p>
        </div>

        <form className="rounded-[22px] border border-[#edf3f8] bg-white p-5 shadow-[0_18px_45px_rgba(23,32,51,0.06)] md:p-7">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="block text-[13px] font-semibold text-[#536174]">
              نوع خدمت
              <select className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] text-[#7b8796] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20">
                <option>همراهی پزشکی</option>
                <option>خرید روزانه</option>
                <option>پیاده‌روی و تفریح</option>
              </select>
            </label>
            <label className="block text-[13px] font-semibold text-[#536174]">
              نام درخواست‌کننده
              <input className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20" />
            </label>
            <label className="block text-[13px] font-semibold text-[#536174]">
              شماره تماس
              <input
                dir="ltr"
                className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
              />
            </label>
            <label className="block text-[13px] font-semibold text-[#536174]">
              مبدأ
              <input className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20" />
            </label>
            <label className="block text-[13px] font-semibold text-[#536174]">
              مقصد
              <input className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20" />
            </label>
            <label className="block text-[13px] font-semibold text-[#536174]">
              زمان موردنظر
              <input
                type="time"
                className="mt-2 h-12 w-full rounded-[10px] border border-[#dfe8ef] bg-white px-4 text-[13px] outline-none focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
              />
            </label>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#8dc9c0] px-9 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(141,201,192,0.35)] transition hover:bg-[#78bdb3]"
          >
            ثبت درخواست
          </button>
        </form>
      </div>
    </section>
  )
}

function ReviewsSection() {
  return (
    <section id="reviews" className="bg-white py-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-[520px]">
          <span className="text-[13px] font-bold text-[#4db6f4]">اعتماد کاربران</span>
          <h2 className="mt-3 text-[32px] font-extrabold tracking-[-0.04em] text-[#172033]">
            امنیت و آرامش هر خانواده برای ما مهم است
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-[#7b8796]">
            تجربه کاربران نشان می‌دهد طراحی ساده، داوطلبان معتبر و پشتیبانی سریع، مهرگام را به همراهی قابل اعتماد تبدیل
            می‌کند.
          </p>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-[20px] border border-[#eff4f8] bg-white p-7 shadow-[0_14px_34px_rgba(23,32,51,0.05)]">
              <div className="text-[14px] tracking-[0.12em] text-[#ffbf3f]">★★★★★</div>
              <p className="mt-5 min-h-[88px] text-[14px] leading-8 text-[#536174]">{review.text}</p>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef9f7] text-[18px]">👤</div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-[#172033]">{review.name}</h3>
                  <p className="mt-1 text-[12px] text-[#7b8796]">{review.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function JoinSection() {
  return (
    <section className="bg-[#fbfdff] py-20">
      <div className="mx-auto w-full max-w-[780px] px-5 text-center sm:px-8">
        <span className="text-[13px] font-bold text-[#4db6f4]">همراه مهرگام شوید</span>
        <h2 className="mt-3 text-[34px] font-extrabold tracking-[-0.04em] text-[#172033]">به شبکه همیاری بپیوندید</h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-7 text-[#7b8796]">
          با ثبت‌نام، می‌توانید به عنوان داوطلب کمک کنید یا برای سالمند و توان‌خواه خانواده خود درخواست همراهی بسازید.
        </p>

        <div className="mx-auto mt-8 flex max-w-[520px] flex-col gap-3 rounded-full bg-white p-2 shadow-[0_14px_36px_rgba(23,32,51,0.08)] sm:flex-row">
          <input
            type="email"
            dir="ltr"
            placeholder="example@email.com"
            className="h-12 flex-1 rounded-full px-5 text-[13px] outline-none placeholder:text-[#a9b6c6]"
          />
          <Link
            to="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#4db6f4] px-8 text-[13px] font-bold text-white transition hover:bg-[#36a7e7]"
          >
            شروع ثبت‌نام
          </Link>
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
      <RequestSection />
      <ReviewsSection />
      <JoinSection />
    </main>
  )
}

export default HomePage
