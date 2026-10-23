#!/usr/bin/env python3
"""Regenerate the repetitive parts of the MiBeM site from assets/topics.js.

Run from anywhere:   python tools/build.py

What it does (it is idempotent, so it is safe to run repeatedly):
  * every topic page: <head> tags, header, footer, scripts, breadcrumb, the
    "builds on / leads to" strip, the key-takeaways box, previous/next links
  * index.html: <head>, header, footer, topic cards, topic-map fallback list
  * map.html: the whole page
  * sitemap.xml and assets/search-index.js
  * reading times (written back into assets/topics.js)

The article text itself is never touched. Add a topic by creating its HTML file
in computational/ (copy an existing page for the structure), adding an entry to
assets/topics.js, and running this script.
"""
import hashlib
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://shasank-ambati.github.io/MiBeM/"
WPM = 200

# ----------------------------------------------------------------- data
TOPICS_JS = ROOT / "assets" / "topics.js"


def _load_array(name):
    text = TOPICS_JS.read_text(encoding="utf-8")
    start = text.index(f"window.{name} = ") + len(f"window.{name} = ")
    end = text.index("];", start) + 1
    return json.loads(text[start:end])


def load_topics():
    return _load_array("MIBEM_TOPICS")


TOPICS = load_topics()
PLANNED = _load_array("MIBEM_PLANNED")
PATHPLAN = _load_array("MIBEM_PATHPLAN")
BY_ID = {t["id"]: t for t in TOPICS}
BY_CODE = {t["code"]: t for t in TOPICS}
for t in TOPICS:
    t["path"] = f"computational/{t['slug']}.html"
    t["math"] = t["dept"] == "MATH" or bool(t.get("katex"))

LEVELS = {
    1: ("Year 1: foundations", "Calculus, linear algebra, physics, materials and programming from first principles. If you are new to university science, start here."),
    2: ("Year 2: core tools", "The mathematics and science that every later course relies on: vector calculus, differential equations, probability, crystal structure and numerical methods."),
    3: ("Year 3: advanced theory", "Partial differential equations, tensors, statistics, variational methods, statistical mechanics and thermodynamics of materials."),
    4: ("Year 4: the field", "A first look at computational materials science: what the methods are, what they can predict and where they fail."),
    5: ("Graduate: simulation methods", "The methods themselves, one course each: density functional theory, molecular dynamics, Monte Carlo, kinetics, phase-field, finite elements and machine learning."),
    7: ("Doctoral: research topics", "Advanced and specialist courses for research. These are planned and will be added over time."),
}
DEPTS = {"MATH": "Mathematics", "PHYS": "Physics", "MSE": "Materials science", "COMP": "Computing", "CMS": "Computational methods"}


def lab(t):
    """Course code such as MATH 101."""
    return t["code"]


def label_text(t):
    return t["code"]


def dept_courses(t):
    """Courses of the same department, in code order: the 'previous / next course' sequence."""
    return sorted((x for x in TOPICS if x["dept"] == t["dept"]), key=lambda x: int(x["code"].split()[1]))


def esc(s):
    return html.escape(s, quote=True)


def ver(rel):
    """Short content hash used as ?v= on asset URLs, so browsers never pair new HTML with a stale cached asset."""
    return hashlib.md5((ROOT / rel).read_bytes()).hexdigest()[:8]


def img_size(path):
    """Width and height of a GIF or SVG, read without extra libraries."""
    if path.suffix == ".gif":
        b = path.read_bytes()[:10]
        return int.from_bytes(b[6:8], "little"), int.from_bytes(b[8:10], "little")
    if path.suffix == ".svg":
        m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', path.read_text(encoding="utf-8"))
        if m:
            return int(float(m.group(1))), int(float(m.group(2)))
    return None


def wrap_tables(s):
    """Put every table in a focusable, labelled scroll region so keyboard users can scroll it."""
    s = re.sub(r'<div class="table-scroll"[^>]*>(<table.*?</table>)</div>', r'\1', s, flags=re.S)
    heads = [(m.start(), re.sub(r"<[^>]+>|#", "", m.group(2)).strip()) for m in re.finditer(r"<(h2|h3)[^>]*>(.*?)</\1>", s, re.S)]

    def fix(m):
        label = "Table"
        for hp, ht in heads:
            if hp < m.start():
                label = html.unescape(ht)
        return f'<div class="table-scroll" role="region" aria-label="{esc(label)} (scrollable table)" tabindex="0">{m.group(0)}</div>'
    return re.sub(r"<table.*?</table>", fix, s, flags=re.S)


