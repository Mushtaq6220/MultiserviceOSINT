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

    // Support both { status: true, result: [...] } and { success: true, results: [...] }
    const resultPayload = data.result || data.results || data.data || null;
    const hasData = (data.status === true || data.status === 'true' || data.success === true || data.success === 'true') && resultPayload;
    
    let records = extractRecords(resultPayload);
    
    // Fallback: If no records found from main API and num is 12 digits (Aadhaar), try Aadhaar API
    if ((!hasData || records.length === 0) && num.length === 12 && /^\d+$/.test(num)) {
      try {
        const aadharRes = await safeFetch(`/aadhar/${encodeURIComponent(num)}?key=@AwesomFF`);
        if (aadharRes.ok) {
          const aadharData = await aadharRes.json();
          if (aadharData && aadharData.result) {
            records = extractRecords(aadharData.result);
          }
        }
      } catch (e) {}
    }

    if (records.length === 0 || data.message === 'Access Denied') {
      showPhoneError(data.message || `No information found for "${num}".`);
    } else {
      showPhoneSuccess({ ...data, result: records }, num);
    }
  } catch (err) {
    showPhoneError('Cannot reach backend proxy. Make sure the server is running.');
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

  const name      = cleanRec['NAME'] || cleanRec['OWNER_NAME'] || cleanRec['FULL_NAME'] || cleanRec['CUSTOMER_NAME'] || 'Unknown Person';
  const fname     = cleanRec['FNAME'] || cleanRec['FATHER_NAME'] || cleanRec['FATHER_HUSBAND_NAME'] || cleanRec['SPOUSE'] || 'N/A';
  
  // Extract Aadhaar UID from all possible API response keys: AADHAR, AADHAAR, UID, ID, AADHAAR_NO, AADHAR_NO
  let aadharRaw   = cleanRec['AADHAR'] || cleanRec['AADHAAR'] || cleanRec['UID'] || cleanRec['ID'] || cleanRec['AADHAAR_NO'] || cleanRec['AADHAR_NO'] || cleanRec['ID_NUM'] || (type === 'aadhar' ? queryVal : 'N/A');
  
  // Validate/format Aadhaar UID if present
  let aadhar = 'N/A';
  if (aadharRaw && aadharRaw !== 'N/A' && aadharRaw !== 'null') {
    const digitsOnly = aadharRaw.replace(/\D/g, '');
    if (digitsOnly.length === 12) {
      aadhar = `${digitsOnly.slice(0,4)} ${digitsOnly.slice(4,8)} ${digitsOnly.slice(8,12)}`;
    } else {
      aadhar = aadharRaw;
    }
  }

  const altNum    = cleanRec['ALT'] || cleanRec['ALT_NUM'] || cleanRec['ALTERNATE'] || cleanRec['ALT_MOBILE'] || 'N/A';
  const circle    = cleanRec['CIRCLE'] || cleanRec['TELECOM'] || cleanRec['OPERATOR'] || cleanRec['CIRCLE_OPERATOR'] || 'India';
  const rawAddr   = cleanRec['ADDRESS'] || cleanRec['LOCATION'] || cleanRec['ADDR'] || cleanRec['OWNER_ADDRESS'] || '';
  const email     = cleanRec['EMAIL'] || cleanRec['EMAIL_ID'] || 'N/A';
  const phone     = cleanRec['NUM'] || cleanRec['MOBILE'] || cleanRec['PHONE'] || cleanRec['NUMBER'] || (type === 'phone' ? queryVal : 'N/A');

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

  const isAadharValid = aadhar !== 'N/A';

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
          <div class="info-val" style="${isAadharValid ? 'font-family:monospace;letter-spacing:1px;font-weight:700;color:var(--accent-color);' : ''}">
            ${isAadharValid ? '🪪 ' + escHtml(aadhar) : 'N/A'}
          </div>
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

    // API returns { response: {...}, regNo, ... } — check for response object presence
    if (!data || data.error || (!data.response && !data['Owner Details'])) {
      showVehicleError((data && (data.message || data.error)) || 'Invalid RC number or no vehicle details found.');
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
// ===== VEHICLE OWNER MOBILE NUMBER LOOKUP (SECTION 2) =====
(function setupVehicleNumListeners() {
  const inputEl  = document.getElementById('vehicleNumInput');
  const clearBtn = document.getElementById('vehicleNumClearBtn');
  if (!inputEl) return;

  inputEl.addEventListener('input', () => {
    if (clearBtn) clearBtn.style.display = inputEl.value.length > 0 ? 'inline-flex' : 'none';
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') doVehicleNumLookup();
  });

  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      clearBtn.style.display = 'none';
      const ra = document.getElementById('vehicleNumResultArea');
      if (ra) ra.classList.add('hidden');
      inputEl.focus();
    });
  }
})();

