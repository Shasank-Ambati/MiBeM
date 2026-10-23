#!/usr/bin/env python3
"""Insert a course code into the learning path right after another code:  python tools/path_insert.py "LAB 502" "CMS 502" """
import json, sys
from pathlib import Path
p = Path(__file__).resolve().parent.parent / "assets" / "topics.js"
s = p.read_text(encoding="utf-8")
k = "window.MIBEM_PATHPLAN = "
a = s.index(k) + len(k); b = s.index("];", a) + 1
plan = json.loads(s[a:b])
new, after = sys.argv[1], sys.argv[2]
for sec in plan:
    if new in sec["courses"]:
        raise SystemExit(f"{new} is already on the path")
for sec in plan:
    if after in sec["courses"]:
        sec["courses"].insert(sec["courses"].index(after) + 1, new)
        break
else:
    raise SystemExit(f"{after} is not on the path")
p.write_text(s[:a] + json.dumps(plan, indent=2, ensure_ascii=False) + s[b:], encoding="utf-8")
print("inserted", new, "after", after)
