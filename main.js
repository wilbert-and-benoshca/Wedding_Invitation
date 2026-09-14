let particleTimers = [];

function dismissLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 300);
  }
}

// Fixed Countdown Timer (Robust parsing)
function initCountdown() {
  const targetDateStr = (typeof CONFIG !== 'undefined' && CONFIG.WEDDING && CONFIG.WEDDING.countdownDate) 
    ? CONFIG.WEDDING.countdownDate 
    : "2026-12-05T15:30:00";
    
  const targetTime = new Date(targetDateStr).getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('mins');
  const secsEl = document.getElementById('secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      daysEl.innerText = "0";
      hoursEl.innerText = "0";
      minsEl.innerText = "0";
      secsEl.innerText = "0";
      return;
    }

    const sec = 1000;
    const min = sec * 60;
    const hr = min * 60;
    const day = hr * 24;

    daysEl.innerText = Math.floor(diff / day);
    hoursEl.innerText = Math.floor((diff % day) / hr);
    minsEl.innerText = Math.floor((diff % hr) / min);
    secsEl.innerText = Math.floor((diff % min) / sec);
  }

  update();
  setInterval(update, 1000);
}

// Populate Images and Details from CONFIG
function populateDetails() {
  if (typeof CONFIG === 'undefined') return;

  // Corner decors
  const cTop = document.getElementById('corner-top-left');
  const cBottom = document.getElementById('corner-bottom-right');
  if (cTop && CONFIG.IMAGES && CONFIG.IMAGES.corner1Url) cTop.src = CONFIG.IMAGES.corner1Url;
  if (cBottom && CONFIG.IMAGES && CONFIG.IMAGES.corner2Url) cBottom.src = CONFIG.IMAGES.corner2Url;

  // Church Watermark & Details
  const chImg = document.getElementById('church-bg-img');
  if (chImg && CONFIG.IMAGES && CONFIG.IMAGES.churchBgUrl) chImg.src = CONFIG.IMAGES.churchBgUrl;
  if (CONFIG.WEDDING) {
    const cTime = document.getElementById('church-time');
    const cVenue = document.getElementById('church-venue');
    const cAddr = document.getElementById('church-address');
    const cMap = document.getElementById('church-map-btn');
    if (cTime && CONFIG.WEDDING.time) cTime.innerText = CONFIG.WEDDING.time;
    if (cVenue && CONFIG.WEDDING.venue) cVenue.innerText = CONFIG.WEDDING.venue;
    if (cAddr && CONFIG.WEDDING.address) cAddr.innerText = CONFIG.WEDDING.address;
    if (cMap && CONFIG.WEDDING.mapUrl) cMap.href = CONFIG.WEDDING.mapUrl;
  }

  // Reception Watermark & Details
  const recImg = document.getElementById('reception-bg-img');
  if (recImg && CONFIG.IMAGES && CONFIG.IMAGES.venueBgUrl) recImg.src = CONFIG.IMAGES.venueBgUrl;
  if (CONFIG.RECEPTION) {
    const rTime = document.getElementById('reception-time');
    const rVenue = document.getElementById('reception-venue');
    const rAddr = document.getElementById('reception-address');
    const rMap = document.getElementById('reception-map-btn');
    if (rTime && CONFIG.RECEPTION.time) rTime.innerText = CONFIG.RECEPTION.time;
    if (rVenue && CONFIG.RECEPTION.venue) rVenue.innerText = CONFIG.RECEPTION.venue;
    if (rAddr && CONFIG.RECEPTION.address) rAddr.innerText = CONFIG.RECEPTION.address;
    if (rMap && CONFIG.RECEPTION.mapUrl) rMap.href = CONFIG.RECEPTION.mapUrl;
  }
}

