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
            else if (n === 7)  pos = [[-14,-14],[0,-14],[14,-14],[-14,0],[14,0],[-14,14],[0,14]];
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

    // ─── Questions — loaded from iq_question_bank.js ──────────────────────────
    // To change the question set, replace iq_question_bank.js only.
    // This engine file must not contain question data.
    if (typeof IQ_QUESTION_BANK === 'undefined') {
        console.error('iq_question_bank.js must be loaded before iq_assessment.js');
    }
    var QUESTIONS = (typeof IQ_QUESTION_BANK !== 'undefined') ? IQ_QUESTION_BANK.slice() : [];

    // ── Legacy inline questions (kept for backwards compatibility only) ─────────
    // These are overridden by IQ_QUESTION_BANK above. Remove this block once the
    // scraper has been run and iq_question_bank.js is populated.
    var _LEGACY_QUESTIONS = [

    // ── M1: Shapes grow S→M→L across cols; circle/square/triangle per row ─────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('',12), ciSVG('',22), ciSVG('',32),
            sqSVG('',12), sqSVG('',22), sqSVG('',32),
            trSVG('',12), trSVG('',22), null
        ],
        opts: [trSVG('',32), ciSVG('',32), sqSVG('',32), trSVG('',12)],
        answer: 0, time: 90,
        exp: 'Shapes grow left-to-right (small→medium→large). Row 3 uses triangles — the missing piece is a large triangle.'
    },
    // ── M2: Fill empty→half→full across cols; circle/square/triangle per row ──
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG(''),  ciSVG('half'),  ciSVG('full'),
            sqSVG(''),  sqSVG('half'),  sqSVG('full'),
            trSVG(''),  trSVG('half'),  null
        ],
        opts: [trSVG(''), trSVG('half'), trSVG('full'), sqSVG('full')],
        answer: 2, time: 90,
        exp: 'Fill progresses empty→half→full across each row. Row 3 uses triangles — the missing piece is a fully-filled triangle.'
    },
    // ── M3: Dot count +1 per col; row starting value +1 per row ───────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            dotsFn(1), dotsFn(2), dotsFn(3),
            dotsFn(2), dotsFn(3), dotsFn(4),
            dotsFn(3), dotsFn(4), null
        ],
        opts: [dotsFn(3), dotsFn(4), dotsFn(5), dotsFn(6)],
        answer: 2, time: 90,
        exp: 'Each row adds 1 dot per column. Row 3 starts at 3 — the last value is 3+2 = 5 dots.'
    },
    // ── M4: Arrow rotates 90° CW per col; row start shifts 90° per row ────────
    {
        title: 'Which image completes the pattern?',
        source: 'Spatial Reasoning',
        matrix: [
            arrowFn(0), arrowFn(2), arrowFn(4),
            arrowFn(2), arrowFn(4), arrowFn(6),
            arrowFn(4), arrowFn(6), null
        ],
        opts: [arrowFn(0), arrowFn(2), arrowFn(5), arrowFn(7)],
        answer: 0, time: 90,
        exp: 'Each arrow rotates 90° clockwise across columns. Row 3: ← → ↑ → →. The missing arrow points right (→).'
    },
    // ── M5: Shape cycles circle→square→triangle (filled), shifting each row ───
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('full'), sqSVG('full'), trSVG('full'),
            sqSVG('full'), trSVG('full'), ciSVG('full'),
            trSVG('full'), ciSVG('full'), null
        ],
        opts: [ciSVG('full'), trSVG('full'), diSVG('full'), sqSVG('full')],
        answer: 3, time: 90,
        exp: 'Shapes cycle circle→square→triangle, shifting by one each row. Row 3 is triangle→circle→square.'
    },
    // ── M6: Shapes shrink L→M→S; circle/square/diamond per row ───────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('',32), ciSVG('',22), ciSVG('',12),
            sqSVG('',32), sqSVG('',22), sqSVG('',12),
            diSVG('',32), diSVG('',22), null
        ],
        opts: [diSVG('',22), diSVG('',12), ciSVG('',12), sqSVG('',12)],
        answer: 1, time: 90,
        exp: 'Shapes shrink right-to-left (large→medium→small). Row 3 uses diamonds — the missing piece is a small diamond.'
    },
    // ── M7: Fill per row (empty/half/full); circle/square/triangle per col ─────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG(''),     sqSVG(''),     trSVG(''),
            ciSVG('half'), sqSVG('half'), trSVG('half'),
            ciSVG('full'), sqSVG('full'), null
        ],
        opts: [trSVG('full'), trSVG('half'), trSVG(''), ciSVG('full')],
        answer: 0, time: 90,
        exp: 'Each row shares the same fill state. Row 3 is fully-filled; column 3 uses triangles — the answer is a full triangle.'
    },
    // ── M8: Numbers double across cols; different row start ───────────────────
    {
        title: 'Which number completes the pattern?',
        source: 'Quantitative Reasoning',
        matrix: [
            numFn(2),  numFn(4),  numFn(8),
            numFn(3),  numFn(6),  numFn(12),
            numFn(5),  numFn(10), null
        ],
        numOpts: [15, 18, 20, 25],
        answer: 2, time: 90,
        exp: 'Each number doubles across columns (×2). Row 3: 5 → 10 → 20.'
    },
    // ── M9: Arrow rotates −90° per col; row start shifts per row ──────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Spatial Reasoning',
        matrix: [
            arrowFn(6), arrowFn(4), arrowFn(2),
            arrowFn(0), arrowFn(6), arrowFn(4),
            arrowFn(2), arrowFn(0), null
        ],
        opts: [arrowFn(2), arrowFn(4), arrowFn(6), arrowFn(0)],
        answer: 2, time: 90,
        exp: 'Each arrow rotates 90° anti-clockwise across columns. Row 3: ↓ → → → ↑. The missing arrow points up (↑).'
    },
    // ── M10: Dot count +2 per col; row starting value +1 per row ─────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            dotsFn(3), dotsFn(5), dotsFn(7),
            dotsFn(4), dotsFn(6), dotsFn(8),
            dotsFn(5), dotsFn(7), null
        ],
        opts: [dotsFn(7), dotsFn(8), dotsFn(9), dotsFn(6)],
        answer: 2, time: 90,
        exp: 'Each row adds 2 dots per column. Row 3 col 2 = 7, so col 3 = 9 dots.'
    },
    {
        title: 'If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are definitely Lazzies.',
        source: 'Fluid Reasoning',
        opts: ['True', 'False'],
        answer: 0, time: 90, exp: 'This follows the transitive property of syllogism: if A=B and B=C, then A=C. Therefore, the statement is True.'
    },
    // ── M11: Numbers ×2 per col (matrix visual); opts show numbers 22-26 ────────
    {
        title: 'Which number completes the pattern?',
        source: 'Quantitative Reasoning',
        matrix: [
            numFn(4),  numFn(8),  numFn(16),
            numFn(5),  numFn(10), numFn(20),
            numFn(6),  numFn(12), null
        ],
        customOptsHtml: [
            '<div style="text-align:center;"><div style="font-size:12px;font-weight:bold;color:#f0f4f8;margin-bottom:5px;">A</div><div style="width:80px;height:80px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#142e56;background:#fff;border-radius:4px;">22</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px;font-weight:bold;color:#f0f4f8;margin-bottom:5px;">B</div><div style="width:80px;height:80px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#142e56;background:#fff;border-radius:4px;">23</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px;font-weight:bold;color:#f0f4f8;margin-bottom:5px;">C</div><div style="width:80px;height:80px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#142e56;background:#fff;border-radius:4px;">24</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px;font-weight:bold;color:#f0f4f8;margin-bottom:5px;">D</div><div style="width:80px;height:80px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#142e56;background:#fff;border-radius:4px;">26</div></div>'
        ],
        answer: 2, time: 90,
        exp: 'Each number doubles across columns (×2). Row 3: 6 → 12 → 24.'
    },
    // ── M12: Arrows rotate +45° per col; row start shifts +45° per row ────────
    {
        title: 'Which image completes the pattern?',
        source: 'Spatial Reasoning',
        matrix: [
            arrowFn(7), arrowFn(0), arrowFn(1),
            arrowFn(1), arrowFn(2), arrowFn(3),
            arrowFn(3), arrowFn(4), null
        ],
        opts: [arrowFn(5), arrowFn(6), arrowFn(7), arrowFn(0)],
        answer: 0, time: 90,
        exp: 'Each arrow rotates 45° clockwise per column. Row 3: ↙ → ← → ↖. The missing arrow points upper-left (↖).'
    },
    // ── M13: Dot count doubles per col: 1→2→4 / 2→4→8 / 1→2→4 ───────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            dotsFn(1), dotsFn(2), dotsFn(4),
            dotsFn(2), dotsFn(4), dotsFn(8),
            dotsFn(1), dotsFn(2), null
        ],
        opts: [dotsFn(3), dotsFn(2), dotsFn(4), dotsFn(6)],
        answer: 2, time: 90,
        exp: 'Dot count doubles across each row (×2). Row 3: 1 → 2 → 4.'
    },
    // ── M14: Uniform size per row; circle/square/diamond per col ─────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('',14), sqSVG('',14), diSVG('',14),
            ciSVG('',22), sqSVG('',22), diSVG('',22),
            ciSVG('',30), sqSVG('',30), null
        ],
        opts: [ciSVG('',30), sqSVG('',22), diSVG('',22), diSVG('',30)],
        answer: 3, time: 90,
        exp: 'Each row uses one consistent size. Column 3 always uses diamonds. Row 3 is large (r=30) — the answer is a large diamond.'
    },
    // ── M15: Numbers ×3 per col ────────────────────────────────────────────────
    {
        title: 'Which number completes the pattern?',
        source: 'Quantitative Reasoning',
        matrix: [
            numFn(1), numFn(3),  numFn(9),
            numFn(2), numFn(6),  numFn(18),
            numFn(3), numFn(9),  null
        ],
        numOpts: [18, 27, 30, 21],
        answer: 1, time: 90,
        exp: 'Each number multiplies by 3 across columns (×3). Row 3: 3 → 9 → 27.'
    },
    // ── M16: Fill rotates by 1 position each row (full/half/empty cycle) ──────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('full'),  ciSVG('half'),  ciSVG(''),
            sqSVG('half'),  sqSVG(''),      sqSVG('full'),
            trSVG(''),      trSVG('full'),  null
        ],
        opts: [trSVG('full'), trSVG('half'), trSVG(''), sqSVG('half')],
        answer: 1, time: 90,
        exp: 'Fill states cycle (full→half→empty) and shift by one each row. Row 3 column 3 completes with half-filled.'
    },
    // ── M17: Full/half/empty per col; circle→square→diamond per row ──────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('full'), ciSVG('half'), ciSVG(''),
            sqSVG('full'), sqSVG('half'), sqSVG(''),
            diSVG('full'), diSVG('half'), null
        ],
        opts: [diSVG('full'), diSVG('half'), diSVG(''), ciSVG('')],
        answer: 2, time: 90,
        exp: 'Column 3 is always empty-fill. Row 3 uses diamonds — the missing shape is an empty diamond.'
    },
    // ── M18: Mixed fill diagonal; shape constant per col ─────────────────────
    {
        title: 'Which image completes the pattern?',
        source: 'Perceptual Reasoning',
        matrix: [
            ciSVG('full'), ciSVG('half'), ciSVG(''),
            ciSVG('half'), ciSVG(''),     ciSVG('full'),
            ciSVG(''),     ciSVG('full'), null
        ],
        opts: [ciSVG('full'), ciSVG('half'), ciSVG(''), sqSVG('half')],
        answer: 1, time: 90,
        exp: 'Each row cycles fill states (full/half/empty) shifted by one. Row 3: empty → full → half.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: '/static/images/iq/q17_mod_main.svg',
        imgOpts: [
            '/static/images/iq/q17_mod_a.svg',
            '/static/images/iq/q17_mod_b.svg',
            '/static/images/iq/q17_mod_c.svg',
            '/static/images/iq/q17_mod_d.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    }
    ,
    {
        title: 'Choose the number that is 1/4 of 1/2 of 1/5 of 200:',
        source: 'Quantitative Reasoning',
        opts: ['2', '5', '10', '25', '50'],
        answer: 1, time: 90, exp: '1/5 of 200 = 40. 1/2 of 40 = 20. 1/4 of 20 = 5.'
    },
    {
        title: 'Which larger shape would be made if the two sections are fitted together?',
        source: 'Perceptual Reasoning',
        customHtml: `<div style="display:flex; gap:30px; align-items:center; justify-content:center; margin:20px 0; background:#f0f4f8; padding:20px; border-radius:8px;">
            <div style="display:grid; grid-template-columns:repeat(2, 40px); grid-template-rows:repeat(2, 40px); border:2px solid #333;">
                <div style="border:1px solid #333; background:#0d173c;"></div><div style="border:1px solid #333; background:#00a651;"></div>
                <div style="border:1px solid #333; background:#fff;"></div><div style="border:1px solid #333; background:#fff;"></div>
            </div>
            <div style="font-size:24px; color:#333; font-weight:bold;">+</div>
            <div style="display:grid; grid-template-columns:repeat(3, 40px); grid-template-rows:repeat(3, 40px); border:2px solid #333;">
                <div style="border:1px solid #333; background:#00a651;"></div><div style="border:1px solid #333; background:#0d173c;"></div><div style="border:1px solid #333; background:#fff;"></div>
                <div style="border:1px solid #333; background:#0d173c;"></div><div style="border:1px solid #333; background:#fff;"></div><div style="border:1px solid #333; background:#fff;"></div>
                <div style="border:1px solid #333; background:#fff;"></div><div style="border:1px solid #333; background:#fff;"></div><div style="border:1px solid #333; background:#fff;"></div>
            </div>
        </div>`,
        customOptsHtml: [
            `<div style="display:grid; grid-template-columns:repeat(3, 20px); grid-template-rows:repeat(3, 20px); border:1px solid #333;">
                <div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div>
            </div>`,
            `<div style="display:grid; grid-template-columns:repeat(3, 20px); grid-template-rows:repeat(3, 20px); border:1px solid #333;">
                <div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div>
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#00a651;"></div>
            </div>`,
            `<div style="display:grid; grid-template-columns:repeat(3, 20px); grid-template-rows:repeat(3, 20px); border:1px solid #333;">
                <div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div>
            </div>`,
            `<div style="display:grid; grid-template-columns:repeat(3, 20px); grid-template-rows:repeat(3, 20px); border:1px solid #333;">
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#fff;"></div>
                <div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#00a651;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div>
                <div style="border:0.5px solid #333; background:#fff;"></div><div style="border:0.5px solid #333; background:#0d173c;"></div><div style="border:0.5px solid #333; background:#00a651;"></div>
            </div>`
        ],
        answer: 0, time: 90, exp: 'The two sections complement each other to form a complete pattern where each color appears once per row and column.'
    },
    {
        title: 'John needs 13 bottles of water from the store. John can only carry 3 at a time. What is the minimum number of trips John needs to make?',
        source: 'Quantitative Reasoning',
        opts: ['3', '4', '4 1/2', '5', '6'],
        answer: 3, time: 90, exp: '13 divided by 3 is 4 remainder 1. So 4 trips is not enough; he needs a 5th trip. Answer: 5.'
    },
    {
        title: 'Which one of the numbers does not belong? 1, 2, 5, 10, 13, 26, 29, 48',
        source: 'Fluid Reasoning',
        opts: ['1', '5', '26', '29', '48'],
        answer: 4, time: 90, exp: 'The sequence alternates x2 and +3. 29x2=58, not 48. So 48 does not belong.'
    },
    {
        title: 'Ralph likes 25 but not 24; he likes 400 but not 300; he likes 144 but not 145. Which does he like?',
        source: 'Fluid Reasoning',
        opts: ['10', '50', '124', '200', '1600'],
        answer: 4, time: 90, exp: 'Ralph only likes perfect squares. 1600 = 40x40.'
    },
    {
        title: 'How many four-sided figures appear in the diagram below?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="position:relative;width:180px;height:220px;margin:20px auto;background:#fff;border-radius:4px;"><svg width="180" height="220" viewBox="0 0 180 220" stroke="#000" stroke-width="1.8" fill="none"><line x1="130" y1="10" x2="130" y2="210"/><line x1="165" y1="10" x2="165" y2="210"/><line x1="130" y1="10" x2="165" y2="10"/><line x1="10" y1="35" x2="165" y2="35"/><line x1="30" y1="55" x2="130" y2="55"/><line x1="10" y1="100" x2="130" y2="100"/><line x1="30" y1="140" x2="130" y2="140"/><line x1="95" y1="175" x2="165" y2="175"/><line x1="130" y1="210" x2="165" y2="210"/><line x1="10" y1="35" x2="10" y2="100"/><line x1="30" y1="55" x2="30" y2="140"/><line x1="95" y1="35" x2="95" y2="175"/></svg></div>',
        opts: ['10', '16', '22', '25', '28'],
        answer: 1, time: 90, exp: 'By counting all overlapping and adjacent four-sided shapes systematically, there are 16 in total.'
    },
    {
        title: 'How many squares are there in the picture?',
        source: 'Spatial Reasoning',
        customHtml: '<div style="position:relative;width:180px;height:180px;margin:20px auto;background:#fff;border-radius:4px;"><svg width="180" height="180" viewBox="0 0 180 180" stroke="#142e56" stroke-width="2" fill="none"><line x1="20" y1="55" x2="20" y2="125"/><line x1="55" y1="20" x2="55" y2="160"/><line x1="90" y1="55" x2="90" y2="125"/><line x1="125" y1="20" x2="125" y2="160"/><line x1="160" y1="20" x2="160" y2="125"/><line x1="55" y1="20" x2="160" y2="20"/><line x1="20" y1="55" x2="160" y2="55"/><line x1="55" y1="90" x2="125" y2="90"/><line x1="20" y1="125" x2="160" y2="125"/><line x1="55" y1="160" x2="125" y2="160"/></svg></div>',
        opts: ['8', '10', '11', '14', '17'],
        answer: 2, time: 90, exp: 'By counting all small, medium, and large squares systematically (including the 2x2 and its sub-sections), there are 11 in total.'
    },
    {
        title: 'Select the missing matrix:',
        source: 'Perceptual Reasoning',
        customHtml: `
        <div style="display:grid; grid-template-columns:repeat(3, 80px); gap:15px; justify-content:center; margin:20px auto; background:#f8fafc; padding:20px; border-radius:8px;">
            <!-- Row 1 -->
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <!-- Row 2 -->
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>
            <!-- Row 3 -->
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 18px); background:#142e56; padding:2px; width:54px; height:54px; border:2px solid #142e56;">
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:18px;height:18px;border:0.5px solid #142e56;background:#f59e0b;"></div>
            </div>
            <div style="background:#142e56; color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold; width:58px; height:58px; border-radius:4px;">?</div>
        </div>`,
        customOptsHtml: [
            // A - Empty
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                ${Array(9).fill('<div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>').join('')}
            </div>`,
            // B - Solution (Right Column)
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
            </div>`,
            // C - Middle Column
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>`,
            // D - Top segment
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>`,
            // E - Diagonal
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
            </div>`,
            // F - Middle Horiz
            `<div style="display:grid; grid-template-columns:repeat(3, 14px); background:#142e56; width:42px; height:42px; border:2px solid #142e56;">
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#f59e0b;"></div>
                <div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div><div style="width:14px;height:14px;border:0.5px solid #142e56;background:#fff;"></div>
            </div>`
        ],
        answer: 1, time: 90, exp: 'Each row focuses on a column (Left, Center, Right) and builds the pattern up to 3 blocks.'
    },

    {
        title: 'Which box completes the grid?',
        source: 'Perceptual Matrix',
        customHtml: `
        <div style="display:grid;grid-template-columns:60px 60px 60px;border:2px solid #142e56;width:max-content;margin:20px auto;background:#fff;">
            <!-- R1C1: 1 Left -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:22px;color:#142e56;">←</div>
            <!-- R1C2: 1 Down -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:22px;color:#142e56;">↓</div>
            <!-- R1C3: 1 Right -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;font-size:22px;color:#142e56;">→</div>
            
            <!-- R2C1: 2 Down (Adjacent) -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:4px;font-size:22px;color:#142e56;">
                <span>↓</span><span>↓</span>
            </div>
            <!-- R2C2: 2 Right (Stacked) -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.8;font-size:22px;color:#142e56;">
                <span>→</span><span>→</span>
            </div>
            <!-- R2C3: 2 Left (Stacked) -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.8;font-size:22px;color:#142e56;">
                <span>←</span><span>←</span>
            </div>

            <!-- R3C1: 3 Right (Stacked) -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.75;font-size:22px;color:#142e56;">
                <span>→</span><span>→</span><span>→</span>
            </div>
            <!-- R3C2: 3 Left (Stacked) -->
            <div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.75;font-size:22px;color:#142e56;">
                <span>←</span><span>←</span><span>←</span>
            </div>
            <div style="width:60px;height:60px;background:#142e56;display:flex;align-items:center;justify-content:center;color:#f59e0b;font-size:32px;font-weight:bold;">?</div>
        </div>`,
        customOptsHtml: [
            // Option A: 3 Up (Adjacent)
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:2px;background:#fff;font-size:22px;color:#142e56;"><span>↑</span><span>↑</span><span>↑</span></div>',
            // Option B: Up-Down-Up (Adjacent)
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:2px;background:#fff;font-size:22px;color:#142e56;"><span>↑</span><span>↓</span><span>↑</span></div>',
            // Option C: Left-Right-Left (Stacked)
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.75;background:#fff;font-size:22px;color:#142e56;"><span>←</span><span>→</span><span>←</span></div>',
            // Option D: 3 Down (Adjacent) - Correct
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:2px;background:#fff;font-size:22px;color:#142e56;"><span>↓</span><span>↓</span><span>↓</span></div>',
            // Option E: Right-Left-Right (Stacked)
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:0.75;background:#fff;font-size:22px;color:#142e56;"><span>→</span><span>←</span><span>→</span></div>',
            // Option F: Down-Up-Down (Adjacent)
            '<div style="width:60px;height:60px;border:1px solid #142e56;display:flex;align-items:center;justify-content:center;gap:2px;background:#fff;font-size:22px;color:#142e56;"><span>↓</span><span>↑</span><span>↓</span></div>'
        ],
        answer: 3, time: 90, exp: 'Each row uses the same direction set (L/D/R, D/R/L, R/L/?). Third row needs Down arrows x3.'
    },


    {
        title: 'Complete the pattern of stars and moons:',
        source: 'Perceptual Patterns',
        customHtml: `
        <div style="display:grid;grid-template-columns:54px 54px 54px;gap:20px;width:max-content;margin:20px auto;background:#fff;padding:15px;border:1px solid #142e56;">
            <!-- G1 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div>
            </div>
            <!-- G2 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G3 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G4 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G5 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G6 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div>
            </div>
            <!-- G7 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G8 -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;">
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
            </div>
            <!-- G9 (Question Mark) -->
            <div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#142e56;color:#f59e0b;position:relative;">
                <div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div>
                <div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div>
                <div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div><div style="border:0.5px solid rgba(255,255,255,0.1);"></div>
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;z-index:10;">?</div>
            </div>
        </div>`,
        customOptsHtml: [
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>',
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>',
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5 solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>',
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>',
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>',
            '<div style="display:grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);border:1px solid #142e56;background:#fff;"><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div></div>'
        ],
        answer: 0, time: 90, exp: 'Star moves top→bottom→middle across each outer column (col 3: [0][2]→[2][2]→[1][2]). Moon moves right→centre→left along each row (col 3: none→[0][1]→[0][0]).'
    }
    ,
    {
        title: 'Which image completes the pattern in the corner?',
        source: 'Perceptual Patterns',
        imgUrl: '/static/images/iq/q36.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 3, time: 90, exp: 'The corner lines rotate 90 degrees clockwise while the inner shapes alternate colors.'
    },
    {
        title: 'Find the missing number in the sequence matrix.',
        source: 'Quantitative Reasoning',
        imgUrl: '/static/images/iq/q37.jpg',
        opts: ['10', '7', '8', '21', '5', '14'],
        answer: 1, time: 90, exp: 'The numbers decrease sequentially down the columns and across the rows by increasing differences: -1, -2, -3, -4, -5, -6, -7. So 15 - 8 = 7.'
    },
    {
        title: 'Which number completes the wheel sequence?',
        source: 'Quantitative Reasoning',
        imgUrl: '/static/images/iq/q38.jpg',
        opts: ['28', '25', '26', '23', '24', '22'],
        answer: 4, time: 90, exp: 'Each adjacent slice increases by 3: 12, 15, 18, 21, 24.'
    },
    {
        title: 'Find the missing number for the bottom hexagon set.',
        source: 'Quantitative Reasoning',
        imgUrl: '/static/images/iq/q40.jpg',
        opts: ['15', '16', '17', '18', '19', '20'],
        answer: 3, time: 90, exp: 'The number at the bottom is the sum of the three numbers at the top of the hexagon cluster. 5 + 6 + 7 = 18.'
    }
    ,
    {
        title: 'Which image completes the matrix?',
        source: 'Perceptual Patterns',
        customHtml: '<div style="position:relative; display:inline-block; max-width:100%; border-radius:8px; overflow:hidden; background:#e2e8f0; padding:10px;"><img src="/static/images/iq/q41.jpg" style="max-width:100%; max-height:270px; display:block; object-fit:contain; border-radius:4px;" /><div style="position:absolute; top:12px; left:12px; width:120px; height:28px; background:#fff; z-index:10;"></div><div style="position:absolute; top:12px; right:12px; width:75px; height:28px; background:#fff; z-index:10;"></div></div>',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 0, time: 90, exp: 'The shapes combine and change according to the logic pattern for each row and column.'
    },
    {
        title: 'Find the missing block in the sequence.',
        source: 'Quantitative Reasoning',
        imgUrl: '/static/images/iq/q42.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 2, time: 90, exp: 'The signs and their positions alternate.'
    },
    {
        title: 'Complete the arrow sequence.',
        source: 'Spatial Reasoning',
        imgUrl: '/static/images/iq/q43.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 1, time: 90, exp: 'The arrows rotate 90 degrees clockwise in each step.'
    },
    {
        title: 'Which figure completes the sets?',
        source: 'Perceptual Logic',
        imgUrl: '/static/images/iq/q44.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 3, time: 90, exp: 'The inner circles and triangles transition across the dividers following a set pattern.'
    },
    {
        title: 'Identify the missing grid tile.',
        source: 'Spatial Matrix',
        imgUrl: '/static/images/iq/q45.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 4, time: 90, exp: 'The dots and smaller shapes navigate the 3x3 grids progressively.'
    },
    {
        title: 'Identify the missing number in the grid:',
        source: 'Quantitative Reasoning',
        customHtml: `
        <div style="display:grid; grid-template-columns:repeat(3, 80px); gap:10px; justify-content:center; margin:20px auto; background:#f0f4f8; padding:20px; border-radius:8px;">
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">20</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">30</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">15</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">8</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">18</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">9</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">10</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">20</div>
            <div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">?</div>
        </div>`,
        customOptsHtml: [
            '<div style="text-align:center;"><div style="font-size:12px; font-weight:bold; color:#f0f4f8; margin-bottom:5px;">A</div><div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">10</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px; font-weight:bold; color:#f0f4f8; margin-bottom:5px;">B</div><div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">12</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px; font-weight:bold; color:#f0f4f8; margin-bottom:5px;">C</div><div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">13</div></div>',
            '<div style="text-align:center;"><div style="font-size:12px; font-weight:bold; color:#f0f4f8; margin-bottom:5px;">D</div><div style="width:80px; height:80px; border:1px solid #142e56; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; color:#142e56; background:#fff; border-radius:4px;">8</div></div>'
        ],
        answer: 0, time: 90, exp: 'In each row, the third entry is half of the second entry (30/2=15; 18/2=9, so 20/2=10).'
    }
]; // end _LEGACY_QUESTIONS

    // ─── Shuffle options (randomise order, keep answer tracking correct) ───────
    function shuffleArr(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    QUESTIONS.forEach(function (q) {
        // Image option questions — shuffle URLs, update answer index
        if (q.imgOpts && q.imgOpts.length > 0) {
            var correctUrl = q.imgOpts[q.answer];
            q.imgOpts = shuffleArr(q.imgOpts);
            q.answer  = q.imgOpts.indexOf(correctUrl);
        }
        // Text/number option questions — skip letter labels (A-F) and True/False
        else if (q.opts && q.opts.length > 0
                 && q.opts[0] !== 'A' && q.opts[0] !== 'True' && q.opts[0] !== 'False') {
            var correctVal = q.opts[q.answer];
            q.opts   = shuffleArr(q.opts);
            q.answer = q.opts.indexOf(correctVal);
        }
    });

    // ─── Assessment completed lock ─────────────────────────────────────────────
    var _iqLocked = localStorage.getItem('iq_completed') === 'true'
                 || localStorage.getItem('assessmentCompleted') === 'true';
    if (_iqLocked) {
        var intro = document.getElementById('screen-intro');
        if (intro) {
            intro.innerHTML = buildCompletedBanner(
                '🧠 General IQ Assessment',
                'You have already completed this assessment.',
                [{ label: '← Application', href: '/' },
                 { label: 'Skillset Assessment', href: '/assessment/skillset' },
                 { label: 'Confirmation', href: '/confirmation' }]
            );
            intro.classList.add('active');
            intro.style.display = '';
        }
        // Hide other screens
        document.querySelectorAll('.psych-screen:not(#screen-intro)').forEach(function(s) {
            s.style.display = 'none';
        });
        return;
    }

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
        screens.forEach(function (el) { 
            el.classList.remove('active'); 
            el.style.display = 'none';
        });
        var target = document.getElementById(id);
        target.classList.add('active');
        target.style.display = 'block'; // Or flex, let's use block depending on CSS, or just empty string. Actually empty string is best.
        target.style.display = '';
    }

    // ─── Section timer (10 minutes for whole IQ section) ───────────────────────
    var SECTION_SECONDS = 600; // 10 minutes

    function fmtTime(secs) {
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function startSectionTimer() {
        var bar   = document.getElementById('timer-bar');
        var numEl = document.getElementById('timer-num');
        var myEpoch = ++epoch;
        if (ticker) clearInterval(ticker);

        bar.classList.remove('warning', 'danger');
        bar.style.transition = 'none';
        bar.style.width = '100%';
        numEl.textContent = fmtTime(SECTION_SECONDS);

        requestAnimationFrame(function () {
            bar.style.transition = 'width ' + SECTION_SECONDS + 's linear';
            bar.style.width = '0%';
        });

        var start = Date.now();
        ticker = setInterval(function () {
            if (myEpoch !== epoch) { clearInterval(ticker); return; }
            var left = Math.max(0, SECTION_SECONDS - Math.floor((Date.now() - start) / 1000));
            numEl.textContent = fmtTime(left);
            var pct = left / SECTION_SECONDS;
            bar.classList.toggle('warning', pct <= 0.4 && pct > 0.15);
            bar.classList.toggle('danger',  pct <= 0.15);
            if (left <= 0) {
                clearInterval(ticker);
                // Mark all unanswered as timed-out
                for (var i = 0; i < answers.length; i++) {
                    if (answers[i] === null) answers[i] = -1;
                }
                updateNumGrid();
                showResults();
            }
        }, 500);
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
        
        if (q.customHtml) {
            qVisual.innerHTML = q.customHtml;
        } else if (q.imgUrl) {
            qVisual.innerHTML = '<img src="' + q.imgUrl + '" style="max-width:100%;max-height:270px;border-radius:8px;object-fit:contain;background-color:#e2e8f0;padding:10px;" />';
        } else if (q.matrix) {
            qVisual.innerHTML = buildMatrix(q.matrix);
        } else {
            qVisual.innerHTML = '';
        }
        qVisual.style.display = 'flex';

        // Build options
        qOpts.innerHTML = '';
        var isNum = !q.opts && !q.imgOpts && q.numOpts;
        var isImg = q.imgOpts && q.imgOpts.length > 0;


        var isOptsHtml = q.customOptsHtml && q.customOptsHtml.length > 0;
        
        if (isOptsHtml) {
            qOpts.className = 'mcq-options psych-opts-row';
            q.customOptsHtml.forEach(function (htmlStr, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = q.optLabels ? q.optLabels[i] : String.fromCharCode(65 + i);
                btn.innerHTML = htmlStr + '<span class="opt-label">' + label + '</span>';
                btn.addEventListener('click', (function (ci) { return function () { selectAnswer(ci); }; })(i));
                qOpts.appendChild(btn);
            });
        } else if (isImg) {
            qOpts.className = 'mcq-options psych-opts-row';
            q.imgOpts.forEach(function (url, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = String.fromCharCode(65 + i);
                btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#ffffff;padding:4px;" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';
                btn.addEventListener('click', (function (ci) { return function () { selectAnswer(ci); }; })(i));
                qOpts.appendChild(btn);
            });
        } else if (isNum) {
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
            q.opts.forEach(function (val, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = q.optLabels ? q.optLabels[i] : String.fromCharCode(65 + i);
                if (typeof val === 'function') {
                    btn.innerHTML = buildOpt(val) + '<span class="opt-label">' + label + '</span>';
                } else {
                    btn.innerHTML = '<div style="font-size:20px; font-weight:bold; color:#f59e0b; padding:10px 0;">' + val + '</div>' + '<span class="opt-label">' + label + '</span>';
                }
                btn.addEventListener('click', (function (ci) { return function () { selectAnswer(ci); }; })(i));
                qOpts.appendChild(btn);
            });
        }

        // Restore prior answer (section timer keeps running — no per-question timer)
        if (answers[idx] !== null && answers[idx] !== -1) {
            revealAnswer(qOpts.querySelectorAll('.mcq-option'), answers[idx], q.answer, q.exp);
        } else if (answers[idx] === -1) {
            disableOpts(qOpts);
            qExp.textContent = 'Section time expired. ' + q.exp;
            qExp.className   = 'mcq-explanation visible incorrect';
        }
        // else: unanswered — section timer is already running, nothing to start here

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
    startBtn.addEventListener('click', function () {
        showScreen('screen-question');
        renderQuestion(0);
        startSectionTimer(); // single 10-min timer for the whole section
    });

    // ─── Results ───────────────────────────────────────────────────────────────
    function showResults() {
        stopTimer();
        localStorage.setItem('iq_completed', 'true'); // lock IQ from retry
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

        // ── Dynamic breakdown by source category ──────────────────────────────
        // Groups questions by their `source` field so any question bank works.
        var sourceMap = {};
        QUESTIONS.forEach(function (q, i) {
            var src = q.source || 'General';
            if (!sourceMap[src]) sourceMap[src] = [];
            sourceMap[src].push(i);
        });
        var cats = Object.keys(sourceMap).map(function (src) {
            return { label: src, indices: sourceMap[src] };
        });
        // Limit to top 6 categories for display
        cats.sort(function (a, b) { return b.indices.length - a.indices.length; });
        cats.slice(0, 6).forEach(function (cat) {
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

        // Save IQ score to localStorage for final submission
        localStorage.setItem('tf_iq', JSON.stringify({
            score: score,
            total: QUESTIONS.length,
            pct: pct,
            tier: tier,
            percentile: percentile
        }));

        showScreen('screen-results');
    }
});
