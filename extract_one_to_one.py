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

def extract_from_file(fpath):
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
        hdrs_raw = part[:sep].decode('utf-8', errors='ignore')
        body = part[sep+4:]
        hdrs = {k.strip().lower(): v.strip() for k, v in [line.split(':', 1) for line in hdrs_raw.split('\r\n') if ':' in line]}
        
        enc = hdrs.get('content-transfer-encoding', '')
        ct = hdrs.get('content-type', '').lower()
        loc = hdrs.get('content-location', '')
        
        if ct.startswith('text/html'):
            html = decode_body(body, enc).decode('utf-8', errors='ignore')
        elif ct.startswith('image/') and loc:
            img_data[loc] = decode_body(body, enc)
            
    if not html: return None
    
    # Identify visible images by style (no display: none)
    img_matches = list(re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL))
    
    visible = []
    for m in img_matches:
        style = m.group(1)
        src = m.group(2)
        if 'display: none' in style: continue
        if 'bubble.io' not in src or 'cdn-cgi' in src: continue
        
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        z = re.search(r'z-index:\s*(\d+)', style)
        
        t = float(top.group(1)) if top else 0
        l = float(left.group(1)) if left else 0
        zi = int(z.group(1)) if z else 0
        
        is_clickable = 'clickable-element' in m.group(0)
        
        visible.append({'src': src, 'top': t, 'left': l, 'z': zi, 'clickable': is_clickable})
        
    if not visible: return None
    
    # Strategy:
    # 1. Main image is usually at top (t < 50) and left (l < 50) and NOT clickable.
    main = None
    for v in visible:
        if not v['clickable'] and v['top'] < 100 and v['left'] < 100:
            main = v['src']
            break
            
    # 2. Options are clickable. Sort them by Top, then Left to get row-by-row order.
    opts = [v for v in visible if v['clickable']]
    opts.sort(key=lambda x: (x['top'], x['left']))
    opt_sources = [o['src'] for o in opts]
    
    # Sometimes main is the first image in the DOM but doesn't follow the coord rule.
    if not main and visible:
        main = visible[0]['src']

    return {
        'main': main,
        'opts': opt_sources,
        'data': img_data
    }

def save_img(url, data, qnum, suffix):
    ext = ".svg" if ".svg" in url.lower() else ".png"
    fname = f"iq_final_q{qnum}_{suffix}{ext}"
    fpath = OUT_IMG_DIR / fname
    with open(fpath, 'wb') as f: f.write(data)
    return f"{BASE_WEB_PATH}/{fname}"

def main():
    final_qs = {}
    for slot in range(11, 16):
        fpath = MHTML_DIR / f"{slot}.mhtml"
        if not fpath.exists(): continue
        print(f"Processing Slot {slot} from {fpath.name}...")
        res = extract_from_file(fpath)
        if res and res['main']:
            m_local = save_img(res['main'], res['data'][res['main']], slot, "main")
            o_locals = [save_img(u, res['data'][u], slot, f"opt{i}") for i, u in enumerate(res['opts'])]
            final_qs[slot] = {'main': m_local, 'opts': o_locals}
            print(f"  Success: Found Main and {len(o_locals)} options")
        else:
            print(f"  Failed extraction for {fpath.name}")

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
        print("Updated Q11-Q15 in iq_assessment.js mapping files one-to-one.")
    else:
        print("Could not find range in JS")

if __name__ == "__main__":
    main()
