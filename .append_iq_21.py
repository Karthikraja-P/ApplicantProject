import os

target = "frontend/static/iq_assessment.js"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

new_q = """    ,
    {
        title: 'Choose the number that is 1/4 of 1/2 of 1/5 of 200:',
        source: 'Quantitative Reasoning',
        opts: ['2', '5', '10', '25', '50'],
        answer: 1, time: 90, exp: '1/5 of 200 is 40. 1/2 of 40 is 20. 1/4 of 20 is 5. Therefore the correct answer is 5.'
    },
    {
        title: 'Which larger shape would be made if the two sections are fitted together?',
        source: 'Perceptual Reasoning',
        customHtml: '<div style="display:flex;gap:12px;align-items:flex-end;justify-content:center;margin-top:20px;">' +
            '<div style="display:grid;grid-template-columns:30px 30px;grid-template-rows:30px 30px;border:1px solid #777;background:#fff;">' +
            '<div style="background:#000044;border:1px solid #777;"></div><div style="background:#00a244;border:1px solid #777;"></div>' +
            '<div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div></div>' +
            '<div style="display:grid;grid-template-columns:30px 30px 30px;grid-template-rows:30px 30px 30px;border:1px solid #777;background:#fff;">' +
            '<div style="background:#00a244;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div>' +
            '<div style="background:#000044;border:1px solid #777;"></div><div style="background:#fff;grid-column:2/span 2;grid-row:2/span 2;border:1px solid #777;"></div></div>' +
            '</div>',
        customOptsHtml: [
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#000044;border:1px solid #777;"></div><div style="background:#00a244;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="grid-column:1/span 3;background:#fff;border:1px solid #777;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#000044;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00a244;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="grid-column:1/span 3;background:#fff;border:1px solid #777;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="background:#00a244;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="grid-column:1/span 3;background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#00a244;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div></div>',
            '<div style="display:grid;grid-template-columns:18px 18px 18px;grid-template-rows:18px 18px 18px;border:1px solid #777;background:#fff;"><div style="grid-column:1/span 3;background:#fff;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="background:#00a244;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div><div style="background:#000044;border:1px solid #777;"></div><div style="background:#fff;border:1px solid #777;"></div></div>'
        ],
        answer: 0, time: 90, exp: 'The pieces combine and rotate to fit.'
    },
    {
        title: 'If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are definitely Lazzies.',
        source: 'Fluid Reasoning',
        opts: ['True', 'False'],
        answer: 0, time: 90, exp: 'Because Bloops are a subset of Razzies, and Razzies are a subset of Lazzies, Bloops are necessarily Lazzies.'
    },
    {
        title: 'John needs 13 bottles of water from the store. John can only carry 3 at a time. What\\'s the minimum number of trips John needs to make to the store?',
        source: 'Quantitative Reasoning',
        opts: ['3', '4', '4 1/2', '5', '6'],
        answer: 3, time: 90, exp: '13 divided by 3 is 4 with a remainder of 1. So 4 trips is not enough; he needs a 5th trip to get the last bottle.'
    },
    {
        title: 'Which one of the numbers does not belong in the following series?\\n\\n1 - 2 - 5 - 10 - 13 - 26 - 29 - 48',
        source: 'Fluid Reasoning',
        opts: ['1', '5', '26', '29', '48'],
        answer: 4, time: 90, exp: 'The sequence alternates between *2 and +3. 29 * 2 = 58. Since 48 breaks this pattern, 48 does not belong.'
    }
];"""

# Replace the end array tag to inject
content = content.replace("];\n\nQUESTIONS = QUESTIONS.slice(0, 20);", new_q + "\n\nQUESTIONS = QUESTIONS.slice(0, 25);")

with open(target, "w", encoding="utf-8") as f:
    f.write(content)
