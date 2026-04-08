#!/usr/bin/env python3
import os, re, base64, quopri, json
from pathlib import Path

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

def extract_from_file_broad(fpath):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return None
    boundary = b'--' + bm.group(1)
    
    html = ""
    img_data = {}
    for part in raw.split(boundary):
        part = part.lstrip(b'\r\n')
        if not part or part.startswith(b'--'): continue
        sep = part.find(b'\r\n\r\n')
        if sep == -1: continue
        hdr_raw = part[:sep].decode('utf-8', errors='ignore')
        body = part[sep+4:]
        hdrs = {k.strip().lower(): v.strip() for k, v in [line.split(':', 1) for line in hdr_raw.split('\r\n') if ':' in line]}
        
        enc = hdrs.get('content-transfer-encoding', '')
        ct = hdrs.get('content-type', '').lower()
        loc = hdrs.get('content-location', '')
        
        if ct.startswith('text/html'):
            html = decode_body(body, enc).decode('utf-8', errors='ignore')
        elif ct.startswith('image/') and loc:
            img_data[loc] = decode_body(body, enc)
            
    if not html: return None
    
    # 1. Find ALL images with their coords
    # Note: Search for style and img src separately to be robust
    div_matches = list(re.finditer(r'<div[^>]*style="([^"]+)"[^>]*>.*?<img[^>]*src="([^"]+)"', html, re.DOTALL))
    
    candidates = []
    for m in div_matches:
        style = m.group(1)
        src = m.group(2)
        if 'bubble.io' not in src: continue
        if 'display: none' in style: continue
        
        topm = re.search(r'top:\s*([\d.]+)px', style)
        leftm = re.search(r'left:\s*([\d.]+)px', style)
        widthm = re.search(r'width:\s*([\d.]+)px', style)
        
        t = float(topm.group(1)) if topm else 0
        l = float(leftm.group(1)) if leftm else 0
        w = float(widthm.group(1)) if widthm else 0
        
        candidates.append({'src': src, 'top': t, 'left': l, 'width': w})
        
    print(f"--- {fpath.name} ({len(candidates)} candidates) ---")
    
    # 2. Heuristic for layout
    # Main Question: top < 100, left < 100, width > 200
    mains = [c for c in candidates if c['top'] < 100 and c['left'] < 100 and c['width'] > 200]
    # Options: top < 1000, left > 300
    opts = [c for c in candidates if c['left'] > 300]
    
    # Sort options by layout
    opts.sort(key=lambda x: (x['top'], x['left']))
    
    # Prune duplicate/similar-coord images (Bubble.io often layers things)
    unique_opts = []
    last_pos = (-1000, -1000)
    for o in opts:
        if abs(o['top'] - last_pos[0]) > 5 or abs(o['left'] - last_pos[1]) > 5:
            unique_opts.append(o['src'])
            last_pos = (o['top'], o['left'])

    # Final pruning for 4-6 options
    if len(unique_opts) > 8: unique_opts = unique_opts[:8]

    return {
        'main': mains[0]['src'] if mains else (candidates[0]['src'] if candidates else None),
        'opts': unique_opts,
        'data': img_data
    }

def save_img(url, data, qnum, suffix):
    ext = ".svg" if ".svg" in url.lower() else ".png"
    fname = f"iq_final_fixed_q{qnum}_{suffix}{ext}"
    fpath = OUT_IMG_DIR / fname
    with open(fpath, 'wb') as f: f.write(data)
    return f"{BASE_WEB_PATH}/{fname}"

def main():
    final_qs = {}
    for slot in range(11, 16):
        fpath = MHTML_DIR / f"{slot}.mhtml"
        if not fpath.exists(): continue
        print(f"Processing Slot {slot}...")
        res = extract_from_file_broad(fpath)
        if res and res['main']:
            m_local = save_img(res['main'], res['data'][res['main']], slot, "main")
            o_locals = [save_img(u, res['data'][u], slot, f"opt{i}") for i, u in enumerate(res['opts'])]
            final_qs[slot] = {'main': m_local, 'opts': o_locals}
            print(f"  Result: {len(o_locals)} options")
        else:
            print(f"  Failed for {fpath.name}")

    # Build JS
    js_blocks = []
    for slot in range(11, 16):
        if slot not in final_qs: continue
        q = final_qs[slot]
        opt_list = ",\n                ".join(f"'{o}'" for o in q['opts'])
        js_blocks.append(f"""        {{
            title: 'Which image completes the pattern?',
            source: 'Visual Reasoning',
            imgUrl: '{q['main']}',
            imgOpts: [
                {opt_list}
            ],
            answer: -1, time: 90, exp: 'Pattern logic from assessment capture set.'
        }}""")

    # Edit JS
    with open(JS_PATH, 'r') as f: 
        content = f.read()
    
    # Pattern to find the range 11-15
    # (Existing questions in JS have 'Visual Reasoning' or 'IQ Academy')
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
        print("Updated JS successfully.")
    else:
        print("Range find error.")

if __name__ == "__main__":
    main()
