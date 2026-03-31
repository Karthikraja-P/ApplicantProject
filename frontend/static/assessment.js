document.addEventListener('DOMContentLoaded', function () {

    // ─── Question Bank (39 questions across 6 categories) ──────────────────────
    // Original 19 from IQTestAcademy + 20 new questions under the same topics
    var QUESTIONS = [

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 1 — VERBAL  (6 questions: 3 original + 3 new)
        // ══════════════════════════════════════════════════════════════════════

        // V1 — Original
        {
            category: 'Verbal', type: 'Classification',
            title: 'Which one does NOT belong with the others?\n\nA. Dog   B. Mouse   C. Lion   D. Snake   E. Elephant',
            options: ['A. Dog', 'B. Mouse', 'C. Lion', 'D. Snake', 'E. Elephant'],
            answer: 3,
            exp: 'Snake is the only reptile; the others (Dog, Mouse, Lion, Elephant) are all mammals.',
            time: 15
        },

        // V2 — Original
        {
            category: 'Verbal', type: 'Analogy',
            title: 'Finger is to Hand   as   Leaf is to ___',
            options: ['A. Tree', 'B. Flower', 'C. Branch', 'D. Root'],
            answer: 2,
            exp: 'A finger is a part of a hand. A leaf is a part of a branch — the direct structural parent.',
            time: 15
        },

        // V3 — Original
        {
            category: 'Verbal', type: 'Syllogism',
            title: 'All architects are engineers.\nNo engineers are drone pilots.\n\nWhich conclusion necessarily follows?\n\nA. No architects are drone pilots.\nB. Some architects are drone pilots.\nC. All engineers are architects.\nD. Some drone pilots are engineers.',
            options: ['A. No architects are drone pilots.', 'B. Some architects are drone pilots.', 'C. All engineers are architects.', 'D. Some drone pilots are engineers.'],
            answer: 0,
            exp: 'Since all architects are engineers, and no engineers are drone pilots, it follows that no architects can be drone pilots.',
            time: 15
        },

        // V4 — New
        {
            category: 'Verbal', type: 'Classification',
            title: 'Which one does NOT belong with the others?\n\nA. Mars   B. Earth   C. Moon   D. Jupiter   E. Venus',
            options: ['A. Mars', 'B. Earth', 'C. Moon', 'D. Jupiter', 'E. Venus'],
            answer: 2,
            exp: 'The Moon is a natural satellite, not a planet. Mars, Earth, Jupiter and Venus are all planets in our solar system.',
            time: 15
        },

        // V5 — New
        {
            category: 'Verbal', type: 'Analogy',
            title: 'Book is to Author   as   Painting is to ___',
            options: ['A. Gallery', 'B. Canvas', 'C. Artist', 'D. Museum'],
            answer: 2,
            exp: 'An author creates a book. An artist creates a painting — both are the creators of their respective works.',
            time: 15
        },

        // V6 — New
        {
            category: 'Verbal', type: 'Syllogism',
            title: 'All birds have wings.\nPenguins are birds.\n\nWhich conclusion necessarily follows?\n\nA. Penguins can fly.\nB. Penguins have wings.\nC. All winged animals are birds.\nD. Penguins have no wings.',
            options: ['A. Penguins can fly.', 'B. Penguins have wings.', 'C. All winged animals are birds.', 'D. Penguins have no wings.'],
            answer: 1,
            exp: 'If all birds have wings and penguins are birds, then penguins must have wings. Whether they can fly is a separate matter not established by the premises.',
            time: 15
        },

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 2 — NUMERICAL  (6 questions: 3 original + 3 new)
        // ══════════════════════════════════════════════════════════════════════

        // N1 — Original
        {
            category: 'Numerical', type: 'Number Series (Fibonacci)',
            title: 'What is the next number in the series?\n\n1  1  2  3  5  8  13  __',
            options: ['A. 18', 'B. 20', 'C. 21', 'D. 26'],
            answer: 2,
            exp: 'This is the Fibonacci sequence — each term is the sum of the two preceding terms. 8 + 13 = 21.',
            time: 15
        },

        // N2 — Original
        {
            category: 'Numerical', type: 'Word Problem (Age)',
            title: 'Mary is 16 years old. She is 4 times older than her brother.\nHow old will Mary be when she is twice as old as her brother?',
            options: ['A. 32', 'B. 24', 'C. 8', 'D. 20'],
            answer: 1,
            exp: "Mary is 16, brother is 4. Let x = years elapsed. (16+x) = 2×(4+x) → 16+x = 8+2x → x = 8. Mary will be 16+8 = 24.",
            time: 15
        },

        // N3 — Original
        {
            category: 'Numerical', type: 'Number Series (Cubes)',
            title: 'What is the missing number?\n\n1  8  27  __  125  216',
            options: ['A. 36', 'B. 48', 'C. 56', 'D. 64'],
            answer: 3,
            exp: 'Each term is a perfect cube: 1³=1, 2³=8, 3³=27, 4³=64, 5³=125, 6³=216.',
            time: 15
        },

        // N4 — New
        {
            category: 'Numerical', type: 'Number Series (Differences)',
            title: 'What is the next number in the series?\n\n2  6  12  20  30  __',
            options: ['A. 40', 'B. 42', 'C. 44', 'D. 36'],
            answer: 1,
            exp: 'Differences between terms: 4, 6, 8, 10, 12 — increasing by 2 each time. 30 + 12 = 42.',
            time: 15
        },

        // N5 — New
        {
            category: 'Numerical', type: 'Word Problem (Distance)',
            title: 'A train travels at 60 km/h. How far will it travel in 2.5 hours?',
            options: ['A. 120 km', 'B. 150 km', 'C. 130 km', 'D. 160 km'],
            answer: 1,
            exp: 'Distance = Speed × Time = 60 × 2.5 = 150 km.',
            time: 15
        },

        // N6 — New
        {
            category: 'Numerical', type: 'Number Series (Geometric)',
            title: 'What is the next number in the series?\n\n3  9  27  81  __',
            options: ['A. 162', 'B. 192', 'C. 243', 'D. 324'],
            answer: 2,
            exp: 'Each term is multiplied by 3. 81 × 3 = 243.',
            time: 15
        },

        // N7 — New (40th question)
        {
            category: 'Numerical', type: 'Number Series (Even Squares)',
            title: 'What is the missing number in the series?\n\n4  16  36  64  __',
            options: ['A. 81', 'B. 96', 'C. 100', 'D. 144'],
            answer: 2,
            exp: 'The series is squares of even numbers: 2²=4, 4²=16, 6²=36, 8²=64, 10²=100.',
            time: 15
        },

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 3 — VISUAL / MATRIX  (8 questions: 4 original + 4 new)
        // ══════════════════════════════════════════════════════════════════════

        // M1 — Original (Shape Pattern Matrix — described textually)
        {
            category: 'Visual / Matrix', type: 'Shape Pattern Matrix',
            title: 'A 3×3 grid shows shapes with increasing fill:\n\nRow 1: □ (outline)   ○ (outline)   ⬠ (outline)\nRow 2: □ (half)      ○ (half)      ⬠ (half)\nRow 3: □ (filled)    ○ (filled)    ?',
            options: ['A. Filled Pentagon', 'B. Outline Pentagon', 'C. Filled Square', 'D. Outline Circle'],
            answer: 0,
            exp: 'Each row uses the same fill style; each column uses the same shape. Row 3 = filled, Column 3 = pentagon → Filled Pentagon.',
            time: 15
        },

        // M2 — Original (Number Matrix Row Sum)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Row Sum)',
            title: 'Find the missing number:\n\n   4   3   7\n   3   6   9\n   2   9   ?',
            grid: [['4','3','7'],['3','6','9'],['2','9','?']],
            options: ['A. 9', 'B. 7', 'C. 11', 'D. 6'],
            answer: 2,
            exp: 'Each row: Col1 + Col2 = Col3. 4+3=7 ✓, 3+6=9 ✓, 2+9=11.',
            time: 15
        },

        // M3 — Original (Number Matrix Row Product)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Row Product)',
            title: 'Find the missing number:\n\n   5   3   15\n   3   3    9\n   4   2    ?',
            grid: [['5','3','15'],['3','3','9'],['4','2','?']],
            options: ['A. 6', 'B. 12', 'C. 2', 'D. 8'],
            answer: 3,
            exp: 'Each row: Col1 × Col2 = Col3. 5×3=15 ✓, 3×3=9 ✓, 4×2=8.',
            time: 15
        },

        // M4 — Original (Number Matrix Decreasing Differences)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Decreasing Differences)',
            title: 'Find the missing number:\n\n  43  42  40\n  37  33  28\n  22  15   ?',
            grid: [['43','42','40'],['37','33','28'],['22','15','?']],
            options: ['A. 14', 'B. 7', 'C. 0', 'D. 21'],
            answer: 1,
            exp: 'Column differences: Col1→Col2 differences are 1, 4, 7 (+3 each); Col2→Col3 differences are 2, 5, 8 (+3 each). 15 − 8 = 7.',
            time: 15
        },

        // M5 — New (Row Difference)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Row Difference)',
            title: 'Find the missing number:\n\n   7   3   4\n   9   5   4\n   8   2   ?',
            grid: [['7','3','4'],['9','5','4'],['8','2','?']],
            options: ['A. 4', 'B. 6', 'C. 5', 'D. 3'],
            answer: 1,
            exp: 'Each row: Col1 − Col2 = Col3. 7−3=4 ✓, 9−5=4 ✓, 8−2=6.',
            time: 15
        },

        // M6 — New (Row Average)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Row Average)',
            title: 'Find the missing number:\n\n   2   6   4\n   4   8   6\n   3   9   ?',
            grid: [['2','6','4'],['4','8','6'],['3','9','?']],
            options: ['A. 5', 'B. 6', 'C. 7', 'D. 8'],
            answer: 1,
            exp: 'Col3 is the average of Col1 and Col2. (2+6)/2=4 ✓, (4+8)/2=6 ✓, (3+9)/2=6.',
            time: 15
        },

        // M7 — New (Sequential matrix)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Sequence)',
            title: 'Find the missing number:\n\n   1   2   3\n   4   5   6\n   7   8   ?',
            grid: [['1','2','3'],['4','5','6'],['7','8','?']],
            options: ['A. 9', 'B. 10', 'C. 8', 'D. 12'],
            answer: 0,
            exp: 'Numbers fill the grid sequentially left-to-right, top-to-bottom: 1 through 9.',
            time: 15
        },

        // M8 — New (n, n², n³ pattern)
        {
            category: 'Visual / Matrix', type: 'Number Matrix (Powers)',
            title: 'Find the missing number:\n\n   2    4    8\n   3    9   27\n   4   16    ?',
            grid: [['2','4','8'],['3','9','27'],['4','16','?']],
            options: ['A. 32', 'B. 48', 'C. 64', 'D. 36'],
            answer: 2,
            exp: 'Each row follows n, n², n³. Row 3: 4, 4²=16, 4³=64.',
            time: 15
        },

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 4 — COGNITIVE  (6 questions: 3 original + 3 new)
        // ══════════════════════════════════════════════════════════════════════

        // C1 — Original (Stroop)
        {
            category: 'Cognitive', type: 'Stroop Test (Attention / Cognitive Control)',
            title: 'The word GREEN is printed in red ink.\n\nWhat COLOUR is the ink?\n(Do not read the word — focus on the ink colour.)',
            options: ['A. Green', 'B. Red', 'C. Blue', 'D. Yellow'],
            answer: 1,
            exp: 'The ink colour is Red. The Stroop effect makes it tempting to say "Green" (the word) instead of the actual ink colour.',
            time: 15
        },

        // C2 — Original (Flanker)
        {
            category: 'Cognitive', type: 'Flanker Task (Attention / Inhibition)',
            title: 'Look at this row of arrows:\n\n  ←  ←  →  ←  ←\n\nWhich direction does the CENTRE arrow point?',
            options: ['A. Left', 'B. Right', 'C. Up', 'D. Down'],
            answer: 1,
            exp: 'The centre (3rd) arrow points Right →. The surrounding arrows pointing left are distractors.',
            time: 15
        },

        // C3 — Original (Working Memory)
        {
            category: 'Cognitive', type: 'Working Memory',
            title: 'A sequence was shown for 3 seconds:\n\n  7  3  9  1  5\n\nWhich number was NOT in the sequence?',
            options: ['A. 7', 'B. 4', 'C. 9', 'D. 5'],
            answer: 1,
            exp: 'The sequence was 7, 3, 9, 1, 5. The number 4 does not appear in the sequence.',
            time: 15
        },

        // C4 — New (Stroop)
        {
            category: 'Cognitive', type: 'Stroop Test (Attention / Cognitive Control)',
            title: 'The word BLUE is printed in yellow ink.\n\nWhat COLOUR is the ink?\n(Do not read the word — focus on the ink colour.)',
            options: ['A. Blue', 'B. Yellow', 'C. Green', 'D. Red'],
            answer: 1,
            exp: 'The ink colour is Yellow. The word "BLUE" creates interference — focus on the physical colour of the text, not what it says.',
            time: 15
        },

        // C5 — New (Flanker)
        {
            category: 'Cognitive', type: 'Flanker Task (Attention / Inhibition)',
            title: 'Look at this row of arrows:\n\n  →  →  ←  →  →\n\nWhich direction does the CENTRE arrow point?',
            options: ['A. Right', 'B. Left', 'C. Up', 'D. Down'],
            answer: 1,
            exp: 'The centre (3rd) arrow points Left ←. The surrounding arrows pointing right are distractors.',
            time: 15
        },

        // C6 — New (Working Memory)
        {
            category: 'Cognitive', type: 'Working Memory',
            title: 'A list was displayed for 3 seconds:\n\n  4  8  2  6  3  1\n\nWhich number was NOT in the list?',
            options: ['A. 3', 'B. 7', 'C. 6', 'D. 4'],
            answer: 1,
            exp: 'The list was 4, 8, 2, 6, 3, 1. The number 7 does not appear in the list.',
            time: 15
        },

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 5 — BEHAVIOURAL / SITUATIONAL  (6 questions: 3 original + 3 new)
        // ══════════════════════════════════════════════════════════════════════

        // B1 — Original
        {
            category: 'Behavioural', type: 'Team Collaboration',
            title: 'Your team is behind schedule and a key member is visibly struggling with their workload. What is the most effective response?',
            options: [
                'A. Reassign their tasks to others immediately without discussion.',
                'B. Have a private conversation to understand the issue and offer support.',
                'C. Escalate to management right away.',
                'D. Wait and monitor — they will likely catch up on their own.'
            ],
            answer: 1,
            exp: 'A private conversation respects the colleague\'s dignity, identifies the root cause, and enables targeted support — the most collaborative and effective approach.',
            time: 15
        },

        // B2 — Original
        {
            category: 'Behavioural', type: 'Prioritisation Under Pressure',
            title: 'You are mid-sprint and a critical production bug is reported. You also have a feature deadline today. What do you do?',
            options: [
                'A. Ignore the bug report and meet the feature deadline first.',
                'B. Fix the bug immediately without telling anyone.',
                'C. Triage the bug, notify stakeholders, and negotiate the feature deadline.',
                'D. Hand the bug to whoever reported it and continue your work.'
            ],
            answer: 2,
            exp: 'Triaging first ensures you understand severity; notifying stakeholders keeps everyone informed; negotiating the deadline is transparent and professional.',
            time: 15
        },

        // B3 — Original
        {
            category: 'Behavioural', type: 'Growth Mindset / Feedback',
            title: 'After a project retrospective, your approach is criticised by two teammates. How do you respond?',
            options: [
                'A. Defend your decisions — you had valid reasons for each one.',
                'B. Agree publicly but ignore the feedback privately.',
                'C. Listen carefully, ask clarifying questions, and incorporate useful feedback.',
                'D. Avoid the teammates in future projects to prevent conflict.'
            ],
            answer: 2,
            exp: 'Listening openly, seeking to understand, and applying useful feedback demonstrates professional maturity and a genuine growth mindset.',
            time: 15
        },

        // B4 — New
        {
            category: 'Behavioural', type: 'Integrity / Error Handling',
            title: 'You discover a colleague has made a significant mistake that will affect the entire team\'s delivery. What do you do?',
            options: [
                'A. Quietly fix it yourself without telling anyone.',
                'B. Inform the team lead and the colleague, and propose a fix together.',
                'C. Tell other teammates about the colleague\'s mistake.',
                'D. Ignore it and hope it resolves itself before the deadline.'
            ],
            answer: 1,
            exp: 'Informing the relevant people and proposing a collaborative fix addresses the problem transparently and maintains team trust without blame.',
            time: 15
        },

        // B5 — New
        {
            category: 'Behavioural', type: 'Adaptability / Remote Work',
            title: 'You are working remotely and your internet drops during an important client call. What do you do?',
            options: [
                'A. Reconnect as soon as possible, inform the team, and request a recap of missed points.',
                'B. Ignore it — the meeting will continue without you.',
                'C. Send a frustrated message blaming your internet provider.',
                'D. Wait for someone to call you without taking any initiative.'
            ],
            answer: 0,
            exp: 'Reconnecting promptly, communicating proactively, and catching up on missed content demonstrates professionalism and accountability in a remote setting.',
            time: 15
        },

        // B6 — New
        {
            category: 'Behavioural', type: 'Conflict Resolution',
            title: 'A colleague presents your idea in a meeting as their own, without crediting you. How do you respond?',
            options: [
                'A. Angrily confront them in front of the entire team immediately.',
                'B. Say nothing and assume it was an honest mistake.',
                'C. Speak to the colleague privately afterwards to clarify ownership and set expectations.',
                'D. Stop sharing ideas with the team to protect yourself in future.'
            ],
            answer: 2,
            exp: 'A private conversation addresses the issue directly and professionally, gives the colleague a chance to explain, and avoids creating unnecessary public conflict.',
            time: 15
        },

        // ══════════════════════════════════════════════════════════════════════
        //  CATEGORY 6 — LOGICAL / ECOSYSTEM  (7 questions: 3 original + 4 new)
        // ══════════════════════════════════════════════════════════════════════

        // L1 — Original
        {
            category: 'Logical / Ecosystem', type: 'Food Chain Cascade',
            title: 'In a food chain:  Grass → Rabbit → Fox\n\nAll Rabbits are suddenly removed. What is the most likely outcome?',
            options: [
                'A. Fox population increases; Grass decreases.',
                'B. Fox population decreases; Grass increases.',
                'C. Fox population increases; Grass increases.',
                'D. No change in either Fox or Grass populations.'
            ],
            answer: 1,
            exp: 'Without Rabbits, Foxes lose their food source and decline. Without Rabbits grazing, Grass is no longer consumed and expands.',
            time: 15
        },

        // L2 — Original
        {
            category: 'Logical / Ecosystem', type: 'Constraint Logic (Species Extinction)',
            title: '4 predators share 2 prey species:\n\n  Species A eats X only\n  Species B eats Y only\n  Species C eats both X and Y\n  Species D eats both X and Y\n\nIf Species X goes extinct, which predators survive?',
            options: [
                'A. A, B, C and D all survive.',
                'B. B, C and D survive; A goes extinct.',
                'C. Only B survives.',
                'D. None survive.'
            ],
            answer: 1,
            exp: 'Species A depends solely on X, so it goes extinct. B (eats Y), C and D (eat both — switch entirely to Y) can all survive on Species Y alone.',
            time: 15
        },

        // L3 — Original
        {
            category: 'Logical / Ecosystem', type: 'Ecosystem Building (Sustainable Chain)',
            title: 'Form a valid 3-species food chain from:\nEagle, Trout, Mayfly, Deer\n\n  Eagle eats Trout and Deer\n  Trout eats Mayfly\n  Deer eats Grass (external)\n  Mayfly eats Algae (external)\n\nWhich trio forms a complete valid chain?',
            options: [
                'A. Eagle → Deer → Mayfly',
                'B. Eagle → Trout → Mayfly',
                'C. Deer → Eagle → Trout',
                'D. Eagle → Deer → Trout'
            ],
            answer: 1,
            exp: 'Eagle eats Trout; Trout eats Mayfly; Mayfly eats Algae. This forms a complete, valid 3-link chain with each predator directly eating the next.',
            time: 15
        },

        // L4 — New
        {
            category: 'Logical / Ecosystem', type: 'Food Chain Cascade (Pollution)',
            title: 'In a marine chain:  Algae → Small Fish → Shark\n\nHeavy pollution kills most Algae. What is the most likely outcome?',
            options: [
                'A. Shark population increases; Small Fish increase.',
                'B. Shark population decreases; Small Fish decrease.',
                'C. Shark population increases; Small Fish decrease.',
                'D. No change — Sharks do not eat Algae directly.'
            ],
            answer: 1,
            exp: 'Loss of Algae means Small Fish lose their food source and decline. With fewer Small Fish, Sharks also decline — the cascade moves up the chain.',
            time: 15
        },

        // L5 — New
        {
            category: 'Logical / Ecosystem', type: 'Cascade Logic (Producer Boost)',
            title: 'In a pond ecosystem:\n\n  Species A eats only Algae\n  Species B eats only Species A\n  Species C eats Species A and Species B\n\nIf Algae doubles in quantity, which species benefits MOST DIRECTLY first?',
            options: [
                'A. Species B only.',
                'B. Species C only.',
                'C. Species A first, then B and C benefit as a cascade.',
                'D. All three benefit equally and simultaneously.'
            ],
            answer: 2,
            exp: 'Species A feeds directly on Algae, so it benefits immediately. As A grows, B (which eats A) benefits next, and finally C (which eats both) benefits last in the cascade.',
            time: 15
        },

        // L6 — New
        {
            category: 'Logical / Ecosystem', type: 'Predator Removal',
            title: 'A forest has:  Trees → Deer → Wolves\n\nRangers remove all Wolves from the forest. What is the most likely long-term outcome?',
            options: [
                'A. Deer increase, overgraze, and Trees decrease.',
                'B. Deer decrease; Trees increase.',
                'C. Deer and Trees both increase equally.',
                'D. No change — Wolves were not eating Trees.'
            ],
            answer: 0,
            exp: 'Without Wolves, Deer populations grow unchecked. With more Deer eating vegetation, Trees and plants are overgrazed, leading to habitat degradation.',
            time: 15
        },

        // L7 — New
        {
            category: 'Logical / Ecosystem', type: 'Food Chain Validity',
            title: 'Which of the following forms a valid food chain?\n(Energy must flow from producer to consumer.)',
            options: [
                'A. Fox → Rabbit → Grass',
                'B. Grass → Rabbit → Fox',
                'C. Fox → Grass → Rabbit',
                'D. Rabbit → Fox → Grass'
            ],
            answer: 1,
            exp: 'A valid food chain goes: Producer → Primary Consumer → Secondary Consumer. Grass (producer) → Rabbit (herbivore) → Fox (carnivore) is the only correct order.',
            time: 15
        }
    ];

    // ─── State ─────────────────────────────────────────────────────────────────
    var TOTAL_SECONDS = 10 * 60; // 10 minutes
    var answers       = new Array(QUESTIONS.length).fill(null);
    var timingAccum   = new Array(QUESTIONS.length).fill(0); // total ms accumulated per question across ALL visits
    var questionStart = null; // timestamp of when the current question view began (null if not timing)
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

    // ─── Global countdown (MM:SS, single timer for all 40 questions) ───────────
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

        // Animate bar over full duration
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
                // Flush the current question's in-progress time before marking expired
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

    // Pause accumulation for the current question (called on leave)
    function pauseQuestionTimer() {
        if (questionStart !== null) {
            timingAccum[currentIdx] += Date.now() - questionStart;
            questionStart = null;
        }
    }

    // Resume accumulation for idx (called on enter, only if still unanswered)
    function resumeQuestionTimer(idx) {
        if (answers[idx] === null) {
            questionStart = Date.now();
        } else {
            questionStart = null;
        }
    }

    // ─── Grid builder for matrix questions ─────────────────────────────────────
    function buildGrid(gridData) {
        var html = '<table class="q-grid-table"><tbody>';
        for (var r = 0; r < gridData.length; r++) {
            html += '<tr>';
            for (var c = 0; c < gridData[r].length; c++) {
                var val = gridData[r][c];
                var cls = (val === '?') ? 'missing' : '';
                html += '<td class="' + cls + '">' + val + '</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
    }

    // ─── Render ────────────────────────────────────────────────────────────────
    function renderQuestion(idx) {
        var q       = QUESTIONS[idx];
        var qNum    = document.getElementById('q-num');
        var qTitle  = document.getElementById('q-title');
        var qGrid   = document.getElementById('q-grid');
        var qOpts   = document.getElementById('q-options');
        var qExp    = document.getElementById('q-explanation');
        var badge   = document.getElementById('q-cat-badge');

        qNum.textContent   = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
        // For grid questions show only the prompt line — the grid itself is rendered visually below
        qTitle.textContent = q.grid ? q.title.split('\n')[0] : q.title;
        qExp.className     = 'mcq-explanation';
        qExp.textContent   = '';

        badge.textContent = q.category + ' · ' + q.type;

        // Grid
        if (q.grid) {
            qGrid.innerHTML = buildGrid(q.grid);
            qGrid.style.display = 'block';
        } else {
            qGrid.innerHTML = '';
            qGrid.style.display = 'none';
        }

        // Options — horizontal row for grid questions, vertical otherwise
        qOpts.innerHTML = '';
        qOpts.className = q.grid ? 'mcq-options mcq-options-row' : 'mcq-options';
        q.options.forEach(function (opt, i) {
            var btn = document.createElement('button');
            btn.className = 'mcq-option';
            btn.textContent = opt;
            btn.addEventListener('click', (function (ci) {
                return function () { selectAnswer(ci); };
            })(i));
            qOpts.appendChild(btn);
        });

        // Navigation
        prevBtn.style.display = idx > 0 ? 'inline-flex' : 'none';
        nextBtn.style.display = idx < QUESTIONS.length - 1 ? 'inline-flex' : 'none';
        finishBtn.style.display = idx === QUESTIONS.length - 1 ? 'inline-flex' : 'none';

        // Restore prior answer state (timer keeps running globally)
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
        pauseQuestionTimer(); // flush this visit's time into timingAccum
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
        pauseQuestionTimer(); // stop accumulating time for the question we're leaving
        currentIdx = idx;
        renderQuestion(idx); // resumeQuestionTimer is called inside renderQuestion
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
                '<span class="res-cat-time">⏱ ' + (avgT === '—' ? '—' : avgT + 's') + ' avg</span>';
            breakdown.appendChild(row);
        });

        // POST timing data to backend
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
        fetch('/assessment/submit', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ timingLog: payload })
        }).catch(function () {}); // silent fail — results still display

        showScreen('screen-results');
    }

    // ─── Event listeners ───────────────────────────────────────────────────────
    startBtn.addEventListener('click', function () {
        showScreen('screen-question');
        renderQuestion(0);
        startGlobalTimer();
    });

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
