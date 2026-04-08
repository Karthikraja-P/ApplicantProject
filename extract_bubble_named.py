#!/usr/bin/env python3
import os, re, base64, quopri, json
from pathlib import Path
from urllib.parse import urlparse, unquote

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
    if not bm: return {}
    boundary = b'--' + bm.group(1)
    
    img_map = {}
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
        
        if ct.startswith('image/') and loc:
            img_map[loc] = decode_body(body, enc)
    return img_map

def save_img(url, data, qnum, suffix):
    ext = ".svg" if ".svg" in url.lower() else ".png"
    fname = f"iqacademy_fixed_q{qnum}_{suffix}{ext}"
    fpath = OUT_IMG_DIR / fname
    with open(fpath, 'wb') as f: f.write(data)
    return f"{BASE_WEB_PATH}/{fname}"

def main():
    final_qs = {}
    
    # 1. Gather all images from 13.mhtml (most complete)
    print("Collecting images from 13.mhtml...")
    img_map = parse_mhtml_parts(MHTML_DIR / "13.mhtml")
    
    for qtarget in range(11, 16):
        print(f"Processing Q{qtarget}...")
        # Pattern: Q{target} (n).svg
        # Note: URL encoding has %20 for space and %28 %29 for parens
        regex = rf'Q{qtarget}%20%28(\d+)%29\.svg'
        
        found = []
        for url in img_map.keys():
            m = re.search(regex, url)
            if m:
                found.append((int(m.group(1)), url))
        
        if not found:
            print(f"  No images found for Q{qtarget} in 13.mhtml. Trying other files...")
            # Fallback to search in all files
            for f in MHTML_DIR.glob("*.mhtml"):
                temp_map = parse_mhtml_parts(f)
                for url in temp_map.keys():
                    m = re.search(regex, url)
                    if m:
                        found.append((int(m.group(1)), url))
                        img_map[url] = temp_map[url]
                if found: break

        if found:
            found.sort() # (1, url), (2, url)...
            main_url = found[0][1]
            opt_urls = [x[1] for x in found[1:]]
            
            main_local = save_img(main_url, img_map[main_url], qtarget, "main")
            opt_locals = [save_img(url, img_map[url], qtarget, f"opt{i}") for i, url in enumerate(opt_urls)]
            
            final_qs[qtarget] = {'main': main_local, 'opts': opt_locals}
            print(f"  Success: Found {len(found)} images for Q{qtarget}")
        else:
            print(f"  Failed: Could not find images for Q{qtarget}")

    # Build JS blocks
    js_blocks = []
    for qnum in range(11, 16):
        if qnum not in final_qs: continue
        q = final_qs[qnum]
        opts_js = ",\n                ".join(f"'{o}'" for o in q['opts'])
        js_blocks.append(f"""        {{
            title: 'Which image completes the pattern?',
            source: 'Visual Reasoning',
            imgUrl: '{q['main']}',
            imgOpts: [
                {opts_js}
            ],
            answer: -1, time: 90, exp: 'Pattern logic from IQ Academy set.'
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
        print("Updated Q11-Q15 in iq_assessment.js with NAMED patterns")
    else:
        print("Error finding range")

if __name__ == "__main__":
    main()
