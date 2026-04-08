import os
from pathlib import Path

# Paths
BASE_DIR = Path("/home/pkr/ApplicantProject/frontend/static")
USED_FILE = Path("/home/pkr/ApplicantProject/used_images.txt")
OLD_BOX = BASE_DIR / "images" / "iq" / "Old_Box"
OLD_BOX.mkdir(parents=True, exist_ok=True)

# Read used files
with open(USED_FILE, 'r') as f:
    used_rel_paths = {line.strip() for line in f if line.strip()}

print(f"Read {len(used_rel_paths)} used image paths.")

def move_unused(dir_path):
    for item in dir_path.iterdir():
        if item.name == "Old_Box":
            continue
        if item.is_dir():
            move_unused(item)
        else:
            # Check if this file is used
            rel_path = item.relative_to(BASE_DIR)
            if str(rel_path) not in used_rel_paths:
                # Not used! Move to Old_Box
                # Keep some structure if needed? No, just put in Old_Box with flat names if possible,
                # but to avoid conflicts we use original-ish names.
                target_name = str(rel_path).replace("/", "_")
                print(f"Moving: {rel_path} -> Old_Box/{target_name}")
                item.rename(OLD_BOX / target_name)

move_unused(BASE_DIR / "images" / "iq")
print("Cleanup done!")
