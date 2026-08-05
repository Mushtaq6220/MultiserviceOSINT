// ===== THEME MANAGEMENT =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

initTheme();

// ===== SECURITY & ANTI-INSPECTION PROTECTION =====
(function() {
  // Disable right click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // Block key combinations (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
  document.addEventListener('keydown', function(e) {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
      (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) // Ctrl+U / Ctrl+S
    ) {
      e.preventDefault();
      return false;
    }
  });
})();

// ===== TERMS & CONDITIONS FIRST-TIME MODAL =====
function checkFirstTimeTerms() {
  const accepted = localStorage.getItem('infocore_terms_accepted');
  const modal = document.getElementById('termsModal');
  if (!accepted && modal) {
    modal.classList.remove('hidden');
  }
}

function toggleTermsConfirmBtn() {
  const check = document.getElementById('termsCheck');
  const btn = document.getElementById('termsConfirmBtn');
  if (btn && check) {
    btn.disabled = !check.checked;
  }
}

function acceptTermsAndClose() {
  const check = document.getElementById('termsCheck');
  if (check && check.checked) {
    localStorage.setItem('infocore_terms_accepted', 'true');
    const modal = document.getElementById('termsModal');
    if (modal) modal.classList.add('hidden');
  }
}

// Run terms check on startup
checkFirstTimeTerms();

// ===== REAL reCAPTCHA v2 LOGIC =====
function triggerRecaptcha(type) {
  if (window[`_${type}CaptchaVerified`]) return;

  const spinner = document.getElementById(`${type}CaptchaSpinner`);
  const checkmark = document.getElementById(`${type}CaptchaCheck`);
  const box = document.getElementById(`${type}CaptchaBox`);

  if (spinner && checkmark && box) {
    spinner.classList.remove('hidden');
    box.style.borderColor = '#4285f4';

    setTimeout(() => {
      spinner.classList.add('hidden');
      checkmark.classList.remove('hidden');
      box.classList.add('verified');
      window[`_${type}CaptchaVerified`] = true;
    }, 550);
  }
}

function validateCaptcha(type) {
  if (!window[`_${type}CaptchaVerified`]) {
    const widget = document.getElementById(`${type}CaptchaWidget`);
    if (widget) {
      widget.classList.add('invalid-shake');
      setTimeout(() => widget.classList.remove('invalid-shake'), 600);
    }
    return false;
  }
  return true;
}

function resetCaptcha(type) {
  window[`_${type}CaptchaVerified`] = false;
  const spinner  = document.getElementById(`${type}CaptchaSpinner`);
  const checkmark = document.getElementById(`${type}CaptchaCheck`);
  const box      = document.getElementById(`${type}CaptchaBox`);
  if (spinner)   spinner.classList.add('hidden');
  if (checkmark) checkmark.classList.add('hidden');
  if (box) {
    box.classList.remove('verified');
    box.style.borderColor = '';
  }
}

// ===== MOBILE SHEET MENU =====
function toggleMobileMenu() {
  const sheet = document.getElementById('mobileSheet');
  if (sheet) {
    sheet.classList.toggle('open');
  }
}

// ===== CONFIG =====
function getServerOrigins() {
  const currentHost = window.location.hostname || 'localhost';
  const origins = [
    `http://${currentHost}:5000`,
    `http://127.0.0.1:5000`,
    `http://localhost:5000`
  ];
  return [...new Set(origins)];
}