def add_anchors(s):
    """Add a hover link (#) to every h2/h3 that has an id and does not already have one."""
    def fix(m):
        tag, hid, inner = m.group(1), m.group(2), m.group(3)
        if 'class="anchor"' in inner:
            return m.group(0)
        return f'<{tag} id="{hid}">{inner}<a class="anchor" href="#{hid}" aria-label="Link to this section">#</a></{tag}>'
    return re.sub(r'<(h2|h3) id="([^"]+)">(.*?)</\1>', fix, s, flags=re.S)


def add_img_attrs(s, page_dir, lazy=True):
    """Give animation images explicit sizes (no layout jump) and, below the fold, lazy loading."""
    s = re.sub(r'<picture><source[^>]*>(<img[^>]*>)</picture>', r'\1', s)  # idempotent: unwrap first

    def fix(m):
        src, alt = m.group(1), m.group(2)
        p = (page_dir / src).resolve()
        if not p.exists():
            return m.group(0)
        size = img_size(p)
        dims = f' width="{size[0]}" height="{size[1]}"' if size else ""
        lz = ' loading="lazy" decoding="async"' if lazy else ""
        img = f'<img src="{src}" alt="{alt}"{dims}{lz}>'
        poster_src = re.sub(r"\.(gif|svg)$", ".poster.png", src)
        if (page_dir / poster_src).resolve().exists():
            return f'<picture><source media="(prefers-reduced-motion: reduce)" srcset="{poster_src}">{img}</picture>'
        return img
    return re.sub(r'<img src="([^"]*assets/animations/[^"]+)" alt="([^"]*)"[^>]*>', fix, s)


# ----------------------------------------------------------------- templates
def head(rel, title, desc, url, og_type="article", math=False):
    return f"""<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{url}">
    <meta name="theme-color" content="#2b6cb0">
    <meta property="og:type" content="{og_type}">
    <meta property="og:site_name" content="MiBeM">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{BASE}assets/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/svg+xml" href="{rel}assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="{rel}assets/favicon-32.png">
    <link rel="icon" sizes="48x48" href="{rel}assets/favicon.ico">
    <link rel="apple-touch-icon" href="{rel}assets/apple-touch-icon.png">
    <link rel="manifest" href="{rel}site.webmanifest">
    <script>try{{var t=localStorage.getItem("mibem-theme");if(t)document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
    <link rel="stylesheet" href="{rel}assets/style.css?v={ver('assets/style.css')}">{katex_css(rel) if math else ""}
</head>"""


def katex_css(rel):
    return f'\n    <link rel="stylesheet" href="{rel}assets/katex/katex.min.css?v={ver("assets/katex/katex.min.css")}">'


def NAV(rel):
    return [(rel + "path.html", "Learning path"), (rel + "curriculum.html", "Curriculum"), (rel + "map.html", "Map"), (rel + "glossary.html", "Glossary"), (rel + "index.html#about", "About")]


def header(rel, links, cta=None):
    nav = "".join(f'<a href="{href}">{label}</a>' for href, label in links)
    if cta:
        nav += f'<a class="cta" href="{cta[0]}">{cta[1]}</a>'
    return f"""<a class="skip" href="#main">Skip to content</a>
    <header class="site"><div class="bar">
        <a class="brand" href="{rel}index.html"><img src="{rel}assets/logo.svg" alt="" width="28" height="28">MiBeM</a>
        <nav>{nav}</nav>
    </div></header>"""


def footer(rel):
    return f"""<footer class="site"><div class="inner">
        <div><b>MiBeM</b><p>A free university curriculum in computational materials science, from first-year foundations to graduate methods.</p></div>
        <nav><a href="{rel}curriculum.html">Curriculum</a><a href="{rel}map.html">Prerequisite map</a><a href="{rel}glossary.html">Glossary</a><a href="#main">Back to top</a></nav>
    </div></footer>"""


def scripts(rel, demos=False, math=False):
    s = ""
    if math:
        s += (f'<script src="{rel}assets/katex/katex.min.js?v={ver("assets/katex/katex.min.js")}"></script>\n'
              f'    <script src="{rel}assets/katex/auto-render.min.js?v={ver("assets/katex/auto-render.min.js")}"></script>\n'
              f'    <script src="{rel}assets/math.js?v={ver("assets/math.js")}"></script>\n    ')
    s += (f'<script src="{rel}assets/topics.js?v={ver("assets/topics.js")}"></script>\n'
         f'    <script src="{rel}assets/pathdata.js?v={ver("assets/pathdata.js")}"></script>\n'
         f'    <script src="{rel}assets/glossary.js?v={ver("assets/glossary.js")}"></script>\n'
         f'    <script src="{rel}assets/site.js?v={ver("assets/site.js")}" defer></script>\n'
         f'    <script src="{rel}assets/learn.js?v={ver("assets/learn.js")}" defer></script>')
    if demos:
        s += f'\n    <script src="{rel}assets/demos.js?v={ver("assets/demos.js")}" defer></script>'
        if math:
            s += f'\n    <script src="{rel}assets/mathdemos.js?v={ver("assets/mathdemos.js")}" defer></script>'
    return s


