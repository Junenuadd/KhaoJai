// Checkout UI. DEMO ONLY: nothing is charged and no card data leaves the page.
// In production, card fields are replaced by the payment provider's hosted fields (tokenization),
// and the server confirms payment through the provider's webhook. See docs/ROADMAP.md.
import { ic, jai } from './ui.js';

export const PLANS = {
  free:   { name: 'Free', m: 0, y: 0, color: 'white', f: ['Hello Line & Café Line', '10 Decoder searches a day', 'Word bank & review', 'Progress saved on this device'] },
  plus:   { name: 'KhaoJai Plus', m: 249, y: 2290, color: 'lav', f: ['Every line & new stations', 'Unlimited Decoder, Chat Autopsy, Reply Lab', 'AI conversation & AI video teacher', 'AI homework checks', '1 human review each month'] },
  review: { name: 'Human Review Pack', m: 390, y: 390, once: true, color: 'lemon', f: ['5 homework reviews by a Thai reviewer', 'Pronunciation, writing or chat replies', 'Feedback with a clear rubric', 'Credits never expire'] }
};

export const METHODS = [
  ['card', 'Credit / debit card', 'Visa, Mastercard, JCB, AmEx, UnionPay'],
  ['promptpay', 'PromptPay QR', 'Scan with any Thai bank app'],
  ['truemoney', 'TrueMoney Wallet', 'Pay from your wallet'],
  ['bank', 'Mobile banking', 'K PLUS, SCB EASY, Krungthai NEXT…'],
  ['wallet', 'Apple Pay / Google Pay', 'One tap on your phone'],
  ['paypal', 'PayPal', 'Popular with visitors from abroad']
];

export function cardBrand(n) {
  n = n.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'AmEx';
  if (/^35/.test(n)) return 'JCB';
  if (/^62/.test(n)) return 'UnionPay';
  return '';
}
export function luhn(n) {
  n = n.replace(/\D/g, ''); if (n.length < 13) return false;
  let s = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; }
  return s % 10 === 0;
}
export const total = (co, billing) => { const p = PLANS[co.item]; return (billing === 'yearly' && !p.once) ? p.y : p.m; };
const baht = n => '฿' + n.toLocaleString('en-US');

export function checkoutSheet(co, billing) {
  const p = PLANS[co.item], T = baht(total(co, billing));
  const head = `<div class="sheet-head c-lav">${jai(58, 'happy', '#fff')}<div style="flex:1;min-width:0"><p class="eyebrow">Checkout</p><h2>${p.name}</h2><p class="small">${p.once ? 'One-time' : billing === 'yearly' ? 'Yearly' : 'Monthly'} · <b>${T}</b></p></div><button class="iconbtn" data-close aria-label="Close">${ic('close')}</button></div>`;
  if (co.step === 'done') return `${head}<div class="card c-mint stack center">${jai(110, 'cheer', '#fff', 'bob')}<h2>Payment successful!</h2>
    <p>${p.name} · ${T} · ${Object.fromEntries(METHODS.map(m => [m[0], m[1]]))[co.method]}</p>
    <p class="small">Receipt KJ-${Date.now().toString().slice(-8)} would be emailed to you.</p><span class="demo">Demo — no money was charged</span>
    <button class="btn" data-close>Done</button></div>`;
  if (co.step === '3ds') return `${head}<div class="card stack"><div class="row">${ic('shield')}<h3>Verify with your bank</h3></div>
    <p class="small">Your bank sends a 6-digit code (3-D Secure). In this demo any 6 digits work.</p>
    <input id="otp" class="input otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" aria-label="One-time code">
    <p class="err" id="otpErr" role="alert"></p><button class="btn block" id="otpGo">Confirm ${T}</button></div>`;
  let body = '';
  if (co.method === 'card') body = `<form class="stack" id="cardForm" novalidate>
    <div class="field"><label for="ccName">Name on card</label><input id="ccName" class="input" autocomplete="cc-name" value="Alex Morgan"></div>
    <div class="field"><label for="ccNum">Card number</label><div style="position:relative"><input id="ccNum" class="input" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" value="4242 4242 4242 4242"><span class="brandtag" id="ccBrand">Visa</span></div></div>
    <div class="grid2"><div class="field"><label for="ccExp">Expiry</label><input id="ccExp" class="input" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" value="12/28"></div>
    <div class="field"><label for="ccCvc">CVC</label><input id="ccCvc" class="input" inputmode="numeric" autocomplete="cc-csc" placeholder="123" value="123"></div></div>
    <p class="err" id="ccErr" role="alert"></p>
    <button class="btn block" type="submit">${ic('lock')} Pay ${T}</button>
    <p class="small muted">Test card 4242 4242 4242 4242 is filled in. In the real app, card details go straight to the payment provider, never to KhaoJai's servers.</p></form>`;
  if (co.method === 'promptpay') body = `<div class="stack center"><canvas class="qr" id="qr" width="29" height="29" aria-label="Sample QR code"></canvas>
    <p><b>${T}</b> · KhaoJai</p><p class="small muted">Sample QR, not payable. Expires in <span id="qrTime">10:00</span></p><button class="btn block" data-pay>I've paid</button></div>`;
  if (co.method === 'truemoney') body = `<div class="stack"><div class="field"><label for="tmPhone">TrueMoney phone number</label><input id="tmPhone" class="input" inputmode="tel" placeholder="08x-xxx-xxxx"></div>
    <p class="err" id="tmErr" role="alert"></p><button class="btn block" id="tmGo">Continue in TrueMoney</button></div>`;
  if (co.method === 'bank') body = `<div class="stack"><p class="small">Choose your bank. Its app opens to confirm the payment.</p><div class="banks">${['K PLUS', 'SCB EASY', 'Krungthai NEXT', 'Bangkok Bank', 'krungsri app'].map(b => `<button class="btn line" data-pay>${b}</button>`).join('')}</div></div>`;
  if (co.method === 'wallet') body = `<div class="stack"><button class="wallet-btn" data-pay> Pay</button><button class="wallet-btn g" data-pay>G Pay</button><p class="small muted">Shown only on devices that support them.</p></div>`;
  if (co.method === 'paypal') body = `<div class="stack"><button class="wallet-btn paypal" data-pay>Pay with PayPal</button><p class="small muted">Charged in THB; your bank converts the currency.</p></div>`;
  return `${head}
  <fieldset class="stack plain-fs"><legend class="lbl">Payment method</legend>
    <div class="pmg">${METHODS.map(([k, t, s]) => `<label class="rc"><input type="radio" name="pm" value="${k}" ${co.method === k ? 'checked' : ''}><span class="dot"></span><span style="min-width:0"><b>${t}</b><br><span class="small muted hide-xs">${s}</span></span></label>`).join('')}</div>
  </fieldset>
  ${body}
  <span class="demo">Demo · nothing is charged</span>`;
}

