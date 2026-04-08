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

def parse_mhtml_parts(fpath):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return [], {}
    boundary = b'--' + bm.group(1)
    
    html = ""
    img_map = {}
    for part in raw.split(boundary):
        part = part.lstrip(b'\r\n')
        if not part or part.startswith(b'--'): continue
        sep = part.find(b'\r\n\r\n')
        if sep == -1: continue
        hdrs_raw = part[:sep].decode('utf-8', errors='ignore')
        body = part[sep+4:]
        hdrs = {k.strip().lower(): v.strip() for k, v in [line.split(':', 1) for line in hdrs_raw.split('\r\n') if ':' in line]}
        
        enc = hdrs.get('content-transfer-encoding', '')
        decoded = decode_body(body, enc)
        ct = hdrs.get('content-type', '').lower()
        loc = hdrs.get('content-location', '')
        
        if ct.startswith('text/html'): html = decoded.decode('utf-8', errors='ignore')
        elif ct.startswith('image/') and loc: img_map[loc] = decoded
    return html, img_map

def extract_q(html, qnum):
    # Find ">N/20</div>"
    target = f">{qnum}/20</div>"
    idx = html.find(target)
    if idx == -1: return None
    
    # Snippet after indicator
    snippet = html[idx:idx+15000]
    
    # Images in Bubble.io are <div ... Image ...><img src="URL">
    # The first one after label is usually the question.
    # The next 4-6 with clickable-element are options.
    
    imgs = re.findall(r'<div[^>]*bubble-element Image[^>]*>.*?<img[^>]*src="([^"]+)"', snippet, re.DOTALL)
    if not imgs: return None
    
    # Sometimes there are extra images (icons, etc), we filter by bubble.io cdn
    imgs = [u for u in imgs if 'bubble.io' in u and 'cdn-cgi' not in u]
    
    if len(imgs) < 2: return None
    
    main = imgs[0]
    opts = imgs[1:]
    # Limit options if they bleed into next question (heuristic: options have common naming or spacing)
    # Most have 4 options.
    if len(opts) > 8: opts = opts[:8] # safety
    
    return {'main': main, 'opts': opts}

def save_img(url, img_map, qnum, suffix="main"):
    if not url or url not in img_map: return url
    data = img_map[url]
    fname = f"iqacademy_q{qnum}_{suffix}.svg" if '.svg' in url.lower() else f"iqacademy_q{qnum}_{suffix}.png"
    fpath = OUT_IMG_DIR / fname
    with open(fpath, 'wb') as f: f.write(data)
    return f"{BASE_WEB_PATH}/{fname}"

def main():
    final_qs = {}
    master_img_map = {}
    
    # Check files 11-15 first as they are most likely to have the targets
    for fnum in [11, 12, 13, 14, 15]:
        fpath = MHTML_DIR / f"{fnum}.mhtml"
        if not fpath.exists(): continue
        print(f"Checking {fpath.name}...")
        html, img_map = parse_mhtml_parts(fpath)
        master_img_map.update(img_map)
        
        for qtarget in range(11, 16):
            if qtarget not in final_qs:
                res = extract_q(html, qtarget)
                if res:
                    print(f"  Found Q{qtarget} in {fpath.name}")
                    final_qs[qtarget] = res

    # Build JS
    js_blocks = []
    for qnum in range(11, 16):
        if qnum not in final_qs:
            print(f"Warning: Q{qnum} not found in any file!")
            continue
        
        q = final_qs[qnum]
        main_local = save_img(q['main'], master_img_map, qnum, "main")
        opt_locals = [save_img(url, master_img_map, qnum, f"opt{i}") for i, url in enumerate(q['opts'])]
        
        opts_js = ",\n                ".join(f"'{o}'" for o in opt_locals)
        js_blocks.append(f"""        {{
            title: 'Which image completes the pattern?',
            source: 'Visual Reasoning',
            imgUrl: '{main_local}',
            imgOpts: [
                {opts_js}
            ],
            answer: -1, time: 90, exp: 'Pattern logic from IQ Academy set.'
        }}""")

    # Update iq_assessment.js positions 11-15
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
        print("Successfully updated Q11-Q15 in iq_assessment.js")
    else:
        print(f"Error finding positions (obj_count={obj_count})")

if __name__ == "__main__":
    main()
