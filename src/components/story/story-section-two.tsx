import "./section-2.css";

const ARTS = {
  birth: "/images/story/section-2/birth-chart.webp",
  rhythm: "/images/story/section-2/life-rhythm.webp",
  guidance: "/images/story/section-2/guidance-scroll.webp",
} as const;

export function StorySectionTwo() {
  return (
    <div className="mmm-story-slot">
      <section className="mmm-story" id="mmm-story-section" aria-labelledby="mmm-story-title">
        <div className="mmm-story__inner">
          <div className="mmm-story__intro" data-story-reveal>
            <p className="mmm-story__eyebrow">
              <span aria-hidden /> เบื้องหลังคำทำนาย <span aria-hidden />
            </p>
            <h2 className="mmm-story__title" id="mmm-story-title">
              วันเกิดไม่ได้กำหนดชีวิต
              <span>แต่ช่วยให้เห็นจังหวะของตัวเอง</span>
            </h2>
            <p className="mmm-story__lead">
              ไม่ใช่เพื่อให้รอชะตา แต่ชวนให้มองว่า
              <br className="mmm-story__mobile-break" /> ตอนนี้ควรเร่ง ควรรอ หรือจัดการเรื่องไหนก่อน
            </p>
          </div>

          <div className="mmm-story__steps" data-story-stagger role="list" aria-label="จากข้อมูลเกิดสู่คำแนะนำ">
            <svg className="mmm-story__thread mmm-story__thread--wide" viewBox="0 0 1080 320" preserveAspectRatio="none" aria-hidden focusable="false">
              <path d="M55 190 C170 290 195 83 347 125 S510 248 568 147 S765 96 840 172 S978 245 1030 104" />
            </svg>
            <svg className="mmm-story__thread mmm-story__thread--mobile" viewBox="0 0 360 510" preserveAspectRatio="none" aria-hidden focusable="false">
              <path d="M67 44 C30 100 92 152 171 153 S281 179 291 230 S289 324 182 327 S38 391 90 470" />
            </svg>

            <div className="mmm-story__step" role="listitem">
              <figure className="mmm-story__art mmm-story__art--birth">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ARTS.birth} width={508} height={321} alt="" />
              </figure>
              <div className="mmm-story__copy">
                <div className="mmm-story__index" aria-hidden>
                  <span>01</span>
                  <i />
                  <b>◇</b>
                </div>
                <h3 className="mmm-story__step-title">เริ่มจากวันเกิด</h3>
                <p className="mmm-story__description">
                  ใช้วัน เดือน ปี และเวลาเกิด
                  <br className="mmm-story__desktop-break" />
                  เป็นจุดตั้งต้นในการอ่านพื้นดวง
                </p>
                <p className="mmm-story__note">ทำความรู้จักตัวเอง</p>
              </div>
            </div>

            <div className="mmm-story__step mmm-story__step--reverse" role="listitem">
              <figure className="mmm-story__art mmm-story__art--rhythm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ARTS.rhythm} width={517} height={266} alt="" />
              </figure>
              <div className="mmm-story__copy">
                <div className="mmm-story__index" aria-hidden>
                  <span>02</span>
                  <i />
                  <b>◇</b>
                </div>
                <h3 className="mmm-story__step-title">อ่านจังหวะชีวิต</h3>
                <p className="mmm-story__description">
                  มองช่วงที่เหมาะกับการเริ่ม
                  <br className="mmm-story__desktop-break" />
                  และช่วงที่ควรจัดสิ่งเดิมให้เข้าที่
                </p>
                <p className="mmm-story__note">ไม่ต้องเร่งทุกเรื่องพร้อมกัน</p>
              </div>
            </div>

            <div className="mmm-story__step" role="listitem">
              <figure className="mmm-story__art mmm-story__art--guidance">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ARTS.guidance} width={562} height={287} alt="" />
              </figure>
              <div className="mmm-story__copy">
                <div className="mmm-story__index" aria-hidden>
                  <span>03</span>
                  <i />
                  <b>◇</b>
                </div>
                <h3 className="mmm-story__step-title">แปลให้เข้าใจง่าย</h3>
                <p className="mmm-story__description">
                  ไม่ใช่แค่บอกว่าดีหรือไม่ดี
                  <br className="mmm-story__desktop-break" />
                  แต่ชวนคิดว่าควรทำอะไรต่อ
                </p>
                <p className="mmm-story__note">ควรทำอะไร · ควรเลี่ยงอะไร</p>
              </div>
            </div>
          </div>

          <div className="mmm-story__closing" data-story-reveal>
            <div className="mmm-story__rule" aria-hidden>
              <i />
              <span>✦</span>
              <i />
            </div>
            <p className="mmm-story__quote">
              ดวงไม่ได้เดินแทนเรา
              <span>แต่ช่วยให้เราเดินโดยเห็นทางมากขึ้น</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
