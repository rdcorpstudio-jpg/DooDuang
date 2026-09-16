from pathlib import Path
import urllib.request

path = Path(r"d:\Coding\DooDuang\public\home2\styles.css")
orig = None
try:
    req = urllib.request.Request(
        "https://mae-mangmee.tawin-ton.chatgpt.site/styles.css",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    orig = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    print("downloaded", len(orig))
except Exception as e:
    print("download fail", e)

if orig is None:
    cur = path.read_text(encoding="utf-8")
    cut = cur.find(".hero-portrait{max-height:680px}")
    if cut < 0:
        cut = cur.find("/* forced vertical")
    orig = cur[:cut] if cut > 0 else cur
    # ensure ends cleanly at mobile-cta{display:none}
    marker = ".mobile-cta{display:none}"
    m = orig.find(marker)
    if m >= 0:
        orig = orig[: m + len(marker)]
    print("salvaged", len(orig))


def strip_media(css: str) -> str:
    out = []
    i = 0
    while True:
        j = css.find("@media", i)
        if j < 0:
            out.append(css[i:])
            break
        out.append(css[i:j])
        k = css.find("{", j)
        depth = 0
        p = k
        while p < len(css):
            if css[p] == "{":
                depth += 1
            elif css[p] == "}":
                depth -= 1
                if depth == 0:
                    break
            p += 1
        i = p + 1
    return "".join(out)


def extract_all(css: str, query: str) -> str:
    token = f"@media({query})"
    parts = []
    start = 0
    while True:
        j = css.find(token, start)
        if j < 0:
            break
        k = css.find("{", j)
        depth = 0
        p = k
        while p < len(css):
            if css[p] == "{":
                depth += 1
            elif css[p] == "}":
                depth -= 1
                if depth == 0:
                    parts.append(css[k + 1 : p])
                    start = p + 1
                    break
            p += 1
        else:
            break
    return "\n".join(parts)


base = strip_media(orig)
mobile = extract_all(orig, "max-width:760px")
tiny = extract_all(orig, "max-width:370px")
reduced = extract_all(orig, "prefers-reduced-motion:reduce")

shell = """
/* Vertical phone shell for /home2 */
html{
  background:#0a1427;
  min-height:100%;
  overflow-x:hidden; /* keep sticky header working — do not put overflow on body */
}
body{
  max-width:430px;
  width:100%;
  margin:0 auto;
  background:#fff !important;
  color:var(--ink);
  min-height:100dvh;
  position:relative;
  box-shadow:0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.45);
}
.section,
.topics,
.start,
#experience{
  background:#fff;
}
.faq{background:#f3f5f8;}
.story{background:var(--cream);}
.mobile-cta{
  left:50% !important;
  right:auto !important;
  transform:translateX(-50%);
  width:min(430px,100%);
  max-width:430px;
  box-sizing:border-box;
}
"""

final = (
    base
    + "\n/* === forced mobile (vertical) === */\n"
    + mobile
    + "\n"
    + tiny
    + "\n"
)
if reduced:
    final += "@media(prefers-reduced-motion:reduce){" + reduced + "}\n"
final += shell

path.write_text(final, encoding="utf-8")
print("wrote", len(final))
print("orphan", "max-height:680px}}" in final)
print("bg navy on body bang", "background:#0a1427!important" in final.replace(" ", ""))
print("body white", "background:#fff !important" in final)
