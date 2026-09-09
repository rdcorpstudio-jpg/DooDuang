import type { FaceMetrics } from "@/lib/fortune/scan/types";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("โหลดรูปไม่สำเร็จ"));
    };
    img.src = url;
  });
}

function isSkin(r: number, g: number, b: number) {
  // Lightweight YCbCr skin gate — works across many tones without ML
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    y > 40 &&
    y < 240 &&
    cb > 77 &&
    cb < 145 &&
    cr > 125 &&
    cr < 185 &&
    r > 40 &&
    g > 20 &&
    b > 15
  );
}

/** Measure face from a guided front photo (face expected near center oval). */
export async function measureFaceFromImage(file: File): Promise<FaceMetrics> {
  const img = await loadImage(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { ratio: 0.85, topBottom: 1, fill: 0.35, clarity: 55 };
  }

  // Cover-fit into square
  const scale = Math.max(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  const { data } = ctx.getImageData(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2 - size * 0.02;
  const rx = size * 0.28;
  const ry = size * 0.36;

  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;
  let skin = 0;
  let oval = 0;
  let topSkinW = 0;
  let botSkinW = 0;
  let topCount = 0;
  let botCount = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny > 1) continue;
      oval++;
      const i = (y * size + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (!isSkin(r, g, b)) continue;
      skin++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      const relY = (y - (cy - ry)) / (2 * ry);
      if (relY < 0.38) {
        topSkinW += 1;
        topCount++;
      } else if (relY > 0.62) {
        botSkinW += 1;
        botCount++;
      }
    }
  }

  const fill = oval > 0 ? skin / oval : 0;
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const ratio = fill > 0.08 ? bw / bh : 0.85;
  const topAvg = topCount > 0 ? topSkinW / topCount : 1;
  const botAvg = botCount > 0 ? botSkinW / botCount : 1;
  const topBottom = botAvg > 0 ? topAvg / botAvg : 1;

  const clarity = Math.round(
    Math.max(
      42,
      Math.min(94, 40 + fill * 55 + (fill > 0.12 ? 12 : 0) - (fill < 0.06 ? 15 : 0))
    )
  );

  return {
    ratio: Math.max(0.55, Math.min(1.25, ratio)),
    topBottom: Math.max(0.7, Math.min(1.45, topBottom)),
    fill,
    clarity,
  };
}