def links_html(ids, rel_prefix="", empty="none"):
    if not ids:
        return empty
    return "<br>".join(f'<a href="{rel_prefix}{BY_ID[i]["slug"]}.html">{lab(BY_ID[i])}: {esc(BY_ID[i]["short"])}</a>' for i in ids)


def region(name, content):
    return f"<!-- {name}:start -->\n{content}\n<!-- {name}:end -->"


def replace_region(s, name, content):
    pat = re.compile(rf"<!-- {name}:start -->.*?<!-- {name}:end -->", re.S)
    return pat.sub(lambda m: region(name, content), s, count=1)


def has_region(s, name):
    return f"<!-- {name}:start -->" in s


# ----------------------------------------------------------------- topic pages
def minutes_of(article_html):
    a = re.sub(r"<!-- (facts|takeaways|pager):start -->.*?<!-- \1:end -->", "", article_html, flags=re.S)
    a = re.sub(r"<script.*?</script>", "", a, flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", a))
    return max(5, round(len(text.split()) / WPM))


def build_topic(t, i):
    path = ROOT / t["path"]
    s = path.read_text(encoding="utf-8")
    rel = "../"
    title = re.search(r"<title>(.*?)</title>", s).group(1)
    desc = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
    url = BASE + t["path"]

    art = re.search(r"<article.*?</article>", s, re.S).group(0)
    t["minutes"] = minutes_of(art)

    seq = dept_courses(t)
    k = seq.index(t)
    prev_t = seq[k - 1] if k > 0 else None
    next_t = seq[k + 1] if k + 1 < len(seq) else None
    leads = [x["id"] for x in TOPICS if t["id"] in x["builds"]]

    math = t["math"]
    s = re.sub(r"<head>.*?</head>", lambda m: head(rel, title, desc, url, math=math), s, count=1, flags=re.S)
    s = re.sub(r"<body[^>]*>", f'<body data-topic="{t["id"]}">', s, count=1)
    cta = None
    hdr = header(rel, NAV(rel), cta)
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)

    crumbs = (f'<p class="crumbs"><a href="{rel}curriculum.html">Curriculum</a><span>/</span>'
              f'<span class="chip{" blue" if t["tone"] == "b" else ""}">{esc(t["part"])}</span><span>{label_text(t)}</span></p>')
    s, n = re.subn(r'<p class="crumbs">.*?</p>', lambda m: crumbs, s, count=1, flags=re.S)
    assert n == 1, f"no breadcrumb in {t['slug']}"
    s = s.replace("<article>", '<article id="main">', 1)

    chips = "".join(f'<a href="{x["slug"]}.html"{" class=\"here\" aria-current=\"page\"" if x["id"] == t["id"] else ""} title="{esc(x["code"] + ": " + x["title"])}">{x["code"].split()[1]}</a>'
                    for x in seq)
    cnav = f'<nav class="course-nav" aria-label="{DEPTS[t["dept"]]} courses"><span class="cn-dept">{t["dept"]}</span>{chips}</nav>'
    if has_region(s, "coursenav"):
        s = replace_region(s, "coursenav", cnav)
    else:
        s = re.sub(r'(<p class="crumbs">.*?</p>)', lambda m: m.group(1) + "\n            " + region("coursenav", cnav), s, count=1, flags=re.S)

    # facts strip after the lead paragraph
    builds = links_html(t["builds"], empty="Nothing: this is the place to start")
    facts = (f'<dl class="facts">\n'
             f'<div><dt>Reading time</dt><dd>about {t["minutes"]} min</dd></div>\n'
             f'<div><dt>Builds on</dt><dd>{builds}</dd></div>\n'
             f'<div><dt>Leads to</dt><dd>{links_html(leads, empty="&mdash;")}</dd></div>\n'
             f'<div><dt>Level</dt><dd>{esc(LEVELS[t["level"]][0])}</dd></div>\n</dl>')
    if has_region(s, "facts"):
        s = replace_region(s, "facts", facts)
    else:
        s, n = re.subn(r'(<p class="lead">.*?</p>)', lambda m: m.group(1) + "\n\n            " + region("facts", facts), s, count=1, flags=re.S)
        assert n == 1, f"no lead paragraph in {t['slug']}"

    # key takeaways before the check section
    lis = "\n".join(f"<li>{esc(x)}</li>" for x in t["takeaways"])
    take = f'<div class="takeaways"><strong>Key takeaways</strong>\n<ul>\n{lis}\n</ul></div>'
    if has_region(s, "takeaways"):
        s = replace_region(s, "takeaways", take)
    else:
        s, n = re.subn(r'(<h2 id="check")', lambda m: region("takeaways", take) + "\n\n            " + m.group(1), s, count=1)
        assert n == 1, f"no check section in {t['slug']}"

    # pager
    pv = (f'<a class="prev" href="{prev_t["slug"]}.html"><span class="dir">Previous course</span>{esc(prev_t["title"])}</a>'
          if prev_t else '<span class="spacer"></span>')
    nx = (f'<a class="next" href="{next_t["slug"]}.html"><span class="dir">Next course</span>{esc(next_t["title"])}</a>'
          if next_t else '<span class="spacer"></span>')
    pager = f'<nav class="pager" aria-label="Previous and next course in this subject">\n{pv}\n{nx}\n</nav>'
    if has_region(s, "pager"):
        s = replace_region(s, "pager", pager)
    else:
        s, n = re.subn(r'<nav class="pager">.*?</nav>', lambda m: region("pager", pager), s, count=1, flags=re.S)
        assert n == 1, f"no pager in {t['slug']}"

    s = re.sub(r"<footer class=\"site\">.*?</footer>.*?</body>",
               lambda m: footer(rel) + "\n    " + scripts(rel, demos='class="demo"' in s, math=math) + "\n</body>", s, count=1, flags=re.S)
    s = add_img_attrs(s, path.parent)
    s = add_anchors(s)
    s = wrap_tables(s)
    path.write_text(s, encoding="utf-8")


