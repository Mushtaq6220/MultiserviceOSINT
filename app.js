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
  const origins = [];
  if (window.location.origin && window.location.origin !== 'null') {
    origins.push(window.location.origin);
  }
  const currentHost = window.location.hostname || 'localhost';
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    origins.push(`http://${currentHost}:5000`);
    origins.push(`https://${currentHost}`);
  }
  origins.push('http://localhost:5000');
  origins.push('http://127.0.0.1:5000');
  return [...new Set(origins)];
}

// Helper fetch with automatic origin fallback
async function safeFetch(pathAndQuery) {
  // If relative path, try direct fetch first (works on Render, custom domains, and mobile web browsers)
  if (pathAndQuery.startsWith('/')) {
    try {
      const res = await fetch(pathAndQuery);
      if (res.ok || res.status < 500) {
        return res;
      }
    } catch (err) {
      console.warn('Relative fetch failed, trying full origins fallback:', err);
    }
  }

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
  if (!result) return [];

  if (typeof result === 'string') {
    try { result = JSON.parse(result); } catch (e) {}
  }

  if (Array.isArray(result)) return result;

  if (typeof result === 'object' && result !== null) {
    // Handle nested format like {"0": {...}, "1": {...}}
    const numericKeys = Object.keys(result).filter(k => /^\d+$/.test(k));
    if (numericKeys.length > 0) {
      return numericKeys.map(k => result[k]);
    }
    // If result contains nested objects under keys like "0", "1", "data", etc.
    const values = Object.values(result).filter(val => typeof val === 'object' && val !== null);
    if (values.length > 0) return values;
    // Otherwise treat result itself as a single record
    return [result];
  }

  return [];
}

// ===== AADHAAR LOOKUP =====
function setupAadharListeners() {
  const aadharInput = document.getElementById('aadharInput');
  const aadharClearBtn = document.getElementById('aadharClearBtn');
  if (aadharInput && aadharClearBtn) {
    aadharInput.addEventListener('input', () => {
      aadharClearBtn.classList.toggle('visible', aadharInput.value.length > 0);
    });
    aadharClearBtn.addEventListener('click', () => {
      aadharInput.value = '';
      aadharClearBtn.classList.remove('visible');
      const ra = document.getElementById('aadharResultArea');
      if (ra) ra.classList.add('hidden');
      aadharInput.focus();
    });
    aadharInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAadharLookup(); });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAadharListeners);
} else {
  setupAadharListeners();
}

async function doAadharLookup() {
  const inputEl = document.getElementById('aadharInput');
  const btnEl = document.getElementById('aadharLookupBtn');
  if (!inputEl) return;

  const aadharNum = inputEl.value.trim();
  if (!aadharNum) { shakeInput(inputEl); return; }
  if (!validateCaptcha('aadhar')) return;

  if (btnEl) setLoading(btnEl, true);
  const resultArea = document.getElementById('aadharResultArea');
  if (resultArea) resultArea.classList.add('hidden');

  try {
    let data = null;

    // Call backend proxy first
    try {
      const res = await safeFetch(`/aadhar/${encodeURIComponent(aadharNum)}?key=@AwesomFF`);
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      console.error('Backend Aadhaar proxy error:', e);
    }

    // Direct fallbacks if proxy returns error or no data
    if (!data || data.status === 'error' || !data.result) {
      if (aadharNum.length === 10 && /^\d+$/.test(aadharNum)) {
        try {
          const res = await safeFetch(`/phone/${encodeURIComponent(aadharNum)}?key=@AwesomFF`);
          if (res.ok) data = await res.json();
        } catch (e) {}
      }
    }

    let records = [];
    if (data) {
      if (data.result) {
        records = extractRecords(data.result);
      }
      if (records.length === 0 && data.data) records = extractRecords(data.data);
      if (records.length === 0 && (data.name || data.fname || data.aadhar || data.num)) records = [data];
    }

    if (!data || records.length === 0 || data.status === 'error') {
      showAadharError((data && data.message) || `No profile found for Aadhaar '${aadharNum}'.`);
    } else {
      showAadharSuccess(data, aadharNum, records);
    }
  } catch (err) {
    showAadharError(`No profile found for Aadhaar '${aadharNum}'.`);
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('aadhar');
  }
}

