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

โปรเจกต์นี้ใช้ **Railway PostgreSQL** เป็นหลัก — เวลาเพิ่ม/แก้ตาราง ให้รัน SQL ใน Railway console (ไม่ใช้ `npm` ใน psql)

1. Railway → Postgres service → **Query** หรือ **psql**
2. วาง SQL จากด้านล่าง (หรือที่ AI ส่งให้ตอนมี schema ใหม่) แล้ว Run

#### Product analytics (`analytics_events`)

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  feature text,
  path text,
  props text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_name_created_idx
  ON analytics_events (name, created_at);

CREATE INDEX IF NOT EXISTS analytics_events_feature_created_idx
  ON analytics_events (feature, created_at);

CREATE INDEX IF NOT EXISTS analytics_events_user_created_idx
  ON analytics_events (user_id, created_at);
```

**กฎสำหรับทีม / AI:** ทุกครั้งที่มีงานเกี่ยวกับ DB ต้องส่ง **ข้อความ SQL คัดลอกวางได้** สำหรับ Railway console — ห้ามบอกแค่ `npm run db:push` โดยไม่มี SQL

ทางเลือก (เครื่อง local ที่มี `DATABASE_URL`):

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
3. Schema ใหม่: วาง SQL ใน Railway **Query / psql** (ดู README หัวข้อ Setup Database) — อย่ารัน `npm` ใน console

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
