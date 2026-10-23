#!/usr/bin/env python3
"""Mark a course page as using maths (KaTeX): python tools/set_katex.py slug [slug ...]"""
import re, sys
p = "assets/topics.js"; s = open(p).read()
for slug in sys.argv[1:]:
    i = s.index('"slug": "%s"' % slug)
    end = s.index("\n  }", i)                       # end of this topic object
    seg = s[i:end]
    if '"katex"' in seg:
        print(slug, "already has katex flag"); continue
    s = s[:end] + ',\n    "katex": true' + s[end:]
    print(slug, "katex enabled")
open(p, "w").write(s)
