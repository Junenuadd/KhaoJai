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
  gd.lineWidth = 10; gd.strokeStyle = '#000'; gd.lineJoin = 'round'; drawGlyph(gd, c, N, 'fill', '#000'); drawGlyph(gd, c, N, 'stroke');
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
  return Math.round(100 * (0.5 * coverage + 0.5 * precision));
}
