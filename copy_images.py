import shutil
import os

source_dir = r"C:\Users\Admin\.gemini\antigravity\brain\df0daba2-d4e7-4c3c-8192-b5948147d42c"
target_dir = r"frontend\static\images\iq"
os.makedirs(target_dir, exist_ok=True)

files = [
    "media__1775034114400.jpg",
    "media__1775034119853.jpg",
    "media__1775034123545.jpg",
    "media__1775034128082.jpg",
    "media__1775034135502.jpg"
]

for i, f in enumerate(files):
    src = os.path.join(source_dir, f)
    dst = os.path.join(target_dir, f"q{36+i}.jpg")
    try:
        shutil.copy(src, dst)
        print(f"Copied {f} to {dst}")
    except Exception as e:
        print(f"Failed to copy {f}: {e}")
