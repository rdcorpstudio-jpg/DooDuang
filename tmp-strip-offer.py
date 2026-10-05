from pathlib import Path

p = Path(r"d:\Coding\DooDuang\src\components\story\story-home.tsx")
text = p.read_text(encoding="utf-8")
start = text.find("\nconst OFFER_CARDS_REMOVED")
end = text.find("\nexport function StoryHome()")
if start < 0 or end < 0:
    raise SystemExit(f"markers {start} {end}")
text = text[:start] + text[end:]
sec = text.find('      <section className="story-offer"')
sec_end = text.find("      <div className={pastHero")
if sec < 0 or sec_end < 0:
    raise SystemExit(f"section {sec} {sec_end}")
text = text[:sec] + text[sec_end:]
for needle in ("FORTUNE_UNLOCK", "OFFER_CARDS", "story-offer", "OfferGlyph"):
    if needle in text:
        raise SystemExit(f"leftover {needle}")
p.write_text(text, encoding="utf-8")
print("ok")