function showAadharError(msg) {
  const ra = document.getElementById('aadharResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('aadharErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const card = document.getElementById('aadharSuccessCard');
  if (card) {
    card.classList.remove('hidden');
    card.innerHTML = buildNotFoundCard(msg);
  }
}

function showAadharSuccess(data, searchedAadhar, records) {
  const ra = document.getElementById('aadharResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('aadharErrorCard');
  if (errCard) errCard.classList.add('hidden');
  
  const successCard = document.getElementById('aadharSuccessCard');
  if (successCard) successCard.classList.remove('hidden');

  let recs = records;
  if (!recs || recs.length === 0) {
    recs = extractRecords(data.result || data.data || data);
  }

  if (!recs || recs.length === 0) {
    showAadharError(`No profile found for Aadhaar '${searchedAadhar}'.`);
    return;
  }

  renderProfileCard('aadhar', recs, 0, searchedAadhar, data);
}

// ===== PHONE LOOKUP =====
const phoneInput     = document.getElementById('phoneInput');
const phoneLookupBtn = document.getElementById('phoneLookupBtn');
const phoneClearBtn  = document.getElementById('phoneClearBtn');

if (phoneInput && phoneClearBtn) {
  phoneInput.addEventListener('input', () => {
    phoneClearBtn.classList.toggle('visible', phoneInput.value.length > 0);
  });

  phoneClearBtn.addEventListener('click', () => {
    phoneInput.value = '';
    phoneClearBtn.classList.remove('visible');
    const ra = document.getElementById('phoneResultArea');
    if (ra) ra.classList.add('hidden');
    phoneInput.focus();
  });

  phoneInput.addEventListener('keydown', e => { if (e.key === 'Enter') doPhoneLookup(); });
}

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

if (aadharInput && aadharClearBtn) {
  aadharInput.addEventListener('input', () => {
    aadharClearBtn.classList.toggle('visible', aadharInput.value.length > 0);
  });

  aadharClearBtn.addEventListener('click', () => {
    aadharInput.value = '';
    aadharClearBtn.classList.remove('visible');
    const ra = document.getElementById('aadharResultArea');
    if (ra) ra.classList.add('hidden');
    aadharInput.focus();
  });

  aadharInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAadharLookup(); });
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
if (vehicleInput && vehicleClearBtn) {
  vehicleInput.addEventListener('input', () => {
    vehicleClearBtn.classList.toggle('visible', vehicleInput.value.length > 0);
    vehicleInput.value = vehicleInput.value.toUpperCase();
  });

  vehicleClearBtn.addEventListener('click', () => {
    vehicleInput.value = '';
    vehicleClearBtn.classList.remove('visible');
    const ra = document.getElementById('vehicleResultArea');
    if (ra) ra.classList.add('hidden');
    vehicleInput.focus();
  });

  vehicleInput.addEventListener('keydown', e => { if (e.key === 'Enter') doVehicleLookup(); });
}

async function doVehicleLookup() {
  const inputEl = document.getElementById('vehicleInput');
  const btnEl = document.getElementById('vehicleLookupBtn');
  if (!inputEl) return;

  const rc = inputEl.value.trim().toUpperCase();
  if (!rc) { shakeInput(inputEl); return; }
  if (!validateCaptcha('vehicle')) return;

  if (btnEl) setLoading(btnEl, true);
  const resultArea = document.getElementById('vehicleResultArea');
  if (resultArea) resultArea.classList.add('hidden');

  try {
    let data = null;
    try {
      const res = await safeFetch(`/vehicle/${encodeURIComponent(rc)}?key=@AwesomFF`);
      data = await res.json();
    } catch (proxyErr) {
      // Direct Vercel API Fallback
      const fallbackUrl = `https://x-trace-shruu-vehicle-full-info.vercel.app/api?key=@AwesomFF&search=${encodeURIComponent(rc)}`;
      const res = await fetch(fallbackUrl);
      data = await res.json();
    }

    if (!data || data.error || (data.status && data.status !== '100' && data.status !== '1')) {
      showVehicleError((data && (data.message || data.error)) || 'Invalid RC number or no details found.');
    } else {
      showVehicleSuccess(data, rc);
    }
  } catch (err) {
    showVehicleError('Failed to fetch data from source. Please check the RC format.');
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('vehicle');
  }
}

function showVehicleError(msg) {
  const ra = document.getElementById('vehicleResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('vehicleErrorCard');
  if (errCard) errCard.classList.remove('hidden');
  const succCard = document.getElementById('vehicleSuccessCard');
  if (succCard) succCard.classList.add('hidden');
  const errDesc = document.getElementById('vehicleErrorDesc');
  if (errDesc) errDesc.textContent = msg;
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
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('vehicleErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const succCard = document.getElementById('vehicleSuccessCard');
  if (succCard) succCard.classList.remove('hidden');

  // Support both direct response payload and legacy format
  const resp = data.response || data;

  const owner       = resp.owner || (data['Owner Details'] && data['Owner Details']['Owner Name']) || 'N/A';
  const fatherName  = resp.ownerFatherName || (data['Owner Details'] && data['Owner Details']["Father's Name"]) || 'N/A';
  const regNo       = resp.regNo || rc;
  const vehicleName = resp.vehicle || resp.variant || (data['Vehicle Details'] && data['Vehicle Details']['Maker Model']) || 'N/A';
  const vehicleClass= resp.vehicleClass || 'N/A';
  const fuelType    = resp.fuelType || resp.fuelid || 'N/A';
  const engine      = resp.engine || 'N/A';
  const chassis     = resp.chassis || 'N/A';
  const regDate     = resp.regDate || 'N/A';
  const rtoName     = resp.rtoName || (resp.rtoData && resp.rtoData.rtoName) || 'N/A';
  const state       = resp.statename || 'N/A';
  const insuranceCo = resp.insuranceCompanyName || 'N/A';
  const insuranceUp = resp.insuranceUpto || 'N/A';
  const address     = resp.presentAddress || resp.permAddress || 'N/A';

  succCard.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">🚗</div>
        <div class="profile-main-info">
          <div class="profile-name">${escHtml(owner)}</div>
          <div class="profile-subtext">Vehicle Owner • RC: ${escHtml(regNo)}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Vehicle Model</div>
          <div class="info-val">${escHtml(vehicleName)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Father's Name</div>
          <div class="info-val">${escHtml(fatherName)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Vehicle Class / Fuel</div>
          <div class="info-val">${escHtml(vehicleClass)} (${escHtml(fuelType)})</div>
        </div>

        <div class="info-item">
          <div class="info-label">RTO Authority</div>
          <div class="info-val">${escHtml(rtoName)} (${escHtml(state)})</div>
        </div>

        <div class="info-item">
          <div class="info-label">Engine Number</div>
          <div class="info-val">${escHtml(engine)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Chassis Number</div>
          <div class="info-val">${escHtml(chassis)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Registration Date</div>
          <div class="info-val">${escHtml(regDate)}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Insurance Status</div>
          <div class="info-val">${escHtml(insuranceCo)} (Upto: ${escHtml(insuranceUp)})</div>
        </div>
      </div>

      ${address !== 'N/A' ? `
        <div class="address-box">
          <div class="info-label">Owner Registered Address</div>
          <div class="info-val" style="margin-top: 4px; font-weight: 500;">${escHtml(address)}</div>
        </div>
      ` : ''}

      <div class="output-credit">@MushtaqOSINT()</div>
    </div>
  `;
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

// ===== BOMBER SERVER SELECTION MODAL =====
function openServerModal() {
  const modal = document.getElementById('serverModal');
  if (modal) modal.classList.remove('hidden');
}

function closeServerModal() {
  const modal = document.getElementById('serverModal');
  if (modal) modal.classList.add('hidden');
}

document.addEventListener('click', function(e) {
  const modal = document.getElementById('serverModal');
  if (modal && e.target === modal) {
    closeServerModal();
  }
});

// ===== NETFLIX COOKIE SUITE FRONTEND INTERACTION =====
function toggleNetflixFeature(el) {
  if (el) el.classList.toggle('active');
}

function doNetflixSubmit() {
  const cookieInput = document.getElementById('netflixCookieInput');
  const btnEl = document.getElementById('netflixSubmitBtn');
  if (!cookieInput) return;

  const cookieVal = cookieInput.value.trim();
  if (!cookieVal) {
    shakeInput(cookieInput);
    return;
  }

  if (!validateCaptcha('netflix')) return;

  // Get active selected features
  const activePills = document.querySelectorAll('.nf-pill-option.active');
  const selectedFeatures = Array.from(activePills).map(p => p.querySelector('.nf-pill-text')?.textContent || '').filter(Boolean);

  if (selectedFeatures.length === 0) {
    alert('Please select at least one feature to process.');
    return;
  }

  if (btnEl) setLoading(btnEl, true);

  setTimeout(() => {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('netflix');

    const resultArea = document.getElementById('netflixResultArea');
    const successCard = document.getElementById('netflixSuccessCard');
    if (resultArea && successCard) {
      resultArea.classList.remove('hidden');
      successCard.classList.remove('hidden');

      // Validate JSON format
      let isJson = false;
      try {
        JSON.parse(cookieVal);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      if (!isJson) {
        successCard.innerHTML = buildNotFoundCard("Invalid JSON cookie format! Please paste valid JSON formatted Netflix cookies.");
        return;
      }

      // If valid JSON, backend is under maintenance / not ready yet error popup
      successCard.innerHTML = buildNotFoundCard("Backend service for Netflix Cookie Suite is under maintenance. Backend integration is not ready yet.");
    }
  }, 500);
}

// ===== PAN CARD LOOKUP =====
(function setupPanListeners() {
  const panInput = document.getElementById('panInput');
  const panClearBtn = document.getElementById('panClearBtn');
  if (panInput) {
    panInput.addEventListener('input', () => {
      panInput.value = panInput.value.toUpperCase();
      if (panClearBtn) panClearBtn.style.display = panInput.value.length > 0 ? 'flex' : 'none';
    });
    panInput.addEventListener('keydown', e => { if (e.key === 'Enter') doPanLookup(); });
  }
})();

function clearPanInput() {
  const panInput = document.getElementById('panInput');
  const panClearBtn = document.getElementById('panClearBtn');
  if (panInput) panInput.value = '';
  if (panClearBtn) panClearBtn.style.display = 'none';
  const ra = document.getElementById('panResultArea');
  if (ra) ra.classList.add('hidden');
  if (panInput) panInput.focus();
}

async function doPanLookup() {
  const inputEl = document.getElementById('panInput');
  const btnEl = document.getElementById('panLookupBtn');
  if (!inputEl) return;

  const pan = inputEl.value.trim().toUpperCase();
  if (!pan) { shakeInput(inputEl); return; }

  // Basic PAN format validation: 5 letters, 4 digits, 1 letter
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    shakeInput(inputEl);
    showPanError('Invalid PAN format. PAN must be like ABCDE1234F (5 letters, 4 digits, 1 letter).');
    return;
  }

  if (!validateCaptcha('pan')) return;

  if (btnEl) setLoading(btnEl, true);
  const resultArea = document.getElementById('panResultArea');
  if (resultArea) resultArea.classList.add('hidden');

  try {
    const res = await safeFetch(`/pan_lookup/${encodeURIComponent(pan)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data) {
      showPanSuccess(data, pan);
    } else {
      showPanError(data.message || `No PAN record found for '${pan}'.`);
    }
  } catch (err) {
    showPanError(`Could not fetch details for '${pan}'. Please try again.`);
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('pan');
  }
}

function showPanError(msg) {
  const ra = document.getElementById('panResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('panErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const card = document.getElementById('panSuccessCard');
  if (card) {
    card.classList.remove('hidden');
    card.innerHTML = buildNotFoundCard(msg);
  }
}

function showPanSuccess(data, queryPan) {
  const ra = document.getElementById('panResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('panErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const card = document.getElementById('panSuccessCard');
  if (!card) return;
  card.classList.remove('hidden');
  renderPanCard(card, data.data, queryPan);
}

function renderPanCard(cardEl, d, queryPan) {
  const name       = escHtml(d.customerName || (d.firstName + (d.middleName ? ' ' + d.middleName : '') + ' ' + d.lastName) || 'N/A');
  const firstName  = escHtml(d.firstName || 'N/A');
  const middleName = escHtml(d.middleName || '—');
  const lastName   = escHtml(d.lastName || 'N/A');
  const dob        = escHtml(d.dob || 'N/A');
  const status     = escHtml(d.panStatus || 'N/A');
  const pan        = escHtml(queryPan);
  const avatarInitial = (d.firstName || d.customerName || 'P').charAt(0).toUpperCase();

  const statusColor = status === 'VALID' ? '#22c55e' : '#ef4444';
  const statusBg    = status === 'VALID' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
  const statusBorder= status === 'VALID' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';

  cardEl.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">${avatarInitial}</div>
        <div class="profile-main-info">
          <div class="profile-name">${name}</div>
          <div class="profile-subtext">PAN Card Holder</div>
        </div>
        <div style="margin-left:auto;">
          <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:${statusBg};border:1px solid ${statusBorder};border-radius:20px;color:${statusColor};font-weight:700;font-size:0.78rem;">
            <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};display:inline-block;"></span>
            ${status}
          </span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">PAN Number</div>
          <div class="info-val" style="font-family:monospace;letter-spacing:1.5px;font-weight:700;">${pan}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Full Name</div>
          <div class="info-val">${name}</div>
        </div>

        <div class="info-item">
          <div class="info-label">First Name</div>
          <div class="info-val">${firstName}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Middle Name</div>
          <div class="info-val">${middleName}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Last Name</div>
          <div class="info-val">${lastName}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-val">${dob}</div>
        </div>

        <div class="info-item">
          <div class="info-label">PAN Status</div>
          <div class="info-val" style="color:${statusColor};font-weight:700;">${status}</div>
        </div>
      </div>

      <div class="credits-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
        Mushtaq_OSINT_DEV
      </div>
    </div>
  `;
}

// ===== INSTA INFO SUBMIT HANDLER =====
function handleInstaInfoSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('instaUsernameInput');
  const captchaCb = document.getElementById('instaCaptcha');
  const btnEl = document.getElementById('instaInfoSubmitBtn');
  const noticeEl = document.getElementById('instaInfoNotice');

  const val = inputEl ? inputEl.value.trim() : '';
  if (!val) {
    if (inputEl) shakeInput(inputEl);
    return;
  }

  if (captchaCb && !captchaCb.checked) {
    alert('Please verify the reCAPTCHA checkbox.');
    return;
  }

  if (btnEl) setLoading(btnEl, true);

  setTimeout(() => {
    if (btnEl) setLoading(btnEl, false);
    if (captchaCb) captchaCb.checked = false;
    if (noticeEl) {
      noticeEl.classList.remove('hidden');
      noticeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 400);
}

// ===== NAVBAR DROPDOWN TOGGLE =====
function toggleNavDropdown(event) {
  event.preventDefault();
  event.stopPropagation();
  const wrapper = event.currentTarget.closest('.nav-dropdown-wrapper');
  if (wrapper) {
    document.querySelectorAll('.nav-dropdown-wrapper.open').forEach(other => {
      if (other !== wrapper) other.classList.remove('open');
    });
    wrapper.classList.toggle('open');
  }
}

document.addEventListener('click', function(e) {
  const wrappers = document.querySelectorAll('.nav-dropdown-wrapper');
  wrappers.forEach(w => {
    if (!w.contains(e.target)) {
      w.classList.remove('open');
    }
  });
});

// ===== MOBILE MORE ACCORDION TOGGLE =====
function toggleMobileMore(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const section = document.querySelector('.mobile-more-section');
  const submenu = document.getElementById('mobileMoreSubmenu');
  if (section && submenu) {
    section.classList.toggle('open');
    submenu.classList.toggle('hidden');
  }
}