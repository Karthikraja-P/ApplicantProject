#!/usr/bin/env python3
import os, re, base64, quopri, json
from pathlb import Path

def get_active_elements(fpath, out_dir):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return None
    boundary = b'--' + bm.group(1)
    
    html = ""
    img_data = {}
    for part in raw.split(boundary):
        sep = part.find(b'\r\n\r\n')
        if sep == -1: continue
        hdr = part[:sep].decode('utf-8', errors='ignore').lower()
        body = part[sep+4:]
        if 'text/html' in hdr:
            enc = re.search(r'content-transfer-encoding:\s*(\S+)', hdr)
            body_decoded = quopri.decodestring(body) if enc and 'quoted-printable' in enc.group(1) else body
            html = body_decoded.decode('utf-8', errors='ignore')
        elif 'image/' in hdr:
            loc = re.search(r'content-location:\s*(\S+)', hdr)
            if loc:
                enc = re.search(r'content-transfer-encoding:\s*(\S+)', hdr)
                img_data[loc.group(1)] = quopri.decodestring(body) if enc and 'quoted-printable' in enc.group(1) else body
                
    if not html: return None

    # Step 2: Find all DIVs with styles
    candidates = []
    # Find all Image divs first (heuristic: bubble-element Image)
    for m in re.finditer(r'<div [^>]*class="bubble-element Image[^"]*"[^>]*style="([^"]+)"', html):
        style = m.group(1)
        if 'display: none' in style: continue
        # Find next img src
        next_snippet = html[m.end():m.end()+1000]
        img_src = re.search(r'<img [^>]*src="([^"]+)"', next_snippet)
        if img_src:
            src = img_src.group(1)
            if 'bubble.io' not in src: continue
            
            top = re.search(r'top:\s*([\d.]+)px', style)
            left = re.search(r'left:\s*([\d.]+)px', style)
            width = re.search(r'width:\s*([\d.]+)px', style)
            
            t = float(top.group(1)) if top else 0
            l = float(left.group(1)) if left else 0
            w = float(width.group(1)) if width else 0
            
            candidates.append({'src': src, 'top': t, 'left': l, 'width': w})
            
    # Heuristic
    mains = [c for c in candidates if c['top'] < 100 and c['left'] < 100 and c['width'] > 200]
    opts = [c for c in candidates if c['left'] > 300]
    opts.sort(key=lambda x: (x['top'], x['left']))
    
    unique_opts = []
    last_pos = (-1000, -1000)
    for o in opts:
        if abs(o['top'] - last_pos[0]) > 5 or abs(o['left'] - last_pos[1]) > 5:
            unique_opts.append(o['src'])
            last_pos = (o['top'], o['left'])
            
    return {
        'main': mains[0]['src'] if mains else (candidates[0]['src'] if candidates else None),
        'opts': unique_opts,
        'data': img_data
    }

# Main logic here...
def main():
    # Define slots and files
    slots = range(11, 16)
    final_output = {}
    for s in slots:
        fpath = f"/home/pkr/ApplicantProject/new questions/{s}.mhtml"
        print(f"Slot {s}...")
        res = get_active_elements(fpath, "")
        if res:
            # Save files
            # ...
            final_output[s] = res
            print(f"  Got {len(res['opts'])} options")
    # ... Update JS etc.
