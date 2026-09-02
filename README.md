# ดูดวงม่วง — DooDuang

เว็บดูดวงออนไลน์ธีมม่วง ดวงรายวันฟรี + ดวงพิเศษแบบเสียเงิน

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind CSS 4
- **Hosting:** Vercel
- **Database:** PostgreSQL (Railway)
- **Auth:** Auth.js — Google + Email Magic Link (Resend)
- **Payment:** Stripe

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า environment

```bash
cp .env.example .env.local
```

กรอกค่าใน `.env.local`:

| ตัวแปร | ที่มา |
|--------|-------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_*` | [Google Cloud Console](https://console.cloud.google.com) |
| `RESEND_API_KEY` | [Resend](https://resend.com) |
| `DATABASE_URL` | [Railway PostgreSQL](https://railway.app) |
| `STRIPE_*` | [Stripe Dashboard](https://dashboard.stripe.com) |

### 3. Setup Database

```bash
npm run db:push
```

### 4. รัน dev server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Deploy

### Vercel

1. Push โค้ดขึ้น GitHub
2. Import project ใน [Vercel](https://vercel.com)
3. ใส่ Environment Variables ทั้งหมดจาก `.env.example`
4. Deploy

### Railway (Database)

1. สร้าง PostgreSQL service ใน [Railway](https://railway.app)
2. Copy `DATABASE_URL` ไปใส่ใน Vercel env

### Stripe Webhook

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events: `checkout.session.completed`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

## โครงสร้าง

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── daily/                # เลือกราศี ดวงรายวันฟรี
│   ├── reading/              # ดูดวงพิเศษ
│   ├── pricing/              # ซื้อเครดิต
│   ├── dashboard/            # แดชบอร์ด user
│   ├── login/                # เข้าสู่ระบบ
│   └── api/
│       ├── auth/             # Auth.js
│       ├── fortune/          # สร้างผลดูดวง
│       └── stripe/           # Checkout + Webhook
├── components/
├── lib/
│   ├── auth.ts
│   ├── db/
│   ├── fortune/              # Engine ดูดวง
│   └── stripe.ts
```

## ฟีเจอร์

- ดวงรายวัน 12 ราศี — **ฟรี**
- ดวงความรัก / การงาน / ไพ่ทาโรต์ — **1 เครดิต**
- Login ด้วย Google หรือ Email Magic Link
- ซื้อเครดิตผ่าน Stripe (3 แพ็ก: 49 / 129 / 299 บาท)
- เก็บประวัติดูดวงใน Dashboard