async function doVehicleNumLookup() {
  const inputEl = document.getElementById('vehicleNumInput');
  const btnEl   = document.getElementById('vehicleNumLookupBtn');
  if (!inputEl) return;

  const rc = inputEl.value.trim().toUpperCase().replace(/\s+/g, '');
  if (!rc) { shakeInput(inputEl); return; }
  if (!validateCaptcha('vehicleNum')) return;

  if (btnEl) setLoading(btnEl, true);
  const ra = document.getElementById('vehicleNumResultArea');
  if (ra) ra.classList.add('hidden');

  try {
    const res  = await safeFetch(`/vehicle_num/${encodeURIComponent(rc)}`);
    const data = await res.json();

    if (data && (data.success || data.mobile_no || data.owner)) {
      showVehicleNumSuccess(data, rc);
    } else {
      showVehicleNumError((data && data.message) || `No linked mobile number found for vehicle '${rc}'.`);
    }
  } catch (err) {
    showVehicleNumError('Could not fetch vehicle owner mobile details. Please try again.');
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('vehicleNum');
  }
}

function showVehicleNumError(msg) {
  const ra = document.getElementById('vehicleNumResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('vehicleNumErrorCard');
  if (errCard) errCard.classList.remove('hidden');
  const succCard = document.getElementById('vehicleNumSuccessCard');
  if (succCard) succCard.classList.add('hidden');
  const errDesc = document.getElementById('vehicleNumErrorDesc');
  if (errDesc) errDesc.textContent = msg;
}

function showVehicleNumSuccess(data, rc) {
  const ra = document.getElementById('vehicleNumResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard  = document.getElementById('vehicleNumErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const succCard = document.getElementById('vehicleNumSuccessCard');
  if (!succCard) return;
  succCard.classList.remove('hidden');

  const ownerName = escHtml(data.owner || 'Vehicle Owner');
  const vehicleNo = escHtml(data.vnum || rc);
  const mobileNo  = escHtml(data.mobile_no || 'N/A');

  succCard.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">🚗</div>
        <div class="profile-main-info">
          <div class="profile-name">${ownerName}</div>
          <div class="profile-subtext">Vehicle: <strong>${vehicleNo}</strong></div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Vehicle Registration</div>
          <div class="info-val">${vehicleNo}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Linked Mobile Number</div>
          <div class="info-val" style="color:var(--accent-color);font-weight:700;font-size:1.05rem;">
            📞 <a href="tel:${mobileNo}" style="color:inherit;text-decoration:none;">${mobileNo}</a>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Owner Name</div>
          <div class="info-val">${ownerName}</div>
        </div>
      </div>
      <div class="credits-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
        Mushtaq_OSINT
      </div>
    </div>
  `;
}

// ===== WEBSITE SOURCE SCRAPER =====
(function setupWebSourceListeners() {
  const inputEl  = document.getElementById('webSourceInput');
  const clearBtn = document.getElementById('webSourceClearBtn');
  if (!inputEl) return;

  inputEl.addEventListener('input', () => {
    if (clearBtn) clearBtn.style.display = inputEl.value.length > 0 ? 'inline-flex' : 'none';
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') doWebsiteSourceLookup();
  });

  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      clearBtn.style.display = 'none';
      const ra = document.getElementById('webSourceResultArea');
      if (ra) ra.classList.add('hidden');
      inputEl.focus();
    });
  }
})();

async function doWebsiteSourceLookup() {
  const inputEl = document.getElementById('webSourceInput');
  const btnEl   = document.getElementById('webSourceLookupBtn');
  if (!inputEl) return;

  const urlVal = inputEl.value.trim();
  if (!urlVal) { shakeInput(inputEl); return; }
  if (!validateCaptcha('webSource')) return;

  if (btnEl) setLoading(btnEl, true);
  const ra = document.getElementById('webSourceResultArea');
  if (ra) ra.classList.add('hidden');

  try {
    const res  = await safeFetch(`/website_source?url=${encodeURIComponent(urlVal)}`);
    const data = await res.json();

    if (data && data.success && data.data) {
      showWebSourceSuccess(data.data);
    } else {
      showWebSourceError((data && data.message) || 'Failed to extract website source code.');
    }
  } catch (err) {
    showWebSourceError('Could not connect to website scraper service.');
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('webSource');
  }
}

function showWebSourceError(msg) {
  const ra = document.getElementById('webSourceResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('webSourceErrorCard');
  if (errCard) errCard.classList.remove('hidden');
  const succCard = document.getElementById('webSourceSuccessCard');
  if (succCard) succCard.classList.add('hidden');
  const errDesc = document.getElementById('webSourceErrorDesc');
  if (errDesc) errDesc.textContent = msg;
}

function showWebSourceSuccess(d) {
  const ra = document.getElementById('webSourceResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard  = document.getElementById('webSourceErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const succCard = document.getElementById('webSourceSuccessCard');
  if (!succCard) return;
  succCard.classList.remove('hidden');

  const domain = escHtml(d.domain || 'Target Site');
  const downloadUrl = d.download_url || d.tmpfiles_url || d.local_download_url || '#';
  const fileCount = d.file_count || 1;
  const fileSizeMb = d.file_size_mb !== undefined ? d.file_size_mb : 0;
  const timeTaken = d.time_taken_seconds || 0;
  const fileId = escHtml(d.file_id || 'N/A');
  const snippet = d.html_snippet ? escHtml(d.html_snippet) : null;

  succCard.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">🌐</div>
        <div class="profile-main-info">
          <div class="profile-name">${domain}</div>
          <div class="profile-subtext">Source Code Package Extracted • ${fileCount} File(s)</div>
        </div>
      </div>

      <div class="info-grid" style="margin-bottom:16px;">
        <div class="info-item">
          <div class="info-label">Target Domain</div>
          <div class="info-val">${domain}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Extraction Time</div>
          <div class="info-val">${timeTaken} seconds</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Files Extracted</div>
          <div class="info-val">${fileCount} File(s) (${fileSizeMb} MB)</div>
        </div>
        <div class="info-item">
          <div class="info-label">Package Identifier</div>
          <div class="info-val" style="font-family:monospace;font-size:0.8rem;">${fileId}</div>
        </div>
      </div>

      ${snippet ? `
      <!-- Code Box Preview -->
      <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border-color);border-radius:10px;padding:12px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-family:monospace;font-size:0.8rem;color:var(--text-secondary);">📄 index.html (Source Preview)</span>
          <button onclick="navigator.clipboard.writeText(document.getElementById('srcCodeBox').textContent);alert('Source code copied!');" class="btn" style="padding:4px 10px;font-size:0.75rem;background:rgba(0,128,255,0.15);color:var(--accent-color);">Copy Source</button>
        </div>
        <pre id="srcCodeBox" style="font-family:monospace;font-size:0.78rem;color:#10b981;background:#0d1117;padding:12px;border-radius:6px;max-height:220px;overflow:auto;margin:0;white-space:pre-wrap;word-break:break-all;">${snippet}</pre>
      </div>` : ''}

      <!-- Code Box Style Download Card -->
      <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border-color);border-radius:10px;padding:16px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary);">📦 source_code_${domain}.zip</span>
          <span style="font-size:0.75rem;padding:2px 8px;background:rgba(34,197,94,0.15);color:#22c55e;border-radius:12px;font-weight:600;">READY</span>
        </div>
        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" download="source_${domain}.zip" class="btn btn-primary" style="width:100%;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download Source Code (.ZIP)</span>
        </a>
      </div>

      <div class="credits-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
        Mushtaq_OSINT
      </div>
    </div>
  `;
}

// ===== SONG DOWNLOADER =====
(function setupSongListeners() {
  const inputEl  = document.getElementById('songInput');
  const clearBtn = document.getElementById('songClearBtn');
  if (!inputEl) return;

  inputEl.addEventListener('input', () => {
    if (clearBtn) clearBtn.style.display = inputEl.value.length > 0 ? 'inline-flex' : 'none';
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSongLookup();
  });

  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      clearBtn.style.display = 'none';
      const ra = document.getElementById('songResultArea');
      if (ra) ra.classList.add('hidden');
      inputEl.focus();
    });
  }
})();

