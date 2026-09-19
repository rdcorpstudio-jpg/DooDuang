from pathlib import Path
import re

html_path = Path(r"d:\Coding\DooDuang\public\home2\index.html")
css_path = Path(r"d:\Coding\DooDuang\public\home2\styles.css")

html = html_path.read_text(encoding="utf-8")

# Fix awkward headline break in experience section
html = html.replace(
    'มากกว่าคำว่า “ดีหรือร้าย”<br>คือมุมมองที่คุณนำไปคิดต่อ',
    'มากกว่าคำว่า “ดีหรือร้าย”<br>คือมุมมองที่คุณ<br>นำไปคิดต่อ',
)

# Soften benefit titles: keep natural breaks but ensure readable
html = html.replace(
    "<h3>รู้จักตัวเอง<br>ในอีกมุมหนึ่ง</h3>",
    "<h3>รู้จักตัวเองในอีกมุมหนึ่ง</h3>",
)
html = html.replace(
    "<h3>มองจังหวะชีวิต<br>อย่างมีสติ</h3>",
    "<h3>มองจังหวะชีวิตอย่างมีสติ</h3>",
)
html = html.replace(
    "<h3>มีเรื่องให้คิดต่อ<br>ก่อนเลือกก้าวถัดไป</h3>",
    "<h3>มีเรื่องให้คิดต่อก่อนเลือกก้าวถัดไป</h3>",
)

html = re.sub(r"styles\.css\?v=[^\"]+", "styles.css?v=layout4", html)
html_path.write_text(html, encoding="utf-8")

css = css_path.read_text(encoding="utf-8")
marker = "\n/* === experience layout fix === */"
if marker in css:
    css = css[: css.find(marker)]

fix = """
/* === experience layout fix === */
#experience .section-top{
  margin-bottom:28px;
}
#experience h2{
  font-size:1.45rem;
  line-height:1.55;
  max-width:16.5rem;
  text-wrap:balance;
}
#experience .eyebrow{
  margin-bottom:12px;
}
.benefit-grid{
  display:flex !important;
  flex-direction:column;
  gap:0 !important;
}
.benefit-grid article{
  display:block !important;
  padding:22px 0 !important;
  border:0 !important;
  border-top:1px solid var(--line) !important;
}
.benefit-grid article:first-child{
  border-top:0 !important;
  padding-top:4px !important;
}
.benefit-number{
  display:block !important;
  grid-row:auto !important;
  font-family:var(--serif);
  font-size:1.05rem !important;
  color:var(--gold-ink);
  letter-spacing:0.04em;
  margin-bottom:10px;
  line-height:1.2 !important;
}
.benefit-number span{
  display:inline !important;
  color:#c5ccd7;
  margin-left:6px;
}
.benefit-grid h3{
  display:block !important;
  margin:0 0 10px !important;
  font-size:1.18rem !important;
  line-height:1.45 !important;
  font-family:var(--serif);
}
.benefit-grid h3 br{
  display:none !important;
}
.benefit-grid p{
  margin:0;
  font-size:0.95rem !important;
  line-height:1.7 !important;
  color:var(--muted);
}
.benefit-grid .benefit-takeaway{
  margin-top:12px !important;
  padding-top:0 !important;
  border:0 !important;
  font-size:0.95rem !important;
  line-height:1.55 !important;
  color:var(--ink) !important;
  font-weight:500;
}

/* keep other section titles from breaking awkwardly */
.section h2,
.belief h2,
.closing h2,
.story-copy h2{
  text-wrap:balance;
  line-height:1.45;
}
"""

css_path.write_text(css.rstrip() + fix, encoding="utf-8")
print("ok")
