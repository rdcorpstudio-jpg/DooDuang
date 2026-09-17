# Analytics tracking checklist (UI / UX changes)

เมื่อแก้หน้าจอ เปลี่ยน route เพิ่มเมนู หรือย้ายปุ่มชำระเงิน **ต้องคิดเรื่อง product analytics ร่วมด้วย** ไม่เช่นนั้น funnel / pie ใน `/admin/analytics` จะตกหล่นเหมือนเคส home v2 (คนเข้าชมมี แต่ `feature_open` ดวงรายวันไม่ขึ้น)

## Events ที่ใช้อยู่

| Event | ความหมาย | ยิงจาก |
|--------|----------|--------|
| `page_view` | คนเข้าชมเว็บ (unique `visitorId` / session) | `SiteVisitTracker` |
| `screen_view` | เปิดแต่ละ path (ดูว่าคนอยู่หน้าไหน) | `FeatureOpenTracker` |
| `feature_open` | เปิดฟีเจอร์/หน้าผลิตภัณฑ์ | route map + กดเมนู (paywall/onboard) |
| `pay_view` | เปิด `/premium/pay` | `PremiumPayPage` |
| `checkout_started` | สร้าง Stripe Checkout | `createPremiumCheckoutUrl` |
| `payment_succeeded` | ชำระสำเร็จ | webhook / confirm |
| `signup` / `login` | สมัคร / เข้าสู่ระบบ | auth routes |

ไฟล์หลัก:

- `src/lib/analytics/events.ts` — รายชื่อ event / feature / `featureFromPath`
- `src/lib/analytics/client.ts` — `trackClientEvent` / `trackFeatureOpen`
- `src/components/analytics/feature-open-tracker.tsx`
- `src/components/analytics/site-visit-tracker.tsx`
- `src/app/api/admin/analytics/route.ts` — รวมเลขสำหรับแดชบอร์ด

## Checklist เวลาแก้ UI/UX

1. **มี route ใหม่ไหม?**  
   - เพิ่มใน `featureFromPath()` ถ้าเป็นหน้าผลิตภัณฑ์  
   - ถ้าเป็นแค่หน้าช่วย (login, terms) อย่างน้อยต้องมี `screen_view` (ยิงอัตโนมัติแล้ว)

2. **มีปุ่ม/การ์ดเมนูใหม่ไหม?**  
   - ใช้ `id` ที่อยู่ใน `ANALYTICS_FEATURES`  
   - ถ้ากดแล้วไป paywall / onboard โดยยังไม่เปลี่ยน path → เรียก `trackFeatureOpen(id, { source: "…" })`  
   - ถ้า navigate ไปหน้าฟีเจอร์แล้ว → route tracker จะนับให้ (อย่า double-count)

3. **ย้ายหน้าชำระเงิน?**  
   - ให้ยังยิง `pay_view` ตอนเข้าหน้าเลือกวิธีชำระ  
   - ส่ง `?return=` หรือ `rememberLastFeature` เพื่อ pie “กดจากเมนูไหน”

4. **Landing / Home เวอร์ชันใหม่?**  
   - path `/` map เป็น `home` แล้ว  
   - ถ้า home ใหม่ใช้ path อื่น (เช่น `/home-v2`) ต้อง map ใน `featureFromPath` หรือ redirect ให้ analytics ตามทัน

5. **เปลี่ยนชื่อเมนูอย่างเดียว**  
   - แก้ที่ `ANALYTICS_FEATURE_LABELS` ไม่ต้องเปลี่ยน `id` ถ้าเป็นฟีเจอร์เดิม

6. **ทดสอบหลัง deploy**  
   - เปิดหน้าใหม่ → ดู `/admin/analytics` ช่วง “วันนี้”  
   - ควรเห็น `screen_view` ของ path นั้น และ `feature_open` ถ้า map แล้ว

## อย่าทำ

- อย่าพึ่ง Meta Pixel / LINE Tag อย่างเดียวสำหรับ funnel ในแอป (คนละระบบกับ `analytics_events`)
- อย่าลบ `visitorId` ใน localStorage key `dd-visitor-id` โดยไม่ตั้งใจ (ทำให้ unique visitors เพี้ยนตอนทดสอบ)
- อย่ายิง `feature_open` ซ้ำทั้งตอนกดเมนูและตอนเข้า route ถ้าไม่จำเป็น (นับซ้ำใน pie)

## ตัวอย่างสั้น ๆ

```ts
import { trackFeatureOpen } from "@/lib/analytics/client";

// กดการ์ดแล้วติด paywall (ยังไม่เปลี่ยน URL)
trackFeatureOpen("face", { path: "/reading/face", source: "menu_paywall" });
```

เพิ่ม feature id ใหม่:

1. ใส่ใน `ANALYTICS_FEATURES` + `ANALYTICS_FEATURE_LABELS`
2. map path ใน `featureFromPath`
3. ถ้ามีเมนู → ใช้ `id` เดียวกันใน `feature-menu-page`
