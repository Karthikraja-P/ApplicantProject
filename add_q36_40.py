import shutil
import os

source_dir = r"C:\Users\Admin\.gemini\antigravity\brain\df0daba2-d4e7-4c3c-8192-b5948147d42c"
target_dir = r"frontend\static\images\iq"
os.makedirs(target_dir, exist_ok=True)

files = [
    "media__1775043099731.jpg",
    "media__1775043106670.jpg",
    "media__1775043112464.jpg",
    "media__1775043118344.jpg",
    "media__1775043125361.jpg"
]

for i, f in enumerate(files):
    src = os.path.join(source_dir, f)
    dst = os.path.join(target_dir, f"q{36+i}.jpg")
    try:
        shutil.copy(src, dst)
        print(f"Copied {f} to {dst}")
    except Exception as e:
        print(f"Failed to copy {f}: {e}")

# Now patch the iq_assessment.js file
js_file = r"frontend\static\iq_assessment.js"
with open(js_file, "r", encoding="utf-8") as file:
    content = file.read()

q36_40_str = """    ,
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
];

QUESTIONS = QUESTIONS.slice(0, 40);"""

if "QUESTIONS.slice(0, 35);" in content:
    content = content.replace("];\n\nQUESTIONS = QUESTIONS.slice(0, 35);", q36_40_str)

    with open(js_file, "w", encoding="utf-8") as file:
        file.write(content)
    print("Successfully added Q36-40 and updated slice to 40.")
else:
    print("Could not find the injection point for Q36-40.")
