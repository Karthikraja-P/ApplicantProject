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
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619620533832x433131910406034500/Q1.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619620616027x749775513973640600/Q%201%20A%20%281%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619620604000x436440903663458400/Q%201%20A%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619620628324x813131711903281900/Q%201%20A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619620647449x949628165349358000/Q%201%20A%20%284%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619611958813x303368106426746600/Q-01.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612017708x318234080959034500/Q-02.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612038426x989591692011166200/Q-03.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619621354436x983135457868009200/Q-03.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619621335445x643859524396502800/Q-04.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619622838404x770376798705511300/Q3.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619622871266x487571820856178600/Q%203%20A%20%281%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619622884080x109847414543593490/Q%203%20A%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619622894966x491590834046897700/Q%203%20A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619622905548x566558871071154400/Q%203%20A%20%284%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612164401x306501931139286920/Q-06.svg',
        imgOpts: [
            '/static/images/iq/q4_mod_a.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612206726x152477936947297500/Q-08.svg',
            '/static/images/iq/q4_mod_c.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612230359x380918791418798340/Q-10.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612265288x400208747201012900/Q-11.svg',
        imgOpts: [
            '/static/images/iq/q5_mod_a_fixed.svg',
            '/static/images/iq/q5_mod_b_fixed.svg',
            '/static/images/iq/q5_mod_c_fixed.svg',
            '/static/images/iq/q5_mod_d_fixed.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612398948x962512441782625700/Q-16.svg',
        imgOpts: [
            '/static/images/iq/q6_mod_a.svg',
            '/static/images/iq/q6_mod_b.svg',
            '/static/images/iq/q6_mod_c.svg',
            '/static/images/iq/q6_mod_d.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612510389x136536805538697070/Q17%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612527866x688576881155968800/Q17%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612546821x592087015516123100/Q17%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612558109x746314279224892000/Q17%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612571978x656955517216798700/Q17%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612612457x835481922157760800/Q16%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612627554x560054647095815400/Q16%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612638103x700005131404033900/Q16%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612646969x376114876119869800/Q16%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612663555x670628805566238800/Q16%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612706523x431190232094357060/Q14%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612716743x827259021008903300/Q14%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612727270x905122243657644000/Q14%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612737827x275944541088282160/Q14%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612765598x927734180298426500/Q14%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612790277x988726767292918300/Q15%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612800220x790021596360232200/Q15%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612810593x696986591314045600/Q15%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612819009x700448667939488400/Q15%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612827861x660028738277195300/Q15%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are definitely Lazzies.',
        source: 'Fluid Reasoning',
        opts: ['True', 'False'],
        answer: 0, time: 90, exp: 'This follows the transitive property of syllogism: if A=B and B=C, then A=C. Therefore, the statement is True.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612849663x445410436101785660/Q13%20%281%29.svg',
        imgOpts: [
            '/static/images/iq/q13_mod_a.svg',
            '/static/images/iq/q13_mod_b.svg',
            '/static/images/iq/q13_mod_c.svg',
            '/static/images/iq/q13_mod_d.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612921005x779975298901960800/Q-21.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612932521x245939771070535760/Q-22.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612942065x644198582365540500/Q-23.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612952472x830828426872516400/Q-24.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612961889x116950176296859660/Q-25.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612987757x885511059745649900/Q12%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612997505x908466850192346600/Q12%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613006344x999993148766248000/Q12%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613013293x456123158923609400/Q12%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613025056x118005538266389820/Q12%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613058202x594037861794896900/Q-26.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613074408x179765709684606370/Q-27.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613083909x562084557747605440/Q-28.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613091609x303689851727431100/Q-29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619686587440x753786085382590300/Q6A%20%284%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613139077x444131484485090300/Q11%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613153993x567530250040917800/Q11%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613195220x438082909840419800/Q11%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613212837x673438854614232000/Q11%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613186404x225846179982523550/Q11%20%285%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613234556x942711401849995400/Q-31.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613251703x643791228348411900/Q-32.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613261579x319041629116795260/Q-33.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613270705x117131142408966720/Q-34.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613278384x975411189850408700/Q-35.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613300992x105407576843956620/Q-46.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613312329x711165442126142600/Q-47.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613321557x857329199642974000/Q-48.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613329792x503449921267319550/Q-49.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613338349x766906738210504200/Q-50.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which of the figures below the line of drawings best completes the series?',
        source: 'Perceptual Reasoning',
        customHtml: `
        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px; background:#f8f9fa; border-radius:8px;">
            <div style="display:flex; gap:12px; align-items:flex-start; padding-bottom:15px; border-bottom:2px solid #333;">
                <!-- Box 1: Comb TL, Needle BL -->
                <svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                    <path d="M4 2 V12 M10 2 V12 M16 2 V12 M22 2 V12 M28 2 V12" stroke="#333" stroke-width="2.5"/>
                    <line x1="4" y1="56" x2="22" y2="38" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="22" cy="38" r="3" fill="#333"/>
                </svg>
                <!-- Box 2: Comb BL, Needle TR (6 lines) -->
                <svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                    <path d="M4 58 V48 M10 58 V48 M16 58 V48 M22 58 V48 M28 58 V48 M34 58 V48" stroke="#333" stroke-width="2.5"/>
                    <line x1="56" y1="4" x2="38" y2="22" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="38" cy="22" r="3" fill="#333"/>
                </svg>
                <!-- Box 3: Comb TR, Needle BR -->
                <svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                    <path d="M32 2 V12 M38 2 V12 M44 2 V12 M50 2 V12 M56 2 V12" stroke="#333" stroke-width="2.5"/>
                    <line x1="56" y1="56" x2="38" y2="38" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="38" cy="38" r="3" fill="#333"/>
                </svg>
                <!-- Box 4: Comb BR, Needle TL (6 lines) -->
                <svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                    <path d="M26 58 V48 M32 58 V48 M38 58 V48 M44 58 V48 M50 58 V48 M56 58 V48" stroke="#333" stroke-width="2.5"/>
                    <line x1="4" y1="4" x2="22" y2="22" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="22" cy="22" r="3" fill="#333"/>
                </svg>
                <!-- Box 5: Comb TL, Needle BL -->
                <svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                    <path d="M4 2 V12 M10 2 V12 M16 2 V12 M22 2 V12 M28 2 V12" stroke="#333" stroke-width="2.5"/>
                    <line x1="4" y1="56" x2="22" y2="38" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="22" cy="38" r="3" fill="#333"/>
                </svg>
            </div>
        </div>
        `,
        customOptsHtml: [
            // Option 1 (Box 1)
            `<svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                <path d="M4 2 V12 M10 2 V12 M16 2 V12 M22 2 V12 M28 2 V12" stroke="#333" stroke-width="2.5"/>
                <line x1="4" y1="56" x2="22" y2="38" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                <circle cx="22" cy="38" r="3" fill="#333"/>
            </svg>`,
            // Option 2 (Box 2) - Correct (6 lines)
            `<svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                <path d="M4 58 V48 M10 58 V48 M16 58 V48 M22 58 V48 M28 58 V48 M34 58 V48" stroke="#333" stroke-width="2.5"/>
                <line x1="56" y1="4" x2="38" y2="22" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                <circle cx="38" cy="22" r="3" fill="#333"/>
            </svg>`,
            // Option 3 (Comb TL, Needle TR)
            `<svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                <path d="M4 2 V12 M10 2 V12 M16 2 V12 M22 2 V12 M28 2 V12" stroke="#333" stroke-width="2.5"/>
                <line x1="56" y1="4" x2="38" y2="22" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                <circle cx="38" cy="22" r="3" fill="#333"/>
            </svg>`,
            // Option 4 (Comb BL Distractor - Dense lines)
            `<svg width="60" height="60" viewBox="0 0 60 60" style="border:2.5px solid #333; background:white;">
                <path d="M4 58 V48 M8 58 V48 M12 58 V48 M16 58 V48 M20 58 V48 M24 58 V48 M28 58 V48 M32 58 V48 M36 58 V48" stroke="#333" stroke-width="2.5"/>
                <line x1="4" y1="56" x2="22" y2="38" stroke="#333" stroke-width="3" stroke-linecap="round"/>
                <circle cx="22" cy="38" r="3" fill="#333"/>
            </svg>`
        ],
        answer: 1, time: 90, exp: 'The comb and needle follow a repeating cyclic sequence across corners. Box 6 must follow the same pattern as Box 2.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613378237x254800041398088900/Q-36.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613396593x549741287264651200/Q-37.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613404244x910607817835188900/Q-38.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613413192x621279494666961300/Q-39.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619613420671x716825641379112700/Q-40.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1625674357084x273551967348619300/Q3.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1625674464985x267064898882172220/Q3A%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1625674480000x844227647810190000/Q3A%20%281%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1625674424059x724234487231742100/Q3A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1625674409241x936427935592745600/Q3A%20%284%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
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
        customHtml: '<div style="display:flex;gap:12px;align-items:flex-end;justify-content:center;margin-top:20px;"><div style="display:grid;grid-template-columns:30px 30px;grid-template-rows:30px 30px;border:1px solid #333;background:#fff;"><div style="background:#000044;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div></div><div style="display:grid;grid-template-columns:30px 30px 30px;grid-template-rows:30px 30px 30px;border:1px solid #333;background:#fff;"><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div></div></div>',
        customOptsHtml: ['<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #333;background:#fff;"><div style="background:#000044;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #333;background:#fff;"><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #333;background:#fff;"><div style="background:#000044;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #333;background:#fff;"><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#00a244;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#ffffff;border:1px solid #333;"></div><div style="background:#000044;border:1px solid #333;"></div></div>' ],
        answer: 0, time: 90, exp: 'From the left 2x2 and the right 3x3, the only matching completed 3x3 is option A, with dark top-left + green positions consistent.',
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
        customHtml: '<div style="position:relative;width:180px;height:220px;margin:20px auto;background:#fff;border-radius:4px;"><svg width="180" height="220" viewBox="0 0 180 220" stroke="#000" stroke-width="1.8" fill="none"><line x1="130" y1="10" x2="130" y2="210"/><line x1="165" y1="10" x2="165" y2="210"/><line x1="130" y1="10" x2="165" y2="10"/><line x1="10" y1="35" x2="165" y2="35"/><line x1="30" y1="55" x2="165" y2="55"/><line x1="10" y1="100" x2="165" y2="100"/><line x1="30" y1="140" x2="165" y2="140"/><line x1="95" y1="175" x2="165" y2="175"/><line x1="130" y1="210" x2="165" y2="210"/><line x1="10" y1="35" x2="10" y2="100"/><line x1="30" y1="55" x2="30" y2="140"/><line x1="95" y1="140" x2="95" y2="175"/></svg></div>',
        opts: ['10', '16', '22', '25', '28'],
        answer: 1, time: 90, exp: 'By counting all overlapping and adjacent four-sided shapes systematically, there are 16 in total.'
    },
    {
        title: 'How many squares are there in the picture?',
        source: 'Spatial Reasoning',
        customHtml: '<div style="position:relative;width:180px;height:180px;margin:20px auto;background:#fff;border-radius:4px;"><svg width="180" height="180" viewBox="0 0 180 180" stroke="#142e56" stroke-width="2" fill="none"><line x1="20" y1="55" x2="20" y2="125"/><line x1="55" y1="20" x2="55" y2="160"/><line x1="90" y1="20" x2="90" y2="125"/><line x1="125" y1="20" x2="125" y2="160"/><line x1="160" y1="20" x2="160" y2="125"/><line x1="55" y1="20" x2="160" y2="20"/><line x1="20" y1="55" x2="160" y2="55"/><line x1="55" y1="90" x2="125" y2="90"/><line x1="20" y1="125" x2="160" y2="125"/><line x1="55" y1="160" x2="125" y2="160"/></svg></div>',
        opts: ['8', '10', '11', '14', '17'],
        answer: 2, time: 90, exp: 'By counting all small, medium, and large squares systematically (including the 2x2 and its sub-sections), there are 11 in total.'
    },
    {
        title: 'Select the missing matrix:',
        source: 'Perceptual Pattern',
        customHtml: '<div style="display:grid;grid-template-columns:auto auto auto;gap:15px;background:#fff;padding:20px;border-radius:8px;justify-content:center;"><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div></div><div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div></div><div style="width:58px;height:58px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;">?</div></div>',
        customOptsHtml: ['<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div></div>', '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;gap:2px;"><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#f59e0b;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div><div style="background:#fff;border:1.5px solid #142e56;"></div></div>'],
        answer: 1, time: 90, exp: 'Right column builds from bottom up: 1 dot at bottom, then 2, then 3.'
    },
    {
        title: 'Select the correct pattern to complete the sequence:',
        source: 'Fluid Reasoning',
        customHtml: '<div style="display:grid;grid-template-columns:60px 60px 60px;gap:20px;justify-content:center;margin:20px auto;"><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(180deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(270deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(0deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(315deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(135deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(135deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(135deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(225deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div><div style="width:54px;height:54px;border-radius:50%;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div></div>',
        customOptsHtml: ['<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(45deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>', '<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(135deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>', '<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(90deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>', '<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(225deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>', '<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(270deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>', '<div style="width:54px;height:54px;border:3px solid #142e56;border-radius:50%;position:relative;transform:rotate(315deg);background:#ebf4ff;"><div style="position:absolute;top:4px;left:21px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #f59e0b;"></div></div>'],
        answer: 1, time: 90, exp: 'The pointer follows a rotation pattern. The missing cell requires 135 degrees.'
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
        title: 'Which box completes the sequence?',
        source: 'Visual Patterns',
        customHtml: '<div style="display:grid;grid-template-columns:60px 60px 60px;border:2px solid #142e56;width:max-content;margin:20px auto;"><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div><div style="width:60px;height:60px;background:#142e56;color:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;">?</div></div>',
        customOptsHtml: ['<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>', '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>', '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>', '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:19px;width:100%;height:2px;background:#142e56;"></div><div style="position:absolute;top:39px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>', '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>', '<div style="width:60px;height:60px;border:1px solid #142e56;background:#fff;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;"><div style="position:absolute;top:29px;width:100%;height:2px;background:#142e56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div><div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:1px solid #142e56;z-index:2;"></div></div>'],
        answer: 0, time: 90, exp: 'Dots increase 1-2-3 vertically. Lines increase 0-1-2 horizontally. Cell needs 3 dots + 2 lines.'
    },
    {
        title: 'Select the missing patch:',
        source: 'Perceptual Patterns',
        customHtml: '<div style="position:relative;width:200px;height:200px;background:#FFA500;overflow:hidden;margin:20px auto;border:2px solid #333;border-radius:4px;"><div style="position:absolute;top:75px;width:100%;height:50px;background:#0A1B3F;"></div><div style="position:absolute;top:99px;width:100%;height:2px;background:#FFF;"></div><svg width="200" height="200" style="position:absolute;top:0;left:0;"><line x1="30" y1="0" x2="80" y2="200" stroke="red" stroke-width="1.5"/><line x1="80" y1="0" x2="120" y2="200" stroke="white" stroke-width="1.5"/><line x1="140" y1="0" x2="60" y2="200" stroke="red" stroke-width="1.5"/><line x1="160" y1="0" x2="100" y2="200" stroke="white" stroke-width="1.5"/></svg><div style="position:absolute;top:60px;left:60px;width:80px;height:80px;background:#FFF;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:bold;color:#0A1B3F;box-shadow:0 0 10px rgba(0,0,0,0.5);">?</div></div>',
        customOptsHtml: ['<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/></svg>', '<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="40" y1="60" x2="50" y2="0" stroke="#fff" stroke-width="1.5"/><line x1="60" y1="10" x2="10" y2="60" stroke="red" stroke-width="1.5"/><line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/></svg>', '<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="0" y1="10" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/></svg>', '<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="0" y1="30" x2="60" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="30" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/></svg>', '<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="20" y1="0" x2="60" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/><line x1="50" y1="60" x2="20" y2="0" stroke="red" stroke-width="1.5"/></svg>', '<svg width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#FFA500"/><rect y="15" width="60" height="30" fill="#0A1B3F"/><rect y="29" width="60" height="2" fill="#fff"/><line x1="20" y1="0" x2="30" y2="60" stroke="#fff" stroke-width="1.5"/><line x1="10" y1="60" x2="40" y2="0" stroke="red" stroke-width="1.5"/></svg>'],
        answer: 1, time: 90, exp: 'The patch lines must align with the red and white diagonal lines crossing the puzzle.'
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
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;position:relative;">★<span style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">🌙</span></div>
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
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div>
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
                <div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div><div style="border:0.5px solid #d1d5db;"></div>
                <div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">🌙</div><div style="border:0.5px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f59e0b;">★</div><div style="border:0.5px solid #d1d5db;"></div>
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
        answer: 3, time: 90, exp: 'The star follows a row-based traversal in each row set, and the moon moves progressively through the empty corners and centers.'
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
        title: 'Complete the pattern matrix.',
        source: 'Spatial Reasoning',
        imgUrl: '/static/images/iq/q39.jpg',
        opts: ['A', 'B', 'C', 'D', 'E', 'F'],
        answer: 2, time: 90, exp: 'Analyzing the columns and rows reveals the combination rule for inner and outer shapes.'
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
        imgUrl: '/static/images/iq/q41.jpg',
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
    }
];

QUESTIONS = QUESTIONS.slice(0, 46);


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
            { label: 'Visual Patterns', indices: [0,2,4,6,8,10,12,14,16,18] },
            { label: 'Number Matrices', indices: [1,3,5,7,9,11,13,15,17,19] }
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
