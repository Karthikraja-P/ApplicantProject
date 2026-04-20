document.addEventListener('DOMContentLoaded', function () {

    // ─── SVG Cell Renderer ─────────────────────────────────────────────────────
    // c = { sh, r, f, sz, d, ds, n, cnt, ip, dp }
    // sh: shape name  r: rotation(deg)  f: fill style  sz: scale(0-1)
    // d: center dot(bool)  ds: dot count  n: nested outlines
    // cnt: shape count  ip: inner shape  dp: dot position ('tl','tr','bl','br')
    var _hid = 0;

    function cellSVG(c) {
        if (!c) {
            return '<svg width="60" height="60" viewBox="0 0 60 60">'
                 + '<text x="30" y="38" text-anchor="middle" font-size="30" font-weight="800" fill="#4a6a8a">?</text>'
                 + '</svg>';
        }

        var sh  = c.sh  || 'triangle';
        var rot = c.r   !== undefined ? c.r   : 0;
        var f   = c.f   || 'solid';
        var sz  = c.sz  !== undefined ? c.sz  : 1.0;
        var col = '#3d6491';

        var fc, sw, defs = '';
        if (f === 'solid')   { fc = col;      sw = 0;   }
        else if (f === 'outline') { fc = 'none';  sw = 2.5; }
        else if (f === 'light')  { fc = '#8ab4d8'; sw = 0; }
        else if (f === 'dark')   { fc = '#162636'; sw = 0; }
        else { // striped
            var hid = 'ht' + (++_hid);
            defs = '<defs><pattern id="' + hid + '" width="6" height="6"'
                 + ' patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
                 + '<line x1="0" y1="0" x2="0" y2="6" stroke="' + col + '" stroke-width="2.5"/>'
                 + '</pattern></defs>';
            fc = 'url(#' + hid + ')'; sw = 2;
        }

        var POLY = {
            triangle: [[30,8],[8,52],[52,52]],
            pentagon: [[30,8],[50.9,23.2],[42.9,47.8],[17.1,47.8],[9.1,23.2]],
            diamond:  [[30,8],[52,30],[30,52],[8,30]],
            arrow:    [[8,22],[40,22],[40,12],[52,30],[40,48],[40,38],[8,38]],
            cross:    [[22,8],[38,8],[38,22],[52,22],[52,38],[38,38],[38,52],[22,52],[22,38],[8,38],[8,22],[22,22]],
            star:     [[30,8],[34,22],[48,22],[37,31],[41,45],[30,37],[19,45],[23,31],[12,22],[26,22]]
        };

        function polyStr(pts, s, ox, oy) {
            ox = ox || 0; oy = oy || 0;
            return pts.map(function(p) {
                return (30 + ox + (p[0] - 30) * s).toFixed(1) + ','
                     + (30 + oy + (p[1] - 30) * s).toFixed(1);
            }).join(' ');
        }

        function singleShape(s, pfc, psw, pr, ox, oy) {
            ox = ox || 0; oy = oy || 0;
            pr = pr !== undefined ? pr : rot;
            if (sh === 'circle') {
                return '<circle cx="' + (30+ox) + '" cy="' + (30+oy) + '" r="' + (22*s).toFixed(1)
                     + '" fill="' + pfc + '" stroke="' + col + '" stroke-width="' + psw + '"/>';
            } else if (sh === 'square') {
                var hw = (22 * s).toFixed(1);
                return '<rect x="' + (30+ox-hw) + '" y="' + (30+oy-hw)
                     + '" width="' + (hw*2) + '" height="' + (hw*2)
                     + '" fill="' + pfc + '" stroke="' + col + '" stroke-width="' + psw
                     + '" transform="rotate(' + pr + ',' + (30+ox) + ',' + (30+oy) + ')"/>';
            } else {
                var pts = POLY[sh] || POLY.triangle;
                var ptStr = polyStr(pts, s, ox, oy);
                return '<polygon points="' + ptStr + '" fill="' + pfc + '" stroke="' + col
                     + '" stroke-width="' + psw + '" transform="rotate(' + pr + ','
                     + (30+ox) + ',' + (30+oy) + ')"/>';
            }
        }

        var body = '';

        if (c.n && c.n > 1) {
            // Nested outlines
            var scales = c.n === 2 ? [1.0, 0.55] : [1.0, 0.65, 0.33];
            scales.forEach(function(s) {
                body += singleShape(s, 'none', 2.5, rot);
            });

        } else if (c.cnt && c.cnt > 1) {
            // Multiple shapes side by side
            var n = c.cnt;
            var offs = n === 2 ? [[-13,0],[13,0]] : [[-16,0],[0,0],[16,0]];
            var s2 = n === 2 ? 0.52 : 0.4;
            offs.forEach(function(off) {
                body += singleShape(s2, fc, sw, rot, off[0], off[1]);
            });

        } else {
            // Single shape
            body = singleShape(sz, fc, sw, rot);
        }

        // Inner shape (white)
        if (c.ip) {
            var isz = 0.42;
            if (c.ip === 'circle') {
                body += '<circle cx="30" cy="30" r="' + (22*isz).toFixed(1) + '" fill="white"/>';
            } else if (c.ip === 'square') {
                var ihw = (22*isz).toFixed(1);
                body += '<rect x="' + (30-ihw) + '" y="' + (30-ihw)
                     + '" width="' + (ihw*2) + '" height="' + (ihw*2) + '" fill="white"/>';
            } else if (c.ip === 'triangle') {
                var ipts = polyStr(POLY.triangle, isz);
                body += '<polygon points="' + ipts + '" fill="white"/>';
            }
        }

        // Center dot
        if (c.d) {
            body += '<circle cx="30" cy="30" r="6" fill="white"/>';
        }

        // Multiple dots (evenly spaced)
        if (c.ds) {
            for (var i = 0; i < c.ds; i++) {
                var dx = 30 + (i - (c.ds - 1) / 2) * 14;
                body += '<circle cx="' + dx.toFixed(1) + '" cy="30" r="5" fill="white"/>';
            }
        }

        // Corner dot
        if (c.dp) {
            var dpx = c.dp.charAt(1) === 'l' ? 16 : 44;
            var dpy = c.dp.charAt(0) === 't' ? 16 : 44;
            body += '<circle cx="' + dpx + '" cy="' + dpy + '" r="5" fill="white"/>';
        }

        return '<svg width="60" height="60" viewBox="0 0 60 60">' + defs + body + '</svg>';
    }

    // ─── Visual 3×3 Grid ───────────────────────────────────────────────────────
    function buildVisualGrid(cells) {
        var html = '<div class="v-grid">';
        for (var i = 0; i < 9; i++) {
            html += '<div class="v-cell">';
            if (i === 8 || cells[i] === null) {
                html += '<span class="v-qmark">?</span>';
            } else {
                html += cellSVG(cells[i]);
            }
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    // ─── Question Bank — 20 Visual Pattern Questions ───────────────────────────
    var QUESTIONS = [

        // Q1 – Triangle rotation (90° clockwise per step)
        {
            category: 'Pattern', type: 'Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid'}, {sh:'triangle',r:90, f:'solid'}, {sh:'triangle',r:180,f:'solid'},
                {sh:'triangle',r:90, f:'solid'}, {sh:'triangle',r:180,f:'solid'}, {sh:'triangle',r:270,f:'solid'},
                {sh:'triangle',r:180,f:'solid'}, {sh:'triangle',r:270,f:'solid'}, null
            ],
            choices: [
                {sh:'triangle',r:0,  f:'solid'},
                {sh:'triangle',r:90, f:'solid'},
                {sh:'triangle',r:180,f:'solid'},
                {sh:'triangle',r:270,f:'solid'}
            ],
            answer: 0,
            exp: 'Each row the triangle rotates 90° clockwise per column. Row 3 ends at 360° = 0° (pointing up).',
            time: 15
        },

        // Q2 – Fill progression (rows=shape, cols=fill: outline→striped→solid)
        {
            category: 'Pattern', type: 'Fill Progression',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'outline'}, {sh:'triangle',f:'striped'}, {sh:'triangle',f:'solid'},
                {sh:'square',  f:'outline'}, {sh:'square',  f:'striped'}, {sh:'square',  f:'solid'},
                {sh:'circle',  f:'outline'}, {sh:'circle',  f:'striped'}, null
            ],
            choices: [
                {sh:'circle',  f:'solid'},
                {sh:'circle',  f:'outline'},
                {sh:'triangle',f:'solid'},
                {sh:'square',  f:'striped'}
            ],
            answer: 0,
            exp: 'Each row progresses outline → striped → solid. Row 3 uses circles, so the missing cell is a solid circle.',
            time: 15
        },

        // Q3 – Shape Latin square (each shape appears once per row & column)
        {
            category: 'Pattern', type: 'Shape Sequence',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid'}, {sh:'square',  f:'solid'}, {sh:'circle',  f:'solid'},
                {sh:'square',  f:'solid'}, {sh:'circle',  f:'solid'}, {sh:'triangle',f:'solid'},
                {sh:'circle',  f:'solid'}, {sh:'triangle',f:'solid'}, null
            ],
            choices: [
                {sh:'triangle',f:'solid'},
                {sh:'circle',  f:'solid'},
                {sh:'square',  f:'solid'},
                {sh:'diamond', f:'solid'}
            ],
            answer: 2,
            exp: 'Each row and column contains triangle, square, and circle exactly once. The missing shape is a square.',
            time: 15
        },

        // Q4 – Size progression (rows=shape, cols=small→medium→large)
        {
            category: 'Pattern', type: 'Size Progression',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid',sz:0.5},  {sh:'triangle',f:'solid',sz:0.75}, {sh:'triangle',f:'solid',sz:1.0},
                {sh:'circle',  f:'solid',sz:0.5},  {sh:'circle',  f:'solid',sz:0.75}, {sh:'circle',  f:'solid',sz:1.0},
                {sh:'square',  f:'solid',sz:0.5},  {sh:'square',  f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'square',f:'solid',sz:0.5},
                {sh:'square',f:'solid',sz:0.75},
                {sh:'triangle',f:'solid',sz:1.0},
                {sh:'square',f:'solid',sz:1.0}
            ],
            answer: 3,
            exp: 'Each row grows small → medium → large. Row 3 uses squares, so the missing cell is a large solid square.',
            time: 15
        },

        // Q5 – Dot count progression (0, 1, 2 white dots per column)
        {
            category: 'Pattern', type: 'Dot Count',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'square',  f:'solid'}, {sh:'square',  f:'solid',ds:1}, {sh:'square',  f:'solid',ds:2},
                {sh:'circle',  f:'solid'}, {sh:'circle',  f:'solid',ds:1}, {sh:'circle',  f:'solid',ds:2},
                {sh:'triangle',f:'solid'}, {sh:'triangle',f:'solid',ds:1}, null
            ],
            choices: [
                {sh:'triangle',f:'solid'},
                {sh:'triangle',f:'solid',ds:1},
                {sh:'triangle',f:'solid',ds:2},
                {sh:'circle',  f:'solid',ds:2}
            ],
            answer: 2,
            exp: 'Each row adds 0, 1, 2 white dots inside the shape. Row 3 uses triangles, so the missing cell is a triangle with 2 white dots.',
            time: 15
        },

        // Q6 – Inner shape (outer=row, inner=column)
        {
            category: 'Pattern', type: 'Inner Shape',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'square',  f:'solid',ip:'triangle'}, {sh:'square',  f:'solid',ip:'circle'}, {sh:'square',  f:'solid',ip:'square'},
                {sh:'circle',  f:'solid',ip:'triangle'}, {sh:'circle',  f:'solid',ip:'circle'}, {sh:'circle',  f:'solid',ip:'square'},
                {sh:'triangle',f:'solid',ip:'triangle'}, {sh:'triangle',f:'solid',ip:'circle'}, null
            ],
            choices: [
                {sh:'triangle',f:'solid',ip:'triangle'},
                {sh:'square',  f:'solid',ip:'square'},
                {sh:'circle',  f:'solid',ip:'square'},
                {sh:'triangle',f:'solid',ip:'square'}
            ],
            answer: 3,
            exp: 'Column 3 always has a square inner shape. Row 3 outer shape is a triangle. Answer: triangle with a square inside.',
            time: 15
        },

        // Q7 – Arrow direction rotation (90° per step)
        {
            category: 'Pattern', type: 'Direction Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'arrow',r:0,  f:'solid'}, {sh:'arrow',r:90, f:'solid'}, {sh:'arrow',r:180,f:'solid'},
                {sh:'arrow',r:90, f:'solid'}, {sh:'arrow',r:180,f:'solid'}, {sh:'arrow',r:270,f:'solid'},
                {sh:'arrow',r:180,f:'solid'}, {sh:'arrow',r:270,f:'solid'}, null
            ],
            choices: [
                {sh:'arrow',r:90, f:'solid'},
                {sh:'arrow',r:0,  f:'solid'},
                {sh:'arrow',r:270,f:'solid'},
                {sh:'arrow',r:180,f:'solid'}
            ],
            answer: 1,
            exp: 'Each row the arrow rotates 90° clockwise per column. Row 3: 180° → 270° → 360° = 0° (pointing right).',
            time: 15
        },

        // Q8 – Solid/outline checkerboard
        {
            category: 'Pattern', type: 'Fill Alternation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid'},   {sh:'triangle',f:'outline'}, {sh:'triangle',f:'solid'},
                {sh:'triangle',f:'outline'}, {sh:'triangle',f:'solid'},   {sh:'triangle',f:'outline'},
                {sh:'triangle',f:'solid'},   {sh:'triangle',f:'outline'}, null
            ],
            choices: [
                {sh:'triangle',f:'outline'},
                {sh:'circle',  f:'solid'},
                {sh:'triangle',f:'solid'},
                {sh:'square',  f:'solid'}
            ],
            answer: 2,
            exp: 'Fill alternates like a checkerboard. Row 3 starts solid, so col 3 of row 3 is solid.',
            time: 15
        },

        // Q9 – Nested shapes (1, 2, 3 concentric outlines per column)
        {
            category: 'Pattern', type: 'Nested Shapes',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'square',  f:'outline',n:1}, {sh:'square',  f:'outline',n:2}, {sh:'square',  f:'outline',n:3},
                {sh:'circle',  f:'outline',n:1}, {sh:'circle',  f:'outline',n:2}, {sh:'circle',  f:'outline',n:3},
                {sh:'triangle',f:'outline',n:1}, {sh:'triangle',f:'outline',n:2}, null
            ],
            choices: [
                {sh:'triangle',f:'outline',n:1},
                {sh:'triangle',f:'outline',n:2},
                {sh:'circle',  f:'outline',n:3},
                {sh:'triangle',f:'outline',n:3}
            ],
            answer: 3,
            exp: 'Each row has 1, 2, then 3 concentric outlines of the same shape. Row 3 uses triangles, so 3 nested triangles.',
            time: 15
        },

        // Q10 – Pentagon rotation (72° per step)
        {
            category: 'Pattern', type: 'Pentagon Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'pentagon',r:0,  f:'solid'}, {sh:'pentagon',r:72, f:'solid'}, {sh:'pentagon',r:144,f:'solid'},
                {sh:'pentagon',r:72, f:'solid'}, {sh:'pentagon',r:144,f:'solid'}, {sh:'pentagon',r:216,f:'solid'},
                {sh:'pentagon',r:144,f:'solid'}, {sh:'pentagon',r:216,f:'solid'}, null
            ],
            choices: [
                {sh:'pentagon',r:0,  f:'solid'},
                {sh:'pentagon',r:288,f:'solid'},
                {sh:'pentagon',r:216,f:'solid'},
                {sh:'pentagon',r:144,f:'solid'}
            ],
            answer: 1,
            exp: 'Each row the pentagon rotates 72° per column. Row 3: 144° → 216° → 288°.',
            time: 15
        },

        // Q11 – Fill × rotation matrix (rows=fill, cols=rotation)
        {
            category: 'Pattern', type: 'Fill & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'outline'}, {sh:'triangle',r:90, f:'outline'}, {sh:'triangle',r:180,f:'outline'},
                {sh:'triangle',r:0,  f:'striped'},  {sh:'triangle',r:90, f:'striped'},  {sh:'triangle',r:180,f:'striped'},
                {sh:'triangle',r:0,  f:'solid'},   {sh:'triangle',r:90, f:'solid'},   null
            ],
            choices: [
                {sh:'triangle',r:180,f:'solid'},
                {sh:'triangle',r:0,  f:'solid'},
                {sh:'triangle',r:180,f:'outline'},
                {sh:'triangle',r:180,f:'striped'}
            ],
            answer: 0,
            exp: 'Rows follow fill: outline, striped, solid. Columns follow rotation: 0°, 90°, 180°. Row 3, col 3 → solid at 180°.',
            time: 15
        },

        // Q12 – Cross alternation (+ at 0° vs × at 45°)
        {
            category: 'Pattern', type: 'Cross Alternation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'cross',r:0, f:'solid'}, {sh:'cross',r:45,f:'solid'}, {sh:'cross',r:0, f:'solid'},
                {sh:'cross',r:45,f:'solid'}, {sh:'cross',r:0, f:'solid'}, {sh:'cross',r:45,f:'solid'},
                {sh:'cross',r:0, f:'solid'}, {sh:'cross',r:45,f:'solid'}, null
            ],
            choices: [
                {sh:'cross',r:45,f:'solid'},
                {sh:'cross',r:0, f:'solid'},
                {sh:'circle',r:0,f:'solid'},
                {sh:'square',r:0,f:'solid'}
            ],
            answer: 1,
            exp: 'The cross alternates + (0°) and × (45°) like a checkerboard. Position (3,3) follows the same alternation — it is + (0°).',
            time: 15
        },

        // Q13 – Sides progression × fill (cols=3/4/5 sides, rows=fill)
        {
            category: 'Pattern', type: 'Shape & Fill',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'outline'}, {sh:'square',  f:'outline'}, {sh:'pentagon',f:'outline'},
                {sh:'triangle',f:'striped'},  {sh:'square',  f:'striped'},  {sh:'pentagon',f:'striped'},
                {sh:'triangle',f:'solid'},   {sh:'square',  f:'solid'},   null
            ],
            choices: [
                {sh:'pentagon',f:'outline'},
                {sh:'pentagon',f:'striped'},
                {sh:'square',  f:'solid'},
                {sh:'pentagon',f:'solid'}
            ],
            answer: 3,
            exp: 'Columns follow shape (3, 4, 5 sides); rows follow fill (outline, striped, solid). Row 3, col 3 → solid pentagon.',
            time: 15
        },

        // Q14 – Color intensity progression (light → medium → dark)
        {
            category: 'Pattern', type: 'Color Intensity',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'light'},  {sh:'triangle',f:'solid'}, {sh:'triangle',f:'dark'},
                {sh:'circle',  f:'light'},  {sh:'circle',  f:'solid'}, {sh:'circle',  f:'dark'},
                {sh:'square',  f:'light'},  {sh:'square',  f:'solid'}, null
            ],
            choices: [
                {sh:'square',f:'light'},
                {sh:'square',f:'solid'},
                {sh:'circle',f:'dark'},
                {sh:'square',f:'dark'}
            ],
            answer: 3,
            exp: 'Each row progresses light → medium → dark. Row 3 uses squares, so the missing cell is a dark-shaded square.',
            time: 15
        },

        // Q15 – Dot position pattern (corner dot cycles TL→TR→BL→BR)
        {
            category: 'Pattern', type: 'Dot Position',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'square',f:'solid',dp:'tl'}, {sh:'square',f:'solid',dp:'tr'}, {sh:'square',f:'solid',dp:'bl'},
                {sh:'square',f:'solid',dp:'tr'}, {sh:'square',f:'solid',dp:'bl'}, {sh:'square',f:'solid',dp:'br'},
                {sh:'square',f:'solid',dp:'bl'}, {sh:'square',f:'solid',dp:'br'}, null
            ],
            choices: [
                {sh:'square',f:'solid',dp:'tr'},
                {sh:'square',f:'solid',dp:'bl'},
                {sh:'square',f:'solid',dp:'br'},
                {sh:'square',f:'solid',dp:'tl'}
            ],
            answer: 3,
            exp: 'The white dot cycles diagonally. Each row shifts one step: TL→TR→BL, TR→BL→BR, BL→BR→TL. The missing position is top-left.',
            time: 15
        },

        // Q16 – Rotation × dot (dot present at 0°/180°, absent at 90°/270°)
        {
            category: 'Pattern', type: 'Rotation & Dot',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid',d:true},  {sh:'triangle',r:90, f:'solid',d:false}, {sh:'triangle',r:180,f:'solid',d:true},
                {sh:'triangle',r:90, f:'solid',d:false}, {sh:'triangle',r:180,f:'solid',d:true},  {sh:'triangle',r:270,f:'solid',d:false},
                {sh:'triangle',r:180,f:'solid',d:true},  {sh:'triangle',r:270,f:'solid',d:false}, null
            ],
            choices: [
                {sh:'triangle',r:0,f:'solid',d:true},
                {sh:'triangle',r:0,f:'solid',d:false},
                {sh:'triangle',r:90,f:'solid',d:true},
                {sh:'triangle',r:180,f:'solid',d:false}
            ],
            answer: 0,
            exp: 'Triangle rotates 90° per step; dot appears at 0° and 180°, absent at 90° and 270°. Next step → 0° with dot.',
            time: 15
        },

        // Q17 – Shape count per cell (1 → 2 → 3)
        {
            category: 'Pattern', type: 'Shape Count',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid',cnt:1}, {sh:'triangle',f:'solid',cnt:2}, {sh:'triangle',f:'solid',cnt:3},
                {sh:'circle',  f:'solid',cnt:1}, {sh:'circle',  f:'solid',cnt:2}, {sh:'circle',  f:'solid',cnt:3},
                {sh:'square',  f:'solid',cnt:1}, {sh:'square',  f:'solid',cnt:2}, null
            ],
            choices: [
                {sh:'square',f:'solid',cnt:1},
                {sh:'square',f:'solid',cnt:2},
                {sh:'circle',f:'solid',cnt:3},
                {sh:'square',f:'solid',cnt:3}
            ],
            answer: 3,
            exp: 'Each row increases shape count: 1 → 2 → 3. Row 3 uses squares, so the missing cell has 3 squares.',
            time: 15
        },

        // Q18 – Size + rotation (size grows, rotation +90° per step)
        {
            category: 'Pattern', type: 'Size & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid',sz:0.5},  {sh:'triangle',r:90, f:'solid',sz:0.75}, {sh:'triangle',r:180,f:'solid',sz:1.0},
                {sh:'triangle',r:90, f:'solid',sz:0.5},  {sh:'triangle',r:180,f:'solid',sz:0.75}, {sh:'triangle',r:270,f:'solid',sz:1.0},
                {sh:'triangle',r:180,f:'solid',sz:0.5},  {sh:'triangle',r:270,f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'triangle',r:0,f:'solid',sz:0.5},
                {sh:'triangle',r:180,f:'solid',sz:1.0},
                {sh:'triangle',r:0,f:'solid',sz:0.75},
                {sh:'triangle',r:0,f:'solid',sz:1.0}
            ],
            answer: 3,
            exp: 'Size grows small→medium→large per column. Rotation starts each row 90° higher. Row 3 ends at 360°=0°, large size.',
            time: 15
        },

        // Q19 – Shape + fill Latin square
        {
            category: 'Pattern', type: 'Shape & Fill Matrix',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid'},   {sh:'circle',  f:'outline'},  {sh:'square',  f:'striped'},
                {sh:'circle',  f:'outline'},  {sh:'square',  f:'striped'},  {sh:'triangle',f:'solid'},
                {sh:'square',  f:'striped'},  {sh:'triangle',f:'solid'},   null
            ],
            choices: [
                {sh:'triangle',f:'solid'},
                {sh:'square',  f:'striped'},
                {sh:'circle',  f:'outline'},
                {sh:'circle',  f:'solid'}
            ],
            answer: 2,
            exp: 'Each row and column contains each shape-fill pair exactly once: solid-triangle, outline-circle, striped-square. Row 3 col 3 must be outline circle.',
            time: 15
        },

        // Q20 – Arrow: fill × direction matrix
        {
            category: 'Pattern', type: 'Fill & Direction',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'arrow',r:0,  f:'outline'}, {sh:'arrow',r:90, f:'outline'}, {sh:'arrow',r:180,f:'outline'},
                {sh:'arrow',r:0,  f:'striped'},  {sh:'arrow',r:90, f:'striped'},  {sh:'arrow',r:180,f:'striped'},
                {sh:'arrow',r:0,  f:'solid'},   {sh:'arrow',r:90, f:'solid'},   null
            ],
            choices: [
                {sh:'arrow',r:180,f:'solid'},
                {sh:'arrow',r:180,f:'outline'},
                {sh:'arrow',r:90, f:'solid'},
                {sh:'arrow',r:270,f:'solid'}
            ],
            answer: 0,
            exp: 'Rows follow fill (outline, striped, solid). Columns follow direction (right=0°, down=90°, left=180°). Row 3, col 3 → solid arrow pointing left.',
            time: 15
        },

        // Q21 – Star rotation (36° clockwise per step)
        {
            category: 'Pattern', type: 'Star Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'star',r:0,  f:'solid'}, {sh:'star',r:36, f:'solid'}, {sh:'star',r:72, f:'solid'},
                {sh:'star',r:36, f:'solid'}, {sh:'star',r:72, f:'solid'}, {sh:'star',r:108,f:'solid'},
                {sh:'star',r:72, f:'solid'}, {sh:'star',r:108,f:'solid'}, null
            ],
            choices: [
                {sh:'star',r:144,f:'solid'},
                {sh:'star',r:0,  f:'solid'},
                {sh:'star',r:72, f:'solid'},
                {sh:'star',r:108,f:'solid'}
            ],
            answer: 0,
            exp: 'Each row the star rotates 36° per column. Row 3: 72° → 108° → 144°.',
            time: 15
        },

        // Q22 – Fill Latin square (all circles; solid/striped/outline each once per row & col)
        {
            category: 'Pattern', type: 'Fill Latin Square',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'circle',f:'solid'},   {sh:'circle',f:'striped'}, {sh:'circle',f:'outline'},
                {sh:'circle',f:'striped'}, {sh:'circle',f:'outline'}, {sh:'circle',f:'solid'},
                {sh:'circle',f:'outline'}, {sh:'circle',f:'solid'},   null
            ],
            choices: [
                {sh:'circle',  f:'solid'},
                {sh:'circle',  f:'outline'},
                {sh:'circle',  f:'striped'},
                {sh:'triangle',f:'striped'}
            ],
            answer: 2,
            exp: 'Each row and column contains each fill (solid, striped, outline) exactly once. Row 3 col 3 must be striped.',
            time: 15
        },

        // Q23 – Pentagon: rows=fill, cols=size
        {
            category: 'Pattern', type: 'Shape Size & Fill',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'pentagon',f:'outline',sz:0.5}, {sh:'pentagon',f:'outline',sz:0.75}, {sh:'pentagon',f:'outline',sz:1.0},
                {sh:'pentagon',f:'striped', sz:0.5}, {sh:'pentagon',f:'striped', sz:0.75}, {sh:'pentagon',f:'striped', sz:1.0},
                {sh:'pentagon',f:'solid',  sz:0.5}, {sh:'pentagon',f:'solid',  sz:0.75}, null
            ],
            choices: [
                {sh:'pentagon',f:'solid',  sz:0.5},
                {sh:'pentagon',f:'outline',sz:1.0},
                {sh:'pentagon',f:'solid',  sz:0.75},
                {sh:'pentagon',f:'solid',  sz:1.0}
            ],
            answer: 3,
            exp: 'Rows follow fill (outline, striped, solid); columns follow size (small, medium, large). Row 3, col 3 → solid, large pentagon.',
            time: 15
        },

        // Q24 – Triangle count (per col) × rotation (per row)
        {
            category: 'Pattern', type: 'Count & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid',cnt:1}, {sh:'triangle',r:0,  f:'solid',cnt:2}, {sh:'triangle',r:0,  f:'solid',cnt:3},
                {sh:'triangle',r:90, f:'solid',cnt:1}, {sh:'triangle',r:90, f:'solid',cnt:2}, {sh:'triangle',r:90, f:'solid',cnt:3},
                {sh:'triangle',r:180,f:'solid',cnt:1}, {sh:'triangle',r:180,f:'solid',cnt:2}, null
            ],
            choices: [
                {sh:'triangle',r:180,f:'solid',cnt:1},
                {sh:'triangle',r:90, f:'solid',cnt:3},
                {sh:'triangle',r:180,f:'solid',cnt:2},
                {sh:'triangle',r:180,f:'solid',cnt:3}
            ],
            answer: 3,
            exp: 'Rows follow rotation (0°, 90°, 180°); columns follow count (1, 2, 3). Row 3, col 3 → 180° rotation, 3 shapes.',
            time: 15
        },

        // Q25 – Arrow: direction per row × size per col
        {
            category: 'Pattern', type: 'Direction & Size',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'arrow',r:0,  f:'solid',sz:0.5},  {sh:'arrow',r:0,  f:'solid',sz:0.75}, {sh:'arrow',r:0,  f:'solid',sz:1.0},
                {sh:'arrow',r:90, f:'solid',sz:0.5},  {sh:'arrow',r:90, f:'solid',sz:0.75}, {sh:'arrow',r:90, f:'solid',sz:1.0},
                {sh:'arrow',r:180,f:'solid',sz:0.5},  {sh:'arrow',r:180,f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'arrow',r:180,f:'solid',sz:0.5},
                {sh:'arrow',r:0,  f:'solid',sz:1.0},
                {sh:'arrow',r:180,f:'solid',sz:0.75},
                {sh:'arrow',r:180,f:'solid',sz:1.0}
            ],
            answer: 3,
            exp: 'Rows follow arrow direction (right, down, left); columns follow size (small, medium, large). Row 3, col 3 → left-pointing large arrow.',
            time: 15
        },

        // Q26 – Nested count (rows=shape, cols=1,2,3 nested outlines)
        {
            category: 'Pattern', type: 'Nested Count',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'outline'},     {sh:'triangle',f:'outline',n:2}, {sh:'triangle',f:'outline',n:3},
                {sh:'square',  f:'outline'},     {sh:'square',  f:'outline',n:2}, {sh:'square',  f:'outline',n:3},
                {sh:'circle',  f:'outline'},     {sh:'circle',  f:'outline',n:2}, null
            ],
            choices: [
                {sh:'circle',  f:'outline'},
                {sh:'circle',  f:'outline',n:2},
                {sh:'triangle',f:'outline',n:3},
                {sh:'circle',  f:'outline',n:3}
            ],
            answer: 3,
            exp: 'Each row progresses 1 → 2 → 3 nested outlines of the same shape. Row 3 uses circles, so 3 concentric circles.',
            time: 15
        },

        // Q27 – Size decreasing (rows=shape, cols=large→medium→small)
        {
            category: 'Pattern', type: 'Size Decreasing',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid',sz:1.0}, {sh:'triangle',f:'solid',sz:0.75}, {sh:'triangle',f:'solid',sz:0.5},
                {sh:'circle',  f:'solid',sz:1.0}, {sh:'circle',  f:'solid',sz:0.75}, {sh:'circle',  f:'solid',sz:0.5},
                {sh:'square',  f:'solid',sz:1.0}, {sh:'square',  f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'square',  f:'solid',sz:1.0},
                {sh:'triangle',f:'solid',sz:0.5},
                {sh:'square',  f:'solid',sz:0.75},
                {sh:'square',  f:'solid',sz:0.5}
            ],
            answer: 3,
            exp: 'Each row shrinks large → medium → small. Row 3 uses squares, so the missing cell is a small square.',
            time: 15
        },

        // Q28 – Cross: fill per row × rotation alternates per col (+/×)
        {
            category: 'Pattern', type: 'Cross Fill & Angle',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'cross',r:0, f:'outline'}, {sh:'cross',r:45,f:'outline'}, {sh:'cross',r:0, f:'outline'},
                {sh:'cross',r:45,f:'striped'},  {sh:'cross',r:0, f:'striped'},  {sh:'cross',r:45,f:'striped'},
                {sh:'cross',r:0, f:'solid'},   {sh:'cross',r:45,f:'solid'},   null
            ],
            choices: [
                {sh:'cross',r:45,f:'solid'},
                {sh:'cross',r:0, f:'outline'},
                {sh:'cross',r:0, f:'solid'},
                {sh:'cross',r:45,f:'outline'}
            ],
            answer: 2,
            exp: 'Rows follow fill (outline, striped, solid). Rotation alternates +/× per column: col 3 is always + (0°). Row 3, col 3 → solid + cross.',
            time: 15
        },

        // Q29 – Shape count decreasing (3→2→1 per column)
        {
            category: 'Pattern', type: 'Count Decreasing',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid',cnt:3}, {sh:'triangle',f:'solid',cnt:2}, {sh:'triangle',f:'solid',cnt:1},
                {sh:'circle',  f:'solid',cnt:3}, {sh:'circle',  f:'solid',cnt:2}, {sh:'circle',  f:'solid',cnt:1},
                {sh:'square',  f:'solid',cnt:3}, {sh:'square',  f:'solid',cnt:2}, null
            ],
            choices: [
                {sh:'square',f:'solid',cnt:3},
                {sh:'square',f:'solid',cnt:2},
                {sh:'circle',f:'solid',cnt:1},
                {sh:'square',f:'solid',cnt:1}
            ],
            answer: 3,
            exp: 'Each row decreases count 3 → 2 → 1. Row 3 uses squares, so the missing cell has 1 square.',
            time: 15
        },

        // Q30 – Nested count (rows) × rotation (cols)
        {
            category: 'Pattern', type: 'Nested & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'outline'},     {sh:'triangle',r:90, f:'outline'},     {sh:'triangle',r:180,f:'outline'},
                {sh:'triangle',r:0,  f:'outline',n:2}, {sh:'triangle',r:90, f:'outline',n:2}, {sh:'triangle',r:180,f:'outline',n:2},
                {sh:'triangle',r:0,  f:'outline',n:3}, {sh:'triangle',r:90, f:'outline',n:3}, null
            ],
            choices: [
                {sh:'triangle',r:0,  f:'outline',n:3},
                {sh:'triangle',r:90, f:'outline',n:3},
                {sh:'triangle',r:180,f:'outline',n:2},
                {sh:'triangle',r:180,f:'outline',n:3}
            ],
            answer: 3,
            exp: 'Rows follow nested count (1, 2, 3); columns follow rotation (0°, 90°, 180°). Row 3, col 3 → 3 nested, 180°.',
            time: 15
        },

        // Q31 – Shape per column × rotation per row
        {
            category: 'Pattern', type: 'Shape & Rotation Grid',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid'}, {sh:'circle',r:0,  f:'solid'}, {sh:'square',r:0,  f:'solid'},
                {sh:'triangle',r:90, f:'solid'}, {sh:'circle',r:90, f:'solid'}, {sh:'square',r:90, f:'solid'},
                {sh:'triangle',r:180,f:'solid'}, {sh:'circle',r:180,f:'solid'}, null
            ],
            choices: [
                {sh:'square',r:0,  f:'solid'},
                {sh:'triangle',r:180,f:'solid'},
                {sh:'square',r:90, f:'solid'},
                {sh:'square',r:180,f:'solid'}
            ],
            answer: 3,
            exp: 'Column 3 always has a square; row 3 rotation is 180°. The missing cell is a square rotated 180°.',
            time: 15
        },

        // Q32 – Fill per row × count per col
        {
            category: 'Pattern', type: 'Fill & Count',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'outline',cnt:1}, {sh:'triangle',f:'outline',cnt:2}, {sh:'triangle',f:'outline',cnt:3},
                {sh:'triangle',f:'striped', cnt:1}, {sh:'triangle',f:'striped', cnt:2}, {sh:'triangle',f:'striped', cnt:3},
                {sh:'triangle',f:'solid',  cnt:1}, {sh:'triangle',f:'solid',  cnt:2}, null
            ],
            choices: [
                {sh:'triangle',f:'solid',  cnt:1},
                {sh:'triangle',f:'solid',  cnt:2},
                {sh:'triangle',f:'outline',cnt:3},
                {sh:'triangle',f:'solid',  cnt:3}
            ],
            answer: 3,
            exp: 'Rows follow fill (outline, striped, solid); columns follow count (1, 2, 3). Row 3, col 3 → solid, 3 triangles.',
            time: 15
        },

        // Q33 – Pentagon: rotation per row × size per col
        {
            category: 'Pattern', type: 'Pentagon Size & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'pentagon',r:0,  f:'solid',sz:0.5},  {sh:'pentagon',r:0,  f:'solid',sz:0.75}, {sh:'pentagon',r:0,  f:'solid',sz:1.0},
                {sh:'pentagon',r:72, f:'solid',sz:0.5},  {sh:'pentagon',r:72, f:'solid',sz:0.75}, {sh:'pentagon',r:72, f:'solid',sz:1.0},
                {sh:'pentagon',r:144,f:'solid',sz:0.5},  {sh:'pentagon',r:144,f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'pentagon',r:144,f:'solid',sz:0.5},
                {sh:'pentagon',r:144,f:'solid',sz:0.75},
                {sh:'pentagon',r:72, f:'solid',sz:1.0},
                {sh:'pentagon',r:144,f:'solid',sz:1.0}
            ],
            answer: 3,
            exp: 'Rows follow rotation (0°, 72°, 144°); columns follow size (small, medium, large). Row 3, col 3 → 144° rotation, large.',
            time: 15
        },

        // Q34 – Dot position cycles clockwise (TL→TR→BR→BL)
        {
            category: 'Pattern', type: 'Dot Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'square',f:'solid',dp:'tl'}, {sh:'square',f:'solid',dp:'tr'}, {sh:'square',f:'solid',dp:'br'},
                {sh:'square',f:'solid',dp:'tr'}, {sh:'square',f:'solid',dp:'br'}, {sh:'square',f:'solid',dp:'bl'},
                {sh:'square',f:'solid',dp:'br'}, {sh:'square',f:'solid',dp:'bl'}, null
            ],
            choices: [
                {sh:'square',f:'solid',dp:'br'},
                {sh:'square',f:'solid',dp:'tl'},
                {sh:'square',f:'solid',dp:'tr'},
                {sh:'square',f:'solid',dp:'bl'}
            ],
            answer: 1,
            exp: 'The dot moves one step clockwise per cell: TL→TR→BR→BL→TL. Row 3: BR→BL→TL.',
            time: 15
        },

        // Q35 – Shape Latin square × rotation per row
        {
            category: 'Pattern', type: 'Shape Latin & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',r:0,  f:'solid'}, {sh:'circle',  r:0,  f:'solid'}, {sh:'square',  r:0,  f:'solid'},
                {sh:'circle',  r:90, f:'solid'}, {sh:'square',  r:90, f:'solid'}, {sh:'triangle',r:90, f:'solid'},
                {sh:'square',  r:180,f:'solid'}, {sh:'triangle',r:180,f:'solid'}, null
            ],
            choices: [
                {sh:'square',  r:180,f:'solid'},
                {sh:'circle',  r:180,f:'solid'},
                {sh:'triangle',r:180,f:'solid'},
                {sh:'circle',  r:0,  f:'solid'}
            ],
            answer: 1,
            exp: 'Shapes form a Latin square (T,C,S each once per row & col). Rotation is 0°, 90°, 180° per row. Row 3, col 3 → circle at 180°.',
            time: 15
        },

        // Q36 – Size decreasing × shape per row (reverse progression, different shapes)
        {
            category: 'Pattern', type: 'Reverse Size',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'circle',  f:'solid',sz:1.0}, {sh:'circle',  f:'solid',sz:0.75}, {sh:'circle',  f:'solid',sz:0.5},
                {sh:'square',  f:'solid',sz:1.0}, {sh:'square',  f:'solid',sz:0.75}, {sh:'square',  f:'solid',sz:0.5},
                {sh:'triangle',f:'solid',sz:1.0}, {sh:'triangle',f:'solid',sz:0.75}, null
            ],
            choices: [
                {sh:'triangle',f:'solid',sz:1.0},
                {sh:'triangle',f:'solid',sz:0.75},
                {sh:'circle',  f:'solid',sz:0.5},
                {sh:'triangle',f:'solid',sz:0.5}
            ],
            answer: 3,
            exp: 'Each row shrinks large → medium → small. Row 3 uses triangles, so the missing cell is a small triangle.',
            time: 15
        },

        // Q37 – Star: fill per row × rotation per col
        {
            category: 'Pattern', type: 'Star Fill & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'star',r:0,  f:'outline'}, {sh:'star',r:36, f:'outline'}, {sh:'star',r:72, f:'outline'},
                {sh:'star',r:0,  f:'solid'},   {sh:'star',r:36, f:'solid'},   {sh:'star',r:72, f:'solid'},
                {sh:'star',r:0,  f:'striped'},  {sh:'star',r:36, f:'striped'},  null
            ],
            choices: [
                {sh:'star',r:0,  f:'striped'},
                {sh:'star',r:72, f:'solid'},
                {sh:'star',r:36, f:'striped'},
                {sh:'star',r:72, f:'striped'}
            ],
            answer: 3,
            exp: 'Rows follow fill (outline, solid, striped); columns follow rotation (0°, 36°, 72°). Row 3, col 3 → striped star at 72°.',
            time: 15
        },

        // Q38 – Mixed shapes per col × count per row (arrow/pentagon/star)
        {
            category: 'Pattern', type: 'Mixed Shape Count',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'arrow',  f:'solid',cnt:1}, {sh:'pentagon',f:'solid',cnt:1}, {sh:'star',   f:'solid',cnt:1},
                {sh:'arrow',  f:'solid',cnt:2}, {sh:'pentagon',f:'solid',cnt:2}, {sh:'star',   f:'solid',cnt:2},
                {sh:'arrow',  f:'solid',cnt:3}, {sh:'pentagon',f:'solid',cnt:3}, null
            ],
            choices: [
                {sh:'star',f:'solid',cnt:1},
                {sh:'star',f:'solid',cnt:2},
                {sh:'pentagon',f:'solid',cnt:3},
                {sh:'star',f:'solid',cnt:3}
            ],
            answer: 3,
            exp: 'Columns fix the shape (arrow, pentagon, star); rows fix the count (1, 2, 3). Row 3, col 3 → 3 stars.',
            time: 15
        },

        // Q39 – Diamond: fill per row × rotation per col
        {
            category: 'Pattern', type: 'Diamond Fill & Rotation',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'diamond',r:0, f:'outline'}, {sh:'diamond',r:45,f:'outline'}, {sh:'diamond',r:90,f:'outline'},
                {sh:'diamond',r:0, f:'striped'},  {sh:'diamond',r:45,f:'striped'},  {sh:'diamond',r:90,f:'striped'},
                {sh:'diamond',r:0, f:'solid'},   {sh:'diamond',r:45,f:'solid'},   null
            ],
            choices: [
                {sh:'diamond',r:0, f:'solid'},
                {sh:'diamond',r:90,f:'outline'},
                {sh:'diamond',r:45,f:'solid'},
                {sh:'diamond',r:90,f:'solid'}
            ],
            answer: 3,
            exp: 'Rows follow fill (outline, striped, solid); columns follow rotation (0°, 45°, 90°). Row 3, col 3 → solid diamond at 90°.',
            time: 15
        },

        // Q40 – Grand challenge: shape Latin square × size × fill (3 attributes)
        {
            category: 'Pattern', type: 'Triple Attribute',
            prompt: 'Which shape completes the pattern?',
            cells: [
                {sh:'triangle',f:'solid',  sz:0.5},  {sh:'circle',  f:'striped', sz:0.5},  {sh:'square',  f:'outline',sz:0.5},
                {sh:'circle',  f:'outline',sz:0.75}, {sh:'square',  f:'solid',  sz:0.75}, {sh:'triangle',f:'striped', sz:0.75},
                {sh:'square',  f:'striped', sz:1.0},  {sh:'triangle',f:'outline',sz:1.0},  null
            ],
            choices: [
                {sh:'circle',f:'solid',  sz:1.0},
                {sh:'circle',f:'striped', sz:1.0},
                {sh:'circle',f:'outline',sz:0.75},
                {sh:'circle',f:'outline',sz:1.0}
            ],
            answer: 0,
            exp: 'Three rules: shapes form a Latin square (T,C,S once per row & col); size increases per row (sm, md, lg); fill forms a Latin square (solid,striped,outline). Row 3, col 3 → circle, large, solid.',
            time: 15
        }

    ];

    // ─── State ─────────────────────────────────────────────────────────────────
    var TOTAL_SECONDS = 40 * 60; // 40 minutes for 40 questions
    var answers       = new Array(QUESTIONS.length).fill(null);
    var timingAccum   = new Array(QUESTIONS.length).fill(0);
    var questionStart = null;
    var currentIdx    = 0;
    var ticker        = null;
    var globalStart   = null;

    // ─── DOM ───────────────────────────────────────────────────────────────────
    var screens   = document.querySelectorAll('.psych-screen');
    var startBtn  = document.getElementById('start-btn');
    var prevBtn   = document.getElementById('q-prev-btn');
    var nextBtn   = document.getElementById('q-next-btn');
    var finishBtn = document.getElementById('q-finish-btn');
    var retryBtn  = document.getElementById('retry-btn');
    var numGrid   = document.getElementById('q-number-grid');

    function showScreen(id) {
        screens.forEach(function (el) { el.classList.remove('active'); });
        document.getElementById(id).classList.add('active');
    }

    function startAssessment() {
        console.log('startAssessment() called');
        if (!startBtn) {
            console.error('Unable to start: startBtn not found');
            return;
        }
        showScreen('screen-question');
        renderQuestion(0);
        startGlobalTimer();
    }

    // Expose fallback for direct onclick attribute (template-level resilience)
    window.startAssessment = startAssessment;

    // ─── Global countdown ─────────────────────────────────────────────────────
    function fmtTime(secs) {
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function startGlobalTimer() {
        var bar   = document.getElementById('timer-bar');
        var numEl = document.getElementById('timer-num');

        bar.classList.remove('warning', 'danger');
        bar.style.transition = 'none';
        bar.style.width = '100%';
        numEl.textContent = fmtTime(TOTAL_SECONDS);

        requestAnimationFrame(function () {
            bar.style.transition = 'width ' + TOTAL_SECONDS + 's linear';
            bar.style.width = '0%';
        });

        globalStart = Date.now();

        ticker = setInterval(function () {
            var elapsed = Math.floor((Date.now() - globalStart) / 1000);
            var left = Math.max(0, TOTAL_SECONDS - elapsed);

            numEl.textContent = fmtTime(left);
            var pct = left / TOTAL_SECONDS;
            bar.classList.toggle('warning', pct <= 0.3 && pct > 0.1);
            bar.classList.toggle('danger',  pct <= 0.1);

            if (left <= 0) {
                clearInterval(ticker);
                ticker = null;
                pauseQuestionTimer();
                for (var i = 0; i < answers.length; i++) {
                    if (answers[i] === null) answers[i] = -1;
                }
                updateNumGrid();
                showResults();
            }
        }, 500);
    }

    function stopGlobalTimer() {
        if (ticker) { clearInterval(ticker); ticker = null; }
    }

    function pauseQuestionTimer() {
        if (questionStart !== null) {
            timingAccum[currentIdx] += Date.now() - questionStart;
            questionStart = null;
        }
    }

    function resumeQuestionTimer(idx) {
        if (answers[idx] === null) {
            questionStart = Date.now();
        } else {
            questionStart = null;
        }
    }

    // ─── Render ────────────────────────────────────────────────────────────────
    function renderQuestion(idx) {
        var q      = QUESTIONS[idx];
        var qNum   = document.getElementById('q-num');
        var qTitle = document.getElementById('q-title');
        var qGrid  = document.getElementById('q-grid');
        var qOpts  = document.getElementById('q-options');
        var qExp   = document.getElementById('q-explanation');
        var badge  = document.getElementById('q-cat-badge');

        qNum.textContent  = (idx + 1) + ' / ' + QUESTIONS.length;
        qTitle.textContent = q.prompt || 'Which shape completes the pattern?';
        qExp.className    = 'mcq-explanation';
        qExp.textContent  = '';
        badge.textContent = q.category + ' · ' + q.type;

        // Visual 3×3 grid
        qGrid.innerHTML = buildVisualGrid(q.cells);
        qGrid.style.display = 'block';

        // Choice buttons (2×2 grid with SVG images)
        qOpts.innerHTML = '';
        qOpts.className = 'mcq-options mcq-options-visual';
        var labels = ['A', 'B', 'C', 'D'];
        q.choices.forEach(function (choice, i) {
            var btn = document.createElement('button');
            btn.className = 'mcq-option v-option';
            btn.innerHTML = '<span class="v-opt-lbl">' + labels[i] + '</span>'
                          + cellSVG(choice);
            btn.addEventListener('click', (function (ci) {
                return function () { selectAnswer(ci); };
            })(i));
            qOpts.appendChild(btn);
        });

        // Navigation
        prevBtn.style.display   = idx > 0 ? 'inline-flex' : 'none';
        nextBtn.style.display   = idx < QUESTIONS.length - 1 ? 'inline-flex' : 'none';
        finishBtn.style.display = idx === QUESTIONS.length - 1 ? 'inline-flex' : 'none';

        // Restore prior answer state
        if (answers[idx] !== null && answers[idx] !== -1) {
            revealAnswer(qOpts.querySelectorAll('.mcq-option'), answers[idx], q.answer, q.exp);
        } else if (answers[idx] === -1) {
            disableOpts(qOpts);
            qExp.textContent = 'Time expired. ' + q.exp;
            qExp.className   = 'mcq-explanation visible incorrect';
        } else {
            resumeQuestionTimer(idx);
        }

        updateNumGrid();
    }

    function selectAnswer(choiceIdx) {
        if (answers[currentIdx] !== null) return;
        answers[currentIdx] = choiceIdx;
        pauseQuestionTimer();
        var opts = document.getElementById('q-options').querySelectorAll('.mcq-option');
        revealAnswer(opts, choiceIdx, QUESTIONS[currentIdx].answer, QUESTIONS[currentIdx].exp);
        updateNumGrid();
    }

    function revealAnswer(opts, chosen, correct, expText) {
        opts.forEach(function (btn, i) {
            btn.disabled = true;
            if (i === correct) btn.classList.add('correct');
            else if (i === chosen && chosen !== correct) btn.classList.add('incorrect');
        });
        var exp = document.getElementById('q-explanation');
        exp.textContent = expText;
        exp.className   = 'mcq-explanation visible ' + (chosen === correct ? 'correct' : 'incorrect');
    }

    function disableOpts(container) {
        container.querySelectorAll('.mcq-option').forEach(function (btn) {
            btn.disabled = true;
        });
    }

    // ─── Number grid ───────────────────────────────────────────────────────────
    function updateNumGrid() {
        numGrid.innerHTML = '';
        QUESTIONS.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.className = 'q-dot';
            if (i === currentIdx) dot.classList.add('active');
            if (answers[i] !== null && answers[i] !== -1) {
                dot.classList.add(answers[i] === QUESTIONS[i].answer ? 'done' : 'wrong');
            } else if (answers[i] === -1) {
                dot.classList.add('wrong');
            }
            dot.textContent = i + 1;
            dot.addEventListener('click', (function (ci) {
                return function () { goTo(ci); };
            })(i));
            numGrid.appendChild(dot);
        });
    }

    function goTo(idx) {
        pauseQuestionTimer();
        currentIdx = idx;
        renderQuestion(idx);
    }

    // ─── Results ───────────────────────────────────────────────────────────────
    function showResults() {
        stopGlobalTimer();
        var total      = QUESTIONS.length;
        var correct    = 0;
        var byCategory = {};

        QUESTIONS.forEach(function (q, i) {
            var cat = q.category;
            if (!byCategory[cat]) byCategory[cat] = { correct: 0, total: 0, totalTime: 0, timedCount: 0 };
            byCategory[cat].total++;
            if (answers[i] === q.answer) { correct++; byCategory[cat].correct++; }
            if (timingAccum[i] > 0) {
                byCategory[cat].totalTime  += Math.round(timingAccum[i] / 1000);
                byCategory[cat].timedCount++;
            }
        });

        var pct = Math.round((correct / total) * 100);
        var percentile, rating;
        if (pct >= 90)      { percentile = 'Top 10%';    rating = 'Exceptional'; }
        else if (pct >= 75) { percentile = 'Top 25%';    rating = 'Above Average'; }
        else if (pct >= 60) { percentile = 'Top 40%';    rating = 'Average'; }
        else if (pct >= 45) { percentile = 'Top 55%';    rating = 'Below Average'; }
        else                { percentile = 'Bottom 50%'; rating = 'Needs Improvement'; }

        document.getElementById('res-score').textContent      = correct + ' / ' + total + ' (' + pct + '%)';
        document.getElementById('res-percentile').textContent = percentile;
        document.getElementById('res-tier').textContent       = rating;

        var breakdown = document.getElementById('res-by-category');
        breakdown.innerHTML = '';
        Object.keys(byCategory).forEach(function (cat) {
            var d      = byCategory[cat];
            var catPct = Math.round((d.correct / d.total) * 100);
            var avgT   = d.timedCount > 0 ? Math.round(d.totalTime / d.timedCount) : '—';
            var cls    = catPct >= 70 ? '' : catPct >= 50 ? 'mid' : 'low';
            var row    = document.createElement('div');
            row.className = 'res-cat-row';
            row.innerHTML =
                '<span class="res-cat-name">' + cat + '</span>' +
                '<span class="res-cat-score ' + cls + '">' + d.correct + ' / ' + d.total + ' (' + catPct + '%)</span>' +
                '<span class="res-cat-time">&#8987; ' + (avgT === '—' ? '—' : avgT + 's') + ' avg</span>';
            breakdown.appendChild(row);
        });

        var payload = QUESTIONS.map(function (q, i) {
            return {
                q:        i + 1,
                category: q.category,
                type:     q.type,
                timeSecs: timingAccum[i] > 0 ? Math.round(timingAccum[i] / 1000) : 0,
                answered: answers[i] !== -1 && answers[i] !== null,
                correct:  answers[i] === q.answer
            };
        });
        showScreen('screen-results');
    }

    // ─── Event listeners ───────────────────────────────────────────────────────
    startBtn.addEventListener('click', startAssessment);

    nextBtn.addEventListener('click', function () {
        if (currentIdx < QUESTIONS.length - 1) goTo(currentIdx + 1);
    });

    prevBtn.addEventListener('click', function () {
        if (currentIdx > 0) goTo(currentIdx - 1);
    });

    finishBtn.addEventListener('click', showResults);

    retryBtn.addEventListener('click', function () {
        stopGlobalTimer();
        answers       = new Array(QUESTIONS.length).fill(null);
        timingAccum   = new Array(QUESTIONS.length).fill(0);
        questionStart = null;
        currentIdx    = 0;
        globalStart   = null;
        showScreen('screen-intro');
    });

});