# ----------------------------------------------------------------- landing + map
def card_html(t):
    bg = " bg" if t["dept"] == "MATH" else ""
    chip = " blue" if t["tone"] == "b" else ""
    d, n = t["code"].split()
    return f'''            <li><a class="topic-card" data-id="{t["id"]}" href="{t["path"]}">
                <span class="num{bg}"><small>{d}</small>{n}</span>
                <span class="title">{esc(t["title"])}</span>
                <span class="desc">{esc(t["blurb"])}</span>
                <span class="tags"><span class="chip{chip}">{esc(t["part"])}</span>{t["minutes"]} min read</span></a></li>'''


def cards():
    out = []
    for lv, (title, sub) in LEVELS.items():
        courses = [x for x in TOPICS if x["level"] == lv]
        if not courses:
            continue
        items = "\n".join(card_html(x) for x in courses)
        out.append(f'        <h3 class="group-title">{title}</h3>\n        <p class="section-sub">{sub}</p>\n        <ul class="topic-grid">\n{items}\n        </ul>')
    return "\n".join(out)


def fallback_list(rel_prefix):
    items = []
    for t in TOPICS:
        b = f' <span class="meta">builds on {", ".join(BY_ID[x]["code"] for x in t["builds"])}</span>' if t["builds"] else ""
        items.append(f'<li><a href="{rel_prefix}{t["path"]}">{lab(t)}: {esc(t["title"])}</a>{b}</li>')
    return "<ol>" + "".join(items) + "</ol>"


def build_index():
    path = ROOT / "index.html"
    s = path.read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", s).group(1)
    desc = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
    s = re.sub(r"<head>.*?</head>", lambda m: head("", title, desc, BASE, "website"), s, count=1, flags=re.S)
    hdr = header("", NAV(""), None)
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)
    s = replace_region(s, "cards", cards())
    s = replace_region(s, "map", '        <div id="topic-map">' + fallback_list("") + "</div>")
    s = re.sub(r"<footer class=\"site\">.*?</footer>.*?</body>", lambda m: footer("") + "\n    " + scripts("") + "\n</body>", s, count=1, flags=re.S)
    s = add_img_attrs(s, ROOT, lazy=False)
    path.write_text(s, encoding="utf-8")


