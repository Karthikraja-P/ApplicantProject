/**
 * Proctor.js - Modern Anti-Cheating & Psychological Deterrent Suite
 * Designed for Singularity Assessment Portal.
 */

(function proctor() {
    const CONFIG = {
        deterrentTitle: "🔴 LIVE MONITORING ACTIVE",
        warningTitle: "⚠ INTEGRITY ALERT",
        warningMessage: "Tab switching and window blur detected. This activity is logged. Please stay on this page to ensure your assessment remains valid.",
        blockTitle: "🔒 ASSESSMENT LOCKED",
        blockMessage: "Camera access is mandatory to maintain assessment integrity. Your session is restricted until monitoring is granted. Please enable your camera and refresh to proceed.",
    };

    // ─── CSS Injection ────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #proctor-overlay {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 180px;
            height: 135px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ef4444;
            border-radius: 12px;
            overflow: hidden;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(239, 68, 68, 0.3);
            transition: all 0.3s ease;
            cursor: move;
        }
        #proctor-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: grayscale(0.2) contrast(1.1);
        }
        #proctor-label {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 4px;
            animation: proctorPulse 2s infinite;
        }
        @keyframes proctorPulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        .proctor-alert-overlay, .proctor-block-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        }
        .proctor-block-overlay {
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(15px);
            z-index: 10005;
        }
        .proctor-alert-overlay.active, .proctor-block-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        .proctor-alert-card {
            max-width: 450px;
            background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
            border: 1px solid #ef4444;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            transform: scale(0.9);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .proctor-alert-overlay.active .proctor-alert-card, .proctor-block-overlay.active .proctor-alert-card {
            transform: scale(1);
        }
        .proctor-alert-card h2 { color: #ef4444; margin: 0 0 15px 0; font-size: 1.4rem; font-family: sans-serif; }
        .proctor-alert-card p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px; font-family: sans-serif; }
        .proctor-alert-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: sans-serif;
            text-decoration: none;
            display: inline-block;
        }
        .proctor-alert-btn:hover { background: #dc2626; transform: translateY(-2px); }
        body.proctor-no-select {
            user-select: none !important;
            -webkit-user-select: none !important;
        }
    `;
    document.head.appendChild(style);

    // ─── DOM Elements ────────────────────────────────────────────────────────
    let videoEl, overlayEl, labelEl, alertOverlay, blockOverlay;

    function createUI() {
        overlayEl = document.createElement('div');
        overlayEl.id = 'proctor-overlay';

        videoEl = document.createElement('video');
        videoEl.id = 'proctor-video';
        videoEl.autoplay = true;
        videoEl.muted = true;
        videoEl.playsInline = true;

        labelEl = document.createElement('div');
        labelEl.id = 'proctor-label';
        labelEl.innerHTML = `<span>●</span> ${CONFIG.deterrentTitle}`;

        overlayEl.appendChild(videoEl);
        overlayEl.appendChild(labelEl);
        document.body.appendChild(overlayEl);

        // Warning Overlay
        alertOverlay = document.createElement('div');
        alertOverlay.className = 'proctor-alert-overlay';
        alertOverlay.innerHTML = `
            <div class="proctor-alert-card">
                <h2>${CONFIG.warningTitle}</h2>
                <p>${CONFIG.warningMessage}</p>
                <button class="proctor-alert-btn">I Understand</button>
            </div>
        `;
        document.body.appendChild(alertOverlay);
        alertOverlay.querySelector('.proctor-alert-btn').onclick = () => {
            alertOverlay.classList.remove('active');
        };

        // Block Overlay (Hard Lock)
        blockOverlay = document.createElement('div');
        blockOverlay.className = 'proctor-block-overlay';
        blockOverlay.innerHTML = `
            <div class="proctor-alert-card">
                <h2>${CONFIG.blockTitle}</h2>
                <p>${CONFIG.blockMessage}</p>
                <a href="#" class="proctor-alert-btn" onclick="location.reload(); return false;">Refresh & Retry Access</a>
            </div>
        `;
        document.body.appendChild(blockOverlay);

        // Draggable
        let isDragging = false;
        overlayEl.onmousedown = (e) => {
            isDragging = true;
            let shiftX = e.clientX - overlayEl.getBoundingClientRect().left;
            let shiftY = e.clientY - overlayEl.getBoundingClientRect().top;
            function moveAt(pageX, pageY) {
                overlayEl.style.left = (pageX - shiftX) + 'px';
                overlayEl.style.top = (pageY - shiftY) + 'px';
                overlayEl.style.bottom = 'auto';
                overlayEl.style.right = 'auto';
            }
            function onMouseMove(e) { if (isDragging) moveAt(e.pageX, e.pageY); }
            document.addEventListener('mousemove', onMouseMove);
            overlayEl.onmouseup = () => {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
            };
        };
    }

    // ─── Camera Logic ────────────────────────────────────────────────────────
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoEl.srcObject = stream;
        } catch (err) {
            console.warn("Proctoring: Camera denied or unavailable.", err);
            blockOverlay.classList.add('active');
        }
    }

    // ─── Anti-Cheat Listeners ──────────────────────────────────────────────────
    function initListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'hidden') {
                alertOverlay.classList.add('active');
            }
        });
        document.body.classList.add('proctor-no-select');
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('copy', e => {
            e.preventDefault();
            alertOverlay.classList.add('active');
        });
        document.addEventListener('keydown', e => {
            const blockedKeys = ['c', 'v', 'u', 'U', 's', 'S'];
            const isCombo = (e.ctrlKey || e.metaKey) && blockedKeys.includes(e.key);
            const isDev = e.key === 'F12';
            if (isCombo || isDev) {
                e.preventDefault();
                alertOverlay.classList.add('active');
            }
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createUI();
            startCamera();
            initListeners();
        });
    } else {
        createUI();
        startCamera();
        initListeners();
    }
})();
