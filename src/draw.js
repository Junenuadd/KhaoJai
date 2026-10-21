// Writing pad: trace a letter or write it from memory, then get an APPROXIMATE shape check.
// The check compares how much of the model letter your ink covers, and how much of your ink
// lands on the letter. It does NOT judge stroke order or stroke direction — the UI says so.
const SIZE = 280;
const FONT = '"IBM Plex Sans Thai Looped","Leelawadee UI","Thonburi",sans-serif';
const fontReady = c => (document.fonts?.load ? document.fonts.load(`200px ${FONT}`, c).catch(() => {}) : Promise.resolve());

function glyphBox(ctx, c, px) {
  ctx.font = `${px}px ${FONT}`;
  const m = ctx.measureText(c);
  const l = m.actualBoundingBoxLeft || 0, r = m.actualBoundingBoxRight || px * .6, a = m.actualBoundingBoxAscent || px * .7, d = m.actualBoundingBoxDescent || 0;
  return { l, r, a, d, w: l + r, h: a + d };
}
function drawGlyph(ctx, c, size, style, fillStyle) {
  const px = size * 0.62, b = glyphBox(ctx, c, px);
  const x = (size - b.w) / 2 + b.l, y = (size - b.h) / 2 + b.a;
  ctx.font = `${px}px ${FONT}`;
  if (style === 'stroke') ctx.strokeText(c, x, y); else { ctx.fillStyle = fillStyle; ctx.fillText(c, x, y); }
  return { x0: x - b.l, y0: y - b.a, x1: x + b.r, y1: y + b.d };
}

export function mountPad(canvas, opts) {
  const { c, guide, strokes, reveal, locked, onChange } = opts;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  let current = null;
  const paint = () => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#EFE7F7'; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(SIZE / 2, 0); ctx.lineTo(SIZE / 2, SIZE); ctx.moveTo(0, SIZE / 2); ctx.lineTo(SIZE, SIZE / 2); ctx.stroke(); ctx.setLineDash([]);
    if (guide || reveal) drawGlyph(ctx, c, SIZE, 'fill', reveal && !guide ? 'rgba(158,134,242,.35)' : '#E9E3F2');
    ctx.strokeStyle = '#2B2440'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [...strokes, ...(current ? [current] : [])].forEach(s => { ctx.beginPath(); s.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (s.length === 1) ctx.lineTo(s[0][0] + .1, s[0][1]); ctx.stroke(); });
  };
  fontReady(c).then(paint); paint();
  if (locked) return;
  const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height]; };
  canvas.onpointerdown = e => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); current = [pos(e)]; paint(); };
  canvas.onpointermove = e => { if (!current) return; current.push(pos(e)); paint(); };
  canvas.onpointerup = canvas.onpointercancel = () => { if (current) { strokes.push(current); current = null; paint(); onChange?.(); } };
}

// Returns 0–100. normalize=true rescales free-hand writing onto the model letter's box.
export async function shapeScore(c, strokes, normalize) {
  await fontReady(c);
  const N = 140, k = N / SIZE;
  const mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = N; return cv.getContext('2d', { willReadFrequently: true }); };
  const g = mk(), gd = mk(), u = mk();
  const box = drawGlyph(g, c, N, 'fill', '#000');
  gd.lineWidth = 5; gd.strokeStyle = '#000'; gd.lineJoin = 'round'; drawGlyph(gd, c, N, 'fill', '#000'); drawGlyph(gd, c, N, 'stroke');
  let pts = strokes.map(s => s.map(([x, y]) => [x * k, y * k]));
  const flat = pts.flat();
  if (!flat.length) return 0;
  if (normalize) {
    const xs = flat.map(p => p[0]), ys = flat.map(p => p[1]);
    const ux0 = Math.min(...xs), ux1 = Math.max(...xs), uy0 = Math.min(...ys), uy1 = Math.max(...ys);
    const uw = Math.max(4, ux1 - ux0), uh = Math.max(4, uy1 - uy0), gw = box.x1 - box.x0, gh = box.y1 - box.y0;
    const sc = Math.min(gw / uw, gh / uh) * 1.0;
    const cx = (ux0 + ux1) / 2, cy = (uy0 + uy1) / 2, gx = (box.x0 + box.x1) / 2, gy = (box.y0 + box.y1) / 2;
    pts = pts.map(s => s.map(([x, y]) => [gx + (x - cx) * sc, gy + (y - cy) * sc]));
  }
  u.strokeStyle = '#000'; u.lineWidth = 7; u.lineCap = 'round'; u.lineJoin = 'round';
  pts.forEach(s => { u.beginPath(); s.forEach(([x, y], i) => i ? u.lineTo(x, y) : u.moveTo(x, y)); if (s.length === 1) u.lineTo(s[0][0] + .1, s[0][1]); u.stroke(); });
  const A = g.getImageData(0, 0, N, N).data, D = gd.getImageData(0, 0, N, N).data, U = u.getImageData(0, 0, N, N).data;
  let gl = 0, cov = 0, up = 0, prec = 0;
  for (let i = 3; i < A.length; i += 4) {
    const ink = U[i] > 40, glyph = A[i] > 40;
    if (glyph) { gl++; if (ink) cov++; }
    if (ink) { up++; if (D[i] > 40) prec++; }
  }
  if (up < 20 || gl === 0) return 0;
  // the user's line is thinner than the letter's filled area, so coverage is scaled up a little
  const coverage = Math.min(1, (cov / gl) * 1.6), precision = prec / up;
  // scribbling or filling the box puts far more ink down than the letter has — that lowers the score
  const excess = up > gl * 1.5 ? (gl * 1.5) / up : 1;
  return Math.round(100 * (0.5 * coverage + 0.5 * precision) * excess);
}

