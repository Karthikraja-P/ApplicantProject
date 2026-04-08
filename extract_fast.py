#!/usr/bin/env python3
"""
Fast streaming MHTML parser. 
Splits on boundary markers, processes each part one at a time.
"""
import os, re, base64, json
from pathlib import Path
from urllib.parse import urlparse

MHTML_DIR = Path("/home/pkr/ApplicantProject/new questions")
OUT_IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")
OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)
BASE_WEB_PATH = "/static/images/iq/wwiq"

def url_to_filename(url):
    path = urlparse(url).path  # /wp-content/uploads/2020/12/Q27_main.svg
    # strip /wp-content/uploads/ prefix
    name = re.sub(r'^/wp-content/uploads/', '', path)
    return name.replace("/", "_")

def parse_mhtml_parts(filepath):
    """Stream parse MHTML. Returns list of (headers_dict, body_bytes) per part."""
    with open(filepath, 'rb') as f:
        raw = f.read()

    # Get boundary
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm:
        raise ValueError("No MIME boundary")
    boundary = b'--' + bm.group(1)

    # Split into raw parts
    raw_parts = raw.split(boundary)
    parts = []
    for rp in raw_parts:
        rp = rp.lstrip(b'\r\n')
        if not rp or rp.startswith(b'--'):
            continue
        sep = rp.find(b'\r\n\r\n')
        if sep == -1:
            continue
        hdrs_raw = rp[:sep].decode('utf-8', errors='ignore')
        body = rp[sep+4:]

        hdrs = {}
        for line in hdrs_raw.split('\r\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                hdrs[k.strip().lower()] = v.strip()

        parts.append((hdrs, body))
    return parts

def extract_html(parts):
    """Find and decode the HTML part."""
    import quopri
    for hdrs, body in parts:
        ct = hdrs.get('content-type', '')
        if ct.startswith('text/html'):
            enc = hdrs.get('content-transfer-encoding', '')
            if enc == 'quoted-printable':
                return quopri.decodestring(body).decode('utf-8', errors='ignore')
            else:
                return body.decode('utf-8', errors='ignore')
    return None

def extract_images(parts):
    """Build url -> (bytes, ext) map from MHTML image parts."""
    img_map = {}
    for hdrs, body in parts:
        ct = hdrs.get('content-type', '')
        if not ct.startswith('image/'):
            continue
        loc = hdrs.get('content-location', '')
        enc = hdrs.get('content-transfer-encoding', '').lower()
        if not loc:
            continue

        if enc == 'base64':
            data = base64.decodebytes(body)
        else:
            data = body

        ext = ct.split('/')[-1].split(';')[0].strip()
        if ext == 'svg+xml':
            ext = 'svg'
        img_map[loc] = (data, ext)
    return img_map

def parse_html_questions(html):
    """Parse questions from decoded HTML."""
    # Find all question blocks
    # Pattern: <div class="question questions_N" data-id="...">...</div>
    # End marker: next question block or </div></div> pattern
    qs = {}
    
    # Use simple block extraction by finding opening tags
    q_starts = list(re.finditer(r'<div class="question questions_(\d+)" data-id="[^"]*"[^>]*>', html))
    
    for i, m in enumerate(q_starts):
        qnum = int(m.group(1))
        start = m.start()
        end = q_starts[i+1].start() if i+1 < len(q_starts) else len(html)
        block = html[start:end]
        
        # Question text
        tm = re.search(r'<span[^>]*>(.*?)</span>', block, re.DOTALL)
        text = tm.group(1).strip() if tm else "Which Shape/Number is missing?"
        
        # Main image
        mm = re.search(r'<img class="nolazy" src="(https://[^"]+)"', block)
        main_img = mm.group(1) if mm else ""
        
        # Option images
        opts = re.findall(r'value="([A-F])"[^>]*>\s*<img class="nolazy" src="(https://[^"]+)"', block)
        opts_dict = {v: u for v, u in opts}
        
        qs[qnum] = {'text': text, 'main': main_img, 'opts': opts_dict}
    
    return qs

def save_image(url, img_map, saved_cache):
    """Save image to local disk. Return local web path."""
    if url in saved_cache:
        return saved_cache[url]
    
    if url not in img_map:
        print(f"    MISS: {url}")
        return url
    
    data, ext = img_map[url]
    fname = url_to_filename(url)
    fpath = OUT_IMG_DIR / fname
    
    if not fpath.exists():
        with open(fpath, 'wb') as f:
            f.write(data)
        print(f"    + {fname}")
    else:
        print(f"    ~ {fname}")
    
    local = f"{BASE_WEB_PATH}/{fname}"
    saved_cache[url] = local
    return local

def main():
    all_qs = {}
    master_img_map = {}
    saved_cache = {}

    for fnum in range(1, 11):
        fpath = MHTML_DIR / f"{fnum}.mhtml"
        print(f"\nParsing file {fnum}...", flush=True)
        
        parts = parse_mhtml_parts(fpath)
        print(f"  {len(parts)} MIME parts")
        
        img_map = extract_images(parts)
        master_img_map.update(img_map)
        print(f"  {len(img_map)} images")
        
        html = extract_html(parts)
        if not html:
            print("  No HTML found!")
            continue
        
        qs = parse_html_questions(html)
        print(f"  {len(qs)} questions")
        for qnum, q in qs.items():
            if qnum not in all_qs:
                all_qs[qnum] = q

    print(f"\nTotal unique questions: {len(all_qs)}")
    print(f"Total images in MHTML: {len(master_img_map)}")
    
    # Take first 10 questions
    target_nums = sorted(all_qs.keys())[:10]
    print(f"\nTarget questions: {target_nums}")

    js_questions = []
    for qnum in target_nums:
        q = all_qs[qnum]
        print(f"\nQ{qnum}: {q['text']}")
        
        main_local = save_image(q['main'], master_img_map, saved_cache) if q['main'] else ""
        
        opt_locals = []
        for letter in ["A", "B", "C", "D", "E", "F"]:
            if letter in q['opts']:
                local = save_image(q['opts'][letter], master_img_map, saved_cache)
                opt_locals.append(local)
        
        js_questions.append({
            "qnum": qnum,
            "title": q['text'],
            "imgUrl": main_local,
            "imgOpts": opt_locals,
            "answer": -1,
        })

    # Save manifest
    manifest = OUT_IMG_DIR / "questions_manifest.json"
    with open(manifest, 'w') as f:
        json.dump(js_questions, f, indent=2)
    print(f"\nManifest: {manifest}")

    # Print JS
    print("\n=== JS OBJECTS (Q1-Q10) ===")
    for q in js_questions:
        opts_js = ",\n                ".join(f"'{o}'" for o in q['imgOpts'])
        print(f"""        {{
            title: '{q['title']}',
            source: 'Perceptual Reasoning',
            imgUrl: '{q['imgUrl']}',
            imgOpts: [
                {opts_js}
            ],
            answer: -1, time: 90, exp: 'Pattern completed according to visual logic.'
        }},""")

if __name__ == "__main__":
    main()
