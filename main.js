let particleTimers = [];

function dismissLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 300);
  }
}

// Welcome Splash with Confetti (Plays once per visit)
function handleWelcomeSplash() {
  const splash = document.getElementById('splash-overlay');
  const splashImg = document.getElementById('splash-img');
  
  if (CONFIG.IMAGES.splashImageUrl) {
    splashImg.src = CONFIG.IMAGES.splashImageUrl;
  }

  if (!sessionStorage.getItem('hasSeenSplash')) {
    splash.style.display = 'flex';

    try {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 10001 });
      }
    } catch(e) {}

    sessionStorage.setItem('hasSeenSplash', 'true');

    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => { splash.style.display = 'none'; }, 600);
    }, 3500);
  }
}

// Live Countdown
function initCountdown() {
  const targetTime = new Date(CONFIG.WEDDING.countdownDate).getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('mins');
  const secsEl = document.getElementById('secs');

  function update() {
    const diff = targetTime - new Date().getTime();
    if (diff <= 0) return;

    daysEl.innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
    hoursEl.innerText = Math.floor((diff / (1000 * 60 * 60)) % 24);
    minsEl.innerText = Math.floor((diff / 1000 / 60) % 60);
    secsEl.innerText = Math.floor((diff / 1000) % 60);
  }

  update();
  setInterval(update, 1000);
}

// Populate Content from Config
function populateCardDetails() {
  document.getElementById('verse-text').innerHTML = CONFIG.WEDDING.verse;
  document.getElementById('corner-top-left').src = CONFIG.IMAGES.corner1Url;
  document.getElementById('corner-bottom-right').src = CONFIG.IMAGES.corner2Url;

  if (CONFIG.IMAGES.showCouplePhoto && CONFIG.IMAGES.couplePhotoUrl) {
    document.getElementById('couple-photo-img').src = CONFIG.IMAGES.couplePhotoUrl;
    document.getElementById('couple-photo-container').style.display = 'flex';
  }

  // Church
  document.getElementById('church-time').innerText = CONFIG.WEDDING.time;
  document.getElementById('church-venue').innerText = CONFIG.WEDDING.venue;
  document.getElementById('church-address').innerText = CONFIG.WEDDING.address;
  document.getElementById('church-map-btn').href = CONFIG.WEDDING.mapUrl;
  document.getElementById('church-watermark').style.backgroundImage = `url('${CONFIG.IMAGES.churchBgUrl}')`;

  // Reception
  document.getElementById('reception-time').innerText = CONFIG.RECEPTION.time;
  document.getElementById('reception-venue').innerText = CONFIG.RECEPTION.venue;
  document.getElementById('reception-address').innerText = CONFIG.RECEPTION.address;
  document.getElementById('reception-map-btn').href = CONFIG.RECEPTION.mapUrl;
  document.getElementById('reception-watermark').style.backgroundImage = `url('${CONFIG.IMAGES.venueBgUrl}')`;
}

// Falling Particles Engine with Oscillating Sway
async function initParticleEngine() {
  particleTimers.forEach(t => clearInterval(t));
  particleTimers = [];

  let config = {
    opacity: 30, speed: 8, sway: 35,
    particles: {
      heart: { desktop: 30, mobile: 6, enabled: true },
      star: { desktop: 5, mobile: 1, enabled: true },
      sparkle: { desktop: 5, mobile: 1, enabled: true },
      snowflake: { desktop: 5, mobile: 1, enabled: true },
      ring: { desktop: 3, mobile: 1, enabled: true },
      rose: { desktop: 3, mobile: 1, enabled: true },
      gift: { desktop: 3, mobile: 1, enabled: true },
      bell: { desktop: 2, mobile: 1, enabled: true }
    }
  };

  try {
    const res = await fetch(`${CONFIG.API_URL}?action=getParticleConfig`);
    const remoteConfig = await res.json();
    if (remoteConfig && remoteConfig.particles) config = remoteConfig;
  } catch(e) {}

  const isMobile = window.innerWidth <= 768;
  const opacity = (config.opacity || 30) / 100;
  const baseSpeed = config.speed || 8;
  const masterSway = config.sway || 35;

  const container = document.getElementById('falling-particles-layer');
  const icons = {
    heart: '❤️', star: '⭐', sparkle: '✨', snowflake: '❄️',
    ring: '💍', rose: '🌹', gift: '🎁', bell: '🔔'
  };

  Object.keys(config.particles).forEach(key => {
    const pData = config.particles[key];
    if (pData.enabled === false) return;

    const rate = isMobile ? (pData.mobile || 0) : (pData.desktop || 0);
    if (rate <= 0 || !icons[key]) return;

    const intervalMs = (60 / rate) * 1000;
    spawnParticle(container, icons[key], opacity, baseSpeed, masterSway);

    const timer = setInterval(() => {
      spawnParticle(container, icons[key], opacity, baseSpeed, masterSway);
    }, intervalMs);

    particleTimers.push(timer);
  });
}

function spawnParticle(container, icon, opacity, baseSpeed, swayPx) {
  const p = document.createElement('div');
  p.className = 'falling-particle-item';
  p.innerText = icon;

  const startX = Math.random() * 95;
  const size = Math.floor(Math.random() * 10) + 16;
  const duration = baseSpeed * (0.8 + Math.random() * 0.4);
  const direction = Math.random() > 0.5 ? 1 : -1;

  p.style.setProperty('--sway-dist', `${swayPx * direction}px`);
  p.style.setProperty('--p-op', opacity);
  p.style.left = `${startX}vw`;
  p.style.fontSize = `${size}px`;
  p.style.animationDuration = `${duration}s`;

  container.appendChild(p);
  setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, duration * 1000 + 500);
}

// File Selection Label
function handleFileSelection(input) {
  const preview = document.getElementById('file-selection-preview');
  if (input.files.length > 0) {
    preview.innerHTML = `<p style="font-weight:600; color:var(--primary); margin-top:0.5rem;">Selected ${input.files.length} file(s)</p>`;
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
    alert("Please choose photos or videos to upload.");
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
    } catch(err) {}
  }

  status.style.color = "#16A34A";
  status.innerText = "Thank you! All memories uploaded successfully.";
  document.getElementById('upload-form').reset();
  document.getElementById('file-selection-preview').innerHTML = "";
  btn.disabled = false;
}

// Private Wish Submission (Direct to Sheet)
async function handleWishSubmit(e) {
  e.preventDefault();
  const status = document.getElementById('wish-status');
  const btn = document.getElementById('wish-btn');

  const name = document.getElementById('wish-name').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked').value;
  const message = document.getElementById('wish-message').value.trim();

  btn.disabled = true;
  status.style.color = "var(--primary)";
  status.innerText = "Recording your blessing...";

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
      status.innerText = "Thank you! Your blessings have been received.";
      document.getElementById('wish-form').reset();
    } else {
      status.style.color = "#DC2626";
      status.innerText = result.message || "Failed to submit.";
    }
  } catch(err) {
    status.style.color = "#DC2626";
    status.innerText = "Submission error. Please try again.";
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

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  dismissLoader();
  populateCardDetails();
  initCountdown();
  handleWelcomeSplash();
  initParticleEngine();
});
