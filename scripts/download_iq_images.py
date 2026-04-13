#!/usr/bin/env python3
"""
Download IQ question images directly from wwiqtest.com URLs.
No MHTML parsing needed.
"""
import re, os, json, urllib.request, time
from pathlib import Path

OUT_IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")
OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)
BASE = "/static/images/iq/wwiq"

# All 10 questions with their wwiqtest.com image URLs (extracted earlier via grep of MHTML)
QUESTIONS = [
    # Q1: Which Shape is missing? (questions_1 in wwiqtest = question at position 1)
    {
        "title": "Which Shape is missing?",
        "source": "Perceptual Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q27_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/22-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/22-b.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/22-c.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/22-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/22-e.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/22-f.png",
        },
        "answer": -1,
    },
    # Q2: Which Shape is missing? (Q6 series)
    {
        "title": "Which Shape is missing?",
        "source": "Perceptual Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2023/09/Q6_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2023/09/6-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2023/09/6-b.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2023/09/6-c.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2023/09/6-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2023/09/6-e.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2023/09/6-f.png",
        },
        "answer": -1,
    },
    # Q3: Which number is missing? (Q9 series)
    {
        "title": "Which number is missing?",
        "source": "Quantitative Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2023/09/Q9_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2023/09/4-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2023/09/4-b.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2023/09/4-c.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2023/09/4-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2023/09/4-e.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2023/09/4-f.png",
        },
        "answer": -1,
    },
    # Q4: How many triangles are in the picture?
    {
        "title": "How many triangles are in the picture?",
        "source": "Perceptual Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q7_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/6-a-1.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/6-b-1.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/6-c-1.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/6-d-1.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/6-e-1.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/6-f-1.png",
        },
        "answer": -1,
    },
    # Q5: Which Shape is missing? (Q21 series)
    {
        "title": "Which Shape is missing?",
        "source": "Spatial Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q21_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/17-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/17-f.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/17-e.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/17-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/17-c.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/17-b.png",
        },
        "answer": -1,
    },
    # Q6: Which Shape is missing? (Q15 series)
    {
        "title": "Which Shape is missing?",
        "source": "Perceptual Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q15_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/12-a-new2-1.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/12-e.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/12-d.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/12-c.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/12-b.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/12-f-new2-2.png",
        },
        "answer": -1,
    },
    # Q7: Which Shape is missing? (Q17 series)
    {
        "title": "Which Shape is missing?",
        "source": "Spatial Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2021/07/Q17_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2021/07/11.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2021/07/12.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2021/07/13.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2021/07/14.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2021/07/15.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2021/07/16.png",
        },
        "answer": -1,
    },
    # Q8: Which Shape is missing? (Q29 series)
    {
        "title": "Which Shape is missing?",
        "source": "Perceptual Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2023/09/Q29_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2023/09/7-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2023/09/7-b.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2023/09/7-c.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2023/09/7-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2023/09/7-e.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2023/09/7-f.png",
        },
        "answer": -1,
    },
    # Q9: What box was created from the image?
    {
        "title": "What box was created from the image?",
        "source": "Spatial Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q5_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/5-a.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/5-f-1.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/5-e.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/5-d.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/5-c.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/5-b.png",
        },
        "answer": -1,
    },
    # Q10: Which Shape is missing? (Q10 series)
    {
        "title": "Which Shape is missing?",
        "source": "Spatial Reasoning",
        "main": "https://wwiqtest.com/wp-content/uploads/2020/12/Q10_main.svg",
        "opts": {
            "A": "https://wwiqtest.com/wp-content/uploads/2020/12/8-f.png",
            "B": "https://wwiqtest.com/wp-content/uploads/2020/12/8-a.png",
            "C": "https://wwiqtest.com/wp-content/uploads/2020/12/8-b.png",
            "D": "https://wwiqtest.com/wp-content/uploads/2020/12/8-d-1.png",
            "E": "https://wwiqtest.com/wp-content/uploads/2020/12/8-d.png",
            "F": "https://wwiqtest.com/wp-content/uploads/2020/12/8-e.png",
        },
        "answer": -1,
    },
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://wwiqtest.com/iq-test/',
}

def download_image(url, dest):
    if dest.exists():
        print(f"  EXISTS: {dest.name}")
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        with open(dest, 'wb') as f:
            f.write(data)
        print(f"  OK: {dest.name} ({len(data)} bytes)")
        return True
    except Exception as e:
        print(f"  FAIL: {url} -> {e}")
        return False

def url_to_local(url):
    # e.g. https://wwiqtest.com/wp-content/uploads/2020/12/Q27_main.svg
    # -> 2020_12_Q27_main.svg
    name = re.sub(r'https://[^/]+/wp-content/uploads/', '', url).replace('/', '_')
    return name

def main():
    js_questions = []
    all_urls = set()
    
    # Collect all unique URLs
    for q in QUESTIONS:
        all_urls.add(q['main'])
        for u in q['opts'].values():
            all_urls.add(u)
    
    print(f"Downloading {len(all_urls)} images to {OUT_IMG_DIR}")
    
    # Download all images
    url_to_local_map = {}
    for url in sorted(all_urls):
        fname = url_to_local(url)
        dest = OUT_IMG_DIR / fname
        ok = download_image(url, dest)
        if ok:
            url_to_local_map[url] = f"{BASE}/{fname}"
        else:
            url_to_local_map[url] = url  # fallback
        time.sleep(0.1)  # small delay between requests
    
    # Build JS question objects
    for i, q in enumerate(QUESTIONS):
        main_local = url_to_local_map.get(q['main'], q['main'])
        opt_locals = [url_to_local_map.get(q['opts'][l], q['opts'][l]) 
                      for l in ['A','B','C','D','E','F'] if l in q['opts']]
        js_questions.append({
            "num": i+1,
            "title": q['title'],
            "source": q['source'],
            "imgUrl": main_local,
            "imgOpts": opt_locals,
            "answer": q['answer'],
        })
    
    # Save manifest
    with open(OUT_IMG_DIR / "manifest.json", 'w') as f:
        json.dump(js_questions, f, indent=2)
    
    print("\n=== JS SNIPPET ===")
    for q in js_questions:
        opts_js = ",\n                ".join(f"'{o}'" for o in q['imgOpts'])
        print(f"""        {{
            title: '{q['title']}',
            source: '{q['source']}',
            imgUrl: '{q['imgUrl']}',
            imgOpts: [
                {opts_js}
            ],
            answer: {q['answer']}, time: 90, exp: 'Pattern completed according to visual logic.'
        }},""")

if __name__ == "__main__":
    main()