async function doSongLookup() {
  const inputEl = document.getElementById('songInput');
  const btnEl   = document.getElementById('songLookupBtn');
  if (!inputEl) return;

  const songName = inputEl.value.trim();
  if (!songName) { shakeInput(inputEl); return; }
  if (!validateCaptcha('song')) return;

  if (btnEl) setLoading(btnEl, true);
  const ra = document.getElementById('songResultArea');
  if (ra) ra.classList.add('hidden');

  try {
    const res  = await safeFetch(`/song_download?song=${encodeURIComponent(songName)}`);
    const data = await res.json();

    const results = (data && data.data && data.data.results) || (data && data.results);

    if (results && results.length > 0) {
      showSongSuccess(results, songName);
    } else {
      showSongError(`No songs found matching '${songName}'.`);
    }
  } catch (err) {
    showSongError('Could not fetch song results. Please try again.');
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('song');
  }
}

function showSongError(msg) {
  const ra = document.getElementById('songResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('songErrorCard');
  if (errCard) errCard.classList.remove('hidden');
  const succCard = document.getElementById('songSuccessCard');
  if (succCard) succCard.classList.add('hidden');
  const errDesc = document.getElementById('songErrorDesc');
  if (errDesc) errDesc.textContent = msg;
}

function showSongSuccess(results, songName) {
  const ra = document.getElementById('songResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard  = document.getElementById('songErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const succCard = document.getElementById('songSuccessCard');
  if (!succCard) return;
  succCard.classList.remove('hidden');

  const songCardsHtml = results.map((s, idx) => {
    const title       = escHtml(s.title || 'Unknown Song');
    const artists     = escHtml(s.artists || 'Unknown Artist');
    const album       = escHtml(s.album || '');
    const duration    = escHtml(s.duration || '');
    const downloadUrl = s.download_url || '#';

    return `
      <div class="card song-card-structured" style="margin-bottom:14px;padding:18px;border:1px solid var(--border-color);border-radius:12px;background:rgba(255,255,255,0.02);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:220px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,128,255,0.12);border:1px solid rgba(0,128,255,0.25);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;color:var(--accent-color, #0080FF);">🎵</div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:1.02rem;color:var(--text-primary);line-height:1.3;">#${idx+1}. ${title}</div>
              <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:3px;">🎤 ${artists} ${album ? '• 💿 ' + album : ''}</div>
            </div>
          </div>
          ${duration ? `<span style="font-size:0.75rem;padding:4px 10px;background:rgba(0,128,255,0.1);border:1px solid rgba(0,128,255,0.2);border-radius:12px;color:var(--accent-color,#0080FF);font-weight:600;">⏱️ ${duration}</span>` : ''}
        </div>

        <!-- Clean Audio Player without 3-dots overflow download menu -->
        <div style="margin:12px 0;">
          <audio controls controlsList="nodownload noplaybackrate noremoteplayback" style="width:100%;height:40px;border-radius:8px;" preload="none" class="song-audio-player">
            <source src="${downloadUrl}" type="audio/mp4">
            <source src="${downloadUrl}" type="audio/mpeg">
            Your browser does not support audio playback.
          </audio>
        </div>

        <div style="margin-top:10px;">
          <a href="/stream_audio?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(s.title || 'song')}" download="${title}.mp3" class="btn btn-primary" style="width:100%;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;font-weight:600;border-radius:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download 320kbps MP3</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  succCard.innerHTML = `
    <div style="margin-bottom:14px;font-size:0.9rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:space-between;">
      <span>Found <strong style="color:var(--text-primary);">${results.length}</strong> song track(s) for "<em>${escHtml(songName)}</em>"</span>
      <span style="font-size:0.75rem;color:var(--text-muted);">Auto-pause enabled</span>
    </div>
    ${songCardsHtml}
    <div class="credits-row" style="margin-top:16px;">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
      Mushtaq_OSINT
    </div>
  `;
}

// Global Single Audio Active Instance Listener
if (typeof document !== 'undefined') {
  document.addEventListener('play', function(e) {
    if (e.target && e.target.tagName === 'AUDIO') {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => {
        if (audio !== e.target) {
          audio.pause();
        }
      });
    }
  }, true);
}

// ===== IMEI INFO LOOKUP =====
(function setupImeiListeners() {
  const inputEl  = document.getElementById('imeiInput');
  const clearBtn = document.getElementById('imeiClearBtn');
  if (!inputEl) return;

  inputEl.addEventListener('input', () => {
    if (clearBtn) clearBtn.style.display = inputEl.value.length > 0 ? 'inline-flex' : 'none';
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') doImeiLookup();
  });

  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      clearBtn.style.display = 'none';
      const ra = document.getElementById('imeiResultArea');
      if (ra) ra.classList.add('hidden');
      inputEl.focus();
    });
  }
})();

async function doImeiLookup() {
  const inputEl = document.getElementById('imeiInput');
  const btnEl   = document.getElementById('imeiLookupBtn');
  if (!inputEl) return;

  const imei = inputEl.value.trim();
  if (!imei) { shakeInput(inputEl); return; }
  if (!validateCaptcha('imei')) return;

  if (btnEl) setLoading(btnEl, true);
  const ra = document.getElementById('imeiResultArea');
  if (ra) ra.classList.add('hidden');

  try {
    const res  = await safeFetch(`/imei_lookup/${encodeURIComponent(imei)}`);
    const data = await res.json();

    const detail = data && data.data;
    if (detail) {
      showImeiSuccess(detail, imei);
    } else {
      showImeiError((data && data.message) || `No information found for IMEI '${imei}'.`);
    }
  } catch (err) {
    showImeiError('Could not fetch IMEI device details. Please try again.');
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('imei');
  }
}

function showImeiError(msg) {
  const ra = document.getElementById('imeiResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('imeiErrorCard');
  if (errCard) errCard.classList.remove('hidden');
  const succCard = document.getElementById('imeiSuccessCard');
  if (succCard) succCard.classList.add('hidden');
  const errDesc = document.getElementById('imeiErrorDesc');
  if (errDesc) errDesc.textContent = msg;
}

function showImeiSuccess(detail, imei) {
  const ra = document.getElementById('imeiResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard  = document.getElementById('imeiErrorCard');
  if (errCard) errCard.classList.add('hidden');
  const succCard = document.getElementById('imeiSuccessCard');
  if (!succCard) return;
  succCard.classList.remove('hidden');

  let rowsHtml = '';
  if (typeof detail === 'object' && detail !== null) {
    rowsHtml = Object.entries(detail).map(([k, v]) => {
      if (!v || k === 'channel' || k === 'developer') return '';
      if (k === 'detail' && (String(v).includes('expensive') || String(v).includes('error'))) return '';
      const label = escHtml(k.replace(/_/g, ' ').toUpperCase());
      const valStr = String(v);
      const isHighlight = k === 'luhn_validity' || k === 'imei_number';
      return `
        <div class="info-item">
          <div class="info-label">${label}</div>
          <div class="info-val" style="${isHighlight ? 'color:var(--accent-color);font-weight:700;' : ''}">${escHtml(valStr)}</div>
        </div>
      `;
    }).join('');
  }

  if (!rowsHtml) {
    showImeiError(`No device specs returned for IMEI '${imei}'.`);
    return;
  }

  succCard.innerHTML = `
    <div class="profile-card-simple">
      <div class="profile-head-row">
        <div class="avatar-circle">📱</div>
        <div class="profile-main-info">
          <div class="profile-name">IMEI: ${escHtml(imei)}</div>
          <div class="profile-subtext">Device TAC Hardware Specification</div>
        </div>
      </div>
      <div class="info-grid">
        ${rowsHtml}
      </div>
      <div class="credits-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
        Mushtaq_OSINT
      </div>
    </div>
  `;
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
// ===== EMAIL LEAK LOOKUP =====
(function setupEmailListeners() {
  const emailInput   = document.getElementById('emailInput');
  const emailClearBtn = document.getElementById('emailClearBtn');
  if (!emailInput) return;
  emailInput.addEventListener('input', () => {
    if (emailClearBtn) emailClearBtn.style.display = emailInput.value.length > 0 ? 'inline-flex' : 'none';
  });
  emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') doEmailLookup(); });
  if (emailClearBtn) {
    emailClearBtn.style.display = 'none';
    emailClearBtn.addEventListener('click', () => {
      emailInput.value = '';
      emailClearBtn.style.display = 'none';
      const ra = document.getElementById('emailResultArea');
      if (ra) ra.classList.add('hidden');
      emailInput.focus();
    });
  }
})();

async function doEmailLookup() {
  const inputEl = document.getElementById('emailInput');
  const btnEl   = document.getElementById('emailLookupBtn');
  if (!inputEl) return;

  const email = inputEl.value.trim();
  if (!email) { shakeInput(inputEl); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    shakeInput(inputEl);
    showEmailError('Please enter a valid email address.');
    return;
  }
  if (!validateCaptcha('email')) return;

  if (btnEl) setLoading(btnEl, true);
  const ra = document.getElementById('emailResultArea');
  if (ra) ra.classList.add('hidden');

  try {
    const res  = await safeFetch(`/email_lookup?query=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.status === 'success' && data.sources) {
      showEmailSuccess(data, email);
    } else {
      showEmailError(data.message || `No breach records found for '${email}'.`);
    }
  } catch (err) {
    showEmailError(`Could not fetch breach data for '${email}'. Please try again.`);
  } finally {
    if (btnEl) setLoading(btnEl, false);
    resetCaptcha('email');
  }
}

function showEmailError(msg) {
  const ra = document.getElementById('emailResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard = document.getElementById('emailErrorCard');
  const errDesc = document.getElementById('emailErrorDesc');
  const succCard = document.getElementById('emailSuccessCard');
  if (errCard)  errCard.classList.remove('hidden');
  if (errDesc)  errDesc.textContent = msg;
  if (succCard) succCard.innerHTML = '';
}

function showEmailSuccess(data, email) {
  const ra = document.getElementById('emailResultArea');
  if (!ra) return;
  ra.classList.remove('hidden');
  const errCard  = document.getElementById('emailErrorCard');
  const succCard = document.getElementById('emailSuccessCard');
  if (errCard) errCard.classList.add('hidden');
  if (!succCard) return;
  renderEmailCard(succCard, data.sources, email);
}

function renderEmailCard(container, sources, email) {
  const sourceKeys = Object.keys(sources);
  const count = sourceKeys.length;

  const breachCards = sourceKeys.map((key, idx) => {
    const src = sources[key];
    const title = escHtml(src.title || key);
    const desc  = escHtml(src.description || '');
    const records = Array.isArray(src.records) ? src.records : [src.records || {}];

    const rowsHtml = records.map(rec => {
      return Object.entries(rec).map(([field, val]) => {
        if (!val || val === 'null') return '';
        return `
          <div class="info-item">
            <div class="info-label">${escHtml(field)}</div>
            <div class="info-val" style="${field.toLowerCase().includes('password') ? 'font-family:monospace;color:#ef4444;' : ''}">${escHtml(String(val))}</div>
          </div>`;
      }).join('');
    }).join('');

    const isFirst = idx === 0;
    return `
      <div class="breach-card card" style="margin-bottom:10px;">
        <div class="breach-header" onclick="toggleBreachCard(this)" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:14px 16px;">
          <div style="width:34px;height:34px;border-radius:50%;background:rgba(0,128,255,0.12);border:1px solid rgba(0,128,255,0.25);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">⚠️</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);">${title}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${records.length} record${records.length > 1 ? 's' : ''} found</div>
          </div>
          <svg class="breach-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transition:transform 0.2s;transform:${isFirst ? 'rotate(180deg)' : 'rotate(0deg)'}"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="breach-body" style="display:${isFirst ? 'block' : 'none'};padding:0 16px 14px;">
          ${desc ? `<div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.5;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:6px;border-left:2px solid rgba(0,128,255,0.3);">${desc}</div>` : ''}
          <div class="info-grid">${rowsHtml}</div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="profile-card-simple" style="margin-bottom:14px;">
      <div class="profile-head-row">
        <div class="avatar-circle" style="background:rgba(239,68,68,0.15);border:1.5px solid rgba(239,68,68,0.3);color:#ef4444;">⚠</div>
        <div class="profile-main-info">
          <div class="profile-name">${escHtml(email)}</div>
          <div class="profile-subtext">Found in <strong style="color:#ef4444;">${count}</strong> breach source${count !== 1 ? 's' : ''}</div>
        </div>
        <div style="margin-left:auto;">
          <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:20px;color:#ef4444;font-weight:700;font-size:0.78rem;">
            <span style="width:7px;height:7px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
            LEAKED
          </span>
        </div>
      </div>
      <div class="credits-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
        Mushtaq_OSINT_DEV
      </div>
    </div>
    ${breachCards}
  `;
}

function toggleBreachCard(headerEl) {
  const body    = headerEl.nextElementSibling;
  const chevron = headerEl.querySelector('.breach-chevron');
  const isOpen  = body.style.display !== 'none';
  body.style.display    = isOpen ? 'none' : 'block';
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
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