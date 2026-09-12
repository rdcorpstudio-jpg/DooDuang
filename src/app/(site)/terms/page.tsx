import { APP_NAME, FORTUNE_PACKAGE_LABEL, LEGAL_UPDATED_AT } from "@/lib/site";
import { LegalSection } from "@/components/layout/legal-section";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";

export const metadata = {
  title: `ข้อกำหนดการใช้งาน — ${APP_NAME}`,
  description: `ข้อกำหนดและเงื่อนไขการใช้บริการ ${APP_NAME}`,
};

export default function TermsPage() {
  return (
    <AnimatedPage className="px-4 py-6 pb-10">
      <PageHero
        title="ข้อกำหนด"
        accent="การใช้งาน"
        subtitle={`อัปเดตล่าสุด ${LEGAL_UPDATED_AT}`}
      />

      <div className="space-y-3">
        <LegalSection title="1. การยอมรับข้อกำหนด">
          <p>
            เมื่อเข้าสู่ระบบหรือใช้บริการ {APP_NAME} ถือว่าคุณยอมรับข้อกำหนดนี้
            หากไม่ยอมรับ กรุณาหยุดใช้บริการ
          </p>
        </LegalSection>

        <LegalSection title="2. บริการที่ให้">
          <p>
            {APP_NAME} เป็นเว็บดูดวงออนไลน์ ให้บริการคำทำนายและไพ่ทาโรต์เพื่อความบันเทิง
            บางส่วนใช้ได้ฟรี และบางส่วนเป็นเนื้อหาพรีเมียมที่ปลดล็อกผ่านแพ็กเกจชำระเงิน
          </p>
        </LegalSection>

        <LegalSection title="3. บัญชีผู้ใช้">
          <p>
            คุณรับผิดชอบอีเมลและลิงก์ดูผลที่ได้รับ ห้ามใช้บริการในทางที่ผิดกฎหมาย
            ละเมิดสิทธิผู้อื่น หรือพยายามเจาะระบบ
          </p>
        </LegalSection>

        <LegalSection title="4. แพ็กเกจพรีเมียมและการชำระเงิน">
          <p>
            แพ็กเกจพรีเมียมให้สิทธิ์เข้าถึงเนื้อหาพิเศษตามระยะเวลาที่ระบุในหน้าชำระเงิน
            (ปัจจุบัน {FORTUNE_PACKAGE_LABEL}) การชำระเงินดำเนินการผ่าน Stripe
          </p>
          <p>
            แพ็กเกจเป็นสิทธิ์ใช้งานดิจิทัลในบริการนี้เท่านั้น ไม่สามารถแลกเป็นเงินสด
            และโดยทั่วไปไม่สามารถขอคืนเงินได้ เว้นแต่กฎหมายที่ใช้บังคับกำหนดไว้เป็นอย่างอื่น
          </p>
        </LegalSection>

        <LegalSection title="5. ลักษณะของคำทำนาย">
          <p>
            ผลดูดวงเป็นการตีความเชิงสัญลักษณ์และสื่อบันเทิง ไม่รับประกันความถูกต้อง
            และไม่ใช่คำปรึกษาวิชาชีพ คุณเป็นผู้ตัดสินใจในชีวิตด้วยตนเอง
          </p>
        </LegalSection>

        <LegalSection title="6. ข้อจำกัดความรับผิด">
          <p>
            บริการจัดให้ตามสภาพที่เป็นอยู่ ผู้ให้บริการไม่รับผิดต่อความเสียหายทางอ้อม
            กำไรที่สูญเสีย หรือความเสียหายที่เกิดจากการใช้หรือการพึ่งพาผลดูดวง
            ในขอบเขตสูงสุดที่กฎหมายอนุญาต
          </p>
        </LegalSection>

        <LegalSection title="7. การเปลี่ยนแปลงบริการ">
          <p>
            เราอาจปรับปรุงฟีเจอร์ ราคา หรือข้อกำหนดนี้ได้ โดยจะอัปเดตวันที่บนหน้านี้
            การใช้บริการต่อหลังจากมีการเปลี่ยนแปลง ถือว่ายอมรับข้อกำหนดฉบับใหม่
          </p>
        </LegalSection>

        <LegalSection title="8. ติดต่อเรา">
          <p>
            หากมีคำถามเกี่ยวกับข้อกำหนดนี้ ติดต่อผู้ให้บริการ {APP_NAME} ผ่านเว็บไซต์นี้
          </p>
        </LegalSection>
      </div>
    </AnimatedPage>
  );
}