// Falling Particles Engine with Oscillating Drift
function initParticleEngine() {
  particleTimers.forEach(t => clearInterval(t));
  particleTimers = [];

  const isMobile = window.innerWidth <= 768;
  const container = document.getElementById('falling-particles-layer');
  if (!container) return;

  const particles = [
    { icon: '❤️', rate: isMobile ? 6 : 24 },
    { icon: '⭐', rate: isMobile ? 2 : 6 },
    { icon: '✨', rate: isMobile ? 2 : 6 },
    { icon: '❄️', rate: isMobile ? 2 : 6 },
    { icon: '💍', rate: isMobile ? 1 : 4 },
    { icon: '🌹', rate: isMobile ? 1 : 4 }
  ];

  particles.forEach(p => {
    const intervalMs = (60 / p.rate) * 1000;
    spawnSingleParticle(container, p.icon);
    const timer = setInterval(() => spawnSingleParticle(container, p.icon), intervalMs);
    particleTimers.push(timer);
  });
}

function spawnSingleParticle(container, icon) {
  const p = document.createElement('div');
  p.className = 'falling-particle-item';
  p.innerText = icon;

  const startX = Math.random() * 95;
  const size = Math.floor(Math.random() * 8) + 16;
  const duration = 7 + Math.random() * 5;
  const sway = (Math.random() > 0.5 ? 1 : -1) * (25 + Math.random() * 20);

  p.style.setProperty('--sway-dist', `${sway}px`);
  p.style.setProperty('--p-op', '0.35');
  p.style.left = `${startX}vw`;
  p.style.fontSize = `${size}px`;
  p.style.animationDuration = `${duration}s`;

  container.appendChild(p);
  setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, duration * 1000 + 400);
}

// File Selection Preview
function handleFileSelection(input) {
  const preview = document.getElementById('file-selection-preview');
  if (preview && input.files.length > 0) {
    preview.innerText = `Selected ${input.files.length} file(s)`;
  }
}

// Upload Submission
async function handleUploadSubmit(e) {
  e.preventDefault();
  const files = document.getElementById('file-input').files;
  const uploader = document.getElementById('uploader-name').value.trim();
  const status = document.getElementById('upload-status');
  const btn = document.getElementById('upload-btn');

  if (files.length === 0) {
    alert("Please select at least one photo or video.");
    return;
  }

  btn.disabled = true;
  status.style.color = "var(--primary)";

  for (let i = 0; i < files.length; i++) {
    status.innerText = `Uploading ${i + 1} of ${files.length}: ${files[i].name}...`;
    const base64 = await readFileAsBase64(files[i]);

    try {
      await fetch(CONFIG.API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "uploadMedia",
          data: {
            filename: files[i].name,
            mimeType: files[i].type,
            base64: base64,
            uploader: uploader
          }
        })
      });
    } catch (err) {
      console.error(err);
    }
  }

  status.style.color = "#16A34A";
  status.innerText = "All memories uploaded successfully! Thank you!";
  document.getElementById('upload-form').reset();
  document.getElementById('file-selection-preview').innerText = '';
  btn.disabled = false;
}

// Wish Submission (Logs privately to Sheet)
async function handleWishSubmit(e) {
  e.preventDefault();
  const status = document.getElementById('wish-status');
  const btn = document.getElementById('wish-btn');

  const name = document.getElementById('wish-name').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked').value;
  const message = document.getElementById('wish-message').value.trim();

  btn.disabled = true;
  status.style.color = "var(--primary)";
  status.innerText = "Submitting blessing...";

  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "submitWish",
        data: { name, attending, message }
      })
    });
    const result = await res.json();

    if (result.success) {
      status.style.color = "#16A34A";
      status.innerText = "Thank you! Your wish and RSVP have been received.";
      document.getElementById('wish-form').reset();
    } else {
      status.style.color = "#DC2626";
      status.innerText = result.message || "Failed to submit.";
    }
  } catch (err) {
    status.style.color = "#DC2626";
    status.innerText = "Connection error. Please try again.";
  } finally {
    btn.disabled = false;
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dismissLoader();
  populateDetails();
  initCountdown();
  initParticleEngine();
});
