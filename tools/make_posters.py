#!/usr/bin/env python3
"""Create a still PNG ("poster") for every animation in assets/animations/.

The site shows the poster when a visitor presses "Pause animation" or has asked
their system to reduce motion. Run this only when an animation is added or changed:

    python tools/make_posters.py

Needs Pillow (for GIFs) and a Chromium-based browser such as Edge or Chrome (for SVGs).
Set BROWSER to the browser executable if it is not found automatically.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ANIM = ROOT / "assets" / "animations"


def find_browser():
    cand = [os.environ.get("BROWSER", "")]
    cand += [r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
             r"C:\Program Files\Google\Chrome\Application\chrome.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    cand += [shutil.which(n) or "" for n in ("msedge", "google-chrome", "chromium", "chrome")]
    for c in cand:
        if c and Path(c).exists():
            return c
    return None


def gif_poster(path):
    im = Image.open(path)
    n = im.n_frames
    im.seek(int(n * 0.6))
    im.convert("RGB").save(path.with_suffix(".poster.png"), optimize=True)


def svg_poster(path, browser):
    text = path.read_text(encoding="utf-8")
    m = re.search(r'viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"', text)
    w, h = int(float(m.group(1))), int(float(m.group(2)))
    with tempfile.TemporaryDirectory() as td:
        page = Path(td) / "p.html"
        page.write_text(f'<html><body style="margin:0;background:#fff"><img src="{path.resolve().as_uri()}" width="{w}" height="{h}" style="display:block"></body></html>', encoding="utf-8")
        out = path.with_suffix(".poster.png")
        subprocess.run([browser, "--headless", "--disable-gpu", "--hide-scrollbars", f"--window-size={w},{h}", "--virtual-time-budget=2500",
                        f"--screenshot={out}", page.as_uri()], capture_output=True, timeout=120)


def main():
    browser = find_browser()
    for p in sorted(ANIM.iterdir()):
        if p.name.endswith(".poster.png"):
            continue
        if p.suffix == ".gif":
            gif_poster(p)
            print("poster:", p.name)
        elif p.suffix == ".svg":
            if not browser:
                print("skipped (no browser found):", p.name)
                continue
            svg_poster(p, browser)
            print("poster:", p.name)


if __name__ == "__main__":
    sys.exit(main())