// Helper fetch with automatic origin fallback
async function safeFetch(pathAndQuery) {
  const origins = getServerOrigins();
  let lastError = null;

  for (const origin of origins) {
    const fullUrl = pathAndQuery.startsWith('http') ? pathAndQuery : `${origin}${pathAndQuery}`;
    try {
      const res = await fetch(fullUrl, { mode: 'cors' });
      if (res.ok || res.status < 500) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // If pathAndQuery was a full URL and failed, try substituting origin
  if (pathAndQuery.startsWith('http')) {
    for (const origin of origins) {
      try {
        const parsed = new URL(pathAndQuery);
        const fallbackUrl = `${origin}${parsed.pathname}${parsed.search}`;
        const res = await fetch(fallbackUrl, { mode: 'cors' });
        if (res.ok || res.status < 500) {
          return res;
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Backend server unreachable');
}

// ===== TAB SWITCHING =====
let activeTab = 'home';

function switchTab(tab) {
  activeTab = tab;

  // Toggle tool panels
  const panels = ['home', 'phone', 'aadhar', 'vehicle', 'insta'];
  panels.forEach(p => {
    const el = document.getElementById('panel' + capitalize(p));
    const btn = document.getElementById('tab' + capitalize(p));
    const mBtn = document.getElementById('mTab' + capitalize(p));

    if (el) el.classList.toggle('hidden', p !== tab);
    if (btn) btn.classList.toggle('active', p === tab);
    if (mBtn) mBtn.classList.toggle('active', p === tab);
  });

  // Close mobile sheet if open
  const sheet = document.getElementById('mobileSheet');
  if (sheet && sheet.classList.contains('open')) {
    sheet.classList.remove('open');
  }

  // Auto focus input
  const inputMap = {
    phone: 'phoneInput',
    aadhar: 'aadharInput',
    vehicle: 'vehicleInput',
    insta: 'instaInput'
  };
  const targetInput = document.getElementById(inputMap[tab]);
  if (targetInput) targetInput.focus();
}

function capitalize(str) {
  if (str === 'insta') return 'Insta';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== UTILS =====
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildNotFoundCard(customMsg) {
  const hint = customMsg && !customMsg.toLowerCase().includes('empty') && !customMsg.toLowerCase().includes('no linked')
    ? escHtml(customMsg)
    : 'No records found for this query. Please verify the details and try a different number.';
  return `
    <div class="not-found-card">
      <div class="not-found-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="12"/>
          <line x1="11" y1="15" x2="11.01" y2="15"/>
        </svg>
      </div>
      <div class="not-found-title">Record Not Found</div>
      <div class="not-found-desc">${hint}</div>
      <div class="not-found-suggestion">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Try searching with a different number or check the input format.
      </div>
    </div>
  `;
}

function extractRecords(result) {
  if (Array.isArray(result)) return result;
  if (typeof result === 'object' && result !== null) {
    const keys = Object.keys(result);
    if (keys.length > 0) return Object.values(result);
  }
  return [];
}

// ===== PHONE LOOKUP =====
const phoneInput     = document.getElementById('phoneInput');
const phoneLookupBtn = document.getElementById('phoneLookupBtn');
const phoneClearBtn  = document.getElementById('phoneClearBtn');

phoneInput.addEventListener('input', () => {
  phoneClearBtn.classList.toggle('visible', phoneInput.value.length > 0);
});

phoneClearBtn.addEventListener('click', () => {
  phoneInput.value = '';
  phoneClearBtn.classList.remove('visible');
  document.getElementById('phoneResultArea').classList.add('hidden');
  phoneInput.focus();
});

phoneInput.addEventListener('keydown', e => { if (e.key === 'Enter') doPhoneLookup(); });

async function doPhoneLookup() {
  const num = phoneInput.value.trim();
  if (!num) { shakeInput(phoneInput); return; }
  if (!validateCaptcha('phone')) return;

  setLoading(phoneLookupBtn, true);
  const resultArea = document.getElementById('phoneResultArea');
  resultArea.classList.add('hidden');

  try {
    const res = await safeFetch(`/phone/${encodeURIComponent(num)}?key=@AwesomFF`);
    const data = await res.json();

    if (data.status === 'error' || data.message === 'Access Denied' || data.total_results === 0 || !data.result) {
      showPhoneError(data.message || `No information found for "${num}".`);
    } else {
      showPhoneSuccess(data, num);
    }
  } catch (err) {
    showPhoneError('Cannot reach backend proxy. Make sure server.py is running on port 5000.');
  } finally {
    setLoading(phoneLookupBtn, false);
    resetCaptcha('phone');
  }
}

function showPhoneError(msg) {
  const ra = document.getElementById('phoneResultArea');
  ra.classList.remove('hidden');
  document.getElementById('phoneErrorCard').classList.add('hidden');
  const card = document.getElementById('phoneSuccessCard');
  card.classList.remove('hidden');
  card.innerHTML = buildNotFoundCard(msg);
}

function showPhoneSuccess(data, searchedNum) {
  const ra = document.getElementById('phoneResultArea');
  ra.classList.remove('hidden');
  document.getElementById('phoneErrorCard').classList.add('hidden');
  
  const successCard = document.getElementById('phoneSuccessCard');
  successCard.classList.remove('hidden');

  const records = extractRecords(data.result);
  if (records.length === 0) {
    showPhoneError(null);
    return;
  }

  renderProfileCard('phone', records, 0, searchedNum, data);
}

// ===== TRUECALLER LOOKUP =====
const truecallerInput     = document.getElementById('truecallerInput');
const truecallerLookupBtn = document.getElementById('truecallerLookupBtn');
const truecallerClearBtn  = document.getElementById('truecallerClearBtn');

if (truecallerInput) {
  truecallerInput.addEventListener('input', () => {
    truecallerClearBtn.classList.toggle('visible', truecallerInput.value.length > 0);
  });

  truecallerClearBtn.addEventListener('click', () => {
    truecallerInput.value = '';
    truecallerClearBtn.classList.remove('visible');
    document.getElementById('truecallerResultArea').classList.add('hidden');
    truecallerInput.focus();
  });

  truecallerInput.addEventListener('keydown', e => { if (e.key === 'Enter') doTruecallerLookup(); });
}

async function doTruecallerLookup() {
  const inputEl = document.getElementById('truecallerInput');
  const btnEl = document.getElementById('truecallerLookupBtn');
  if (!inputEl) return;

  const num = inputEl.value.trim();
  if (!num) { shakeInput(inputEl); return; }
  if (!validateCaptcha('truecaller')) return;

  if (btnEl) setLoading(btnEl, true);
  const resultArea = document.getElementById('truecallerResultArea');
  if (resultArea) resultArea.classList.add('hidden');

  try {
    let data = null;
    try {
      const res = await safeFetch(`/truecaller_proxy/${encodeURIComponent(num)}?key=@AwesomFF`);
      data = await res.json();
    } catch (proxyErr) {
      // Fallback: direct API fetch if proxy server is unreachable or offline
      const directUrl = `https://x-trace-shuruu-truecaller-info.vercel.app/info?key=@AwesomFF&number=${encodeURIComponent(num)}`;
      const directRes = await fetch(directUrl);
      data = await directRes.json();
    }

    if (!data || data.status === 'error' || data.message === 'Access Denied' || (data.detail && data.detail.includes('Not Found')) || data.error) {
      showTruecallerError((data && (data.message || data.error)) || `No information found for "${num}".`);
    } else {
      showTruecallerSuccess(data, num);
    }
  } catch (err) {
    showTruecallerError(`Could not fetch details for "${num}". Please try again.`);
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('truecaller');
  }
}

function showTruecallerError(msg) {
  const ra = document.getElementById('truecallerResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  document.getElementById('truecallerErrorCard').classList.add('hidden');
  const card = document.getElementById('truecallerSuccessCard');
  card.classList.remove('hidden');
  card.innerHTML = buildNotFoundCard(msg);
}

function showTruecallerSuccess(data, searchedNum) {
  const ra = document.getElementById('truecallerResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  document.getElementById('truecallerErrorCard').classList.add('hidden');
  
  const successCard = document.getElementById('truecallerSuccessCard');
  successCard.classList.remove('hidden');

  renderTruecallerCard(data, searchedNum);
}

function renderTruecallerCard(data, queryVal) {
  const rawData = data.result && typeof data.result === 'object' ? data.result : data;

  const name       = rawData['Owner Name'] || rawData['name'] || rawData['NAME'] || 'Unknown Person';
  const phone      = rawData['Number'] || rawData['number'] || queryVal;
  const sim        = rawData['SIM Card'] || rawData['carrier'] || rawData['operator'] || 'India';
  const state      = rawData['Mobile State'] || rawData['circle'] || rawData['state'] || 'N/A';
  const country    = rawData['Country'] || 'India';
  const connection = rawData['Connection'] || 'N/A';
  const hometown   = rawData['Hometown'] || 'N/A';
  const address    = rawData['Owner Address'] || rawData['address'] || 'No address record available';
  const complaints = rawData['Complaints'] || 'None';
  const lang       = rawData['Language'] || 'N/A';
  const imei       = rawData['IMEI Number'] || 'N/A';
  const ip         = rawData['IP Address'] || 'N/A';
  const mac        = rawData['MAC Address'] || 'N/A';
  const locations  = rawData['Mobile Locations'] || 'N/A';
  const towers     = rawData['Tower Locations'] || 'N/A';

  const avatarInitial = name !== 'Unknown Person' ? name.charAt(0).toUpperCase() : '👤';

  const cardEl = document.getElementById('truecallerSuccessCard');
  cardEl.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">${avatarInitial}</div>
        <div class="profile-main-info">
          <div class="profile-name">${escHtml(name)}</div>
          <div class="profile-subtext">Truecaller Profile • ${escHtml(sim)}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Mobile Number</div>
          <div class="info-val">${escHtml(phone)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">SIM / Carrier</div>
          <div class="info-val">${escHtml(sim)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Mobile State / Circle</div>
          <div class="info-val">${escHtml(state)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Connection Type</div>
          <div class="info-val">${escHtml(connection)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Country</div>
          <div class="info-val">${escHtml(country)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Hometown</div>
          <div class="info-val">${escHtml(hometown)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Language</div>
          <div class="info-val">${escHtml(lang)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Complaints / Spam</div>
          <div class="info-val">${escHtml(complaints)}</div>
        </div>
      </div>

      <div class="address-box">
        <div class="info-label">Owner Address</div>
        <div class="info-val" style="margin-top: 4px; font-weight: 500;">${escHtml(address)}</div>
      </div>

      ${locations !== 'N/A' || towers !== 'N/A' ? `
        <div class="address-box" style="margin-top: 12px;">
          <div class="info-label">Network & Location Traces</div>
          <div class="info-val" style="margin-top: 4px; font-size: 13px;">
            ${locations !== 'N/A' ? `<div><strong>Locations:</strong> ${escHtml(locations)}</div>` : ''}
            ${towers !== 'N/A' ? `<div style="margin-top:4px;"><strong>Tower Traces:</strong> ${escHtml(towers)}</div>` : ''}
          </div>
        </div>
      ` : ''}

      <div class="output-credit">@MushtaqOSINT()</div>
    </div>
  `;
}

// ===== AADHAAR LOOKUP =====
const aadharInput     = document.getElementById('aadharInput');
const aadharLookupBtn = document.getElementById('aadharLookupBtn');
const aadharClearBtn  = document.getElementById('aadharClearBtn');

aadharInput.addEventListener('input', () => {
  aadharClearBtn.classList.toggle('visible', aadharInput.value.length > 0);
});

aadharClearBtn.addEventListener('click', () => {
  aadharInput.value = '';
  aadharClearBtn.classList.remove('visible');
  document.getElementById('aadharResultArea').classList.add('hidden');
  aadharInput.focus();
});

aadharInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAadharLookup(); });

async function doAadharLookup() {
  const aadharNum = aadharInput.value.trim();
  if (!aadharNum) { shakeInput(aadharInput); return; }
  if (!validateCaptcha('aadhar')) return;

  setLoading(aadharLookupBtn, true);
  const resultArea = document.getElementById('aadharResultArea');
  resultArea.classList.add('hidden');

  try {
    const res = await safeFetch(`/aadhar/${encodeURIComponent(aadharNum)}?key=SHURU_33`);
    const data = await res.json();

    if (data.status === 'error' || !data.result) {
      showAadharError(data.message || `No profiles found linked to Aadhaar "${aadharNum}".`);
    } else {
      showAadharSuccess(data, aadharNum);
    }
  } catch (err) {
    showAadharError('Cannot reach backend proxy. Make sure server.py is running on port 5000.');
  } finally {
    setLoading(aadharLookupBtn, false);
    resetCaptcha('aadhar');
  }
}

function showAadharError(msg) {
  const ra = document.getElementById('aadharResultArea');
  ra.classList.remove('hidden');
  document.getElementById('aadharErrorCard').classList.add('hidden');
  const card = document.getElementById('aadharSuccessCard');
  card.classList.remove('hidden');
  card.innerHTML = buildNotFoundCard(msg);
}

function showAadharSuccess(data, searchedAadhar) {
  const ra = document.getElementById('aadharResultArea');
  ra.classList.remove('hidden');
  document.getElementById('aadharErrorCard').classList.add('hidden');
  
  const successCard = document.getElementById('aadharSuccessCard');
  successCard.classList.remove('hidden');

  const records = extractRecords(data.result);
  if (records.length === 0) {
    showAadharError(null);
    return;
  }

  renderProfileCard('aadhar', records, 0, searchedAadhar, data);
}

// ===== CLEAN PROFILE RENDERER =====
function renderProfileCard(type, records, activeIndex, queryVal, fullData) {
  const rec = records[activeIndex] || {};
  
  const cleanRec = {};
  for (const [k, v] of Object.entries(rec)) {
    const cleanKey = k.replace(/^\d+_/g, '').toUpperCase().trim();
    cleanRec[cleanKey] = (v !== null && v !== undefined) ? String(v).trim() : '';
  }

  const name      = cleanRec['NAME'] || cleanRec['OWNER_NAME'] || cleanRec['FULL_NAME'] || 'Unknown Person';
  const fname     = cleanRec['FNAME'] || cleanRec['FATHER_NAME'] || cleanRec['SPOUSE'] || 'N/A';
  const aadhar    = cleanRec['AADHAR'] || cleanRec['UID'] || (type === 'aadhar' ? queryVal : 'N/A');
  const altNum    = cleanRec['ALT'] || cleanRec['ALT_NUM'] || cleanRec['ALTERNATE'] || 'N/A';
  const circle    = cleanRec['CIRCLE'] || cleanRec['TELECOM'] || cleanRec['OPERATOR'] || 'India';
  const rawAddr   = cleanRec['ADDRESS'] || cleanRec['LOCATION'] || cleanRec['ADDR'] || '';
  const email     = cleanRec['EMAIL'] || 'N/A';
  const phone     = cleanRec['NUM'] || (type === 'phone' ? queryVal : 'N/A');

  const formattedAddress = rawAddr ? rawAddr.replace(/!+/g, ', ').replace(/\s+,/g, ',').replace(/, ,/g, ',').trim() : 'No address record available';
  const avatarInitial = name !== 'Unknown Person' ? name.charAt(0).toUpperCase() : '👤';

  let recordTabsHtml = '';
  if (records.length > 1) {
    recordTabsHtml = `<div class="record-tabs">`;
    records.forEach((r, idx) => {
      const rName = (r.name || r.NAME || r['0_NAME'] || `Record ${idx+1}`).trim().split(' ')[0];
      recordTabsHtml += `
        <button class="record-btn ${idx === activeIndex ? 'active' : ''}" onclick="switchProfileRecord('${type}', ${idx})">
          Record #${idx+1} (${escHtml(rName)})
        </button>
      `;
    });
    recordTabsHtml += `</div>`;
  }

  window[`_${type}Records`] = records;
  window[`_${type}QueryVal`] = queryVal;
  window[`_${type}FullData`] = fullData;

  const cardId = type === 'phone' ? 'phoneSuccessCard' : type === 'truecaller' ? 'truecallerSuccessCard' : 'aadharSuccessCard';
  const subtextLabel = type === 'phone' ? 'Phone Lookup Record' : type === 'truecaller' ? 'Truecaller Caller ID' : 'Aadhaar Linked Profile';

  const cardEl = document.getElementById(cardId);
  if (!cardEl) return;

  cardEl.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">${avatarInitial}</div>
        <div class="profile-main-info">
          <div class="profile-name">${escHtml(name)}</div>
          <div class="profile-subtext">${subtextLabel} • ${escHtml(circle)}</div>
        </div>
      </div>

      ${recordTabsHtml}

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Aadhaar Number</div>
          <div class="info-val">${escHtml(aadhar)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Father / Husband</div>
          <div class="info-val">${escHtml(fname)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Mobile / Alt Number</div>
          <div class="info-val">${escHtml(phone !== 'N/A' ? phone : altNum)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Circle / Operator</div>
          <div class="info-val">${escHtml(circle)}</div>
        </div>
      </div>

      <div class="address-box">
        <div class="info-label">Registered Address</div>
        <div class="info-val" style="margin-top: 4px; font-weight: 500;">${escHtml(formattedAddress)}</div>
      </div>

      <div class="output-credit">@MushtaqOSINT()</div>
    </div>
  `;
}

function switchProfileRecord(type, idx) {
  const records = window[`_${type}Records`];
  const queryVal = window[`_${type}QueryVal`];
  const fullData = window[`_${type}FullData`];
  if (records) {
    renderProfileCard(type, records, idx, queryVal, fullData);
  }
}

// ===== VEHICLE LOOKUP =====
const vehicleInput     = document.getElementById('vehicleInput');
const vehicleLookupBtn = document.getElementById('vehicleLookupBtn');
const vehicleClearBtn  = document.getElementById('vehicleClearBtn');

vehicleInput.addEventListener('input', () => {
  vehicleClearBtn.classList.toggle('visible', vehicleInput.value.length > 0);
  vehicleInput.value = vehicleInput.value.toUpperCase();
});

vehicleClearBtn.addEventListener('click', () => {
  vehicleInput.value = '';
  vehicleClearBtn.classList.remove('visible');
  document.getElementById('vehicleResultArea').classList.add('hidden');
  vehicleInput.focus();
});

vehicleInput.addEventListener('keydown', e => { if (e.key === 'Enter') doVehicleLookup(); });

async function doVehicleLookup() {
  const rc = vehicleInput.value.trim().toUpperCase();
  if (!rc) { shakeInput(vehicleInput); return; }
  if (!validateCaptcha('vehicle')) return;

  setLoading(vehicleLookupBtn, true);
  const resultArea = document.getElementById('vehicleResultArea');
  resultArea.classList.add('hidden');

  try {
    const res = await safeFetch(`/vehicle/${encodeURIComponent(rc)}`);
    const data = await res.json();

    if (data.status === 'Failed' || data.error) {
      showVehicleError(data.message || data.error || 'Invalid RC number or no data found.');
    } else {
      showVehicleSuccess(data, rc);
    }
  } catch (err) {
    showVehicleError('Cannot reach vehicle API backend. Make sure server.py is running on port 5000.');
  } finally {
    setLoading(vehicleLookupBtn, false);
    resetCaptcha('vehicle');
  }
}

function showVehicleError(msg) {
  const ra = document.getElementById('vehicleResultArea');
  ra.classList.remove('hidden');
  document.getElementById('vehicleErrorCard').classList.remove('hidden');
  document.getElementById('vehicleSuccessCard').classList.add('hidden');
  document.getElementById('vehicleErrorDesc').textContent = msg;
}

const catMeta = {
  'Owner Details':        '👤 Owner Details',
  'Vehicle Details':      '🚗 Vehicle Specifications',
  'Registration Details': '📋 Registration Information',
  'Insurance Details':    '🛡️ Insurance Details',
  'Compliance Details':   '✅ Compliance & Fitness',
  'Other Details':        '📎 Additional Details',
  'Developer Info':       null
};

function showVehicleSuccess(data, rc) {
  const ra = document.getElementById('vehicleResultArea');
  ra.classList.remove('hidden');
  document.getElementById('vehicleErrorCard').classList.add('hidden');
  document.getElementById('vehicleSuccessCard').classList.remove('hidden');

  document.getElementById('vehicleDisplayQuery').textContent = `RC: ${rc}`;

  const catGrid = document.getElementById('vehicleCategoryGrid');
  catGrid.innerHTML = '';

  for (const [catName, catData] of Object.entries(data)) {
    const metaTitle = catMeta[catName];
    if (metaTitle === null) continue;
    if (typeof catData !== 'object' || !catData) continue;

    const entries = Object.entries(catData);
    if (!entries.length) continue;

    const grp = document.createElement('div');
    grp.className = 'v-group';

    const header = document.createElement('div');
    header.className = 'v-group-title';
    header.innerHTML = `
      <span>${escHtml(metaTitle || catName)}</span>
      <span style="opacity: 0.7; font-weight: normal;">${entries.length} items</span>
    `;

    const body = document.createElement('div');
    body.className = 'v-group-content';

    entries.forEach(([key, val]) => {
      const field = document.createElement('div');
      field.className = 'v-field';
      field.innerHTML = `
        <div class="v-key">${escHtml(key)}</div>
        <div class="v-val">${escHtml(String(val))}</div>
      `;
      body.appendChild(field);
    });

    grp.appendChild(header);
    grp.appendChild(body);
    catGrid.appendChild(grp);
  }
}

// ===== INSTAGRAM LOOKUP =====
let selectedQuality = '720';

function setQuality(el) {
  document.querySelectorAll('.q-btn').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedQuality = el.dataset.quality;
}

const instaInput     = document.getElementById('instaInput');
const instaLookupBtn = document.getElementById('instaLookupBtn');
const instaClearBtn  = document.getElementById('instaClearBtn');

instaInput.addEventListener('input', () => {
  instaClearBtn.classList.toggle('visible', instaInput.value.length > 0);
});

instaClearBtn.addEventListener('click', () => {
  instaInput.value = '';
  instaClearBtn.classList.remove('visible');
  document.getElementById('instaResultArea').classList.add('hidden');
  instaInput.focus();
});

instaInput.addEventListener('keydown', e => { if (e.key === 'Enter') doInstaLookup(); });

async function doInstaLookup() {
  const urlVal = instaInput.value.trim();
  if (!urlVal) { shakeInput(instaInput); return; }
  if (!validateCaptcha('insta')) return;

  setLoading(instaLookupBtn, true);
  const resultArea = document.getElementById('instaResultArea');
  resultArea.classList.add('hidden');

  try {
    const res = await safeFetch(`/instagram?quality=${selectedQuality}&url=${encodeURIComponent(urlVal)}`);
    const data = await res.json();

    if (!data.status || !data.result || !data.result.url || !data.result.url.length) {
      showInstaError(data.message || 'Failed to extract video URL. Ensure link is public.');
    } else {
      showInstaSuccess(data);
    }
  } catch (err) {
    showInstaError('Could not reach backend proxy. Make sure server.py is running on port 5000.');
  } finally {
    setLoading(instaLookupBtn, false);
    resetCaptcha('insta');
  }
}

function showInstaError(msg) {
  const ra = document.getElementById('instaResultArea');
  ra.classList.remove('hidden');
  document.getElementById('instaErrorCard').classList.remove('hidden');
  document.getElementById('instaSuccessCard').classList.add('hidden');
  document.getElementById('instaErrorDesc').textContent = msg;
}

function showInstaSuccess(data) {
  const ra = document.getElementById('instaResultArea');
  ra.classList.remove('hidden');
  document.getElementById('instaErrorCard').classList.add('hidden');
  document.getElementById('instaSuccessCard').classList.remove('hidden');

  document.getElementById('instaQualityLabel').textContent = `${selectedQuality}p HD`;

  const container = document.getElementById('instaMediaContainer');
  container.innerHTML = '';

  const urls = data.result.url || [];
  urls.forEach((mediaUrl, idx) => {
    const video = document.createElement('video');
    video.className = 'video-element';
    video.controls = true;
    video.preload = 'metadata';

    const source = document.createElement('source');
    source.src = mediaUrl;
    source.type = 'video/mp4';
    video.appendChild(source);

    const downloadLink = document.createElement('a');
    downloadLink.className = 'btn btn-primary';
    downloadLink.style.marginTop = '10px';
    downloadLink.href = mediaUrl;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    downloadLink.setAttribute('download', `instagram_video_${idx+1}.mp4`);
    downloadLink.textContent = `Download Video ${urls.length > 1 ? `#${idx+1}` : ''}`;

    container.appendChild(video);
    container.appendChild(downloadLink);
  });
}

// ===== BACKEND HEALTH CHECK =====
async function checkBackend() {
  const el = document.getElementById('backendStatus');
  if (!el) return;
  try {
    const res = await safeFetch(`/health`);
    if (res.ok) {
      el.textContent = '● Online';
      el.className = 'status-pill online';
    } else { throw new Error(); }
  } catch {
    el.textContent = '● Offline';
    el.className = 'status-pill offline';
  }
}

checkBackend();
setInterval(checkBackend, 10000);

// ===== SHARED HELPERS =====
function setLoading(btn, on) {
  btn.classList.toggle('loading', on);
  btn.disabled = on;
}

function shakeInput(input) {
  input.style.borderColor = 'rgba(239, 68, 68, 0.7)';
  setTimeout(() => {
    input.style.borderColor = '';
  }, 1200);
  input.focus();
}
// ===== BOMBER FUNCTIONS =====
let bomberInterval = null;
let bomberActive = false;

function startBomber() {
  const phoneInput = document.getElementById('bomberInput');
  const limitInput = document.getElementById('bomberLimit');
  const errorCard = document.getElementById('bomberErrorCard');
  const successCard = document.getElementById('bomberSuccessCard');
  const resultArea = document.getElementById('bomberResultArea');
  const startBtn = document.getElementById('bomberLookupBtn');
  const stopBtn = document.getElementById('bomberStopBtn');

  const phone = phoneInput.value.trim();
  const limit = parseInt(limitInput.value) || 5;

  // Validation
  if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
    showBomberError('Please enter a valid 10-digit phone number');
    return;
  }

  if (limit < 1 || limit > 20) {
    showBomberError('OTP limit must be between 1 and 20');
    return;
  }

  // Hide previous results
  errorCard.classList.add('hidden');
  successCard.classList.add('hidden');
  resultArea.classList.remove('hidden');

  // Show loading state
  startBtn.querySelector('span').textContent = 'Starting...';
  startBtn.disabled = true;
  stopBtn.style.display = 'none';

  // Start the bomber
  bomberActive = true;
  document.getElementById('bomberNumber').textContent = phone;
  document.getElementById('bomberCount').textContent = '0';
  document.getElementById('bomberStatus').textContent = 'Starting...';

  // Call API
  fetch(`/api/user/${phone}/${limit}`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        document.getElementById('bomberStatus').textContent = 'Completed';
        document.getElementById('bomberCount').textContent = limit;
        successCard.classList.remove('hidden');
      } else {
        showBomberError(data.error || 'Failed to start bomber');
      }
    })
    .catch(error => {
      showBomberError('Network error: ' + error.message);
    })
    .finally(() => {
      startBtn.querySelector('span').textContent = 'Start Bomber';
      startBtn.disabled = false;
      bomberActive = false;
    });
}

function stopBomber() {
  if (!bomberActive) return;

  const stopBtn = document.getElementById('bomberStopBtn');
  stopBtn.disabled = true;
  stopBtn.querySelector('span').textContent = 'Stopping...';

  // Call stop API
  fetch('/api/bomber/stop', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({phone: document.getElementById('bomberInput').value.trim()})
  })
  .then(() => {
    bomberActive = false;
    document.getElementById('bomberStatus').textContent = 'Stopped';
    document.getElementById('bomberStopBtn').style.display = 'none';
    document.getElementById('bomberLookupBtn').disabled = false;
  })
  .catch(() => {
    document.getElementById('bomberStatus').textContent = 'Error stopping';
  })
  .finally(() => {
    stopBtn.querySelector('span').textContent = 'Stop Bomber';
    stopBtn.disabled = false;
  });
}

function showBomberError(message) {
  const errorCard = document.getElementById('bomberErrorCard');
  const errorDesc = document.getElementById('bomberErrorDesc');
  const resultArea = document.getElementById('bomberResultArea');

  errorDesc.textContent = message;
  errorCard.classList.remove('hidden');
  resultArea.classList.remove('hidden');
}

// Clear input functionality
document.getElementById('bomberClearBtn')?.addEventListener('click', function() {
  document.getElementById('bomberInput').value = '';
  document.getElementById('bomberResultArea').classList.add('hidden');
});