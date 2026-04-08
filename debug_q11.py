import re, quopri, sys

def find_q11(fpath):
    with open(fpath, 'rb') as f:
        raw = f.read()

    # Boundary find
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return "No boundary"
    boundary = b'--' + bm.group(1)
    
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            # Look for ANY container that mentions Question 11
            # Standard is <div class="question questions_11" ...
            # But maybe it's <div id="question_11" or something?
            
            # 1. Search for text "Question No: <span class=\"current\">11</span>" in some DIV
            # It's usually the ONLY one active.
            
            # Let's see ALL divs with 'question questions_' class
            qs = re.findall(r'class="question questions_(\d+)"[^>]*>(.*?)</div><div class="skip-btn"', html, re.DOTALL)
            print(f"Questions found by regex: {[q[0] for q in qs]}")
            
            if '11' in [q[0] for q in qs]:
                print("Found questions_11 via standard regex")
            else:
                # Let's find Question 11 by text
                i = html.find('current">11</span>')
                if i != -1:
                    print(f"Current question is 11 in {fpath.name}! Extrating its content...")
                    # Grab surrounding block
                    print(html[i-100:i+1000])
                else:
                    print(f"Question 11 NOT found in {fpath.name}")
    return "Done"

if len(sys.argv) > 1:
    find_q11(sys.argv[1])
