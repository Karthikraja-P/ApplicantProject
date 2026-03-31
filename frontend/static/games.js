document.addEventListener('DOMContentLoaded', function () {

    var GAME_TIME = 5 * 60; // 5 minutes per game (seconds)

    // ─── Pre-generated data ────────────────────────────────────────────────────

    // BART: 15 pre-seeded explosion points (pumps at which balloon pops, 1–20)
    var BART_EXPLODE_AT = [7, 13, 3, 18, 9, 5, 14, 2, 11, 16, 6, 19, 8, 12, 4];
    var BART_BALLOONS   = 15;
    var EARN_PER_PUMP   = 0.05;

    // IGT: 4 decks — A & B are negative EV, C & D are positive EV
    var IGT_DECKS = [
        { label: 'A', reward: 100, lossPct: 50, lossMin: 150, lossMax: 350 },  // EV: -25/card
        { label: 'B', reward: 100, lossPct: 10, lossMin: 1200, lossMax: 1300 }, // EV: -25/card
        { label: 'C', reward:  50, lossPct: 50, lossMin:  25,  lossMax:  75 },  // EV: +25/card
        { label: 'D', reward:  50, lossPct: 10, lossMin: 225,  lossMax: 275 },  // EV: +25/card
    ];
    var IGT_TRIALS  = 40;
    var IGT_START   = 2000;

    // Hard/Easy question pairs
    var HE_QS = [
        { easy: { q: '5 + 3',  a: 8  }, hard: { q: '34 + 27', a: 61  } },
        { easy: { q: '9 - 4',  a: 5  }, hard: { q: '56 + 38', a: 94  } },
        { easy: { q: '6 + 7',  a: 13 }, hard: { q: '73 - 28', a: 45  } },
        { easy: { q: '8 - 3',  a: 5  }, hard: { q: '45 + 36', a: 81  } },
        { easy: { q: '4 + 9',  a: 13 }, hard: { q: '62 - 37', a: 25  } },
        { easy: { q: '7 + 6',  a: 13 }, hard: { q: '84 + 19', a: 103 } },
        { easy: { q: '9 - 5',  a: 4  }, hard: { q: '51 + 49', a: 100 } },
        { easy: { q: '3 + 8',  a: 11 }, hard: { q: '76 - 29', a: 47  } },
        { easy: { q: '6 - 2',  a: 4  }, hard: { q: '38 + 47', a: 85  } },
        { easy: { q: '7 + 4',  a: 11 }, hard: { q: '93 - 46', a: 47  } },
        { easy: { q: '8 + 5',  a: 13 }, hard: { q: '67 + 25', a: 92  } },
        { easy: { q: '9 - 3',  a: 6  }, hard: { q: '54 - 18', a: 36  } },
        { easy: { q: '4 + 6',  a: 10 }, hard: { q: '82 + 13', a: 95  } },
        { easy: { q: '7 - 4',  a: 3  }, hard: { q: '46 + 37', a: 83  } },
        { easy: { q: '5 + 8',  a: 13 }, hard: { q: '71 - 24', a: 47  } },
        { easy: { q: '9 + 2',  a: 11 }, hard: { q: '58 + 36', a: 94  } },
        { easy: { q: '6 + 3',  a: 9  }, hard: { q: '43 - 17', a: 26  } },
        { easy: { q: '8 - 6',  a: 2  }, hard: { q: '69 + 28', a: 97  } },
        { easy: { q: '7 + 3',  a: 10 }, hard: { q: '85 - 39', a: 46  } },
        { easy: { q: '5 - 2',  a: 3  }, hard: { q: '77 + 16', a: 93  } },
    ];
    var HE_TRIALS = 20;

    // ─── State ─────────────────────────────────────────────────────────────────

    var bart = {
        balloon: 0, pumps: 0, roundEarnings: 0,
        totalBanked: 0, adjustedPumps: [], explodedCount: 0, done: false,
    };

    var igt = {
        trial: 0, balance: IGT_START, deckChoices: [], done: false,
    };

    var he = {
        trial: 0, totalEarned: 0,
        hardChosen: 0, hardCorrect: 0,
        easyChosen: 0, easyCorrect: 0,
        phase: 'choose', currentChoice: null, currentAnswer: 0, done: false,
    };

    var gameTicker = null;

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
        var bar   = document.getElementById(barId);
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

        var start = Date.now();
        gameTicker = setInterval(function () {
            var left = Math.max(0, GAME_TIME - Math.floor((Date.now() - start) / 1000));
            numEl.textContent = fmtTime(left);
            var pct = left / GAME_TIME;
            numEl.className = 'game-timer-num' + (pct <= 0.1 ? ' danger' : pct <= 0.3 ? ' warning' : '');
            bar.classList.toggle('warning', pct <= 0.3 && pct > 0.1);
            bar.classList.toggle('danger',  pct <= 0.1);
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

    function startBART() {
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
        document.getElementById('bart-pumps').textContent      = bart.pumps;
        document.getElementById('bart-round-earn').textContent = '$' + bart.roundEarnings.toFixed(2);
        document.getElementById('bart-total').textContent      = '$' + bart.totalBanked.toFixed(2);

        // Grow and recolour balloon with pumps
        var scale   = 1 + bart.pumps * 0.09;
        var danger  = Math.min(1, bart.pumps / 18);
        var g       = Math.round(200 * (1 - danger * 0.85));
        var balloon = document.getElementById('bart-balloon');
        balloon.style.transform  = 'scale(' + scale + ')';
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
        document.getElementById('igt-result').className   = 'igt-result-banner idle';
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
        balEl.className   = 'igt-balance' + (igt.balance < IGT_START ? ' negative' : '');
    }

    function pickDeck(deckIdx) {
        if (igt.done || igt.trial >= IGT_TRIALS) return;
        var deck   = IGT_DECKS[deckIdx];
        var reward = deck.reward;
        var loss   = (randInt(1, 100) <= deck.lossPct) ? randInt(deck.lossMin, deck.lossMax) : 0;
        var net    = reward - loss;

        igt.balance += net;
        igt.trial++;
        igt.deckChoices.push(deckIdx);

        var res = document.getElementById('igt-result');
        if (net >= 0) {
            res.textContent = 'Deck ' + deck.label + ':  +$' + reward + (loss ? '  −$' + loss : '') + '  =  +$' + net;
            res.className   = 'igt-result-banner win';
        } else {
            res.textContent = 'Deck ' + deck.label + ':  +$' + reward + '  −$' + loss + '  =  −$' + Math.abs(net);
            res.className   = 'igt-result-banner loss';
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

    // ══════════════════════════════════════════════════════════════════════════
    //  GAME 3 — Hard / Easy Task
    // ══════════════════════════════════════════════════════════════════════════

    function startHE() {
        he.trial = 0; he.totalEarned = 0;
        he.hardChosen = 0; he.hardCorrect = 0;
        he.easyChosen = 0; he.easyCorrect = 0;
        he.phase = 'choose'; he.done = false;
        showScreen('screen-he');
        document.getElementById('he-next-btn').style.display = 'none';
        renderHEChoose();
        startGameTimer('he-bar', 'he-timer', function () {
            he.done = true;
            document.getElementById('he-choose-wrap').style.display   = 'none';
            document.getElementById('he-question-wrap').style.display = 'none';
            setFeedback('he-feedback', 'Time\'s up!', '');
            document.getElementById('he-next-btn').style.display = 'inline-flex';
        });
    }

    function renderHEChoose() {
        document.getElementById('he-trial').textContent      = 'Trial ' + (he.trial + 1) + ' of ' + HE_TRIALS;
        document.getElementById('he-earned').textContent     = '$' + he.totalEarned.toFixed(2);
        document.getElementById('he-hard-count').textContent = he.hardChosen;
        document.getElementById('he-easy-count').textContent = he.easyChosen;
        document.getElementById('he-choose-wrap').style.display   = 'flex';
        document.getElementById('he-question-wrap').style.display = 'none';
        setFeedback('he-feedback', '', '');
        document.getElementById('he-answer').value = '';
        // Re-enable choice buttons
        document.querySelectorAll('.he-choice-btn').forEach(function (b) { b.disabled = false; });
    }

    function chooseTask(type) {
        if (he.done || he.phase !== 'choose') return;
        he.currentChoice = type;
        he.phase = 'answer';
        var q = HE_QS[he.trial][type];
        he.currentAnswer = q.a;

        document.getElementById('he-choose-wrap').style.display   = 'none';
        document.getElementById('he-question-wrap').style.display = 'block';
        document.getElementById('he-q-text').textContent = q.q + ' = ?';
        document.getElementById('he-answer').value = '';
        document.getElementById('he-answer').focus();
        setFeedback('he-feedback', '', '');
    }

    function submitHEAnswer() {
        if (he.phase !== 'answer' || he.done) return;
        var val     = parseInt(document.getElementById('he-answer').value, 10);
        var correct = val === he.currentAnswer;
        var reward  = he.currentChoice === 'hard' ? 3 : 1;
        var earned  = correct ? reward : 0;

        he.totalEarned += earned;
        if (he.currentChoice === 'hard') {
            he.hardChosen++;
            if (correct) he.hardCorrect++;
        } else {
            he.easyChosen++;
            if (correct) he.easyCorrect++;
        }

        var feedEl = document.getElementById('he-feedback');
        if (correct) {
            feedEl.textContent = '✓ Correct!  +$' + reward;
            feedEl.style.color = '#00ff88';
        } else {
            feedEl.textContent = '✗ Wrong — answer was ' + he.currentAnswer + '.  +$0';
            feedEl.style.color = '#ff6b6b';
        }

        he.phase = 'feedback';
        he.trial++;

        setTimeout(function () {
            if (he.trial >= HE_TRIALS) {
                he.done = true;
                stopGameTimer();
                document.getElementById('he-question-wrap').style.display = 'none';
                document.getElementById('he-next-btn').style.display = 'inline-flex';
            } else {
                he.phase = 'choose';
                renderHEChoose();
            }
        }, 950);
    }

    // ─── Shared feedback helper ────────────────────────────────────────────────

    function setFeedback(id, text, cls) {
        var el = document.getElementById(id);
        el.textContent = text;
        el.className   = id === 'bart-feedback' ? 'bart-feedback' + (cls ? ' ' + cls : '') : 'he-feedback';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  RESULTS
    // ══════════════════════════════════════════════════════════════════════════

    function showResults() {
        stopGameTimer();
        showScreen('screen-games-results');

        // ── BART ──
        var avgPumps = bart.adjustedPumps.length > 0
            ? (bart.adjustedPumps.reduce(function (s, v) { return s + v; }, 0) / bart.adjustedPumps.length)
            : 0;
        var bartProfile, bartDetail;
        if (avgPumps >= 13) {
            bartProfile = 'High Risk Taker';
            bartDetail  = 'Tends toward aggressive decisions — watch for overconfidence in low-probability scenarios.';
        } else if (avgPumps >= 7) {
            bartProfile = 'Optimal Risk Balance';
            bartDetail  = 'Calibrates risk vs. reward well — strong instinct for probability-adjusted decisions.';
        } else {
            bartProfile = 'Risk Averse';
            bartDetail  = 'Overly conservative — may underutilise high-value, moderate-risk opportunities.';
        }
        document.getElementById('res-bart-profile').textContent = bartProfile;
        document.getElementById('res-bart-detail').textContent  = bartDetail;
        document.getElementById('res-bart-stat').textContent    =
            'Avg pumps (non-exploded): ' + avgPumps.toFixed(1) +
            ' · Exploded: ' + bart.explodedCount +
            ' · Total banked: $' + bart.totalBanked.toFixed(2);

        // ── IGT ──
        var late = igt.deckChoices.slice(-Math.min(20, igt.deckChoices.length));
        var goodCount = late.filter(function (d) { return d >= 2; }).length;
        var goodPct   = late.length > 0 ? Math.round((goodCount / late.length) * 100) : 0;
        var igtProfile, igtDetail;
        if (goodPct >= 65) {
            igtProfile = 'Strong Pattern Recogniser';
            igtDetail  = 'Identified the positive-EV decks and adapted — excellent expected-value reasoning.';
        } else if (goodPct >= 40) {
            igtProfile = 'Moderate Learner';
            igtDetail  = 'Partially adapted to the reward structure across trials.';
        } else {
            igtProfile = 'Slow Adaptor';
            igtDetail  = 'Continued drawing from negative-EV decks — pattern recognition under uncertainty needs work.';
        }
        document.getElementById('res-igt-profile').textContent = igtProfile;
        document.getElementById('res-igt-detail').textContent  = igtDetail;
        document.getElementById('res-igt-stat').textContent    =
            'Final balance: $' + igt.balance.toLocaleString() +
            ' · Good-deck % (last 20): ' + goodPct + '%' +
            ' · Trials: ' + igt.trial;

        // ── Hard/Easy ──
        var totalTrials = he.hardChosen + he.easyChosen;
        var hardPct     = totalTrials > 0 ? Math.round((he.hardChosen / totalTrials) * 100) : 0;
        var hardAcc     = he.hardChosen > 0 ? Math.round((he.hardCorrect / he.hardChosen) * 100) : 0;
        var heProfile, heDetail;
        if (hardPct >= 60) {
            heProfile = 'High Effort / High Reward';
            heDetail  = 'Consistently chose challenge — demonstrates intrinsic motivation and confidence.';
        } else if (hardPct >= 35) {
            heProfile = 'Balanced Effort Strategy';
            heDetail  = 'Mixed approach — pragmatically weighs effort cost against reward value.';
        } else {
            heProfile = 'Effort Conserving';
            heDetail  = 'Preferred easy tasks — may underperform in high-demand, high-complexity environments.';
        }
        document.getElementById('res-he-profile').textContent = heProfile;
        document.getElementById('res-he-detail').textContent  = heDetail;
        document.getElementById('res-he-stat').textContent    =
            'Hard chosen: ' + hardPct + '%' +
            ' · Hard accuracy: ' + hardAcc + '%' +
            ' · Total earned: $' + he.totalEarned.toFixed(2);
    }

    // ─── Event listeners ───────────────────────────────────────────────────────

    document.getElementById('start-games-btn').addEventListener('click', startBART);

    document.getElementById('bart-pump-btn').addEventListener('click', pumpBART);
    document.getElementById('bart-bank-btn').addEventListener('click', bankBART);
    document.getElementById('bart-next-btn').addEventListener('click', startIGT);

    document.querySelectorAll('.card-deck').forEach(function (btn, i) {
        btn.addEventListener('click', function () { pickDeck(i); });
    });
    document.getElementById('igt-next-btn').addEventListener('click', startHE);

    document.querySelectorAll('.he-choice-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { chooseTask(btn.dataset.type); });
    });
    document.getElementById('he-submit-btn').addEventListener('click', submitHEAnswer);
    document.getElementById('he-answer').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') submitHEAnswer();
    });
    document.getElementById('he-next-btn').addEventListener('click', showResults);

    document.getElementById('retry-games-btn').addEventListener('click', function () {
        stopGameTimer();
        showScreen('screen-games-intro');
    });

});
