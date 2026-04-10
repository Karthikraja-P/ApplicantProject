document.addEventListener('DOMContentLoaded', function () {
    window.isTestActive = false;

    // ─── Force Submission & Start Rule (3 min) ───────────────────────────────
    var _active = localStorage.getItem('current_assessment_active');
    var _subTime = parseInt(localStorage.getItem('submissionTime') || '0');
    var _now = Date.now();
    var _MAX_WAIT = 60 * 60 * 1000;

    if (_subTime === 0) {
        window.location.href = '/';
        return;
    }

    if ((_now - _subTime) > _MAX_WAIT && localStorage.getItem('tf_assessment_stage') < 4) {
        var intro = document.getElementById('screen-games-intro');
        if (intro) {
            intro.innerHTML = buildCompletedBanner(
                '⏰ Time Expired',
                'You were required to start assessments within 60 minutes of form submission. Session expired.',
                [{ label: 'Return to Application', href: '/' }]
            );
        }
        return;
    }

    // ─── Stage-Based Locking ──────────────────────────────────────────────────
    var _stage = parseInt(localStorage.getItem('tf_assessment_stage') || '0');
    if (_stage < 3) {
        window.location.href = '/skillset_assessment.html';
        return;
    }

    if (_stage >= 4) {
        var intro = document.getElementById('screen-games-intro');
        if (intro) {
            intro.innerHTML = buildCompletedBanner(
                '🎮 Games Assessment',
                'You have already completed this assessment.',
                [{ label: 'Finish Application →', href: '/confirmation.html' }]
            );
        }
        return;
    }

    // ─── Prevent Round Switching ──────────────────────────────────────────────
    if (_active && _active !== 'games') {
        window.location.href = '/' + _active + '_assessment.html';
        return;
    }

    // ─── Resume Check ──────────────────────────────────────────────────────────
    var _gStep = localStorage.getItem('tf_game_step');
    var _gStartTime = parseInt(localStorage.getItem('tf_game_start_time') || '0');
    if (_active === 'games' && _gStep && _gStartTime > 0) {
        window.isTestActive = true;
        window.onbeforeunload = function () { if (window.isTestActive) return "Game in progress."; };
        // Disable sidebar links
        document.querySelectorAll('.sidebar a').forEach(a => {
            a.style.pointerEvents = 'none';
            a.style.opacity = '0.5';
        });
        startTime = _gStartTime;
        // Delay slightly for init
        setTimeout(function () {
            if (_gStep === 'bart') startBART(true);
            else if (_gStep === 'igt') startIGT(true);

        }, 100);
        return;
    }

    var GAME_TIME = 5 * 60; // 5 minutes per game (seconds)

    // ─── Pre-generated data ────────────────────────────────────────────────────

    // BART: 15 pre-seeded explosion points (pumps at which balloon pops, 1–20)
    var BART_EXPLODE_AT = [7, 13, 3, 18, 9, 5, 14, 2, 11, 16, 6, 19, 8, 12, 4];
    var BART_BALLOONS = 15;
    var EARN_PER_PUMP = 0.05;

    // IGT: 4 decks — A & B are negative EV, C & D are positive EV
    var IGT_DECKS = [
        { label: 'A', reward: 100, lossPct: 50, lossMin: 150, lossMax: 350 },  // EV: -25/card
        { label: 'B', reward: 100, lossPct: 10, lossMin: 1200, lossMax: 1300 }, // EV: -25/card
        { label: 'C', reward: 50, lossPct: 50, lossMin: 25, lossMax: 75 },  // EV: +25/card
        { label: 'D', reward: 50, lossPct: 10, lossMin: 225, lossMax: 275 },  // EV: +25/card
    ];
    var IGT_TRIALS = 40;
    var IGT_START = 2000;



    // ─── State ─────────────────────────────────────────────────────────────────

    var bart = {
        balloon: 0, pumps: 0, roundEarnings: 0,
        totalBanked: 0, adjustedPumps: [], explodedCount: 0, done: false,
    };

    var igt = {
        trial: 0, balance: IGT_START, deckChoices: [], done: false,
    };



    var gameTicker = null;
    var startTime = null;
    var finishTime = null;

    // ─── Helpers ───────────────────────────────────────────────────────────────

    var screens = document.querySelectorAll('.psych-screen');
    function showScreen(id) {
        screens.forEach(function (el) { el.classList.remove('active'); });
        document.getElementById(id).classList.add('active');
    }

    function fmtTime(secs) {
        var m = Math.floor(secs / 60), s = secs % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ─── Per-game timer (5 min each) ───────────────────────────────────────────

    function startGameTimer(barId, numId, onExpire) {
        if (gameTicker) clearInterval(gameTicker);
        var bar = document.getElementById(barId);
        var numEl = document.getElementById(numId);

        bar.classList.remove('warning', 'danger');
        bar.style.transition = 'none';
        bar.style.width = '100%';
        numEl.textContent = fmtTime(GAME_TIME);
        numEl.className = 'game-timer-num';

        requestAnimationFrame(function () {
            bar.style.transition = 'width ' + GAME_TIME + 's linear';
            bar.style.width = '0%';
        });

        var start = startTime || Date.now();
        gameTicker = setInterval(function () {
            var left = Math.max(0, GAME_TIME - Math.floor((Date.now() - start) / 1000));
            numEl.textContent = fmtTime(left);
            var pct = left / GAME_TIME;
            numEl.className = 'game-timer-num' + (pct <= 0.1 ? ' danger' : pct <= 0.3 ? ' warning' : '');
            bar.classList.toggle('warning', pct <= 0.3 && pct > 0.1);
            bar.classList.toggle('danger', pct <= 0.1);
            if (left <= 0) {
                clearInterval(gameTicker);
                gameTicker = null;
                onExpire();
            }
        }, 500);
    }

    function stopGameTimer() {
        if (gameTicker) { clearInterval(gameTicker); gameTicker = null; }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  GAME 1 — BART (Balloon Analogue Risk Task)
    // ══════════════════════════════════════════════════════════════════════════

    function startBART(isResume) {
        localStorage.setItem('current_assessment_active', 'games');
        localStorage.setItem('tf_game_step', 'bart');
        window.isTestActive = true;
        if (!isResume) {
            startTime = Date.now();
            localStorage.setItem('tf_game_start_time', startTime.toString());
            bart.balloon = 0; bart.pumps = 0; bart.roundEarnings = 0;
            bart.totalBanked = 0; bart.adjustedPumps = []; bart.explodedCount = 0; bart.done = false;
        } else {
            // Restore from localStorage if needed (implemented in next step if user has mid-round saves)
        }

        // Warn before leaving
        window.onbeforeunload = function () { if (window.isTestActive) return "Assessment in progress."; };

        // Re-apply global sidebar lock
        if (window.applySidebarLock) window.applySidebarLock();

        bart.balloon = 0; bart.pumps = 0; bart.roundEarnings = 0;
        bart.totalBanked = 0; bart.adjustedPumps = []; bart.explodedCount = 0; bart.done = false;
        showScreen('screen-bart');
        renderBART();
        document.getElementById('bart-pump-btn').disabled = false;
        document.getElementById('bart-bank-btn').disabled = false;
        document.getElementById('bart-next-btn').style.display = 'none';
        startGameTimer('bart-bar', 'bart-timer', function () {
            bart.done = true;
            document.getElementById('bart-pump-btn').disabled = true;
            document.getElementById('bart-bank-btn').disabled = true;
            document.getElementById('bart-next-btn').style.display = 'inline-flex';
            setFeedback('bart-feedback', 'Time\'s up! Balloons complete.', '');
        });
    }

    function renderBART() {
        document.getElementById('bart-balloon-num').textContent =
            'Balloon ' + (bart.balloon + 1) + ' of ' + BART_BALLOONS;
        document.getElementById('bart-pumps').textContent = bart.pumps;
        document.getElementById('bart-round-earn').textContent = '$' + bart.roundEarnings.toFixed(2);
        document.getElementById('bart-total').textContent = '$' + bart.totalBanked.toFixed(2);

        // Grow and recolour balloon with pumps
        var scale = 1 + bart.pumps * 0.09;
        var danger = Math.min(1, bart.pumps / 18);
        var g = Math.round(200 * (1 - danger * 0.85));
        var balloon = document.getElementById('bart-balloon');
        balloon.style.transform = 'scale(' + scale + ')';
        balloon.style.background =
            'radial-gradient(circle at 35% 30%, #fff9c4, rgb(255,' + g + ',0))';
        balloon.classList.remove('balloon-pop');
    }

    function pumpBART() {
        if (bart.done) return;
        bart.pumps++;
        bart.roundEarnings = +(bart.pumps * EARN_PER_PUMP).toFixed(2);
        renderBART();

        if (bart.pumps >= BART_EXPLODE_AT[bart.balloon]) {
            // Balloon pops
            bart.explodedCount++;
            document.getElementById('bart-balloon').classList.add('balloon-pop');
            document.getElementById('bart-pump-btn').disabled = true;
            document.getElementById('bart-bank-btn').disabled = true;
            setFeedback('bart-feedback', '💥 Popped! Lost $' + bart.roundEarnings.toFixed(2), 'loss');
            setTimeout(nextBalloon, 1300);
        }
    }

    function bankBART() {
        if (bart.done) return;
        bart.adjustedPumps.push(bart.pumps);
        bart.totalBanked += bart.roundEarnings;
        setFeedback('bart-feedback', '✓ Banked $' + bart.roundEarnings.toFixed(2), 'win');
        renderBART();
        setTimeout(nextBalloon, 900);
    }

    function nextBalloon() {
        bart.balloon++;
        if (bart.balloon >= BART_BALLOONS) {
            bart.done = true;
            stopGameTimer();
            document.getElementById('bart-pump-btn').disabled = true;
            document.getElementById('bart-bank-btn').disabled = true;
            document.getElementById('bart-next-btn').style.display = 'inline-flex';
            setFeedback('bart-feedback',
                'All done! Total banked: $' + bart.totalBanked.toFixed(2), 'win');
        } else {
            bart.pumps = 0;
            bart.roundEarnings = 0;
            document.getElementById('bart-pump-btn').disabled = false;
            document.getElementById('bart-bank-btn').disabled = false;
            setFeedback('bart-feedback', '', '');
            renderBART();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  GAME 2 — Iowa Gambling Task
    // ══════════════════════════════════════════════════════════════════════════

    function startIGT() {
        igt.trial = 0; igt.balance = IGT_START; igt.deckChoices = []; igt.done = false;
        showScreen('screen-igt');
        enableDecks(true);
        document.getElementById('igt-next-btn').style.display = 'none';
        renderIGT();
        document.getElementById('igt-result').textContent = 'Pick a deck to draw a card';
        document.getElementById('igt-result').className = 'igt-result-banner idle';
        startGameTimer('igt-bar', 'igt-timer', function () {
            igt.done = true;
            enableDecks(false);
            document.getElementById('igt-next-btn').style.display = 'inline-flex';
        });
    }

    function renderIGT() {
        document.getElementById('igt-trial').textContent = 'Trial ' + igt.trial + ' of ' + IGT_TRIALS;
        var balEl = document.getElementById('igt-balance');
        balEl.textContent = '$' + igt.balance.toLocaleString();
        balEl.className = 'igt-balance' + (igt.balance < IGT_START ? ' negative' : '');
    }

    function pickDeck(deckIdx) {
        if (igt.done || igt.trial >= IGT_TRIALS) return;
        var deck = IGT_DECKS[deckIdx];
        var reward = deck.reward;
        var loss = (randInt(1, 100) <= deck.lossPct) ? randInt(deck.lossMin, deck.lossMax) : 0;
        var net = reward - loss;

        igt.balance += net;
        igt.trial++;
        igt.deckChoices.push(deckIdx);

        var res = document.getElementById('igt-result');
        if (net >= 0) {
            res.textContent = 'Deck ' + deck.label + ':  +$' + reward + (loss ? '  −$' + loss : '') + '  =  +$' + net;
            res.className = 'igt-result-banner win';
        } else {
            res.textContent = 'Deck ' + deck.label + ':  +$' + reward + '  −$' + loss + '  =  −$' + Math.abs(net);
            res.className = 'igt-result-banner loss';
        }

        renderIGT();

        if (igt.trial >= IGT_TRIALS) {
            igt.done = true;
            stopGameTimer();
            enableDecks(false);
            document.getElementById('igt-next-btn').style.display = 'inline-flex';
        }
    }

    function enableDecks(on) {
        document.querySelectorAll('.card-deck').forEach(function (btn) { btn.disabled = !on; });
    }



    // ─── Shared feedback helper ────────────────────────────────────────────────

    function setFeedback(id, text, cls) {
        var el = document.getElementById(id);
        el.textContent = text;
        el.className = id === 'bart-feedback' ? 'bart-feedback' + (cls ? ' ' + cls : '') : '';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RESULTS
    // ══════════════════════════════════════════════════════════════════════════

    function showResults() {
        window.isTestActive = false;
        window.onbeforeunload = null;
        finishTime = Date.now();
        localStorage.setItem('tf_assessment_stage', '4'); // Final stage
        localStorage.removeItem('current_assessment_active');
        // Re-enable sidebar
        document.querySelectorAll('.sidebar a').forEach(a => {
            a.style.pointerEvents = 'auto';
            a.style.opacity = '1';
        });

        stopGameTimer();
        showScreen('screen-games-results');

        // ── BART ──
        var avgPumps = bart.adjustedPumps.length > 0
            ? (bart.adjustedPumps.reduce(function (s, v) { return s + v; }, 0) / bart.adjustedPumps.length)
            : 0;
        var bartProfile, bartDetail;
        if (avgPumps >= 13) {
            bartProfile = 'High Risk Taker';
            bartDetail = 'Tends toward aggressive decisions — watch for overconfidence in low-probability scenarios.';
        } else if (avgPumps >= 7) {
            bartProfile = 'Optimal Risk Balance';
            bartDetail = 'Calibrates risk vs. reward well — strong instinct for probability-adjusted decisions.';
        } else {
            bartProfile = 'Risk Averse';
            bartDetail = 'Overly conservative — may underutilise high-value, moderate-risk opportunities.';
        }
        document.getElementById('res-bart-profile').textContent = bartProfile;
        document.getElementById('res-bart-detail').textContent = bartDetail;
        document.getElementById('res-bart-stat').textContent =
            'Avg pumps (non-exploded): ' + avgPumps.toFixed(1) +
            ' · Exploded: ' + bart.explodedCount +
            ' · Total banked: $' + bart.totalBanked.toFixed(2);

        // ── IGT ──
        var late = igt.deckChoices.slice(-Math.min(20, igt.deckChoices.length));
        var goodCount = late.filter(function (d) { return d >= 2; }).length;
        var goodPct = late.length > 0 ? Math.round((goodCount / late.length) * 100) : 0;
        var igtProfile, igtDetail;
        if (goodPct >= 65) {
            igtProfile = 'Strong Pattern Recogniser';
            igtDetail = 'Identified the positive-EV decks and adapted — excellent expected-value reasoning.';
        } else if (goodPct >= 40) {
            igtProfile = 'Moderate Learner';
            igtDetail = 'Partially adapted to the reward structure across trials.';
        } else {
            igtProfile = 'Slow Adaptor';
            igtDetail = 'Continued drawing from negative-EV decks — pattern recognition under uncertainty needs work.';
        }
        document.getElementById('res-igt-profile').textContent = igtProfile;
        document.getElementById('res-igt-detail').textContent = igtDetail;
        document.getElementById('res-igt-stat').textContent =
            'Final balance: $' + igt.balance.toLocaleString() +
            ' · Good-deck % (last 20): ' + goodPct + '%' +
            ' · Trials: ' + igt.trial;



        // Save games score to localStorage for final submission
        var timeTakenSec = Math.floor((finishTime - startTime) / 1000);
        var gameResults = {
            bart: { profile: bartProfile, avg_pumps: avgPumps.toFixed(1), exploded: bart.explodedCount, banked: bart.totalBanked.toFixed(2), responses: bart.adjustedPumps },
            igt: { profile: igtProfile, good_pct: goodPct, balance: igt.balance, trials: igt.trial, responses: igt.deckChoices },
            time_taken: timeTakenSec
        };
        localStorage.setItem('tf_games', JSON.stringify(gameResults));

        // NEW: Persist to backend
        try {
            var cache = JSON.parse(localStorage.getItem('formCache') || '{}');
            if (cache.email && window.apiSubmitAssessment) {
                window.apiSubmitAssessment(cache.email, 'games', gameResults);
            }
        } catch (e) {
            console.error('Failed to persist Games results:', e);
        }

        // Lock games — no retry allowed
        localStorage.setItem('games_completed', 'true');
        var retryBtn = document.getElementById('retry-games-btn');
        if (retryBtn) retryBtn.style.display = 'none';
    }

    // ─── Event listeners ───────────────────────────────────────────────────────

    document.getElementById('show-bart-intro-btn').addEventListener('click', function () {
        showScreen('screen-bart-intro');
    });

    document.getElementById('start-bart-real-btn').addEventListener('click', function () {
        startBART();
    });

    document.getElementById('bart-pump-btn').addEventListener('click', pumpBART);
    document.getElementById('bart-bank-btn').addEventListener('click', bankBART);
    document.getElementById('bart-next-btn').addEventListener('click', function () {
        showScreen('screen-igt-intro');
    });

    document.getElementById('start-igt-real-btn').addEventListener('click', function () {
        startIGT();
    });

    document.querySelectorAll('.card-deck').forEach(function (btn, i) {
        btn.addEventListener('click', function () { pickDeck(i); });
    });
    document.getElementById('igt-next-btn').addEventListener('click', showResults);



    // Retry is disabled — retry button is hidden after results are shown

    document.getElementById('final-submit-btn').addEventListener('click', function () {
        var btn = document.getElementById('final-submit-btn');
        var status = document.getElementById('submit-status');

        // Gather all scores from localStorage
        var iq = JSON.parse(localStorage.getItem('tf_iq') || 'null');
        var skillset = JSON.parse(localStorage.getItem('tf_skillset') || 'null');
        var games = JSON.parse(localStorage.getItem('tf_games') || 'null');
        var formData = JSON.parse(localStorage.getItem('formCache') || 'null');

        if (!iq || !skillset || !games) {
            var missing = [];
            if (!iq) missing.push('Psychometric Test');
            if (!skillset) missing.push('Technical Assessment');
            if (!games) missing.push('Games Assessment');
            status.style.color = '#ff6b6b';
            status.textContent = 'Please complete: ' + missing.join(', ') + ' before submitting.';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Submitting…';
        status.style.color = '#5a7ca0';
        status.textContent = 'Saving your results…';

        const API_BASE_URL = window.API_BASE_URL || '';
        fetch(`${API_BASE_URL}/submit-final`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicant: { email: formData.email },
                scores: { iq: iq, skillset: skillset, games: games }
            })
        })
            .then(function (r) {
                if (!r.ok) throw new Error('Server returned ' + r.status);
                return r.json();
            })
            .then(function (res) {
                localStorage.setItem('applicationSubmitted', 'true');
                localStorage.setItem('assessmentCompleted', 'true');
                window.location.href = 'confirmation.html';
            })
            .catch(function (err) {
                status.style.color = '#ff6b6b';
                status.textContent = 'Submission failed: ' + err.message;
                btn.disabled = false;
                btn.textContent = 'Submit Application →';
            });

    });

});
