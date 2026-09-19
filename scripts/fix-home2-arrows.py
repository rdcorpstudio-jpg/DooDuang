from pathlib import Path

html_path = Path(r"d:\Coding\DooDuang\public\home2\index.html")
css_path = Path(r"d:\Coding\DooDuang\public\home2\styles.css")

html = html_path.read_text(encoding="utf-8")
replacements = [
    ('<span aria-hidden="true">↗</span>', '<span class="btn-arrow" aria-hidden="true"></span>'),
    ('<span aria-hidden="true">→</span>', '<span class="btn-arrow btn-arrow--inline" aria-hidden="true"></span>'),
    ('<span aria-hidden="true">↓</span>', '<span class="btn-arrow btn-arrow--down" aria-hidden="true"></span>'),
]
total = 0
for old, new in replacements:
    n = html.count(old)
    total += n
    html = html.replace(old, new)
html = html.replace("styles.css?v=pretty1", "styles.css?v=arrow2")
if "v=arrow2" not in html:
    html = html.replace('/home2/styles.css"', '/home2/styles.css?v=arrow2"')
html_path.write_text(html, encoding="utf-8")
print("replaced", total)

css = css_path.read_text(encoding="utf-8")
marker = "\n/* === arrow fix === */"
if marker in css:
    css = css[: css.find(marker)]
fix = """
/* === arrow fix === */
.button span,
.button-small span,
.text-link span{
  font-size:1em !important;
  line-height:1;
}
.btn-arrow{
  display:inline-block;
  width:0.55em;
  height:0.55em;
  margin-left:0.2em;
  border-right:2px solid currentColor;
  border-top:2px solid currentColor;
  transform:rotate(45deg) translateY(-0.04em);
  flex-shrink:0;
  opacity:0.92;
}
.btn-arrow--inline{
  width:0.45em;
  height:0.45em;
  transform:rotate(45deg);
  margin-left:0.35em;
}
.btn-arrow--down{
  width:0.45em;
  height:0.45em;
  transform:rotate(135deg);
  margin-left:0.25em;
}
.button .btn-arrow,
.button-small .btn-arrow{
  border-color:#172139;
}
.text-link .btn-arrow{
  border-color:currentColor;
}
.topic-more .btn-arrow{
  border-color:currentColor;
}
"""
css_path.write_text(css.rstrip() + fix, encoding="utf-8")
print("css ok")
