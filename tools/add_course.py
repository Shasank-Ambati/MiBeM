#!/usr/bin/env python3
"""Register a new course in assets/topics.js, taking over its entry in the planned list.

    python tools/add_course.py "PHYS 101" classical-mechanics "Classical mechanics" --short "Classical mechanics" \
        --builds "MATH 101" --blurb "One-sentence description." [--katex]

Afterwards write the page source and run  python tools/new_page.py source.html  then  python tools/build.py.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOPICS_JS = ROOT / "assets" / "topics.js"
PART = {"MATH": "Mathematics", "PHYS": "Physics", "MSE": "Materials science", "COMP": "Computing", "CMS": "Computational methods"}


def split():
    text = TOPICS_JS.read_text(encoding="utf-8")
    k1, k2 = "window.MIBEM_TOPICS = ", "window.MIBEM_PLANNED = "
    a = text.index(k1) + len(k1)
    b = text.index("];", a) + 1
    c = text.index(k2) + len(k2)
    d = text.index("];", c) + 1
    return text[:a - len(k1)], json.loads(text[a:b]), text[b + 1:c - len(k2)], json.loads(text[c:d]), text[d + 1:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("code")
    ap.add_argument("slug")
    ap.add_argument("title")
    ap.add_argument("--short", required=True)
    ap.add_argument("--blurb")
    ap.add_argument("--builds", default="", help="comma-separated course codes")
    ap.add_argument("--katex", action="store_true")
    ap.add_argument("--tone", default="a")
    a = ap.parse_args()
    h, topics, mid, planned, tail = split()
    if any(t["code"] == a.code for t in topics):
        raise SystemExit(f"{a.code} already exists")
    by_code = {t["code"]: t for t in topics}
    pl = next((p for p in planned if p["code"] == a.code), None)
    builds = [by_code[c.strip()]["id"] for c in a.builds.split(",") if c.strip()]
    dept = a.code.split()[0]
    entry = {
        "id": max(t["id"] for t in topics) + 1, "label": a.code, "code": a.code, "dept": dept, "level": int(a.code.split()[1][0]),
        "slug": a.slug, "short": a.short, "part": PART[dept], "tone": a.tone, "minutes": 10, "title": a.title,
        "blurb": a.blurb or (pl["blurb"] if pl else ""), "builds": builds, "related": [], "takeaways": [],
    }
    if a.katex:
        entry["katex"] = True
    topics.append(entry)
    order = {"MATH": 0, "PHYS": 1, "MSE": 2, "COMP": 3, "CMS": 4}
    topics.sort(key=lambda t: (t["level"] if t["code"] != "MATH 100" else 0, order[t["dept"]], int(t["code"].split()[1])))
    planned = [p for p in planned if p["code"] != a.code]
    TOPICS_JS.write_text(h + "window.MIBEM_TOPICS = " + json.dumps(topics, indent=2, ensure_ascii=False) + ";" + mid
                         + "window.MIBEM_PLANNED = " + json.dumps(planned, indent=2, ensure_ascii=False) + ";" + tail, encoding="utf-8")
    print("added", a.code, "id", entry["id"])


if __name__ == "__main__":
    main()