def build_curriculum():
    title = "Curriculum - MiBeM"
    desc = "A free, self-contained university curriculum in computational materials science, from first-year mathematics and physics to graduate simulation methods."
    hdr = header("", NAV(""), None)

    def needs_html(codes):
        out = []
        for c in codes:
            tt = BY_CODE.get(c)
            out.append(f'<a href="computational/{tt["slug"]}.html">{c}</a>' if tt else f'<span class="muted">{c}</span>')
        return ", ".join(out) or "&mdash;"

    sections = []
    for lv, (ltitle, lsub) in LEVELS.items():
        if not any(x["level"] == lv for x in TOPICS) and not any(x["level"] == lv for x in PLANNED):
            continue
        rows = []
        for tt in TOPICS:
            if tt["level"] != lv:
                continue
            rows.append(f'<tr><td class="code">{tt["code"]}</td><td><a href="computational/{tt["slug"]}.html">{esc(tt["title"])}</a><span class="cdesc">{esc(tt["blurb"])}</span></td>'
                        f'<td>{esc(tt["part"])}</td><td>{needs_html([BY_ID[b]["code"] for b in tt["builds"]])}</td><td>{tt["minutes"]} min</td></tr>')
        for pl in PLANNED:
            if pl["level"] == lv:
                rows.append(f'<tr class="planned"><td class="code">{pl["code"]}</td><td>{esc(pl["title"])} <span class="chip">In preparation</span><span class="cdesc">{esc(pl["blurb"])}</span></td>'
                            f'<td>{esc(DEPTS[pl["dept"]])}</td><td>{needs_html(pl["needs"])}</td><td>&mdash;</td></tr>')
        rows.sort(key=lambda r: re.search(r'class="code">(\w+) (\d+)', r).groups()[::-1])
        sections.append(f'''        <h2 id="level-{lv}">{ltitle}</h2>
        <p class="section-sub">{lsub}</p>
        <div class="table-scroll" role="region" aria-label="{ltitle} (scrollable table)" tabindex="0"><table class="curric">
            <thead><tr><th>Code</th><th>Course</th><th>Subject</th><th>Needs</th><th>Reading</th></tr></thead>
            <tbody>
{chr(10).join(rows)}
            </tbody></table></div>''')

    subj = []
    for d, dn in DEPTS.items():
        items = [tt for tt in TOPICS if tt["dept"] == d] + [pl for pl in PLANNED if pl["dept"] == d]
        items.sort(key=lambda x: int(x["code"].split()[1]))
        lis = "".join((f'<li><a href="computational/{x["slug"]}.html">{x["code"]} {esc(x["title"])}</a></li>' if "slug" in x else f'<li class="muted">{x["code"]} {esc(x["title"])} (in preparation)</li>') for x in items)
        subj.append(f'<div class="subj"><h3>{dn}</h3><ol class="subj-list">{lis}</ol></div>')

    page = f"""<!DOCTYPE html>
<html lang="en">
{head("", title, desc, BASE + "curriculum.html", "website")}
<body>
    {hdr}

    <main class="wrap" id="main">
        <p class="crumbs"><a href="index.html">Home</a><span>/</span><span>Curriculum</span></p>
        <h1>Curriculum</h1>
        <p class="lead">This is the catalogue. If you would rather be guided, the <a href="path.html">learning path</a> puts every course and lesson in one recommended order with progress tracking. A free university curriculum in computational materials science. It starts at first-year level, so that a new university student can begin here, and runs up to graduate research methods. Each course teaches the concepts it needs, includes worked examples and problems with solutions, and lists the courses it builds on.</p>

        <h2 id="how">How the courses are numbered</h2>
        <p>Course codes follow the usual university pattern: a subject, then a three-digit number whose first digit is the level.</p>
        <ul>
            <li><strong>Subject:</strong> MATH mathematics; PHYS physics; MSE materials science and engineering; COMP computing and numerical methods; CMS computational materials science.</li>
            <li><strong>Level (first digit):</strong> 1 Year 1; 2 Year 2; 3 Year 3; 4 Year 4; 5 graduate. Doctoral-level courses (7) are planned for later.</li>
        </ul>
        <p>Within a subject, work through the courses in number order; across subjects, the <strong>Needs</strong> column says what to have finished first. Year 1 courses assume only school mathematics and science. A course numbered 100 (such as MATH 100) is a guide to its subject rather than a lecture course.</p>

        <h2 id="paths">Where to start</h2>
        <ul>
            <li><strong>New to university science.</strong> Begin with Year 1: <a href="computational/calculus-single-variable.html">MATH 101</a> and <a href="computational/linear-algebra-foundations.html">MATH 103</a> together, with <a href="computational/materials-science-essentials.html">MSE 101</a> and <a href="computational/programming-and-workflow.html">COMP 101</a>. The <a href="computational/maths-course-overview.html">mathematics guide</a> has a short placement check.</li>
            <li><strong>You have a science or engineering degree.</strong> Use the placement check in the mathematics guide to skip what you know, then take the Year 2 and Year 3 courses you are missing and move on to Year 4 and the graduate courses.</li>
            <li><strong>You want a particular method.</strong> Open its graduate course (CMS 5xx) and follow the <strong>Needs</strong> links backwards, or use the <a href="map.html">prerequisite map</a>.</li>
        </ul>

{chr(10).join(sections)}

        <h2 id="subjects">By subject</h2>
        <p class="section-sub">The same courses grouped by subject, in the order to take them.</p>
        <div class="subj-grid">
            {"".join(subj)}
        </div>
    </main>

    {footer("")}
    {scripts("")}
</body>
</html>
"""
    (ROOT / "curriculum.html").write_text(page, encoding="utf-8")


