#!/usr/bin/env python3
import os, re, base64, quopri, json
from pathlib import Path
from urllib.parse import urlparse

MHTML_DIR = Path("/home/pkr/ApplicantProject/new questions")
OUT_IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")
OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)
BASE_WEB_PATH = "/static/images/iq/wwiq"
JS_PATH = Path("/home/pkr/ApplicantProject/frontend/static/iq_assessment.js")

def decode_body(body, encoding):
    encoding = encoding.lower()
    if encoding == 'quoted-printable': return quopri.decodestring(body)
    if encoding == 'base64': 
        try: return base64.decodebytes(body.replace(b'\r\n', b''))
        except: return body
    return body

def parse_bubble_mhtml(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()

    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return None
    boundary = b'--' + bm.group(1)

    html = ""
    img_map = {}

    for part in raw.split(boundary):
        part = part.lstrip(b'\r\n')
        if not part or part.startswith(b'--'): continue
        sep = part.find(b'\r\n\r\n')
        if sep == -1: continue
        hdr_raw = part[:sep].decode('utf-8', errors='ignore')
        body = part[sep+4:]
        
        hdrs = {}
        for line in hdr_raw.split('\r\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                hdrs[k.strip().lower()] = v.strip()
        
        enc = hdrs.get('content-transfer-encoding', '')
        decoded = decode_body(body, enc)
        ct = hdrs.get('content-type', '').lower()
        loc = hdrs.get('content-location', '')
        
        if ct.startswith('text/html'):
            html = decoded.decode('utf-8', errors='ignore')
        elif ct.startswith('image/') and loc:
            img_map[loc] = decoded

    if not html: return None

    # Step 1: Find Question Number label
    # Search for <div class="content">2/20</div> or similar
    match_num = re.search(r'<div class="content">(\d+)/(\d+)</div>', html)
    qlabel = match_num.group(1) if match_num else "Unknown"
    
    # Step 2: Main image (heuristic: first Image z-index 3 or 4)
    # iqtestacademy.org uses: <div class="bubble-element Image bubble-legacy-image" style="...; z-index: 4; height: 280px; ...">
    main_pattern = r'class="bubble-element Image bubble-legacy-image"[^>]*z-index: [1-5];[^>]*>.*?<img[^>]*src="([^"]+)"'
    # Use re.finditer to see ALL large images, pick the one with height >= 200px
    main_imgs = []
    for m in re.finditer(main_pattern, html, re.DOTALL):
        url = m.group(1)
        # Check height in surrounding style
        style = html[m.start()-500:m.start()+200]
        if 'height: 280' in style or 'height: 200' in style:
            main_imgs.append(url)

    main_img = main_imgs[0] if main_imgs else ""
    
    # Step 3: Options (heuristic: clickable-element images)
    opt_pattern = r'class="bubble-element Image bubble-legacy-image clickable-element"[^>]*>.*?<img[^>]*src="([^"]+)"'
    opts = list(set(re.findall(opt_pattern, html, re.DOTALL)))
    
    return {
        'label': qlabel,
        'main': main_img,
        'opts': opts,
        'img_map': img_map
    }

def save_img(url, img_map, prefix=""):
    if not url or url not in img_map: return url
    data = img_map[url]
    # Name from URL
    p = urlparse(url).path
    name = p.split('/')[-1]
    if not name or name == '/': name = f"img_{hash(url)}.svg"
    fname = f"{prefix}_{name}"
    fpath = OUT_IMG_DIR / fname
    with open(fpath, 'wb') as f: f.write(data)
    return f"{BASE_WEB_PATH}/{fname}"

def main():
    snippets = []
    for qidx in range(11, 16):
        fpath = MHTML_DIR / f"{qidx}.mhtml"
        if not fpath.exists(): continue
        
        print(f"File {fpath.name}...")
        res = parse_bubble_mhtml(fpath)
        if not res:
            print("  Failed to parse")
            continue
        
        print(f"  Question label: {res['label']}")
        print(f"  Main: {res['main']}")
        print(f"  Opts count: {len(res['opts'])}")
        
        main_local = save_img(res['main'], res['img_map'], f"q{qidx}")
        # Sort options is important for layout but here we just collect
        opt_locals = [save_img(url, res['img_map'], f"q{qidx}_opt") for url in sorted(res['opts'])]
        
        snippets.append({
            'num': qidx,
            'title': "Which image completes the pattern?",
            'main': main_local,
            'opts': opt_locals
        })

    # Build JS
    js_blocks = []
    for s in snippets:
        opt_list = ",\n                ".join(f"'{o}'" for o in s['opts'])
        js_blocks.append(f"""        {{
            title: '{s['title']}',
            source: 'Perceptual Reasoning',
            imgUrl: '{s['main']}',
            imgOpts: [
                {opt_list}
            ],
            answer: -1, time: 90, exp: 'Pattern logic from IQ Test Academy format.'
        }}""")

    # Update iq_assessment.js
    with open(JS_PATH, 'r') as f: content = f.read()
    
    start_marker = 'var QUESTIONS = ['
    si = content.find(start_marker) + len(start_marker)
    
    depth = 0
    obj_count = 0
    q11_start = -1
    q15_end = -1
    
    for i in range(si, len(content)):
        if content[i] == '{': depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                obj_count += 1
                if obj_count == 10:
                    j = i + 1
                    while j < len(content) and content[j] in [',', ' ', '\n', '\r', '\t']: j += 1
                    q11_start = j
                if obj_count == 15:
                    q15_end = i + 1
                    while q15_end < len(content) and content[q15_end] in [',', ' ', '\n', '\r', '\t']: q15_end += 1
                    break

    if q11_start != -1 and q15_end != -1:
        new_block = ",\n\n".join(js_blocks)
        new_content = content[:q11_start] + new_block + ",\n\n        " + content[q15_end:]
        with open(JS_PATH, 'w') as f: f.write(new_content)
        print("Updated Q11-Q15 in iq_assessment.js")
    else:
        print(f"Could not find Q11-Q15 range (obj_count={obj_count})")

if __name__ == "__main__":
    main()
