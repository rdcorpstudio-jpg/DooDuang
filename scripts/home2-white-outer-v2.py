from pathlib import Path
import re

p = Path(r"d:\Coding\DooDuang\public\home2\index.html")
t = p.read_text(encoding="utf-8")
t = re.sub(r"styles\.css\?v=[^\"]+", "styles.css?v=whitebg2", t)
# theme-color was navy — make browser chrome light too
t = t.replace('content="#101d35"', 'content="#ffffff"')
p.write_text(t, encoding="utf-8")
print("ok", "whitebg2" in p.read_text(encoding="utf-8"))