def build_pathdata():
    """assets/pathdata.js: the learning path (sections, units = courses, lessons = the entries of each page's contents list)."""
    by_code = {t["code"]: t for t in TOPICS}
    planned = {p["code"]: p for p in PLANNED}
    sections = []
    for sec in PATHPLAN:
        units = []
        for code in sec["courses"]:
            if code in by_code:
                t = by_code[code]
                page = (ROOT / t["path"]).read_text(encoding="utf-8")
                toc = re.search(r'<aside class="toc">.*?</aside>', page, re.S).group(0)
                lessons = []
                for hid, title in re.findall(r'<li><a href="#([^"]+)">(.*?)</a></li>', toc, re.S):
                    if hid in ("refs", "glossary") or hid.startswith("summary"):
                        continue
                    title = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", title))).strip()
                    title = re.sub(r"^\d+\.\s*", "", title)
                    lessons.append({"id": hid, "t": title})
                units.append({"code": code, "slug": t["slug"], "title": t["title"], "blurb": t["blurb"], "min": t["minutes"],
                              "needs": [BY_ID[b]["code"] for b in t["builds"]], "lessons": lessons})
            else:
                pl = planned[code]
                units.append({"code": code, "slug": None, "title": pl["title"], "blurb": pl["blurb"], "min": 0, "needs": pl["needs"], "lessons": []})
        sections.append({"name": sec["name"], "sub": sec["sub"], "units": units})
    out = "window.MIBEM_PATHDATA = " + json.dumps(sections, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "pathdata.js").write_text(out, encoding="utf-8")
    return sections


def build_path(sections):
    title = "Learning Path - MiBeM"
    desc = "A single path through the whole curriculum: sections, units and lessons, with progress, streaks and a continue button."
    hdr = header("", NAV(""), None)
    fallback = "".join(
        f'<h3>{html.escape(sec["name"])}</h3><ol>' + "".join(
            (f'<li><a href="computational/{u["slug"]}.html">{u["code"]}: {html.escape(u["title"])}</a></li>' if u["slug"]
             else f'<li>{u["code"]}: {html.escape(u["title"])} (in preparation)</li>') for u in sec["units"]) + "</ol>"
        for sec in sections)
    page = f"""<!DOCTYPE html>
<html lang="en">
{head("", title, desc, BASE + "path.html", "website")}
<body>
    {hdr}

    <main class="wrap wide" id="main">
        <p class="crumbs"><a href="index.html">Home</a><span>/</span><span>Learning path</span></p>
        <h1>Learning path</h1>
        <p class="lead">One path through everything. Each unit is a course and each circle is a lesson: a lecture, a problem set or a quiz. Work from the top; the highlighted circle is your next step, and every lesson ends with a button that takes you to the next one, across course boundaries. Progress is stored only in this browser.</p>
        <div id="learn-path"><noscript><p>The interactive path needs JavaScript. Here are the courses in order:</p>{fallback}</noscript></div>
        <p class="meta">Already know a unit? Use &ldquo;I know this&rdquo; on it to mark its lessons done. The <a href="curriculum.html">curriculum page</a> lists the same courses as a catalogue, and the <a href="map.html">prerequisite map</a> shows how they depend on each other.</p>
    </main>

    {footer("")}
    {scripts("")}
</body>
</html>
"""
    (ROOT / "path.html").write_text(page, encoding="utf-8")


