import shutil
import os
import re

source_dir = r"C:\Users\Admin\.gemini\antigravity\brain\df0daba2-d4e7-4c3c-8192-b5948147d42c"
target_dir = r"frontend\static\images\iq"
os.makedirs(target_dir, exist_ok=True)

files = [
    "media__1775043663871.jpg",
    "media__1775043670608.jpg",
    "media__1775043677969.jpg",
    "media__1775043684762.jpg",
    "media__1775043691796.jpg"
]

for i, f in enumerate(files):
    src = os.path.join(source_dir, f)
    dst = os.path.join(target_dir, f"q{41+i}.jpg")
    try:
        shutil.copy(src, dst)
        print(f"Copied {f} to {dst}")
    except Exception as e:
        print(f"Failed to copy {f}: {e}")

# Now patch the iq_assessment.js file
js_file = r"frontend\static\iq_assessment.js"
with open(js_file, "r", encoding="utf-8") as file:
    content = file.read()

q41_45_str = """    ,
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

QUESTIONS = QUESTIONS.slice(0, 45);"""

content = re.sub(r'\];\s*QUESTIONS = QUESTIONS\.slice\(0,\s*40\);', q41_45_str, content, flags=re.S)

with open(js_file, "w", encoding="utf-8") as file:
    file.write(content)
print("Successfully added Q41-45 and updated slice to 45.")
