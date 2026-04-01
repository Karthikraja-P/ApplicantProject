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
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612188661x664850454619189400/Q-07.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612206726x152477936947297500/Q-08.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612220629x748943399782868100/Q-09.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612230359x380918791418798340/Q-10.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612265288x400208747201012900/Q-11.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612287573x889196537106714400/Q-12.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612300104x964109325700997000/Q-13.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612312475x204553183506439580/Q-14.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612351189x921323380661548400/Q-15.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    },
    {
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612398948x962512441782625700/Q-16.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612425529x766302366875854600/Q-17.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612448264x247045399738077700/Q-18.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619686527995x759109475628974100/Q4A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1620306315972x996536499471051800/Q4A%20%284%29.svg'
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
        title: 'Which image completes the pattern?',
        source: 'IQ Test Academy',
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612849663x445410436101785660/Q13%20%281%29.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612867903x664841418227566400/Q13%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612877527x595238487156306200/Q13%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612886104x437068441125307800/Q13%20%284%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619612898109x300024873754223040/Q13%20%285%29.svg'
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
        imgUrl: 'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619702212081x202411985709518340/Group%203.svg',
        imgOpts: [
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619702227135x806119431202281300/Q%2019%20A%20%281%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619702238253x865788033219401500/Q%2019%20A%20%282%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619702246991x239834537066900380/Q%2019%20A%20%283%29.svg',
            'https://f867b987572fb5d41ec60f5cee22021a.cdn.bubble.io/f1619702258788x435321848650833000/Q%2019%20A%20%284%29.svg'
        ],
        answer: 0, time: 90, exp: 'Pattern completed according to visual logic.'
    }
];

QUESTIONS = QUESTIONS.slice(0, 20);


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
        
        if (q.imgUrl) {
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


        if (isImg) {
            qOpts.className = 'mcq-options psych-opts-row';
            q.imgOpts.forEach(function (url, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = String.fromCharCode(65 + i);
                btn.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><img src="' + url + '" style="width:100%;height:100%;max-width:64px;max-height:64px;object-fit:contain;border-radius:6px;background:#e2e8f0;padding:4px;" /></div>' + '<div class="opt-label" style="text-align:center;">' + label + '</div>';
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
