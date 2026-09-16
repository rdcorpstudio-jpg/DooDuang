from pathlib import Path

css_path = Path(r"d:\Coding\DooDuang\public\home2\styles.css")
html_path = Path(r"d:\Coding\DooDuang\public\home2\index.html")
css = css_path.read_text(encoding="utf-8")
marker = "\n/* === polish vertical === */"
if marker in css:
    css = css[: css.find(marker)]

polish = """
/* === polish vertical === */
.site-header{
  position:sticky;
  top:0;
  z-index:40;
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  background:rgba(16,29,53,0.96);
  border-bottom:1px solid rgba(245,206,126,0.18);
}
.header-inner{
  min-height:60px;
  padding:6px 0;
}
.brand{width:108px}
.brand img{height:52px}
.button,
.button-small{
  border-radius:999px;
  gap:10px;
  background:linear-gradient(165deg,#fff6d8 0%,#f5ce7e 42%,#e0b45a 78%,#c9963f 100%);
  box-shadow:0 8px 22px rgba(184,146,79,0.32), inset 0 1px 0 rgba(255,255,255,0.55);
  letter-spacing:0.01em;
}
.button:hover,
.button-small:hover{
  background:linear-gradient(165deg,#fff9e4 0%,#ffdc96 48%,#f0c46a 100%);
  transform:translateY(-1px);
}
.button.navy{
  background:var(--navy);
  box-shadow:none;
  color:#fff;
}
.hero{
  background:
    radial-gradient(ellipse 90% 55% at 50% -10%, rgba(245,206,126,0.18), transparent 58%),
    linear-gradient(180deg, #152445 0%, #101d35 48%, #0c1730 100%);
  padding-bottom:8px;
}
.hero-grid{
  gap:22px;
  padding-top:18px;
  padding-bottom:18px;
}
.hero-copy{
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
}
.hero .eyebrow{
  font-size:0.8rem;
  letter-spacing:0.06em;
  margin-bottom:10px;
  opacity:0.95;
}
.hero-opening{
  font-size:1.05rem;
  color:#d7deea;
  margin:0 0 8px;
  font-weight:400;
}
.hero h1{
  font-family:var(--serif);
  font-size:clamp(1.85rem, 7.2vw, 2.35rem);
  line-height:1.35;
  letter-spacing:-0.01em;
  font-weight:600;
  max-width:16.5rem;
}
.hero h1 span{
  display:inline;
  background:linear-gradient(180deg,#fff4c8 0%,#f5ce7e 55%,#d4a84c 100%);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  -webkit-text-fill-color:transparent;
}
.hero-lead{
  font-size:0.98rem;
  line-height:1.75;
  color:#eef2f8;
  margin-top:14px;
  max-width:19.5rem;
}
.hero-body{
  font-size:0.92rem;
  line-height:1.72;
  color:#aeb9cc;
  margin-top:10px;
  max-width:19.5rem;
}
.hero-actions{
  width:100%;
  max-width:280px;
  margin-top:20px;
  margin-bottom:8px;
}
.hero-actions .button{
  min-height:52px;
  font-size:1.02rem;
  padding:14px 22px;
}
.hero .micro{
  font-size:0.8rem;
  color:#c5d0e1;
  margin-top:2px;
}
.hero-portrait{
  height:min(52vh, 420px);
  border-radius:48% 48% 18px 18px / 38% 38% 18px 18px;
  border:1px solid rgba(245,206,126,0.42);
  box-shadow:0 18px 40px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.04);
}
.hero-portrait:after{
  inset:48% 0 0;
  background:linear-gradient(180deg, transparent 0%, rgba(16,29,53,0.55) 45%, #101d35 100%);
}
.hero-portrait figcaption{
  bottom:16px;
  left:16px;
  right:16px;
}
.hero-portrait figcaption p{
  font-size:1.12rem;
  line-height:1.55;
  margin:4px 0 6px;
  text-shadow:0 2px 12px rgba(0,0,0,0.35);
}
.hero-footer{
  padding:14px 0 18px;
  border-top:1px solid rgba(255,255,255,0.12);
  margin-top:4px;
}
.hero-footer>span{
  font-size:0.92rem;
  letter-spacing:0.04em;
}
.section{
  padding:52px 0;
}
.section-top{
  margin-bottom:22px;
}
.section-intro{
  font-size:0.98rem;
  line-height:1.7;
}
h2{
  font-family:var(--serif);
  line-height:1.35;
}
.topic-card{
  border-radius:16px;
  padding:18px 15px;
  box-shadow:0 6px 18px rgba(16,29,53,0.04);
  border-color:rgba(216,221,229,0.95);
}
.topic-card[aria-selected=true]{
  box-shadow:0 10px 24px rgba(16,29,53,0.18);
}
.topic-name{font-size:1.12rem}
.topic-question{font-size:0.92rem; line-height:1.65}
.topic-detail{
  padding-top:22px;
  padding-bottom:8px;
}
.topic-detail h3{
  font-family:var(--serif);
  font-size:1.22rem;
  line-height:1.45;
}
.story{
  padding:48px 0;
}
.story-copy h2{
  font-size:1.55rem;
  line-height:1.45;
}
.benefit-grid h3{
  font-family:var(--serif);
  font-size:1.2rem;
}
.belief{
  padding:48px 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,206,126,0.12), transparent 60%),
    var(--navy);
}
.belief h2{
  font-family:var(--serif);
  font-size:1.55rem;
  line-height:1.4;
}
.equation-number{
  font-size:3.75rem;
  background:linear-gradient(180deg,#fff4c8,#f5ce7e);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  -webkit-text-fill-color:transparent;
}
.closing{
  padding:48px 0 56px;
  background:
    radial-gradient(ellipse 70% 45% at 50% 0%, rgba(245,206,126,0.14), transparent 55%),
    var(--navy);
}
.closing h2{
  font-family:var(--serif);
  font-size:1.4rem;
  line-height:1.45;
  max-width:18rem;
  margin-left:auto;
  margin-right:auto;
}
.footer{
  padding:28px 0 118px;
}
.mobile-cta{
  background:rgba(255,255,255,0.94);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border-top:1px solid rgba(216,221,229,0.9);
  box-shadow:0 -8px 28px rgba(16,29,53,0.08);
  padding:11px 16px max(11px, env(safe-area-inset-bottom));
  border-radius:18px 18px 0 0;
}
.mobile-cta strong{
  font-size:0.9rem;
  color:var(--ink);
}
.mobile-cta .button{
  min-height:42px;
  font-size:0.92rem;
  padding:10px 15px;
}
"""

css_path.write_text(css.rstrip() + polish, encoding="utf-8")

html = html_path.read_text(encoding="utf-8")
html = html.replace("/home2/styles.css?v=vert2", "/home2/styles.css?v=pretty1")
if "styles.css?v=pretty1" not in html:
    html = html.replace('/home2/styles.css"', '/home2/styles.css?v=pretty1"')
html_path.write_text(html, encoding="utf-8")
print("ok")
