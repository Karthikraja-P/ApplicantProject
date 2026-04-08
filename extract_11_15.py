#!/usr/bin/env python3
import os, re, base64, json, quopri
from pathlib import Path
from urllib.parse import urlparse

MHTML_DIR = Path("/home/pkr/ApplicantProject/new questions")
OUT_IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")
OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)
BASE_WEB_PATH = "/static/images/iq/wwiq"
JS_PATH = Path("/home/pkr/ApplicantProject/frontend/static/iq_assessment.js")

def url_to_filename(url):
    path = urlparse(url).path 
    name = re.sub(r'^/wp-content/uploads/', '', path)
    return name.replace("/", "_")

def parse_mhtml_parts(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return []
    boundary = b'--' + bm.group(1)
    parts = raw.split(boundary)
    result = []
    for rp in parts:
        rp = rp.lstrip(b'\r\n')
        if not rp or rp.startswith(b'--'): continue
        sep = rp.find(b'\r\n\r\n')
        if sep == -1: continue
        hdrs_raw = rp[:sep].decode('utf-8', errors='ignore')
        body = rp[sep+4:]
        hdrs = {k.strip().lower(): v.strip() for k, v in [line.split(':', 1) for line in hdrs_raw.split('\r\n') if ':' in line]}
        result.append((hdrs, body))
    return result

def decode_body(body, encoding):
    encoding = encoding.lower()
    if encoding == 'quoted-printable': return quopri.decodestring(body)
    if encoding == 'base64': return base64.decodebytes(body.replace(b'\r\n', b''))
    return body

def main():
    all_qs = {}
    master_img_map = {}
    
    for fnum in range(1, 11):
        fpath = MHTML_DIR / f"{fnum}.mhtml"
        if not fpath.exists(): continue
        print(f"Parsing {fpath.name}...")
        parts = parse_mhtml_parts(fpath)
        
        # Extract HTML
        html = ""
        for hdrs, body in parts:
            if hdrs.get('content-type', '').startswith('text/html'):
                html = decode_body(body, hdrs.get('content-transfer-encoding', '')).decode('utf-8', errors='ignore')
                break
        
        # Extract Images
        for hdrs, body in parts:
            if hdrs.get('content-type', '').startswith('image/'):
                loc = hdrs.get('content-location', '')
                if loc:
                    master_img_map[loc] = decode_body(body, hdrs.get('content-transfer-encoding', ''))

        # Extract Questions 11-15
        if html:
            q_starts = list(re.finditer(r'<div class="question questions_(\d+)" data-id="[^"]*"[^>]*>', html))
            for i, m in enumerate(q_starts):
                qnum = int(m.group(1))
                if 11 <= qnum <= 15:
                    start = m.start()
                    end = q_starts[i+1].start() if i+1 < len(q_starts) else len(html)
                    block = html[start:end]
                    tm = re.search(r'<span[^>]*>(.*?)</span>', block, re.DOTALL)
                    text = tm.group(1).strip() if tm else "Which Shape/Number is missing?"
                    mm = re.search(r'<img class="nolazy" src="(https://[^"]+)"', block)
                    main_img = mm.group(1) if mm else ""
                    opts = re.findall(r'value="([A-F])"[^>]*>\s*<img class="nolazy" src="(https://[^"]+)"', block)
                    if qnum not in all_qs:
                        all_qs[qnum] = {'text': text, 'main': main_img, 'opts': {v: u for v, u in opts}}

    print(f"Found questions: {sorted(all_qs.keys())}")
    
    # Save images and build JS snippets
    snippets = []
    for qnum in range(11, 16):
        if qnum not in all_qs:
            print(f"ERROR: Question {qnum} not found in MHTML")
            continue
        q = all_qs[qnum]
        print(f"Processing Q{qnum}...")
        
        # Main image
        main_local = ""
        if q['main']:
            fname = url_to_filename(q['main'])
            with open(OUT_IMG_DIR / fname, 'wb') as f: f.write(master_img_map[q['main']])
            main_local = f"{BASE_WEB_PATH}/{fname}"
        
        # Options
        opt_locals = []
        for letter in ["A", "B", "C", "D", "E", "F"]:
            url = q['opts'].get(letter)
            if url:
                fname = url_to_filename(url)
                with open(OUT_IMG_DIR / fname, 'wb') as f: f.write(master_img_map[url])
                opt_locals.append(f"{BASE_WEB_PATH}/{fname}")

        opts_js = ",\n                ".join(f"'{o}'" for o in opt_locals)
        snippet = f"""        {{
            title: '{q['text'].replace("'", "\\'")}',
            source: 'Perceptual Reasoning',
            imgUrl: '{main_local}',
            imgOpts: [
                {opts_js}
            ],
            answer: -1, time: 90, exp: 'Pattern completed according to visual logic.'
        }}"""
        snippets.append(snippet)

    # Update iq_assessment.js
    with open(JS_PATH, 'r') as f: content = f.read()
    
    start_marker = 'var QUESTIONS = ['
    start_idx = content.find(start_marker) + len(start_marker)
    
    # We want to replace objects 11-15 (0-indexed 10 to 14)
    # But wait, Q1-Q10 are already there.
    # Q11 starts after the 10th '}'.
    depth = 0
    objs_found = 0
    q11_start = -1
    q15_end = -1
    
    for i in range(start_idx, len(content)):
        if content[i] == '{': depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                objs_found += 1
                if objs_found == 10: # End of Q10
                    # q11 starts after this
                    j = i + 1
                    while j < len(content) and content[j] in [',', ' ', '\n', '\r', '\t']: j += 1
                    q11_start = j
                if objs_found == 15: # End of Q15
                    q15_end = i + 1
                    while q15_end < len(content) and content[q15_end] in [',', ' ', '\n', '\r', '\t']: q15_end += 1
                    break
    
    if q11_start != -1 and q15_end != -1:
        new_content = content[:q11_start] + ',\n\n'.join(snippets) + ',\n\n        ' + content[q15_end:]
        with open(JS_PATH, 'w') as f: f.write(new_content)
        print("Success: Updated iq_assessment.js with questions 11-15")
    else:
        print(f"Failure: Could not find positions for Q11-Q15 (objs_found={objs_found})")

if __name__ == "__main__":
    main()
