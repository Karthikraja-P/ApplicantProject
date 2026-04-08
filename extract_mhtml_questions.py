#!/usr/bin/env python3
"""
Extract IQ questions and images from MHTML files.
Images are embedded in MHTML; we extract them to frontend/static/images/iq/wwiq/
"""
import re, quopri, os, base64, json
from pathlib import Path
from urllib.parse import urlparse

MHTML_DIR = Path("/home/pkr/ApplicantProject/new questions")
OUT_IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")
OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)

BASE = "/static/images/iq/wwiq"  # web path prefix

def url_to_local_name(url):
    """Convert image URL to a safe local filename."""
    path = urlparse(url).path  # e.g. /wp-content/uploads/2020/12/Q27_main.svg
    return path.replace("/wp-content/uploads/", "").replace("/", "_")  # e.g. 2020_12_Q27_main.svg

def parse_mhtml(filepath):
    """Parse MHTML file, return (html_text, {url: bytes}) mapping."""
    with open(filepath, "rb") as f:
        raw = f.read()

    # Find boundary
    boundary_m = re.search(rb'boundary="(.*?)"', raw)
    if not boundary_m:
        raise ValueError("No boundary found")
    boundary = b"--" + boundary_m.group(1)

    parts = raw.split(boundary)
    html_text = None
    url_to_data = {}

    for part in parts:
        if not part.strip() or part.strip() == b"--":
            continue

        # Split headers from body
        sep = part.find(b"\r\n\r\n")
        if sep == -1:
            continue
        headers_raw = part[:sep]
        body = part[sep+4:]

        # Parse headers
        content_type = ""
        content_location = ""
        content_transfer_encoding = ""
        content_id = ""

        for line in headers_raw.split(b"\r\n"):
            line = line.decode("utf-8", errors="ignore").strip()
            if line.lower().startswith("content-type:"):
                content_type = line.split(":", 1)[1].strip().split(";")[0].strip()
            elif line.lower().startswith("content-location:"):
                content_location = line.split(":", 1)[1].strip()
            elif line.lower().startswith("content-transfer-encoding:"):
                content_transfer_encoding = line.split(":", 1)[1].strip().lower()
            elif line.lower().startswith("content-id:"):
                content_id = line.split(":", 1)[1].strip()

        if content_type == "text/html":
            if content_transfer_encoding == "quoted-printable":
                html_text = quopri.decodestring(body).decode("utf-8", errors="ignore")
            else:
                html_text = body.decode("utf-8", errors="ignore")
        elif content_type.startswith("image/"):
            if content_transfer_encoding == "base64":
                img_data = base64.b64decode(body.replace(b"\r\n", b""))
            else:
                img_data = body
            if content_location:
                url_to_data[content_location] = (img_data, content_type)

    return html_text, url_to_data


def extract_questions(html):
    """Extract question blocks from html."""
    qs = re.findall(
        r'<div class="question questions_(\d+)" data-id="[^"]*"[^>]*>(.*?)<div class="skip-btn"',
        html, re.DOTALL
    )
    result = {}
    for qnum, content in qs:
        # Question text
        qtext_m = re.search(r'<span[^>]*>(.*?)</span>', content, re.DOTALL)
        qtext = qtext_m.group(1).strip() if qtext_m else "Which Shape is missing?"

        # Main image (first nolazy img)
        main_m = re.search(r'<img class="nolazy" src="([^"]+)"', content)
        main_img = main_m.group(1) if main_m else ""

        # Option images: A-F with their images
        opt_imgs = re.findall(
            r'value="([A-F])"[^>]*>\s*<img class="nolazy" src="([^"]+)"', content
        )
        result[int(qnum)] = {
            "text": qtext,
            "main_img": main_img,
            "opts": {v: u for v, u in opt_imgs}  # {A: url, B: url, ...}
        }
    return result


def save_image(url, url_to_data):
    """Save image from url_to_data map to local disk. Return local web path."""
    if url not in url_to_data:
        print(f"  WARNING: {url} not found in MHTML parts")
        return url  # fallback to original url

    img_data, content_type = url_to_data[url]
    local_name = url_to_local_name(url)
    out_path = OUT_IMG_DIR / local_name

    if not out_path.exists():
        with open(out_path, "wb") as f:
            f.write(img_data)
        print(f"  Saved: {local_name}")
    else:
        print(f"  Exists: {local_name}")

    return f"{BASE}/{local_name}"


def main():
    # Collect all questions and image URL maps from all 10 files
    all_questions = {}  # qnum -> question data
    master_url_map = {}  # url -> (bytes, type)

    print("Parsing MHTML files...")
    for fnum in range(1, 11):
        fpath = MHTML_DIR / f"{fnum}.mhtml"
        print(f"\nFile {fnum}...")
        html, url_map = parse_mhtml(fpath)
        master_url_map.update(url_map)

        qs = extract_questions(html)
        for qnum, q in qs.items():
            if qnum not in all_questions:
                all_questions[qnum] = q

    print(f"\nTotal unique questions found: {len(all_questions)}")
    print(f"Total images in MHTML: {len(master_url_map)}")

    # We want the first 10 questions
    target_qs = sorted(all_questions.keys())[:10]
    print(f"\nTarget question numbers: {target_qs}")

    # Save images and build JS question objects
    js_questions = []
    for qnum in target_qs:
        q = all_questions[qnum]
        print(f"\nProcessing Q{qnum}: {q['text']}")

        # Save main image
        main_local = save_image(q["main_img"], master_url_map) if q["main_img"] else ""

        # Save option images (A-F in order)
        opt_locals = []
        for letter in ["A", "B", "C", "D", "E", "F"]:
            if letter in q["opts"]:
                local = save_image(q["opts"][letter], master_url_map)
                opt_locals.append(local)

        js_obj = {
            "qnum": qnum,
            "title": q["text"],
            "imgUrl": main_local,
            "imgOpts": opt_locals,
            "answer": -1,  # PLACEHOLDER - needs to be filled manually
        }
        js_questions.append(js_obj)

    # Write JSON manifest
    manifest_path = OUT_IMG_DIR / "questions_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(js_questions, f, indent=2)
    print(f"\nManifest saved: {manifest_path}")

    # Print JS snippet
    print("\n=== JS SNIPPET (paste into iq_assessment.js for Q1-Q10) ===\n")
    for q in js_questions:
        opts_str = ",\n            ".join(f"'{o}'" for o in q["imgOpts"])
        print(f"""        {{
            title: '{q['title']}?',
            source: 'Perceptual Reasoning',
            imgUrl: '{q['imgUrl']}',
            imgOpts: [
                {opts_str}
            ],
            answer: {q['answer']},  // TODO: set correct answer index
            time: 90, exp: 'Pattern completed according to visual logic.'
        }},""")

    return js_questions


if __name__ == "__main__":
    main()
