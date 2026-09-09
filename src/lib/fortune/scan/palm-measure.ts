import type { PalmMetrics } from "@/lib/fortune/scan/types";

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
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    y > 35 &&
    y < 245 &&
    cb > 75 &&
    cb < 150 &&
    cr > 120 &&
    cr < 190
  );
}

/** Measure palm from guided photo (hand expected in center guide). */
export async function measurePalmFromImage(file: File): Promise<PalmMetrics> {
  const img = await loadImage(file);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { ratio: 0.72, lineDensity: 0.4, fill: 0.3, clarity: 55 };
  }

  const scale = Math.max(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

  const { data } = ctx.getImageData(0, 0, size, size);
  // Palm guide roughly lower-center rectangle
  const x0 = Math.floor(size * 0.22);
  const x1 = Math.floor(size * 0.78);
  const y0 = Math.floor(size * 0.28);
  const y1 = Math.floor(size * 0.88);

  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;
  let skin = 0;
  let area = 0;
  let edge = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      area++;
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

      // crude crease proxy: darker neighbor contrast on skin
      if (x + 1 < x1 && y + 1 < y1) {
        const j = (y * size + (x + 1)) * 4;
        const k = ((y + 1) * size + x) * 4;
        const y0v = 0.299 * r + 0.587 * g + 0.114 * b;
        const y1v =
          0.299 * data[j]! + 0.587 * data[j + 1]! + 0.114 * data[j + 2]!;
        const y2v =
          0.299 * data[k]! + 0.587 * data[k + 1]! + 0.114 * data[k + 2]!;
        if (Math.abs(y0v - y1v) > 18 || Math.abs(y0v - y2v) > 18) edge++;
      }
    }
  }

  const fill = area > 0 ? skin / area : 0;
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const ratio = fill > 0.06 ? bw / bh : 0.72;
  const lineDensity = skin > 0 ? Math.min(1, edge / skin) : 0.35;
  const clarity = Math.round(
    Math.max(40, Math.min(92, 38 + fill * 50 + lineDensity * 20))
  );

  return {
    ratio: Math.max(0.45, Math.min(1.1, ratio)),
    lineDensity,
    fill,
    clarity,
  };
}
