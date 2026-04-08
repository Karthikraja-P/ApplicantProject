import re, quopri, sys

def analyze_mhtml(fpath):
    with open(fpath, 'rb') as f:
        raw = f.read()

    # Boundary find
    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return "No boundary"
    boundary = b'--' + bm.group(1)
    
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            # Look for Title and any main image
            title = re.search(r'<title>(.*?)</title>', html)
            print(f"File: {fpath} | Title: {title.group(1) if title else 'N/A'}")
            
            # Simple extractor: find ALL bubble.io images
            # One is the question, others are options
            bubble_imgs = re.findall(r'src="(https://[^"]+bubble\.io[^"]+)"', html)
            print(f"Bubble images ({len(bubble_imgs)}): {bubble_imgs}")
            
            # Context around first image to see how they label options
            if bubble_imgs:
                idx = html.find(bubble_imgs[0])
                print("Context around first img:")
                print(html[idx-100:idx+500])
    return "Done"

if len(sys.argv) > 1:
    analyze_mhtml(sys.argv[1])
