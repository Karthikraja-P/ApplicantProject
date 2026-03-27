document.addEventListener('DOMContentLoaded', function () {

    // ─── Guard ─────────────────────────────────────────────────────────────────
    const selectedArea = localStorage.getItem('selectedArea');

    let testInProgress = false;
    window.addEventListener('beforeunload', function (e) {
        if (testInProgress) { e.preventDefault(); }
    });

    // ─── SVG Helpers ───────────────────────────────────────────────────────────

    function pentPts(cx, cy, r) {
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i / 5) - Math.PI / 2;
            pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
        }
        return pts.join(' ');
    }

    function shapeCell(type, fill, cx, cy, r) {
        const col = '#c8d8f0';
        const f   = fill === 'full' ? col : 'none';
        if (type === 'sq') {
            const x = cx - r, y = cy - r, s = r * 2;
            if (fill === 'half') {
                return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + (s / 2) + '" fill="' + col + '"/>'
                     + '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + col + '" stroke-width="2"/>';
            }
            return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + f + '" stroke="' + col + '" stroke-width="2"/>';
        }
        if (type === 'ci') {
            if (fill === 'half') {
                return '<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' Z" fill="' + col + '"/>'
                     + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="2"/>';
            }
            return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '" stroke="' + col + '" stroke-width="2"/>';
        }
        const pts = pentPts(cx, cy, r);
        const uid = 'pc' + cx + '_' + cy;
        if (fill === 'half') {
            return '<clipPath id="' + uid + '"><rect x="' + (cx - r - 2) + '" y="' + (cy - r - 2) + '" width="' + (r * 2 + 4) + '" height="' + (r + 2) + '"/></clipPath>'
                 + '<polygon points="' + pts + '" fill="' + col + '" clip-path="url(#' + uid + ')"/>'
                 + '<polygon points="' + pts + '" fill="none" stroke="' + col + '" stroke-width="2"/>';
        }
        return '<polygon points="' + pts + '" fill="' + f + '" stroke="' + col + '" stroke-width="2"/>';
    }

    function buildShapeMatrix() {
        const types = ['sq', 'ci', 'pe'];
        const fills = ['none', 'half', 'full'];
        const S = 90, r = 28;
        let s = '<svg width="270" height="270" viewBox="0 0 270 270" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:8px;">';
        for (let i = 1; i < 3; i++) {
            s += '<line x1="' + (i*S) + '" y1="0" x2="' + (i*S) + '" y2="270" stroke="#2a3a55" stroke-width="1"/>';
            s += '<line x1="0" y1="' + (i*S) + '" x2="270" y2="' + (i*S) + '" stroke="#2a3a55" stroke-width="1"/>';
        }
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cx = col * S + S / 2, cy = row * S + S / 2;
                if (row === 2 && col === 2) {
                    s += '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" font-size="36" fill="#445" font-weight="bold">?</text>';
                } else {
                    s += shapeCell(types[col], fills[row], cx, cy, r);
                }
            }
        }
        return s + '</svg>';
    }

    function shapeOpt(type, fill) {
        return '<svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:6px;">'
             + shapeCell(type, fill, 45, 45, 30) + '</svg>';
    }

    function buildNumMatrix(vals) {
        const S = 80;
        let s = '<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:8px;">';
        for (let i = 1; i < 3; i++) {
            s += '<line x1="' + (i*S) + '" y1="0" x2="' + (i*S) + '" y2="240" stroke="#2a3a55" stroke-width="1"/>';
            s += '<line x1="0" y1="' + (i*S) + '" x2="240" y2="' + (i*S) + '" stroke="#2a3a55" stroke-width="1"/>';
        }
        for (let i = 0; i < 9; i++) {
            const col = i % 3, row = Math.floor(i / 3);
            const cx = col * S + S / 2, cy = row * S + S / 2 + 10;
            const color = vals[i] === '?' ? '#445' : '#c8d8f0';
            s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-size="30" fill="' + color + '" font-weight="bold">' + vals[i] + '</text>';
        }
        return s + '</svg>';
    }

    function numOpt(n) {
        return '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:6px;">'
             + '<text x="40" y="50" text-anchor="middle" font-size="32" fill="#c8d8f0" font-weight="bold">' + n + '</text></svg>';
    }

    // ─── Question Bank ─────────────────────────────────────────────────────────

    const QUESTIONS = [

        // ── Sample PDF questions ────────────────────────────────────────────────
        {
            q: 'Which one does NOT belong with the others?',
            opts: ['A.  Dog', 'B.  Mouse', 'C.  Lion', 'D.  Snake', 'E.  Elephant'],
            a: 3,
            exp: 'Snake is the only reptile; all others are mammals.'
        },
        {
            q: 'What is the next number in the series?\n\n1  ·  1  ·  2  ·  3  ·  5  ·  8  ·  13  ·  __',
            opts: ['A.  18', 'B.  20', 'C.  21', 'D.  26'],
            a: 2,
            exp: 'Each term is the sum of the two before it: 8 + 13 = 21.'
        },
        {
            q: 'Finger is to Hand  as  Leaf is to ___',
            opts: ['A.  Tree', 'B.  Flower', 'C.  Branch', 'D.  Root'],
            a: 2,
            exp: 'A finger is part of a hand; a leaf grows from a branch.'
        },
        {
            q: 'Mary is 16 years old. She is 4 times older than her brother.\nHow old will Mary be when she is twice as old as her brother?',
            opts: ['A.  32', 'B.  24', 'C.  8', 'D.  20'],
            a: 1,
            exp: 'Brother is 4. Gap = 12. Solve 16+x = 2(4+x): x = 8. Mary will be 24.'
        },
        {
            q: 'What is the missing number?\n\n1  ·  8  ·  27  ·  __  ·  125  ·  216',
            opts: ['A.  36', 'B.  48', 'C.  56', 'D.  64'],
            a: 3,
            exp: 'These are perfect cubes: 1³=1, 2³=8, 3³=27, 4³=64, 5³=125, 6³=216.'
        },
        {
            q: 'All architects are engineers.\nNo engineers are drone pilots.\n\nWhich conclusion necessarily follows?',
            opts: [
                'A.  No architects are drone pilots.',
                'B.  Some architects are drone pilots.',
                'C.  All engineers are architects.',
                'D.  Some drone pilots are engineers.'
            ],
            a: 0,
            exp: 'All architects ⊆ engineers, and engineers ∩ drone-pilots = ∅, so architects ∩ drone-pilots = ∅.'
        },
        {
            q: 'Which shape completes the pattern?',
            visual: buildShapeMatrix(),
            svgOpts: [shapeOpt('pe','full'), shapeOpt('pe','none'), shapeOpt('sq','full'), shapeOpt('ci','none')],
            optLabels: ['A','B','C','D'],
            a: 0,
            exp: 'Row 3 = fully-filled shapes; Column 3 = pentagons. Missing cell: filled pentagon.'
        },
        {
            q: 'What number replaces the question mark?',
            visual: buildNumMatrix([4,3,7, 3,6,9, 2,9,'?']),
            svgOpts: [numOpt(9), numOpt(7), numOpt(11), numOpt(6)],
            optLabels: ['9','7','11','6'],
            a: 2,
            exp: 'Each row sums to its third number: 4+3=7, 3+6=9, 2+9=11.'
        },
        {
            q: 'What number replaces the question mark?',
            visual: buildNumMatrix([5,3,15, 3,3,9, 4,2,'?']),
            svgOpts: [numOpt(6), numOpt(12), numOpt(2), numOpt(8)],
            optLabels: ['6','12','2','8'],
            a: 3,
            exp: 'Column 1 × Column 2 = Column 3: 5×3=15, 3×3=9, 4×2=8.'
        },
        {
            q: 'What number replaces the question mark?',
            visual: buildNumMatrix([43,42,40, 37,33,28, 22,15,'?']),
            svgOpts: [numOpt(14), numOpt(7), numOpt(0), numOpt(21)],
            optLabels: ['14','7','0','21'],
            a: 1,
            exp: 'Column 3 differences: 40→28 (−12), 28→? (−21, diff-of-diffs = −9). 28−21 = 7.'
        },

        // ── DiLi-Lab / MeRID Psychometric Tests ────────────────────────────────
        {
            source: 'DiLi-Lab / MeRID',
            q: 'The word below is printed in a specific ink colour.\nWhat COLOUR is the ink? (Do not read the word — look at the colour.)',
            visual: '<svg width="320" height="110" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:8px;"><text x="160" y="74" text-anchor="middle" font-size="62" font-weight="bold" fill="#e63946" font-family="Arial, sans-serif">GREEN</text></svg>',
            opts: ['A.  Green', 'B.  Red', 'C.  Blue', 'D.  Yellow'],
            a: 1,
            exp: 'Stroop effect: the word says "GREEN" but the ink colour is Red. Suppressing word meaning requires cognitive control.'
        },
        {
            source: 'DiLi-Lab / MeRID',
            q: 'Look at the row of arrows below.\nWhich direction does the CENTRE arrow point?',
            visual: '<svg width="320" height="90" viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg" style="background:#0d1b2a;border-radius:8px;"><text x="160" y="62" text-anchor="middle" font-size="52" fill="#c8d8f0" font-family="Arial, sans-serif">&#8592; &#8592; &#8594; &#8592; &#8592;</text></svg>',
            opts: ['A.  Left', 'B.  Right', 'C.  Up', 'D.  Down'],
            a: 1,
            exp: 'Flanker task: the flanking arrows point left, but the centre arrow points Right. Attention must focus on the target and suppress distractors.'
        },
        {
            source: 'DiLi-Lab / MeRID',
            q: 'You were shown this sequence for 3 seconds:\n\n7  ·  3  ·  9  ·  1  ·  5\n\nWhich number was NOT in the sequence?',
            opts: ['A.  7', 'B.  4', 'C.  9', 'D.  5'],
            a: 1,
            exp: 'Working memory task: the sequence was 7, 3, 9, 1, 5. The number 4 never appeared.'
        },

        // ── Vishal1003 / psychometric-mindHunt ─────────────────────────────────
        {
            source: 'Vishal1003 / mindHunt',
            q: 'Your team is behind schedule and a key member is visibly struggling with their workload. What is the most effective response?',
            opts: [
                'A.  Reassign their tasks to others immediately without discussion.',
                'B.  Have a private conversation to understand the issue and offer support.',
                'C.  Escalate to management right away.',
                'D.  Wait and monitor — they will likely catch up on their own.'
            ],
            a: 1,
            exp: 'Effective team collaboration starts with direct, empathetic communication before escalating or reassigning.'
        },
        {
            source: 'Vishal1003 / mindHunt',
            q: 'You are mid-sprint and a critical production bug is reported. You also have a feature deadline today. What do you do?',
            opts: [
                'A.  Ignore the bug report and meet the feature deadline first.',
                'B.  Fix the bug immediately without telling anyone.',
                'C.  Triage the bug, notify stakeholders, and negotiate the feature deadline.',
                'D.  Hand the bug to whoever reported it and continue your work.'
            ],
            a: 2,
            exp: 'Triage first (assess severity), communicate transparently with stakeholders, then negotiate priorities.'
        },
        {
            source: 'Vishal1003 / mindHunt',
            q: 'After a project retrospective, your approach is criticised by two teammates. How do you respond?',
            opts: [
                'A.  Defend your decisions — you had valid reasons for each one.',
                'B.  Agree publicly but ignore the feedback privately.',
                'C.  Listen carefully, ask clarifying questions, and incorporate useful feedback.',
                'D.  Avoid the teammates in future projects to prevent conflict.'
            ],
            a: 2,
            exp: 'Growth mindset requires genuinely receiving feedback. Listening, clarifying, and adapting is the hallmark of a strong team contributor.'
        },

        // ── SebastienEveno / McKinsey Solve Game ───────────────────────────────
        {
            source: 'SebastienEveno / McKinsey Solve',
            q: 'In a food chain:  Grass → Rabbit → Fox\n\nAll Rabbits are suddenly removed from the ecosystem. What is the most likely outcome?',
            opts: [
                'A.  Fox population increases; Grass decreases.',
                'B.  Fox population decreases; Grass increases.',
                'C.  Fox population increases; Grass increases.',
                'D.  No change in either Fox or Grass populations.'
            ],
            a: 1,
            exp: 'Removing the middle link: Foxes lose their food source → Fox declines. Grass is no longer grazed → Grass expands.'
        },
        {
            source: 'SebastienEveno / McKinsey Solve',
            q: 'Four predator species (A, B, C, D) share two prey species (X, Y).\n• Species A eats X only.\n• Species B eats Y only.\n• Species C eats both X and Y.\n• Species D eats both X and Y.\n\nIf Species X goes extinct, which predators survive?',
            opts: [
                'A.  A, B, C and D all survive.',
                'B.  B, C and D survive; A goes extinct.',
                'C.  Only B survives.',
                'D.  None survive.'
            ],
            a: 1,
            exp: 'A depends solely on X — it goes extinct. B, C, and D can feed on the remaining prey species Y, so they survive.'
        },
        {
            source: 'SebastienEveno / McKinsey Solve',
            q: 'You must form a sustainable 3-species food chain (each predator must have something to eat).\nAvailable species: Eagle, Trout, Mayfly, Deer.\n• Eagle eats Trout and Deer.\n• Trout eats Mayfly.\n• Deer eats Grass (external).\n• Mayfly eats Algae (external).\n\nWhich trio forms a complete, valid chain?',
            opts: [
                'A.  Eagle → Deer → Mayfly',
                'B.  Eagle → Trout → Mayfly',
                'C.  Deer → Eagle → Trout',
                'D.  Eagle → Deer → Trout'
            ],
            a: 1,
            exp: 'Eagle eats Trout ✓, Trout eats Mayfly ✓, Mayfly eats Algae (external) ✓. Every species has a valid food source.'
        },
    ];

    const QUESTION_TIME = 60;

    // ─── State ─────────────────────────────────────────────────────────────────

    // answers[i] = null (unanswered) | -1 (expired) | 0-4 (chosen index)
    const answers     = new Array(QUESTIONS.length).fill(null);
    let   currentIdx  = 0;
    let   score       = 0;
    let   epoch       = 0;
    let   currentTicker = null;

    // ─── Cached DOM references ─────────────────────────────────────────────────

    const screens  = document.querySelectorAll('.psych-screen');
    const navItems = document.querySelectorAll('.psych-nav-item');
    const prevBtn  = document.getElementById('q-prev-btn');
    const nextBtn  = document.getElementById('q-next-btn');

    // ─── Helpers ───────────────────────────────────────────────────────────────

    function showScreen(id) {
        screens.forEach(el => el.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    function setNavActive() {
        navItems.forEach(el => {
            el.classList.remove('active', 'done', 'locked');
            el.classList.add(el.dataset.module === 'C' ? 'active' : 'locked');
        });
    }

    function setNavDone() {
        navItems.forEach(el => {
            el.classList.remove('active', 'done', 'locked');
            el.classList.add(el.dataset.module === 'R' ? 'active' : 'done');
        });
    }

    function startTimer(barId, numId, seconds, onExpire) {
        const bar   = document.getElementById(barId);
        const num   = document.getElementById(numId);
        const start = Date.now();
        let warningSet = false, dangerSet = false;

        bar.style.transition = 'none';
        bar.style.width      = '100%';
        bar.classList.remove('warning', 'danger');

        requestAnimationFrame(() => {
            bar.style.transition = 'width ' + seconds + 's linear';
            bar.style.width      = '0%';
        });

        num.textContent = seconds;

        const ticker = setInterval(() => {
            const left = Math.max(0, seconds - Math.floor((Date.now() - start) / 1000));
            num.textContent = left;
            if (left <= 3 && !dangerSet)        { bar.classList.add('danger');  dangerSet  = true; }
            else if (left <= 10 && !warningSet) { bar.classList.add('warning'); warningSet = true; }
            if (left <= 0) { clearInterval(ticker); onExpire(); }
        }, 500);

        return ticker;
    }

    // Stop running timer and freeze bar display
    function stopTimer() {
        clearInterval(currentTicker);
        currentTicker = null;
        const bar = document.getElementById('pattern-timer-bar');
        const num = document.getElementById('pattern-timer-num');
        bar.style.transition = 'none';
        bar.style.width      = '0%';
        num.textContent      = '—';
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    function renderQuestion(idx) {
        const q         = QUESTIONS[idx];
        const answered  = answers[idx] !== null;
        const chosen    = answers[idx]; // null | -1 | 0-4

        document.getElementById('pattern-counter').textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;

        // Question area
        const questionEl = document.getElementById('pattern-question');
        questionEl.innerHTML = '';

        if (q.source) {
            const badge = document.createElement('div');
            badge.className   = 'q-source-badge';
            badge.textContent = q.source;
            questionEl.appendChild(badge);
        }

        if (q.visual) {
            const vizDiv = document.createElement('div');
            vizDiv.className = 'pattern-visual';
            vizDiv.innerHTML = q.visual;
            questionEl.appendChild(vizDiv);
        }

        const caption = document.createElement('p');
        caption.className   = 'pattern-caption';
        caption.textContent = q.q;
        questionEl.appendChild(caption);

        // Explanation
        const exp = document.getElementById('pattern-explanation');
        exp.className   = 'mcq-explanation';
        exp.textContent = '';

        if (answered) {
            exp.textContent = (chosen === q.a ? '✓ Correct' : (chosen === -1 ? '⏱  Time\'s up' : '✗ Incorrect')) + ' — ' + q.exp;
            exp.classList.add(chosen === q.a ? 'correct' : 'incorrect', 'visible');
        }

        // Options
        const optsEl = document.getElementById('pattern-options');
        optsEl.innerHTML = '';

        if (q.svgOpts) {
            optsEl.classList.add('pattern-grid');
            q.svgOpts.forEach((svg, i) => {
                const btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                btn.innerHTML = svg + '<span class="opt-label">' + q.optLabels[i] + '</span>';
                if (answered) {
                    btn.disabled = true;
                    btn.classList.add('revealed');
                    if (i === q.a)                           btn.classList.add('correct');
                    else if (i === chosen && chosen !== q.a) btn.classList.add('incorrect');
                } else {
                    btn.onclick = () => selectAnswer(idx, i);
                }
                optsEl.appendChild(btn);
            });
        } else {
            optsEl.classList.remove('pattern-grid');
            q.opts.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className   = 'mcq-option';
                btn.textContent = opt;
                if (answered) {
                    btn.disabled = true;
                    btn.classList.add('revealed');
                    if (i === q.a)                           btn.classList.add('correct');
                    else if (i === chosen && chosen !== q.a) btn.classList.add('incorrect');
                } else {
                    btn.onclick = () => selectAnswer(idx, i);
                }
                optsEl.appendChild(btn);
            });
        }

        // Nav buttons
        prevBtn.style.display = idx > 0 ? 'inline-block' : 'none';
        nextBtn.disabled      = false;
        nextBtn.textContent   = (idx === QUESTIONS.length - 1) ? 'Finish ✓' : 'Next →';
    }

    // ─── Assessment logic ──────────────────────────────────────────────────────

    function navigateTo(idx) {
        // Stop any running timer
        epoch++;
        clearInterval(currentTicker);
        currentTicker = null;
        currentIdx = idx;

        // Reset timer bar for new question
        const bar = document.getElementById('pattern-timer-bar');
        bar.style.transition = 'none';
        bar.style.width = '100%';
        bar.classList.remove('warning', 'danger');
        document.getElementById('pattern-timer-num').textContent = QUESTION_TIME;

        renderQuestion(idx);

        // Start timer only if unanswered
        if (answers[idx] === null) {
            const myEpoch = epoch;
            currentTicker = startTimer('pattern-timer-bar', 'pattern-timer-num', QUESTION_TIME, () => {
                if (epoch !== myEpoch) return;
                recordAnswer(idx, -1);
            });
        } else {
            stopTimer();
        }
    }

    function recordAnswer(idx, chosen) {
        if (answers[idx] !== null) return; // already answered
        answers[idx] = chosen;
        if (chosen === QUESTIONS[idx].a) score++;
        stopTimer();
        renderQuestion(idx); // re-render with revealed state
    }

    function selectAnswer(idx, chosen) {
        if (answers[idx] !== null) return;
        recordAnswer(idx, chosen);
    }

    // ─── Results ───────────────────────────────────────────────────────────────

    function showResults() {
        testInProgress = false;
        epoch++;
        clearInterval(currentTicker);
        showScreen('screen-results');
        setNavDone();

        const max = QUESTIONS.length || 1;
        const pct = Math.round((score / max) * 100);

        const tier =
            pct >= 85 ? 'Exceptional' :
            pct >= 70 ? 'Strong'      :
            pct >= 55 ? 'Moderate'    :
            pct >= 40 ? 'Developing'  : 'Below Threshold';

        const tierColor =
            pct >= 85 ? '#00ff88' :
            pct >= 70 ? '#00d4ff' :
            pct >= 55 ? '#f0a500' : '#ff6f6f';

        document.getElementById('res-overall-pct').textContent = pct + '%';
        document.getElementById('res-tier').textContent        = tier;
        document.getElementById('res-tier').style.color        = tierColor;
        document.getElementById('res-C').textContent           = score + '/' + max;

        setTimeout(() => {
            document.getElementById('bar-C').style.width = pct + '%';
        }, 150);

        localStorage.setItem('psychoResults', JSON.stringify({
            C: { score, max },
            composite: { score, max, percent: pct, tier },
            completedAt: new Date().toISOString(),
        }));

        let count = 5;
        const cdEl   = document.getElementById('redirect-countdown');
        const cdTick = setInterval(() => {
            count--;
            cdEl.textContent = count;
            if (count <= 0) { clearInterval(cdTick); doRedirect(); }
        }, 1000);

        proceedBtn.onclick = () => { clearInterval(cdTick); doRedirect(); };
    }

    function doRedirect() {
        const pageMap = {
            'database': 'next_database.html',
            'ml':       'next_ml.html',
            'ai':       'next_ai.html',
            'not-sure': 'next_not_sure.html',
        };
        window.location.href = pageMap[selectedArea] || 'confirmation.html';
    }

    // ─── Nav button handlers ───────────────────────────────────────────────────

    prevBtn.addEventListener('click', () => {
        if (currentIdx > 0) navigateTo(currentIdx - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentIdx < QUESTIONS.length - 1) {
            navigateTo(currentIdx + 1);
        } else {
            showResults();
        }
    });

    // ─── Entry Point ───────────────────────────────────────────────────────────

    const proceedBtn = document.getElementById('proceed-btn');

    document.getElementById('start-btn').addEventListener('click', () => {
        showScreen('screen-moduleC');
        setNavActive();
        testInProgress = true;
        navigateTo(0);
    });

});
