import re, quopri, sys

def find_context(fpath, qnum):
    with open(fpath, 'rb') as f:
        raw = f.read()

    bm = re.search(rb'boundary="([^"]+)"', raw)
    if not bm: return
    boundary = b'--' + bm.group(1)
    
    html = ""
    for part in raw.split(boundary):
        if b'text/html' in part[:200]:
            html = quopri.decodestring(part[part.find(b'\r\n\r\n')+4:]).decode('utf-8', errors='ignore')
            break
            
    if not html: return
    
    # 1. Find the indicator "QNUM/20"
    target = f">{qnum}/20</div>"
    idx = html.find(target)
    if idx == -1:
        print(f"  Q{qnum} not found in {fpath}")
        return
    
    print(f"  Found Q{qnum} in {fpath} at index {idx}. Context:")
    # Look for images within 5000 chars after this indicator
    # Bubble.io often layout elements in order of creation/grouping
    snippet = html[idx:idx+15000]
    
    # Find all images in snippet
    imgs = re.findall(r'<div[^>]*bubble-element Image[^>]*>.*?<img[^>]*src="([^"]+)"', snippet, re.DOTALL)
    print(f"  Images in snippet: {len(imgs)}")
    for i, img in enumerate(imgs):
        print(f"    {i}: {img}")

if __name__ == "__main__":
    import sys
    find_context(sys.argv[1], sys.argv[2])
