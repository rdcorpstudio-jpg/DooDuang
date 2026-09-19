from pathlib import Path
import re

css_path = Path(r"d:\Coding\DooDuang\public\home2\styles.css")
html_path = Path(r"d:\Coding\DooDuang\public\home2\index.html")

css = css_path.read_text(encoding="utf-8")
css = css.replace("background:#0a1427;", "background:#fff;")
# also in phone shell block specifically
css = re.sub(
    r"(/\* Vertical phone shell for /home2 \*/\s*html\{\s*background:)[^;]+;",
    r"\1#fff;",
    css,
)
css_path.write_text(css, encoding="utf-8")

html = html_path.read_text(encoding="utf-8")
html = re.sub(r"styles\.css\?v=[^\"]+", "styles.css?v=whitebg1", html)
html_path.write_text(html, encoding="utf-8")
print("css has navy outer", "#0a1427" in css_path.read_text(encoding="utf-8"))
print("html ver", "whitebg1" in html_path.read_text(encoding="utf-8"))
