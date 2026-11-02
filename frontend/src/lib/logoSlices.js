// Splits a transparent logo image into pieces (mark + one piece per letter) by scanning empty rows/columns.
const runs = (filled, minGap) => {
  const out = [];
  let start = -1;
  let gap = 0;
  filled.forEach((on, i) => {
    if (on) {
      if (start < 0) start = i;
      gap = 0;
    } else if (start >= 0 && ++gap >= minGap) {
      out.push([start, i - gap + 1]);
      start = -1;
      gap = 0;
    }
  });
  if (start >= 0) out.push([start, filled.length - gap]);
  return out;
};

export const sliceLogo = (img) => {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const ctx = Object.assign(document.createElement("canvas"), { width: W, height: H }).getContext("2d");
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, W, H).data;
  const on = (x, y) => px[(y * W + x) * 4 + 3] > 40;
  const rows = Array.from({ length: H }, (_, y) => { for (let x = 0; x < W; x += 1) if (on(x, y)) return true; return false; });
  const bands = runs(rows, 3);
  const pieces = [];
  bands.forEach(([y0, y1], b) => {
    const cols = Array.from({ length: W }, (_, x) => { for (let y = y0; y < y1; y += 1) if (on(x, y)) return true; return false; });
    const segs = bands.length >= 3 && b === 0 ? [[cols.indexOf(true), cols.lastIndexOf(true) + 1]] : runs(cols, 2);
    segs.forEach(([x0, x1]) => pieces.push({ band: b, x: x0 / W, y: y0 / H, w: (x1 - x0) / W, h: (y1 - y0) / H }));
  });
  return { ratio: W / H, bands: bands.length, pieces };
};
