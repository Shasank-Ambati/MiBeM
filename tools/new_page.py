#!/usr/bin/env python3
"""Turn a module source file into a complete topic page in computational/.

    python tools/new_page.py path/to/source.html

The source starts with a small header, then the article body (from the lead paragraph
to the references):

    ---
    slug: vector-calculus
    description: One-sentence summary used for search engines and link previews.
    takeaways:
    - First key takeaway.
    - Second key takeaway.
    ---
    <p class="lead">...</p>
    <div class="callout">...</div>
    <h2 id="first">1. First section</h2>
    ...
    <h2 id="check">9. Problems</h2>
    ...

The slug must already exist in assets/topics.js (see tools/add_course.py). The
script writes the page (table of contents built from the h2 headings), updates the
takeaways in topics.js, and leaves the rest to `python tools/build.py`.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOPICS_JS = ROOT / "assets" / "topics.js"


def load():
    """Returns (text before the topic array, the topics, text after it: the planned-course list)."""
    text = TOPICS_JS.read_text(encoding="utf-8")
    key = "window.MIBEM_TOPICS = "
    i = text.index(key) + len(key)
    j = text.index("];", i) + 1
    return text[:i - len(key)], json.loads(text[i:j]), text[j + 1:]


def parse(src):
    m = re.match(r"---\n(.*?)\n---\n(.*)", src, re.S)
    if not m:
        raise SystemExit("source must start with a --- header block")
    meta, body = {"takeaways": []}, m.group(2)
    key = None
    for line in m.group(1).splitlines():
        if line.startswith("- ") and key == "takeaways":
            meta["takeaways"].append(line[2:].strip())
        elif ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            if key != "takeaways":
                meta[key] = val.strip()
    return meta, body


SKELETON = """<!DOCTYPE html>
<html lang="en">
<head>
    <title>{title} - MiBeM</title>
    <meta name="description" content="{desc}">
</head>
<body data-topic="{id}">
    <header class="site"></header>

    <div class="wrap">
    <div class="layout">

        <aside class="toc">
            <strong>On this page</strong>
            <ol>
{toc}
            </ol>
        </aside>

        <article id="main">
            <p class="crumbs"></p>
            <h1>{title}</h1>
{body}

            <nav class="pager"></nav>
        </article>

    </div>
    </div>

    <footer class="site"></footer>
</body>
</html>
"""


MATH = re.compile(r"\$\$.*?\$\$|\$[^$\n]*?\$|\$[^$]*?\$", re.S)


def escape_math(body):
    """Write raw TeX in the source: &, < and > inside $...$ / $$...$$ are escaped for HTML here."""
    def breakable(t):
        """Long inline formulas cannot wrap on a phone: split them into separate formulas at each top-level comma, so the line can break there."""
        out, depth, prev = [], 0, ""
        for ch in t[1:-1]:
            depth += ch in "([{"
            depth = max(0, depth - (ch in ")]}"))
            out.append("$, $" if ch == "," and depth == 0 and prev != "\\" else ch)   # \, is a thin space, not a comma
            prev = ch
        return ("$" + "".join(out) + "$").replace("$ $", "$ $").replace("$, $ ", "$, $")

    def fix(m):
        t = m.group(0)
        if not t.startswith("$$") and len(t) > 26:
            t = breakable(t)
        t = re.sub(r"&(?!(amp|lt|gt|nbsp|[a-z]+|#\d+);)", "&amp;", t)
        return t.replace("<", "&lt;").replace(">", "&gt;")
    # code listings may contain $, &, < and > (shell variables, LAMMPS ${vars}); leave <pre> blocks untouched
    pieces = re.split(r"(<pre.*?</pre>)", body, flags=re.S)
    out = "".join(pc if pc.startswith("<pre") else MATH.sub(fix, pc) for pc in pieces)
    stripped = re.sub(r"\$\$", "", re.sub(r"<pre.*?</pre>|<code>.*?</code>", "", out, flags=re.S))
    if stripped.count("$") % 2:
        print("WARNING: odd number of $ signs; check for an unclosed formula or a stray dollar")
    return out


def main(path):
    meta, body = parse(Path(path).read_text(encoding="utf-8"))
    body = escape_math(body)
    header, topics, tail = load()
    t = next((x for x in topics if x["slug"] == meta["slug"]), None)
    if t is None:
        raise SystemExit(f"slug {meta['slug']!r} is not in assets/topics.js")
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.S)
    toc = "\n".join(f'                <li><a href="#{i}">{re.sub(r"<a .*", "", h).strip()}</a></li>' for i, h in heads)
    body = "\n".join(("            " + ln) if ln.strip() else ln for ln in body.strip("\n").splitlines())
    esc = lambda s: s.replace("&", "&amp;").replace('"', "&quot;")
    page = SKELETON.format(title=t["title"].replace("&", "&amp;"), desc=esc(meta["description"]), id=t["id"], toc=toc, body=body)
    (ROOT / "computational" / f"{t['slug']}.html").write_text(page, encoding="utf-8")
    if meta["takeaways"]:
        t["takeaways"] = meta["takeaways"]
        TOPICS_JS.write_text(header + "window.MIBEM_TOPICS = " + json.dumps(topics, indent=2, ensure_ascii=False) + ";" + tail, encoding="utf-8")
    print("wrote", t["slug"], f"({len(heads)} sections, {len(meta['takeaways'])} takeaways)")


if __name__ == "__main__":
    for p in sys.argv[1:] or sys.exit(__doc__):
        main(p)