def build_map():
    title = "Prerequisite Map - MiBeM"
    desc = "How the courses build on each other: prerequisites and what each course leads to."
    hdr = header("", NAV(""), None)
    page = f"""<!DOCTYPE html>
<html lang="en">
{head("", title, desc, BASE + "map.html", "website")}
<body>
    {hdr}

    <main class="wrap" id="main">
        <p class="crumbs"><a href="index.html">Home</a><span>/</span><span>Prerequisite map</span></p>
        <h1>Prerequisite map</h1>
        <p class="lead">Every course builds on a few others. Follow the arrows from the top to see a sensible order, or jump straight to the course you need and read what it assumes. The <a href="curriculum.html">curriculum page</a> lists the same courses by level.</p>

        <div id="topic-map">{fallback_list("")}</div>

        <h2>How to read the map</h2>
        <ul>
            <li><strong>Orange lines</strong> lead from a course back to what it builds on; <strong>blue lines</strong> lead forward to what it unlocks.</li>
            <li><strong>Dashed related links</strong> mark courses that connect without being required.</li>
            <li>A tick on a course means you have read most of that page on this device. The record stays in your browser only, and can be cleared with the link in the footer.</li>
        </ul>
    </main>

    {footer("")}
    {scripts("")}
</body>
</html>
"""
    (ROOT / "map.html").write_text(page, encoding="utf-8")


def build_404():
    """Served by GitHub Pages for any address that does not exist. Uses absolute URLs so it works at any depth."""
    rel = BASE
    hdr = header(rel, NAV(BASE), None)
    h = head(rel, "Page not found - MiBeM", "That page does not exist.", BASE + "404.html", "website")
    h = h.replace('<meta name="description"', '<meta name="robots" content="noindex">\n    <meta name="description"', 1)
    page = f"""<!DOCTYPE html>
<html lang="en">
{h}
<body>
    {hdr}

    <main class="wrap" id="main">
        <p class="crumbs"><span>Error 404</span></p>
        <h1>That page is not here</h1>
        <p class="lead">The address may be mistyped, or the page may have moved. These will get you back on track.</p>
        <p><a class="btn" href="{BASE}index.html#topics">Browse all topics</a> <a class="btn ghost" href="{BASE}map.html">Open the topic map</a></p>
        <p class="meta">You can also search every topic: press <strong>/</strong> on your keyboard.</p>
    </main>

    {footer(rel)}
    {scripts(rel)}
</body>
</html>
"""
    (ROOT / "404.html").write_text(page, encoding="utf-8")


def load_glossary():
    path = ROOT / "assets" / "glossary.js"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    body = text[text.index("window.MIBEM_GLOSSARY = ") + len("window.MIBEM_GLOSSARY = "):]
    body = body[: body.rindex("];") + 1]
    return json.loads(body)


def gslug(term):
    return re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")


def build_glossary():
    terms = sorted(load_glossary(), key=lambda g: g["t"].lower())
    title = "Glossary - MiBeM"
    desc = "Plain-language definitions of the terms used across the MiBeM topics, from atoms and bonds to eigenvalues and Monte Carlo."
    hdr = header("", NAV(""), None)
    letters = sorted({g["t"][0].upper() for g in terms})
    jump = " ".join(f'<a href="#letter-{c}">{c}</a>' for c in letters)
    groups = []
    for c in letters:
        items = []
        for g in [x for x in terms if x["t"][0].upper() == c]:
            link = f' <a class="gl-see" href="computational/{g["p"]}">Read more &rarr;</a>' if g.get("p") else ""
            items.append(f'<dt id="{gslug(g["t"])}">{esc(g["t"])}</dt><dd>{esc(g["d"])}{link}</dd>')
        groups.append(f'<h2 id="letter-{c}">{c}</h2>\n<dl class="glossary">' + "".join(items) + "</dl>")
    page = f"""<!DOCTYPE html>
<html lang="en">
{head("", title, desc, BASE + "glossary.html", "website")}
<body>
    {hdr}

    <main class="wrap" id="main">
        <p class="crumbs"><a href="index.html">Home</a><span>/</span><span>Glossary</span></p>
        <h1>Glossary</h1>
        <p class="lead">Plain-language definitions of the words used across the site. Terms in the topic pages are underlined with a dotted line: hover, focus or tap one to see its meaning without leaving the page.</p>
        <p class="gl-jump">{jump}</p>
        {chr(10).join(groups)}
    </main>

    {footer("")}
    {scripts("")}
</body>
</html>
"""
    (ROOT / "glossary.html").write_text(page, encoding="utf-8")
    return terms


# ----------------------------------------------------------------- search index + sitemap
BLOCK = {"p", "li", "td", "th", "dt", "dd", "summary", "tr", "div", "h1", "h2", "h3", "h4", "figcaption", "br", "ul", "ol", "table", "details", "pre", "aside", "dl", "figure"}
SKIP_CLASSES = ("crumbs", "facts", "demo")


