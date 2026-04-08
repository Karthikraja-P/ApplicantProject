import re, quopri, sys
from pathlib import Path

def extract_correct_set(fpath, qnum):
    with open(fpath, 'rb') as f: raw = f.read()
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return None
    boundary = b'--' + bm.group(1)
    
    html = ''
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            break
            
    if not html: return None
    
    # Target label indicator
    target = f">{qnum}/20</div>"
    idx = html.find(target)
    if idx == -1: return None
    
    # We look for elements within a Group that is currently visible (non-hidden)
    # The label belongs to a parent Group.
    # Let's find the Group that contains this label and is NOT display: none.
    
    # Actually, simpler: just find all Image elements in the WHOLE file
    # and pick the ones that are VISIBLE and whose style doesn't have display: none.
    # In MHTML captures of SPA, usually ONLY the active question's elements are SHOWing.
    
    matches = list(re.finditer(r'<div class="bubble-element Image[^"]*" style="([^"]+)">.*?<img[^>]*src="([^"]+)"', html, re.DOTALL))
    
    main = None
    options = []
    
    print(f"--- {fpath.name} | Q{qnum} ---")
    for m in matches:
        style = m.group(1)
        src = m.group(2)
        if 'display: none' in style: continue
        if 'bubble.io' not in src or 'cdn-cgi' in src: continue
        
        top = re.search(r'top:\s*([\d.]+)px', style)
        left = re.search(r'left:\s*([\d.]+)px', style)
        t = float(top.group(1)) if top else 0
        l = float(left.group(1)) if left else 0
        
        is_clickable = 'clickable-element' in m.group(0)
        
        # Main Question heuristic
        if not is_clickable and l < 100 and t < 100:
            main = src
        # Option heuristic
        elif is_clickable and l > 300:
            # We want to sort them by top, then left to get A,B,C,D order
            options.append({'src': src, 'top': t, 'left': l})

    # Sort options: rows first, then columns
    options.sort(key=lambda x: (x['top'], x['left']))
    opt_sources = [o['src'] for o in options]
    
    print(f"  Main: {main}")
    print(f"  Options ({len(opt_sources)}): {opt_sources}")
    return {'main': main, 'opts': opt_sources}

if __name__ == "__main__":
    import pathlib
    files = sorted(list(pathlib.Path('/home/pkr/ApplicantProject/new questions').glob('1[1-5].mhtml')))
    for f in files:
        qnum = int(f.stem)
        extract_correct_set(f, qnum)
