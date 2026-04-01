import json

filepath = 'frontend/static/iq_assessment.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_q = """    },
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

QUESTIONS = QUESTIONS.slice(0, 20);"""

content = content.replace("    }\n];\n\nQUESTIONS = QUESTIONS.slice(0, 15);", new_q)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully!")