class Sections(HTMLParser):
    def __init__(self, topic):
        super().__init__(convert_charrefs=True)
        self.topic = topic
        self.items = []
        self.cur = None
        self.in_article = False
        self.heading = None
        self.skip = 0
        self.anchor = 0
        self.page = topic["path"]
        self.skip_tag = None
        self.skip_depth = 0

    def start(self, h, hid):
        if self.cur and self.cur["x"].strip():
            self.items.append(self.cur)
        self.cur = {"n": self.topic["id"], "l": label_text(self.topic), "t": self.topic["title"], "h": h, "u": self.page + (f"#{hid}" if hid else ""), "x": ""}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth += 1
            return
        if self.in_article and any(c in (a.get("class") or "").split() for c in SKIP_CLASSES):
            self.skip_tag, self.skip_depth = tag, 1
            return
        if self.in_article and tag in BLOCK and self.cur is not None and self.heading is None:
            self.cur["x"] += " "
        if tag == "article":
            self.in_article = True
            self.start(self.topic["title"], "")
            return
        if not self.in_article:
            return
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "a" and "anchor" in (a.get("class") or ""):
            self.anchor += 1
        if tag in ("h2", "h3") and a.get("id"):
            self.heading = {"id": a["id"], "text": ""}
        if tag == "div" and "facts" in (a.get("class") or ""):
            pass

    def handle_endtag(self, tag):
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_depth -= 1
                if self.skip_depth == 0:
                    self.skip_tag = None
            return
        if self.in_article and tag in BLOCK and self.cur is not None and self.heading is None:
            self.cur["x"] += " "
        if not self.in_article:
            return
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
        if tag == "a" and self.anchor:
            self.anchor -= 1
        if tag in ("h2", "h3") and self.heading:
            self.start(self.heading["text"].strip(), self.heading["id"])
            self.heading = None
        if tag == "article":
            if self.cur and self.cur["x"].strip():
                self.items.append(self.cur)
            self.cur = None
            self.in_article = False

    def handle_data(self, data):
        if not self.in_article or self.skip or self.anchor:
            return
        if self.heading is not None:
            self.heading["text"] += data
        elif self.cur is not None:
            self.cur["x"] += data


def build_search():
    entries = []
    for t in TOPICS:
        p = Sections(t)
        p.feed((ROOT / t["path"]).read_text(encoding="utf-8"))
        for it in p.items:
            if t["math"]:
                it["x"] = re.sub(r"\\[a-zA-Z]+|[$\\{}^_]", " ", it["x"])
            it["x"] = re.sub(r"\s+", " ", it["x"]).strip()[:2400]
            entries.append(it)
    for g in load_glossary():
        entries.append({"n": 0, "l": "Glossary", "t": "Glossary", "h": g["t"], "u": "glossary.html#" + gslug(g["t"]), "x": g["d"]})
    out = "window.MIBEM_INDEX = " + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "search-index.js").write_text(out, encoding="utf-8")
    return len(entries), len(out)


def build_sitemap():
    urls = [BASE, BASE + "path.html", BASE + "curriculum.html", BASE + "map.html", BASE + "glossary.html"] + [BASE + t["path"] for t in TOPICS]
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{LASTMOD}</lastmod></url>\n" for u in urls)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n", encoding="utf-8")


def write_minutes():
    text = TOPICS_JS.read_text(encoding="utf-8")
    for t in TOPICS:
        text = re.sub(rf'("id": {t["id"]},.*?"minutes": )\d+', lambda m: m.group(1) + str(t["minutes"]), text, count=1, flags=re.S)
    TOPICS_JS.write_text(text, encoding="utf-8")


def write_manifest():
    m = {
        "name": "MiBeM", "short_name": "MiBeM",
        "description": "A reference series on computational materials science.",
        "start_url": "./", "scope": "./", "display": "browser",
        "background_color": "#fbfaf6", "theme_color": "#2b6cb0",
        "icons": [
            {"src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png"},
        ],
    }
    (ROOT / "site.webmanifest").write_text(json.dumps(m, indent=2) + "\n", encoding="utf-8")


import datetime
LASTMOD = datetime.date.today().isoformat()

def compute_minutes():
    for t in TOPICS:
        art = re.search(r"<article.*?</article>", (ROOT / t["path"]).read_text(encoding="utf-8"), re.S).group(0)
        t["minutes"] = minutes_of(art)


if __name__ == "__main__":
    compute_minutes()
    write_minutes()
    SECTIONS = build_pathdata()
    for i, t in enumerate(TOPICS):
        build_topic(t, i)
    build_index()
    build_map()
    build_curriculum()
    build_path(SECTIONS)
    build_404()
    build_glossary()
    build_sitemap()
    write_manifest()
    n, size = build_search()
    print(f"built {len(TOPICS)} topic pages, index.html, map.html, glossary.html, 404.html, sitemap.xml, site.webmanifest")
    print(f"search index: {n} sections, {size // 1024} KB")
