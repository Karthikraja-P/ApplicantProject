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

    // ─── Question Bank (15 visual + 15 number, interleaved) ────────────────────
    // Answer distribution: A(0)×6, B(1)×8, C(2)×8, D(3)×8

    var QUESTIONS = [

        // ── Visual 1 ── answer: C (2) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none'), ciSVG('none'), trSVG('none'),
                     sqSVG('half'), ciSVG('half'), trSVG('half'),
                     sqSVG('full'), ciSVG('full'), null],
            opts: [trSVG('none'), ciSVG('full'), trSVG('full'), sqSVG('half')],
            optLabels: ['A','B','C','D'], answer: 2, time: 90,
            exp: 'Each row shares a fill style (none/half/full); each column has the same shape. Row 3 = full, Col 3 = triangle → filled triangle.'
        },

        // ── Number 1 ── answer: B (1) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(8), numFn(3), numFn(11),
                     numFn(5), numFn(7), numFn(12),
                     numFn(9), numFn(4), null],
            numOpts: [14, 13, 12, 15], answer: 1, time: 60,
            exp: 'Each row: Col1 + Col2 = Col3. 8+3=11, 5+7=12, 9+4=13.'
        },

        // ── Visual 2 ── answer: D (3) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [dotsFn(1), dotsFn(2), dotsFn(3),
                     dotsFn(2), dotsFn(4), dotsFn(6),
                     dotsFn(3), dotsFn(6), null],
            opts: [dotsFn(8), dotsFn(6), dotsFn(12), dotsFn(9)],
            optLabels: ['8','6','12','9'], answer: 3, time: 90,
            exp: 'Dots = row × column. Row 3, Col 3 = 3×3 = 9 dots.'
        },

        // ── Number 2 ── answer: C (2) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(3), numFn(4), numFn(12),
                     numFn(5), numFn(3), numFn(15),
                     numFn(6), numFn(2), null],
            numOpts: [8, 10, 12, 14], answer: 2, time: 60,
            exp: 'Each row: Col1 × Col2 = Col3. 3×4=12, 5×3=15, 6×2=12.'
        },

        // ── Visual 3 ── answer: B (1) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [arrowFn(0), arrowFn(1), arrowFn(2),
                     arrowFn(1), arrowFn(2), arrowFn(3),
                     arrowFn(2), arrowFn(3), null],
            opts: [arrowFn(0), arrowFn(4), arrowFn(6), arrowFn(2)],
            optLabels: ['A','B','C','D'], answer: 1, time: 90,
            exp: 'Each arrow rotates 45° clockwise per step. Row 3: ↓, ↙, ← (dir 4).'
        },

        // ── Number 3 ── answer: D (3) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(1),  numFn(4),  numFn(9),
                     numFn(4),  numFn(9),  numFn(16),
                     numFn(9),  numFn(16), null],
            numOpts: [20, 36, 21, 25], answer: 3, time: 60,
            exp: 'Numbers are perfect squares shifting one step each row: 1², 2², 3², 4², 5²=25.'
        },

        // ── Visual 4 ── answer: A (0) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('full',12), sqSVG('full',20), sqSVG('full',28),
                     ciSVG('full',12), ciSVG('full',20), ciSVG('full',28),
                     trSVG('full',12), trSVG('full',20), null],
            opts: [trSVG('full',28), trSVG('full',12), ciSVG('full',28), sqSVG('full',28)],
            optLabels: ['A','B','C','D'], answer: 0, time: 90,
            exp: 'Each row: same shape, size grows small→medium→large. Row 3 = triangle, Col 3 = large.'
        },

        // ── Number 4 ── answer: C (2) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2),  numFn(5),  numFn(10),
                     numFn(5),  numFn(10), numFn(17),
                     numFn(10), numFn(17), null],
            numOpts: [24, 28, 26, 25], answer: 2, time: 60,
            exp: 'Values follow n²+1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26.'
        },

        // ── Visual 5 ── answer: B (1) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [diSVG('none'), ciSVG('none'), sqSVG('none'),
                     diSVG('full'), ciSVG('none'), sqSVG('none'),
                     diSVG('full'), ciSVG('full'), null],
            opts: [sqSVG('none'), sqSVG('full'), ciSVG('full'), diSVG('full')],
            optLabels: ['A','B','C','D'], answer: 1, time: 90,
            exp: 'One more shape fills per row: 0 filled → 1 filled → 2 filled. The last shape must be filled.'
        },

        // ── Number 5 ── answer: D (3) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2), numFn(4),  numFn(8),
                     numFn(3), numFn(9),  numFn(27),
                     numFn(4), numFn(16), null],
            numOpts: [48, 32, 80, 64], answer: 3, time: 60,
            exp: 'Each row: n, n², n³. Row 3: 4, 4²=16, 4³=64.'
        },

        // ── Visual 6 ── answer: A (0) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [arrowFn(6), arrowFn(0), arrowFn(2),
                     arrowFn(0), arrowFn(2), arrowFn(4),
                     arrowFn(2), arrowFn(4), null],
            opts: [arrowFn(6), arrowFn(0), arrowFn(4), arrowFn(3)],
            optLabels: ['A','B','C','D'], answer: 0, time: 90,
            exp: 'Each arrow rotates 90° clockwise per step. Row 3: ↓(2), ←(4), ↑(6).'
        },

        // ── Number 6 ── answer: C (2) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(3), numFn(4), numFn(5),
                     numFn(5), numFn(2), numFn(5),
                     numFn(4), numFn(3), null],
            numOpts: [4, 6, 5, 3], answer: 2, time: 60,
            exp: 'Each row sums to 12: 3+4+5=12, 5+2+5=12, 4+3+?=12 → ?=5.'
        },

        // ── Visual 7 ── answer: B (1) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none'), sqSVG('half'), sqSVG('full'),
                     ciSVG('none'), ciSVG('half'), ciSVG('full'),
                     trSVG('none'), trSVG('half'), null],
            opts: [trSVG('none'), trSVG('full'), ciSVG('full'), sqSVG('half')],
            optLabels: ['A','B','C','D'], answer: 1, time: 90,
            exp: 'Each row uses the same shape; fill increases none→half→full across columns. Row 3 = triangle, Col 3 = full → filled triangle.'
        },

        // ── Number 7 ── answer: D (3) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(3), numFn(7), numFn(11),
                     numFn(5), numFn(8), numFn(11),
                     numFn(2), numFn(6), null],
            numOpts: [8, 12, 9, 10], answer: 3, time: 60,
            exp: 'Each row is arithmetic: Row 1 diff=4, Row 2 diff=3, Row 3 diff=4 → 2+4+4=10.'
        },

        // ── Visual 8 ── answer: A (0) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [diSVG('none'), sqSVG('none'), ciSVG('none'),
                     diSVG('half'), sqSVG('half'), ciSVG('half'),
                     diSVG('full'), sqSVG('full'), null],
            opts: [ciSVG('full'), ciSVG('half'), sqSVG('full'), diSVG('none')],
            optLabels: ['A','B','C','D'], answer: 0, time: 90,
            exp: 'Each column has the same shape; fill increases down. Col 3 = circle, Row 3 = full → filled circle.'
        },

        // ── Number 8 ── answer: C (2) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(15), numFn(8),  numFn(7),
                     numFn(12), numFn(3),  numFn(9),
                     numFn(10), numFn(4),  null],
            numOpts: [5, 7, 6, 4], answer: 2, time: 60,
            exp: 'Each row: Col1 − Col2 = Col3. 15−8=7, 12−3=9, 10−4=6.'
        },

        // ── Visual 9 ── answer: D (3) ──────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [arrowFn(0), arrowFn(6), arrowFn(4),
                     arrowFn(6), arrowFn(4), arrowFn(2),
                     arrowFn(4), arrowFn(2), null],
            opts: [arrowFn(6), arrowFn(2), arrowFn(3), arrowFn(0)],
            optLabels: ['A','B','C','D'], answer: 3, time: 90,
            exp: 'Each arrow rotates 90° counter-clockwise per step. Row 3: ←(4), ↓(2), →(0).'
        },

        // ── Number 9 ── answer: B (1) ──────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(1), numFn(1), numFn(2),
                     numFn(2), numFn(3), numFn(5),
                     numFn(3), numFn(5), null],
            numOpts: [7, 8, 9, 6], answer: 1, time: 60,
            exp: 'Each row: Col1 + Col2 = Col3 (Fibonacci-like). Row 3: 3+5=8.'
        },

        // ── Visual 10 ── answer: C (2) ─────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none',12), sqSVG('none',26), sqSVG('none',12),
                     ciSVG('none',26), ciSVG('none',12), ciSVG('none',26),
                     trSVG('none',12), trSVG('none',26), null],
            opts: [trSVG('none',26), ciSVG('none',12), trSVG('none',12), sqSVG('none',12)],
            optLabels: ['A','B','C','D'], answer: 2, time: 90,
            exp: 'Row 1: S-L-S; Row 2: L-S-L; Row 3: S-L-? = S. The pattern ends on small.'
        },

        // ── Number 10 ── answer: A (0) ─────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(3), numFn(4), numFn(9),
                     numFn(5), numFn(3), numFn(10),
                     numFn(4), numFn(5), null],
            numOpts: [16, 12, 20, 14], answer: 0, time: 60,
            exp: 'Each row: Col1 × (Col2 − 1) = Col3. 3×3=9, 5×2=10, 4×4=16.'
        },

        // ── Visual 11 ── answer: D (3) ─────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none'), ciSVG('half'), trSVG('full'),
                     ciSVG('none'), trSVG('half'), sqSVG('full'),
                     trSVG('none'), sqSVG('half'), null],
            opts: [ciSVG('half'), sqSVG('full'), trSVG('full'), ciSVG('full')],
            optLabels: ['A','B','C','D'], answer: 3, time: 90,
            exp: 'Each column has the same fill (none/half/full). Shapes cycle sq→ci→tr each row. Col 3 fill=full, next shape after sq = ci → filled circle.'
        },

        // ── Number 11 ── answer: B (1) ─────────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(4), numFn(3), numFn(13),
                     numFn(5), numFn(6), numFn(19),
                     numFn(3), numFn(2), null],
            numOpts: [5, 7, 9, 6], answer: 1, time: 60,
            exp: 'Each row: Col1² − Col2 = Col3. 4²−3=13, 5²−6=19, 3²−2=7.'
        },

        // ── Visual 12 ── answer: C (2) ─────────────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [dotsFn(2), dotsFn(3), dotsFn(4),
                     dotsFn(3), dotsFn(4), dotsFn(5),
                     dotsFn(4), dotsFn(5), null],
            opts: [dotsFn(5), dotsFn(7), dotsFn(6), dotsFn(4)],
            optLabels: ['5','7','6','4'], answer: 2, time: 90,
            exp: 'Dots = row + col + 1 (1-indexed). Row 3, Col 3: 3+3=6 dots.'
        },

        // ── Number 12: (col1 + col3) / col2 = 2 ───────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2), numFn(4),  numFn(6),
                     numFn(3), numFn(6),  numFn(9),
                     numFn(4), numFn(8),  null],
            numOpts: [12, 10, 16, 14], answer: 0, time: 60,
            exp: 'Each row: Col1+Col3 = 2×Col2. 2+6=8=2×4 ✓, 3+9=12=2×6 ✓, 4+?=2×8=16 → ?=12.'
        },

        // ── Visual 13: Diagonal fill pattern ───────────────────────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [sqSVG('none'), sqSVG('none'), sqSVG('half'),
                     sqSVG('none'), sqSVG('half'), sqSVG('full'),
                     sqSVG('half'), sqSVG('full'), null],
            opts: [sqSVG('half'), sqSVG('none'), ciSVG('full'), sqSVG('full')],
            optLabels: ['A','B','C','D'], answer: 3, time: 90,
            exp: 'Fill increases toward the bottom-right corner. The cell at Row 3, Col 3 is the most distant from the origin → fully filled.'
        },

        // ── Number 13: col3 = col1 + col2² ────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(1), numFn(2), numFn(5),
                     numFn(2), numFn(3), numFn(11),
                     numFn(3), numFn(4), null],
            numOpts: [16, 19, 22, 17], answer: 1, time: 60,
            exp: 'Col3 = Col1 + Col2². 1+2²=5 ✓, 2+3²=11 ✓, 3+4²=19.'
        },

        // ── Visual 14: Arrow direction = (row+col)×90° mod 360° ────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [arrowFn(0), arrowFn(2), arrowFn(4),
                     arrowFn(2), arrowFn(4), arrowFn(6),
                     arrowFn(4), arrowFn(6), null],
            opts: [arrowFn(2), arrowFn(6), arrowFn(0), arrowFn(4)],
            optLabels: ['A','B','C','D'], answer: 2, time: 90,
            exp: 'Direction = (row+col)×90°. Row 2+Col 2 = 4 steps of 90° = 360° → back to right (→).'
        },

        // ── Number 14: col3 = col1 + col2 + (row index) ────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(2), numFn(3), numFn(6),
                     numFn(4), numFn(5), numFn(11),
                     numFn(3), numFn(6), null],
            numOpts: [10, 14, 9, 12], answer: 3, time: 60,
            exp: 'Col3 = Col1 + Col2 + row (1-indexed). Row1: 2+3+1=6 ✓, Row2: 4+5+2=11 ✓, Row3: 3+6+3=12.'
        },

        // ── Visual 15: Dots in columns match column number × 2 ─────────────────
        {
            title: 'Which image completes the pattern?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [dotsFn(2), dotsFn(4), dotsFn(6),
                     dotsFn(2), dotsFn(4), dotsFn(6),
                     dotsFn(2), dotsFn(4), null],
            opts: [dotsFn(6), dotsFn(4), dotsFn(8), dotsFn(5)],
            optLabels: ['6','4','8','5'], answer: 0, time: 90,
            exp: 'Each column always has the same dot count: Col 1=2, Col 2=4, Col 3=6. All rows follow this rule.'
        },

        // ── Number 15: triangular numbers ──────────────────────────────────────
        {
            title: 'What number replaces the question mark?',
            source: 'yuis-ice / rpm-iq-exam',
            matrix: [numFn(1), numFn(3),  numFn(6),
                     numFn(3), numFn(6),  numFn(10),
                     numFn(6), numFn(10), null],
            numOpts: [12, 15, 14, 16], answer: 1, time: 60,
            exp: 'Triangular numbers: T(1)=1, T(2)=3, T(3)=6, T(4)=10, T(5)=15. Diagonal shifts one step per row.'
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
            { label: 'Visual Patterns', indices: [0,2,4,6,8,10,12,14,16,18,20,22,24,26,28] },
            { label: 'Number Matrices', indices: [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29] }
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
