// Countdown Timer
function initCountdown() {
  const targetTime = new Date(CONFIG.WEDDING_DATE).getTime();
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

// File Selection Handler
function updateFileCount(input) {
  const label = document.getElementById('file-selection-label');
  if (input.files.length > 0) {
    label.innerText = `Selected ${input.files.length} file(s)`;
    label.style.marginTop = "0.5rem";
    label.style.fontWeight = "600";
    label.style.color = "var(--primary)";
  }
}

// Private Wish Submit (Saved directly to Sheets)
async function handleWishSubmit(e) {
  e.preventDefault();
  const status = document.getElementById('wish-status');
  const btn = document.getElementById('wish-btn');

  const name = document.getElementById('wish-name').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked').value;
  const message = document.getElementById('wish-message').value.trim();

  btn.disabled = true;
  status.style.color = "var(--primary)";
  status.innerText = "Sending your blessing...";

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "submitWish",
        data: { name, attending, message }
      })
    });
    const result = await response.json();

    if (result.success) {
      status.style.color = "#16A34A";
      status.innerText = "Thank you! Your blessings have been received.";
      document.getElementById('wish-form').reset();
    } else {
      status.style.color = "#DC2626";
      status.innerText = result.message || "Failed to submit.";
    }
  } catch (err) {
    status.style.color = "#DC2626";
    status.innerText = "Submission error. Please try again.";
  } finally {
    btn.disabled = false;
  }
}

// Media Upload Handler
async function handleUpload(e) {
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
  status.innerText = `Uploading 1 of ${files.length}...`;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.innerText = `Uploading ${i + 1} of ${files.length}: ${file.name}...`;

    const base64 = await readFileAsBase64(file);

    try {
      await fetch(CONFIG.API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "uploadMedia",
          data: {
            filename: file.name,
            mimeType: file.type,
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
  document.getElementById('file-selection-label').innerText = '';
  btn.disabled = false;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', initCountdown);
