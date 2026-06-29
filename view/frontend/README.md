# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## صفحات اضافه‌شده در نسخه فارسی

این نسخه علاوه بر Home و صفحات ورود/ثبت‌نام، صفحه‌های زیر را دارد:

- `/dashboard` داشبورد نقش‌محور
- `/requests` ثبت، مشاهده، پذیرش، اتمام و لغو درخواست‌های همراهی
- `/emergency` ثبت و پیگیری هشدار اضطراری
- `/volunteer` پنل داوطلب شامل وضعیت آنلاین، موقعیت و زمان‌های آزاد
- `/supervisor` پنل سرپرست برای مدیریت توان‌خواهان
- `/admin` پنل مدیر برای مدیریت کاربران و تأیید داوطلبان

برای اتصال به بک‌اند، مقدار پیش‌فرض API این است:

```txt
http://localhost:5000/api/v1
```

در صورت نیاز می‌توانید فایل `.env` در مسیر `view/frontend` بسازید:

```txt
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

اجرای فرانت‌اند:

```bash
npm install
npm run dev
```

## اتصال به بک‌اند و نقشه نشان

یک فایل `.env` در مسیر `view/frontend` بسازید:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_NESHAN_WEB_API_KEY=web.your_neshan_web_api_key
VITE_NESHAN_MAP_TYPE=dreamy
```

`VITE_NESHAN_WEB_API_KEY` فقط برای نمایش نقشه وب نشان در مرورگر است. برای جستجو، تبدیل مختصات به آدرس و فاصله، فرانت‌اند به بک‌اند درخواست می‌زند و بک‌اند از `NESHAN_SERVICE_API_KEY` استفاده می‌کند.
