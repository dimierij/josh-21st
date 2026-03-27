// ─── CONFIG ────────────────────────────────────────────────────────────────
// Update this to your backend URL once deployed (e.g. Railway)
const API_URL = 'https://josh-21st-production.up.railway.app/rsvp';
// ────────────────────────────────────────────────────────────────────────────

// CONFETTI
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const colors = ['#FFE135', '#FF6B9D', '#7B4FFF', '#FF8C42', '#60EFFF'];
const pieces = Array.from({ length: 60 }, () => randomPiece());

function randomPiece(burst = false) {
  return {
    x: Math.random() * canvas.width,
    y: burst ? canvas.height * 0.6 : Math.random() * canvas.height,
    r: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: burst ? -(Math.random() * 5 + 2) : Math.random() * 0.6 + 0.2,
    drift: (Math.random() - 0.5) * (burst ? 3 : 0.4),
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
    burst
  };
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    }
    ctx.restore();
    p.y += p.speed;
    p.x += p.drift;
    p.rot += p.rotSpeed;
    if (p.burst) {
      p.speed += 0.15; // gravity
      if (p.y > canvas.height + 20) pieces.splice(i, 1);
    } else {
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    }
  }
  requestAnimationFrame(drawConfetti);
}
drawConfetti();

// VIDEO — show placeholder if file can't load
const video = document.getElementById('invite-video');
const placeholder = document.getElementById('video-placeholder');

video.addEventListener('error', () => {
  video.style.display = 'none';
  placeholder.style.display = 'flex';
});

// If no src or src is empty, show placeholder immediately
if (!video.querySelector('source')?.src || video.querySelector('source').src === window.location.href) {
  video.style.display = 'none';
  placeholder.style.display = 'flex';
}

// GUEST COUNTER
let guestCount = 1;
const counterVal = document.getElementById('counter-val');
const counterLabel = document.getElementById('counter-label');

function updateCounter() {
  counterVal.textContent = guestCount;
  if (guestCount === 1) counterLabel.textContent = 'just me!';
  else if (guestCount === 2) counterLabel.textContent = 'me + 1 🫂';
  else counterLabel.textContent = `me + ${guestCount - 1} others 🎉`;
}

document.getElementById('inc-btn').addEventListener('click', () => {
  if (guestCount < 20) { guestCount++; updateCounter(); }
});
document.getElementById('dec-btn').addEventListener('click', () => {
  if (guestCount > 1) { guestCount--; updateCounter(); }
});

// FORM SUBMIT
document.getElementById('submit-btn').addEventListener('click', async () => {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const dietary = document.getElementById('dietary').value.trim();
  const msg = document.getElementById('msg').value.trim();

  document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');

  let valid = true;
  if (!fname) { document.getElementById('err-fname').style.display = 'block'; valid = false; }
  if (!lname) { document.getElementById('err-lname').style.display = 'block'; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('err-email').style.display = 'block'; valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.textContent = '';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: fname,
        last_name: lname,
        email,
        phone: phone || null,
        guests: guestCount,
        dietary: dietary || null,
        message: msg || null
      })
    });

    if (!res.ok) throw new Error('Server error');

    document.getElementById('rsvp-form-wrap').style.display = 'none';
    document.getElementById('success-state').style.display = 'block';

    // Burst confetti!
    for (let i = 0; i < 60; i++) pieces.push(randomPiece(true));

  } catch (err) {
    status.textContent = '⚠️ Something went wrong — please try again.';
    btn.disabled = false;
    btn.textContent = 'Count me in! 🎉';
  }
});
