import json

filepath = 'frontend/static/iq_assessment.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_questions_js = """var QUESTIONS = [
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
    }
];

QUESTIONS = QUESTIONS.slice(0, 15);
"""

# Replace the array via string split
if "var QUESTIONS = [" in content and "QUESTIONS = QUESTIONS.slice(0, 20);" in content:
    parts_before = content.split("var QUESTIONS = [", 1)
    parts_after = parts_before[1].split("QUESTIONS = QUESTIONS.slice(0, 20);", 1)
    content = parts_before[0] + new_questions_js + parts_after[1]
    print("Replaced questions array successfully.")
else:
    print("Could not find boundaries for QUESTIONS array.")

# Replace the HTML generation part
old_logic = "qVisual.innerHTML   = buildMatrix(q.matrix);\n        qVisual.style.display = 'flex';\n\n        // Build options\n        qOpts.innerHTML = '';\n        var isNum = !q.opts && q.numOpts;"
new_logic = """
        if (q.imgUrl) {
            qVisual.innerHTML = '<img src="' + q.imgUrl + '" style="max-width:100%;max-height:270px;border-radius:8px;object-fit:contain;background-color:#14223f;padding:10px;" />';
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
"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Replaced visual builder logic successfully.")
else:
    print("Could not find old_logic for qVisual.innerHTML.")

# Now replace the option building logic
old_opt_logic = """        if (isNum) {
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
        }"""

new_opt_logic = """        if (isImg) {
            qOpts.className = 'mcq-options psych-opts-row';
            q.imgOpts.forEach(function (url, i) {
                var btn = document.createElement('button');
                btn.className = 'mcq-option pattern-opt';
                var label = String.fromCharCode(65 + i);
                btn.innerHTML = '<img src="' + url + '" style="max-width:56px;max-height:56px;border-radius:6px;background:' + BG + ';" />' + '<span class="opt-label">' + label + '</span>';
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
        }"""

if old_opt_logic in content:
    content = content.replace(old_opt_logic, new_opt_logic)
    print("Replaced options builder logic successfully.")
else:
    print("Could not find old_opt_logic.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
