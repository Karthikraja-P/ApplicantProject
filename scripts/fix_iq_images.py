#!/usr/bin/env python3
import os, re, quopri, base64
from pathlib import Path

MHTML_DIR = Path("/home/pkr/ApplicantProject/new questions")
IMG_DIR = Path("/home/pkr/ApplicantProject/frontend/static/images/iq/wwiq")

def decode_part(body, encoding):
    encoding = encoding.lower()
    if encoding == 'quoted-printable':
        return quopri.decodestring(body)
    elif encoding == 'base64':
        return base64.b64decode(body.replace(b'\r\n', b''))
    return body

def fix_images():
    for fnum in range(1, 11):
        fpath = MHTML_DIR / f"{fnum}.mhtml"
        if not fpath.exists(): continue
        
        print(f"Checking {fpath.name}...")
        with open(fpath, 'rb') as f:
            raw = f.read()

        # Get boundary
        bm = re.search(rb'boundary="([^"]+)"', raw)
        if not bm: continue
        boundary = b'--' + bm.group(1)

        parts = raw.split(boundary)
        for part in parts:
            if b'Content-Location:' not in part: continue
            
            # Parse headers briefly
            lines = part.split(b'\r\n')
            loc = b""
            enc = b""
            body_start = part.find(b'\r\n\r\n') + 4
            
            for line in lines:
                if line.lower().startswith(b'content-location:'):
                    loc = line.split(b':', 1)[1].strip()
                if line.lower().startswith(b'content-transfer-encoding:'):
                    enc = line.split(b':', 1)[1].strip()

            if loc and b'wwiqtest.com/wp-content/uploads/' in loc:
                url_str = loc.decode('utf-8', errors='ignore')
                fname = re.sub(r'https://[^/]+/wp-content/uploads/', '', url_str).replace('/', '_')
                dest = IMG_DIR / fname
                
                # If it ends in .svg, we definitely want to ensure it's decoded
                if fname.endswith('.svg') or enc.lower() == b'quoted-printable':
                    body = part[body_start:]
                    decoded = decode_part(body, enc.decode('utf-8', errors='ignore'))
                    
                    with open(dest, 'wb') as f:
                        f.write(decoded)
                    print(f"  Fixed/Verified: {fname} (Encoding: {enc.decode()})")

if __name__ == "__main__":
    fix_images()
