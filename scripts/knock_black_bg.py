from PIL import Image
from pathlib import Path


def knock_black(path: Path, thresh: int = 18) -> None:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    stack: list[tuple[int, int]] = []

    def is_bg(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        # near-black and not too colorful (avoid teal cuff / purple hair)
        mx = max(r, g, b)
        mn = min(r, g, b)
        return a > 0 and mx <= thresh and (mx - mn) <= 8

    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    cleared = 0
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        visited[y][x] = True
        if not is_bg(x, y):
            continue
        px[x, y] = (0, 0, 0, 0)
        cleared += 1
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    # anti-aliased fringe only next to already-transparent
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mx = max(r, g, b)
            if mx > 40:
                continue
            near_t = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                    near_t = True
                    break
            if near_t and mx <= 40 and (mx - min(r, g, b)) <= 10:
                # fade rather than hard cut
                fade = max(0, min(255, int(a * (mx / 40))))
                px[x, y] = (r, g, b, fade) if fade > 8 else (0, 0, 0, 0)

    im.save(path, "PNG", optimize=True)
    a = im.getchannel("A").histogram()
    print(
        f"ok {path.name}: cleared={cleared} transparent={a[0]} opaque={a[255]} partial={sum(a[1:255])}"
    )


base = Path(r"d:\Coding\DooDuang\public\images\extra")
for name in ("tarot.png", "face.png", "palm.png"):
    knock_black(base / name, thresh=18)
