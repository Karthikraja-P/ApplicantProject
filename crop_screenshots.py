#!/usr/bin/env python3
"""
Crop question + option images from full-page screenshots.
Saves PNGs and updates scraped_questions_raw.json with correct paths + answers.
"""
import json
from pathlib import Path
from PIL import Image

IMG_DIR  = Path("frontend/static/images/iq_scraped")
RAW_JSON = Path("scraped_questions_raw.json")

# Crop boxes (left, top, right, bottom) at 1280x900
MAIN_BOX  = (293, 178, 635, 525)
OPT_BOXES = [
    (660, 228, 783, 345),   # A
    (833, 228, 948, 345),   # B
    (660, 375, 783, 498),   # C
    (833, 375, 948, 498),   # D
]
OPT_LABELS = list("abcd")

# Correct answers from agent analysis (0=A, 1=B, 2=C, 3=D)
# q01 skipped (loading screen) - answer determined separately
ANSWERS = {
    "q02": 3,  # D
    "q03": 2,  # C
    "q04": 2,  # C
    "q05": 3,  # D
    "q06": 3,  # D
    "q07": 0,  # A
    "q08": 1,  # B
    "q09": 2,  # C
    "q10": 3,  # D
    "q11": 2,  # C
    "q12": 3,  # D
    "q13": 0,  # A
    "q14": 2,  # C
    "q15": 1,  # B
    "q16": 0,  # A
    "q17": 3,  # D
    "q18": 2,  # C
    "q19": 2,  # C
    "q20": 3,  # D
}

def crop_question(n: int) -> dict | None:
    """Crop main + options from screenshot n. Returns updated paths dict or None if no screenshot."""
    ss_path = IMG_DIR / f"_q{n:02d}_screen.png"
    if not ss_path.exists():
        print(f"  [skip] no screenshot for q{n:02d}")
        return None

    img = Image.open(ss_path)
    w, h = img.size
    if w < 900 or h < 600:
        print(f"  [skip] q{n:02d} screenshot too small ({w}x{h}) — likely loading screen")
        return None

    # Check if it's a loading screen (very few dark pixels in the card area)
    card_crop = img.crop((285, 125, 985, 535))
    # Simple check: if no question number visible, skip
    # Better check: look for the question pattern in the left panel
    left_panel = img.crop(MAIN_BOX)
    pixels = list(left_panel.getdata())
    # Count non-white pixels (actual content)
    non_white = sum(1 for r, g, b, *a in [p if len(p) >= 3 else (p, p, p) for p in
                    [px if isinstance(px, tuple) else (px,) for px in pixels]]
                    if r < 240 or g < 240 or b < 240)
    # If very few non-white pixels, it's blank/loading
    total = len(pixels)

    # Simpler: just check the mode
    if img.mode == 'RGBA':
        arr = left_panel.convert('RGB')
    else:
        arr = left_panel
    import statistics
    sample = list(arr.getdata())
    dark_count = sum(1 for r, g, b in sample if r < 200 or g < 200 or b < 200)
    if dark_count < 50:
        print(f"  [skip] q{n:02d} appears blank/loading")
        return None

    qid = f"q{n:02d}"
    result = {}

    # Save main
    main_fname = f"{qid}_main.png"
    left_panel.save(IMG_DIR / main_fname)
    result["imgUrl"] = f"/static/images/iq_scraped/{main_fname}"

    # Save options
    opt_paths = []
    for i, box in enumerate(OPT_BOXES):
        opt_crop = img.crop(box)
        opt_fname = f"{qid}_opt_{OPT_LABELS[i]}.png"
        opt_crop.save(IMG_DIR / opt_fname)
        opt_paths.append(f"/static/images/iq_scraped/{opt_fname}")

    result["imgOpts"] = opt_paths
    print(f"  [done] q{n:02d} — main + {len(opt_paths)} opts")
    return result


def main():
    qs = json.loads(RAW_JSON.read_text(encoding="utf-8"))

    for q in qs:
        n = int(q["id"][1:])
        print(f"Processing q{n:02d}...")

        if n == 1:
            # Q1 has no valid screenshot — keep existing SVGs, just set answer
            q["answer"] = ANSWERS.get(q["id"], None)
            # Q1 answer was not in the agent analysis — mark as needs review
            if q["answer"] is None:
                print(f"  [warn] q01 answer unknown — keeping null")
            continue

        result = crop_question(n)
        if result:
            q["imgUrl"]  = result["imgUrl"]
            q["imgOpts"] = result["imgOpts"]

        if q["id"] in ANSWERS:
            q["answer"] = ANSWERS[q["id"]]

    RAW_JSON.write_text(json.dumps(qs, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nUpdated {RAW_JSON}")


if __name__ == "__main__":
    main()
