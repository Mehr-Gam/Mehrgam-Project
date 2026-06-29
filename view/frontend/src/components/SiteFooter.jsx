import { Link } from 'react-router-dom'

const pageLinks = [
  { label: 'خانه', to: '/' },
  { label: 'خدمات', to: '/#services' },
  { label: 'فرایند کار', to: '/#process' },
  { label: 'اعتماد و امنیت', to: '/#trust' },
]

const appLinks = [
  { label: 'داشبورد', to: '/dashboard' },
  { label: 'درخواست‌ها', to: '/requests' },
  { label: 'هشدار اضطراری', to: '/emergency' },
  { label: 'پنل داوطلب', to: '/volunteer' },
]

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      <div className="mt-5 space-y-3 text-[13px] leading-7 text-white/68">{children}</div>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#101827] text-white" dir="rtl">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#8dc9c0]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#4db6f4]/16 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-[22px] font-bold tracking-[-0.04em] text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#55b7ad] shadow-[0_14px_30px_rgba(255,255,255,0.14)]">م</span>
              مهرگام
            </Link>
            <p className="mt-5 max-w-[360px] text-[13px] leading-8 text-white/68">
              مهرگام شبکه‌ای امن برای اتصال سالمندان و توانیابان به داوطلبان تاییدشده محلی است؛ با تمرکز بر اعتماد، موقعیت مکانی و پشتیبانی خانواده.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/signup" className="shine-button rounded-full bg-[#8dc9c0] px-6 py-3 text-[13px] font-bold text-white shadow-[0_18px_36px_rgba(141,201,192,0.22)] transition hover:-translate-y-0.5 hover:bg-[#78bdb3]">
                شروع ثبت‌نام
              </Link>
              <Link to="/login" className="rounded-full border border-white/15 bg-white/8 px-6 py-3 text-[13px] font-bold text-white/90 transition hover:-translate-y-0.5 hover:bg-white/14">
                ورود کاربران
              </Link>
            </div>
          </div>

          <FooterColumn title="صفحات سایت">
            {pageLinks.map((item) => (
              <Link key={item.label} to={item.to} className="block transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="بخش‌های سامانه">
            {appLinks.map((item) => (
              <Link key={item.label} to={item.to} className="block transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="تماس و پشتیبانی">
            <p>پشتیبانی مهرگام: ۰۲۱ ۳۸۴ ۹۴۵۲</p>
            <p>ایمیل: support@mehrgam.local</p>
            <p>ساعات پاسخ‌گویی: شنبه تا پنجشنبه، ۹ تا ۱۸</p>
            <div className="flex gap-2 pt-2">
              {['تلگرام', 'لینکدین', 'اینستاگرام'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-bold text-white/78">
                  {item}
                </span>
              ))}
            </div>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-[12px] text-white/50 md:flex-row md:items-center">
          <p>© ۲۰۲۶ مهرگام. تمامی حقوق محفوظ است.</p>
          <p>طراحی شده برای MVP سامانه همیاری سالمندان و توانیابان</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
