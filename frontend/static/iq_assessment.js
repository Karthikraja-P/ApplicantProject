document.addEventListener('DOMContentLoaded', function () {

    // ─── SVG constants ─────────────────────────────────────────────────────────
    const COL  = '#c8d8f0';
    const BG   = '#0d1b2a';
    const GRID = '#2a3a55';

    // ─── Shape cell builders: return (cx, cy) => svgString ─────────────────────

    function sqSVG(fill, r) {
        r = r || 28;
        return function (cx, cy) {
            var f = fill === 'full' ? COL : 'none';
            var s = '<rect x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + (r * 2) + '" height="' + (r * 2) + '" fill="' + f + '" stroke="' + COL + '" stroke-width="2"/>';
            if (fill === 'half') s = '<rect x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + (r * 2) + '" height="' + r + '" fill="' + COL + '"/>' + s;
            return s;
        };
    }

    function ciSVG(fill, r) {
        r = r || 28;
        return function (cx, cy) {
            var f = fill === 'full' ? COL : 'none';
            var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '" stroke="' + COL + '" stroke-width="2"/>';
            if (fill === 'half') s = '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' Z" fill="' + COL + '"/>' + s;
            return s;
        };
    }

    function trSVG(fill, r) {
        r = r || 28;
        return function (cx, cy) {
            var h = (r * 0.866).toFixed(1);
            var h2 = (r * 0.5).toFixed(1);
            var p = cx + ',' + (cy - r) + ' ' + (cx - h) + ',' + (cy + +h2) + ' ' + (cx + +h) + ',' + (cy + +h2);
            var f = fill === 'full' ? COL : 'none';
            var s = '<polygon points="' + p + '" fill="' + f + '" stroke="' + COL + '" stroke-width="2"/>';
            if (fill === 'half') {
                var mid = (cy + r * 0.08).toFixed(1);
                var bot = (cy + +h2).toFixed(1);
                s = '<polygon points="' + (cx - h) + ',' + mid + ' ' + (cx + +h) + ',' + mid + ' ' + (cx + +h) + ',' + bot + ' ' + (cx - h) + ',' + bot + '" fill="' + COL + '"/>' + s;
            }
            return s;
        };
    }

    function diSVG(fill, r) {
        r = r || 28;
        return function (cx, cy) {
            var rw = (r * 0.65).toFixed(1);
            var p = cx + ',' + (cy - r) + ' ' + (cx + +rw) + ',' + cy + ' ' + cx + ',' + (cy + r) + ' ' + (cx - rw) + ',' + cy;
            var f = fill === 'full' ? COL : 'none';
            return '<polygon points="' + p + '" fill="' + f + '" stroke="' + COL + '" stroke-width="2"/>';
        };
    }

    function numFn(n) {
        return function (cx, cy) {
            var color = (n === '?') ? '#3a4a5a' : COL;
            return '<text x="' + cx + '" y="' + (cy + 11) + '" text-anchor="middle" font-size="30" fill="' + color + '" font-weight="bold">' + n + '</text>';
        };
    }

    function dotsFn(n) {
        return function (cx, cy) {
            var r = 7;
            var pos = [];
            if      (n === 1)  pos = [[0, 0]];
            else if (n === 2)  pos = [[-10, 0], [10, 0]];
            else if (n === 3)  pos = [[0, -10], [-10, 8], [10, 8]];
            else if (n === 4)  pos = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
            else if (n === 5)  pos = [[0, -14], [-13, -3], [13, -3], [-8, 10], [8, 10]];
            else if (n === 6)  pos = [[-13, -12], [0, -12], [13, -12], [-13, 4], [0, 4], [13, 4]];
            else if (n === 8)  pos = [[-14,-14],[0,-14],[14,-14],[-14,0],[14,0],[-14,14],[0,14],[14,14]];
            else if (n === 9)  { for (var i=0;i<3;i++) for (var j=0;j<3;j++) pos.push([(j-1)*14,(i-1)*14]); }
            else if (n === 12) { for (var ri=0;ri<3;ri++) for (var ci2=0;ci2<4;ci2++) pos.push([(ci2-1.5)*13,(ri-1)*16]); }
            else pos = [[0, 0]];
            return pos.map(function (p) {
                return '<circle cx="' + (cx + p[0]) + '" cy="' + (cy + p[1]) + '" r="' + r + '" fill="' + COL + '"/>';
            }).join('');
        };
    }

    function arrowFn(dir) {
        // dir: 0=→ 1=↘ 2=↓ 3=↙ 4=← 5=↖ 6=↑ 7=↗
        return function (cx, cy) {
            var angle = dir * Math.PI / 4;
            var r = 22;
            var ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle);
            var sx = cx - r * 0.6 * Math.cos(angle), sy = cy - r * 0.6 * Math.sin(angle);
            var hl = 9, ha = 0.5;
            var ax1 = ex - hl * Math.cos(angle - ha), ay1 = ey - hl * Math.sin(angle - ha);
            var ax2 = ex - hl * Math.cos(angle + ha), ay2 = ey - hl * Math.sin(angle + ha);
            return '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="' + COL + '" stroke-width="2.5" stroke-linecap="round"/>' +
                   '<polygon points="' + ex.toFixed(1) + ',' + ey.toFixed(1) + ' ' + ax1.toFixed(1) + ',' + ay1.toFixed(1) + ' ' + ax2.toFixed(1) + ',' + ay2.toFixed(1) + '" fill="' + COL + '"/>';
        };
    }

    // ─── Matrix / option SVG builders ──────────────────────────────────────────

    function buildMatrix(cells) {
        var CXS = [45, 135, 225], CYS = [45, 135, 225];
        var content = '';
        for (var i = 1; i < 3; i++) {
            content += '<line x1="' + (i * 90) + '" y1="0" x2="' + (i * 90) + '" y2="270" stroke="' + GRID + '" stroke-width="1"/>';
            content += '<line x1="0" y1="' + (i * 90) + '" x2="270" y2="' + (i * 90) + '" stroke="' + GRID + '" stroke-width="1"/>';
        }
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var idx = row * 3 + col;
                var cx = CXS[col], cy = CYS[row];
                if (cells[idx] === null) {
                    content += '<text x="225" y="237" text-anchor="middle" font-size="42" fill="#3a4a5a" font-weight="bold">?</text>';
                } else {
                    content += cells[idx](cx, cy);
                }
            }
        }
        return '<svg width="270" height="270" viewBox="0 0 270 270" xmlns="http://www.w3.org/2000/svg" style="background:' + BG + ';border-radius:8px;">' + content + '</svg>';
    }

    function buildOpt(fn) {
        return '<svg width="56" height="56" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="background:' + BG + ';border-radius:6px;">' + fn(40, 40) + '</svg>';
    }

    function buildNumOpt(n) {
        return '<svg width="56" height="56" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="background:' + BG + ';border-radius:6px;"><text x="40" y="50" text-anchor="middle" font-size="32" fill="' + COL + '" font-weight="bold">' + n + '</text></svg>';
    }

    // ─── Question Bank ──────────────────────────────────────────────────────────

    var QUESTIONS = [

        // Q1: Shape × Fill matrix (RPM classic)
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none'), ciSVG('none'), trSVG('none'),
                     sqSVG('half'), ciSVG('half'), trSVG('half'),
                     sqSVG('full'), ciSVG('full'), null],
            opts:      [trSVG('full'), trSVG('none'), ciSVG('full'), sqSVG('half')],
            optLabels: ['A', 'B', 'C', 'D'],
            answer: 0, time: 90,
            exp: 'Each row shares a fill style (none/half/full). Each column has the same shape. Row 3 = filled; Column 3 = triangle → filled triangle.'
        },

        // Q2: col1 + col2 = col3
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(8), numFn(3), numFn(11),
                     numFn(5), numFn(7), numFn(12),
                     numFn(9), numFn(4), null],
            numOpts: [13, 14, 12, 15],
            answer: 0, time: 60,
            exp: 'Each row: Col1 + Col2 = Col3. 8+3=11, 5+7=12, 9+4=13.'
        },

        // Q3: Dot counting (row × col)
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [dotsFn(1), dotsFn(2), dotsFn(3),
                     dotsFn(2), dotsFn(4), dotsFn(6),
                     dotsFn(3), dotsFn(6), null],
            opts:      [dotsFn(9), dotsFn(8), dotsFn(6), dotsFn(12)],
            optLabels: ['9', '8', '6', '12'],
            answer: 0, time: 90,
            exp: 'Dots = row × column. Row 3, Col 3 = 3 × 3 = 9 dots.'
        },

        // Q4: col1 × col2 = col3
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(3), numFn(4), numFn(12),
                     numFn(5), numFn(3), numFn(15),
                     numFn(6), numFn(2), null],
            numOpts: [12, 8, 10, 14],
            answer: 0, time: 60,
            exp: 'Each row: Col1 × Col2 = Col3. 3×4=12, 5×3=15, 6×2=12.'
        },

        // Q5: Arrow rotation +45° per step
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [arrowFn(0), arrowFn(1), arrowFn(2),
                     arrowFn(1), arrowFn(2), arrowFn(3),
                     arrowFn(2), arrowFn(3), null],
            opts:      [arrowFn(4), arrowFn(0), arrowFn(6), arrowFn(2)],
            optLabels: ['A', 'B', 'C', 'D'],
            answer: 0, time: 90,
            exp: 'Each arrow rotates 45° clockwise per step. Row 3 goes: ↓, ↙, ← (dir 4).'
        },

        // Q6: Perfect squares diagonal
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(1),  numFn(4),  numFn(9),
                     numFn(4),  numFn(9),  numFn(16),
                     numFn(9),  numFn(16), null],
            numOpts: [25, 20, 36, 21],
            answer: 0, time: 60,
            exp: 'Each diagonal uses consecutive perfect squares: 1², 2², 3², 4², 5²=25.'
        },

        // Q7: Shape size progression (small → medium → large)
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('full', 12), sqSVG('full', 20), sqSVG('full', 28),
                     ciSVG('full', 12), ciSVG('full', 20), ciSVG('full', 28),
                     trSVG('full', 12), trSVG('full', 20), null],
            opts:      [trSVG('full', 28), trSVG('full', 12), ciSVG('full', 28), sqSVG('full', 28)],
            optLabels: ['A', 'B', 'C', 'D'],
            answer: 0, time: 90,
            exp: 'Each row shows the same shape growing small → medium → large. Row 3 = triangle; Column 3 = large.'
        },

        // Q8: n²+1 sequence
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2),  numFn(5),  numFn(10),
                     numFn(5),  numFn(10), numFn(17),
                     numFn(10), numFn(17), null],
            numOpts: [26, 24, 28, 25],
            answer: 0, time: 60,
            exp: 'Values follow n²+1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26.'
        },

        // Q9: Progressive filling (0 → 1 → 2 filled shapes per row)
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [diSVG('none'), ciSVG('none'), sqSVG('none'),
                     diSVG('full'), ciSVG('none'), sqSVG('none'),
                     diSVG('full'), ciSVG('full'), null],
            opts:      [sqSVG('full'), sqSVG('none'), ciSVG('full'), diSVG('full')],
            optLabels: ['A', 'B', 'C', 'D'],
            answer: 0, time: 90,
            exp: 'Each row has one more filled shape: Row 1 = 0, Row 2 = 1, Row 3 = 2 → the last shape must also be filled.'
        },

        // Q10: n³ pattern (n, n², n³)
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2), numFn(4),  numFn(8),
                     numFn(3), numFn(9),  numFn(27),
                     numFn(4), numFn(16), null],
            numOpts: [64, 48, 32, 80],
            answer: 0, time: 60,
            exp: 'Each row: n, n², n³. Row 3: 4, 4²=16, 4³=64.'
        }
    ];

    // ─── State ─────────────────────────────────────────────────────────────────
    var answers    = new Array(QUESTIONS.length).fill(null);
    var currentIdx = 0;
    var ticker     = null;
    var epoch      = 0;

    // ─── DOM ───────────────────────────────────────────────────────────────────
    var screens   = document.querySelectorAll('.psych-screen');
    var startBtn  = document.getElementById('start-btn');
    var prevBtn   = document.getElementById('q-prev-btn');
    var nextBtn   = document.getElementById('q-next-btn');
    var finishBtn = document.getElementById('q-finish-btn');
    var numGrid   = document.getElementById('q-number-grid');

    function showScreen(id) {
        screens.forEach(function (el) { el.classList.remove('active'); });
        document.getElementById(id).classList.add('active');
    }

    // ─── Timer ─────────────────────────────────────────────────────────────────
    function startTimer(seconds, onExpire) {
        var bar    = document.getElementById('timer-bar');
        var numEl  = document.getElementById('timer-num');
        var myEpoch = ++epoch;
        if (ticker) clearInterval(ticker);

        bar.classList.remove('warning', 'danger');
        bar.style.transition = 'none';
        bar.style.width = '100%';
        numEl.textContent = seconds;

        requestAnimationFrame(function () {
            bar.style.transition = 'width ' + seconds + 's linear';
            bar.style.width = '0%';
        });

        var start = Date.now();
        ticker = setInterval(function () {
            if (myEpoch !== epoch) { clearInterval(ticker); return; }
            var left = Math.max(0, seconds - Math.floor((Date.now() - start) / 1000));
            numEl.textContent = left;
            var pct = left / seconds;
            bar.classList.toggle('warning', pct <= 0.4 && pct > 0.15);
            bar.classList.toggle('danger',  pct <= 0.15);
            if (left <= 0) {
                clearInterval(ticker);
                if (answers[currentIdx] === null) answers[currentIdx] = -1;
                updateNumGrid();
                onExpire();
            }
        }, 250);
    }

    function stopTimer() {
        epoch++;
        if (ticker) clearInterval(ticker);
        var bar = document.getElementById('timer-bar');
        if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; }
        var numEl = document.getElementById('timer-num');
        if (numEl) numEl.textContent = '—';
    }

    // ─── Render ────────────────────────────────────────────────────────────────
    function renderQuestion(idx) {
        var q       = QUESTIONS[idx];
        var qNum    = document.getElementById('q-num');
        var qTitle  = document.getElementById('q-title');
        var qVisual = document.getElementById('q-visual');
        var qOpts   = document.getElementById('q-options');
        var qExp    = document.getElementById('q-explanation');
        var badge   = document.getElementById('q-source-badge');

        qNum.textContent   = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
        qTitle.textContent = q.title;
        qExp.className     = 'mcq-explanation';
        qExp.textContent   = '';

        if (q.source) { badge.style.display = 'inline-block'; badge.textContent = q.source; }
        else          { badge.style.display = 'none'; }

        // Matrix visual
        qVisual.innerHTML   = buildMatrix(q.matrix);
        qVisual.style.display = 'flex';

        // Build options
        qOpts.innerHTML = '';
        var isNum = !q.opts && q.numOpts;

        if (isNum) {
            qOpts.className = 'mcq-options psych-opts-row';
            q.numOpts.forEach(function (n, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                btn.innerHTML = buildNumOpt(n) + '<span class="opt-label">' + n + '</span>';
                btn.addEventListener('click', (function (ci) { return function () { selectAnswer(ci); }; })(i));
                qOpts.appendChild(btn);
            });
        } else {
            qOpts.className = 'mcq-options psych-opts-row';
            q.opts.forEach(function (fn, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = q.optLabels ? q.optLabels[i] : String.fromCharCode(65 + i);
                btn.innerHTML = buildOpt(fn) + '<span class="opt-label">' + label + '</span>';
                btn.addEventListener('click', (function (ci) { return function () { selectAnswer(ci); }; })(i));
                qOpts.appendChild(btn);
            });
        }

        // Restore prior answer
        if (answers[idx] !== null && answers[idx] !== -1) {
            stopTimer();
            revealAnswer(qOpts.querySelectorAll('.mcq-option'), answers[idx], q.answer, q.exp);
        } else if (answers[idx] === -1) {
            stopTimer();
            disableOpts(qOpts);
            qExp.textContent = 'Time expired. ' + q.exp;
            qExp.className   = 'mcq-explanation visible incorrect';
        } else {
            startTimer(q.time, function () {
                disableOpts(document.getElementById('q-options'));
                var e = document.getElementById('q-explanation');
                e.textContent = 'Time expired. ' + q.exp;
                e.className   = 'mcq-explanation visible incorrect';
                updateNav();
            });
        }

        updateNumGrid();
        updateNav();
    }

    function disableOpts(container) {
        container.querySelectorAll('.mcq-option').forEach(function (o) {
            o.disabled = true; o.classList.add('revealed');
        });
    }

    function selectAnswer(chosen) {
        if (answers[currentIdx] !== null) return;
        stopTimer();
        answers[currentIdx] = chosen;
        var q    = QUESTIONS[currentIdx];
        var opts = document.getElementById('q-options').querySelectorAll('.mcq-option');
        revealAnswer(opts, chosen, q.answer, q.exp);
        updateNumGrid();
        updateNav();
    }

    function revealAnswer(opts, chosen, correct, exp) {
        opts.forEach(function (o, i) {
            o.disabled = true; o.classList.add('revealed');
            if (i === correct)                        o.classList.add('correct');
            else if (i === chosen && chosen !== correct) o.classList.add('incorrect');
        });
        var expEl       = document.getElementById('q-explanation');
        var isCorrect   = chosen === correct;
        expEl.textContent = (isCorrect ? '✓ Correct. ' : '✗ Incorrect. ') + exp;
        expEl.className   = 'mcq-explanation visible ' + (isCorrect ? 'correct' : 'incorrect');
    }

    // ─── Navigation ────────────────────────────────────────────────────────────
    function updateNav() {
        var allDone = answers.every(function (a) { return a !== null; });
        var isLast  = currentIdx === QUESTIONS.length - 1;
        prevBtn.style.display   = currentIdx > 0 ? 'inline-block' : 'none';
        nextBtn.style.display   = !isLast ? 'inline-block' : 'none';
        finishBtn.style.display = (isLast || allDone) ? 'inline-block' : 'none';
    }

    function updateNumGrid() {
        if (!numGrid) return;
        numGrid.innerHTML = '';
        QUESTIONS.forEach(function (_, i) {
            var btn = document.createElement('button');
            btn.className   = 'q-num-btn';
            btn.textContent = i + 1;
            if (i === currentIdx)        btn.classList.add('qn-current');
            else if (answers[i] !== null) btn.classList.add('qn-answered');
            btn.addEventListener('click', (function (ci) { return function () { goTo(ci); }; })(i));
            numGrid.appendChild(btn);
        });
    }

    function goTo(idx) { currentIdx = idx; renderQuestion(idx); }

    prevBtn.addEventListener('click',  function () { if (currentIdx > 0) goTo(currentIdx - 1); });
    nextBtn.addEventListener('click',  function () { if (currentIdx < QUESTIONS.length - 1) goTo(currentIdx + 1); });
    finishBtn.addEventListener('click', showResults);
    startBtn.addEventListener('click',  function () { showScreen('screen-question'); renderQuestion(0); });

    // ─── Results ───────────────────────────────────────────────────────────────
    function showResults() {
        stopTimer();
        var score = 0;
        answers.forEach(function (a, i) { if (a === QUESTIONS[i].answer) score++; });
        var pct = Math.round(score / QUESTIONS.length * 100);

        document.getElementById('res-score').textContent = score + ' / ' + QUESTIONS.length;

        var percentile, tier, tierColor;
        if (pct >= 90) { percentile = 'Top 10%';  tier = 'Exceptional';    tierColor = '#00ff88'; }
        else if (pct >= 70) { percentile = 'Top 30%'; tier = 'Above Average'; tierColor = '#00d4ff'; }
        else if (pct >= 50) { percentile = 'Top 50%'; tier = 'Average';       tierColor = '#ffcc44'; }
        else                { percentile = 'Below 50%'; tier = 'Developing';  tierColor = '#ff9a9a'; }

        document.getElementById('res-percentile').textContent = percentile;
        var tierEl = document.getElementById('res-tier');
        tierEl.textContent = tier;
        tierEl.style.color = tierColor;

        var breakdown = document.getElementById('res-breakdown');
        breakdown.innerHTML = '';
        var cats = [
            { label: 'Visual Patterns', indices: [0, 2, 4, 6, 8] },
            { label: 'Number Matrices', indices: [1, 3, 5, 7, 9] }
        ];
        cats.forEach(function (cat) {
            var correct = cat.indices.filter(function (i) { return answers[i] === QUESTIONS[i].answer; }).length;
            var total   = cat.indices.length;
            var p       = Math.round(correct / total * 100);
            var row     = document.createElement('div');
            row.className = 'psych-result-row';
            row.innerHTML = '<span class="psych-result-label">' + cat.label + '</span>' +
                            '<div class="psych-bar-wrap"><div class="psych-bar" style="width:' + p + '%;"></div></div>' +
                            '<span class="psych-result-val">' + correct + '/' + total + '</span>';
            breakdown.appendChild(row);
        });

        showScreen('screen-results');
    }
});