// Free-hand writing check. The drawing and each letter are scaled into the same box and compared with a
// "chamfer distance" (how far each line is from the nearest line of the other shape, both ways).
// The writing counts only if the target letter is among the closest matches of all the letters,
// so scribbling or filling the box does not pass. Still approximate: stroke order is not checked.
const M = 48, PAD = 4;
function cropTo(srcCanvas, x0, y0, x1, y1, width) {
  const cv = document.createElement('canvas'); cv.width = cv.height = M;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(srcCanvas, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0), PAD, PAD, M - 2 * PAD, M - 2 * PAD);
  const d = ctx.getImageData(0, 0, M, M).data, mask = new Uint8Array(M * M);
  for (let i = 0; i < M * M; i++) mask[i] = d[i * 4 + 3] > 60 ? 1 : 0;
  return mask;
}
function inkBox(ctx, n) {
  const d = ctx.getImageData(0, 0, n, n).data; let x0 = n, y0 = n, x1 = 0, y1 = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 >= x0 ? [x0, y0, x1 + 1, y1 + 1] : null;
}
function distMap(mask) {   // two-pass chamfer distance transform (3-4 weights)
  const INF = 1e6, d = new Float32Array(M * M);
  for (let i = 0; i < M * M; i++) d[i] = mask[i] ? 0 : INF;
  for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) { const i = y * M + x; let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + 3); if (y > 0) { v = Math.min(v, d[i - M] + 3); if (x > 0) v = Math.min(v, d[i - M - 1] + 4); if (x < M - 1) v = Math.min(v, d[i - M + 1] + 4); } d[i] = v; }
  for (let y = M - 1; y >= 0; y--) for (let x = M - 1; x >= 0; x--) { const i = y * M + x; let v = d[i];
    if (x < M - 1) v = Math.min(v, d[i + 1] + 3); if (y < M - 1) { v = Math.min(v, d[i + M] + 3); if (x < M - 1) v = Math.min(v, d[i + M + 1] + 4); if (x > 0) v = Math.min(v, d[i + M - 1] + 4); } d[i] = v; }
  return d;
}
const glyphCache = {};
function glyphShape(c) {
  if (glyphCache[c]) return glyphCache[c];
  const n = 200, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.font = `120px ${FONT}`; ctx.fillStyle = '#000'; ctx.textBaseline = 'middle'; ctx.fillText(c, 30, 100);
  const b = inkBox(ctx, n); const mask = cropTo(cv, ...b);
  return (glyphCache[c] = { mask, dist: distMap(mask) });
}
function userShape(strokes) {
  const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.strokeStyle = '#000'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  strokes.forEach(s => { ctx.beginPath(); s.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (s.length === 1) ctx.lineTo(s[0][0] + .1, s[0][1]); ctx.stroke(); });
  const b = inkBox(ctx, SIZE); if (!b) return null;
  const mask = cropTo(cv, ...b); return { mask, dist: distMap(mask) };
}
function chamfer(a, b) {
  let s1 = 0, n1 = 0, s2 = 0, n2 = 0;
  for (let i = 0; i < M * M; i++) { if (a.mask[i]) { s1 += b.dist[i]; n1++; } if (b.mask[i]) { s2 += a.dist[i]; n2++; } }
  return (s1 / Math.max(1, n1) + s2 / Math.max(1, n2)) / 2 / 3;   // in pixels of the 48px box
}
export async function recognize(target, strokes, candidates) {
  await fontReady(candidates.join(''));
  const u = userShape(strokes); if (!u) return { score: 0, rank: 99, best: [] };
  const res = candidates.map(c => [c, chamfer(u, glyphShape(c))]).sort((a, b) => a[1] - b[1]);
  const rank = res.findIndex(([c]) => c === target) + 1, dist = res[rank - 1][1];
  const score = Math.max(0, Math.min(100, Math.round(100 - dist * 18)));   // 0 px apart = 100, ~5.5 px = 0
  return { score, rank, best: res.slice(0, 3).map(([c]) => c) };
}