let qrTimer = null;
export function stopQr() { clearInterval(qrTimer); }

export function wireCheckout(co, repaint, onPaid) {
  document.querySelectorAll('input[name="pm"]').forEach(r => r.addEventListener('change', () => { co.method = r.value; repaint(); }));
  const processing = next => { const b = document.querySelector('.sheet .btn[type=submit], #otpGo, #tmGo'); if (b) { b.disabled = true; b.textContent = 'Processing…'; } setTimeout(next, 1000); };
  const finish = () => { stopQr(); co.step = 'done'; onPaid(); repaint(); };
  const num = document.getElementById('ccNum');
  if (num) {
    num.addEventListener('input', () => { const d = num.value.replace(/\D/g, '').slice(0, 19); num.value = d.replace(/(.{4})/g, '$1 ').trim(); const b = cardBrand(d), t = document.getElementById('ccBrand'); t.textContent = b; t.hidden = !b; });
    const exp = document.getElementById('ccExp');
    exp.addEventListener('input', () => { const d = exp.value.replace(/\D/g, '').slice(0, 4); exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });
    document.getElementById('cardForm').addEventListener('submit', e => {
      e.preventDefault(); const err = document.getElementById('ccErr');
      const [mm, yy] = (exp.value || '').split('/'), cvc = document.getElementById('ccCvc').value.replace(/\D/g, '');
      const now = new Date(), ey = 2000 + (+yy || 0), em = +mm || 0;
      if (!document.getElementById('ccName').value.trim()) return err.textContent = 'Enter the name shown on the card.';
      if (!luhn(num.value)) return err.textContent = 'That card number doesn\'t look right. Check the digits and try again.';
      if (!(em >= 1 && em <= 12) || ey < now.getFullYear() || (ey === now.getFullYear() && em < now.getMonth() + 1)) return err.textContent = 'The expiry date has passed or is incomplete. Use MM/YY.';
      if (cvc.length < (cardBrand(num.value) === 'AmEx' ? 4 : 3)) return err.textContent = 'Enter the security code from the back of the card.';
      err.textContent = ''; processing(() => { co.step = '3ds'; repaint(); document.getElementById('otp')?.focus(); });
    });
  }
  document.getElementById('otpGo')?.addEventListener('click', () => { const v = document.getElementById('otp').value.replace(/\D/g, ''); if (v.length !== 6) { document.getElementById('otpErr').textContent = 'Enter all 6 digits from the text message.'; return; } processing(finish); });
  document.getElementById('tmGo')?.addEventListener('click', () => { const v = document.getElementById('tmPhone').value.replace(/\D/g, ''); if (!/^0[689]\d{8}$/.test(v)) { document.getElementById('tmErr').textContent = 'Use a Thai mobile number like 081 234 5678.'; return; } processing(finish); });
  document.querySelectorAll('[data-pay]').forEach(b => b.addEventListener('click', () => processing(finish)));
  const qr = document.getElementById('qr');
  if (qr) {
    const x = qr.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 29, 29); x.fillStyle = '#2B2440';
    let seed = 7; const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 29; i++) for (let j = 0; j < 29; j++) if (r() > .55) x.fillRect(i, j, 1, 1);
    [[0, 0], [22, 0], [0, 22]].forEach(([a, b]) => { x.fillStyle = '#2B2440'; x.fillRect(a, b, 7, 7); x.fillStyle = '#fff'; x.fillRect(a + 1, b + 1, 5, 5); x.fillStyle = '#8E6CF5'; x.fillRect(a + 2, b + 2, 3, 3); });
    let s = 600; stopQr(); qrTimer = setInterval(() => { s--; const el = document.getElementById('qrTime'); if (!el) return stopQr(); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s <= 0) stopQr(); }, 1000);
  }
}
