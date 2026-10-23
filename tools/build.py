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


def load_topics():
    text = TOPICS_JS.read_text(encoding="utf-8")
    body = text[text.index("window.MIBEM_TOPICS = ") + len("window.MIBEM_TOPICS = "):]
    body = body[: body.rindex("];") + 1]
    return json.loads(body)


TOPICS = load_topics()
BY_ID = {t["id"]: t for t in TOPICS}
for t in TOPICS:
    t["path"] = f"computational/{t['slug']}.html"
    t.setdefault("label", str(t["id"]))
    t.setdefault("series", "core")


def lab(t):
    """Short label used in the number slot: 1..11 for core topics, B1..B5 for background pages."""
    return t["label"]


def label_text(t):
    if t["series"] == "background":
        return "Background " + t["label"].lstrip("B")
    if t["series"] == "start":
        return "Start here " + t["label"].lstrip("S")
    if t["series"] == "maths":
        return "Maths module " + t["label"].lstrip("M")
    return "Topic " + t["label"]


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
        <div><b>MiBeM</b><p>A reference series on computational materials science for materials scientists and metallurgists.</p></div>
        <nav><a href="{rel}index.html#topics">All topics</a><a href="{rel}map.html">Topic map</a><a href="{rel}glossary.html">Glossary</a><a href="#main">Back to top</a></nav>
    </div></footer>"""


def scripts(rel, demos=False, math=False):
    s = ""
    if math:
        s += (f'<script src="{rel}assets/katex/katex.min.js?v={ver("assets/katex/katex.min.js")}"></script>\n'
              f'    <script src="{rel}assets/katex/auto-render.min.js?v={ver("assets/katex/auto-render.min.js")}"></script>\n'
              f'    <script src="{rel}assets/math.js?v={ver("assets/math.js")}"></script>\n    ')
    s += (f'<script src="{rel}assets/topics.js?v={ver("assets/topics.js")}"></script>\n'
         f'    <script src="{rel}assets/glossary.js?v={ver("assets/glossary.js")}"></script>\n'
         f'    <script src="{rel}assets/site.js?v={ver("assets/site.js")}" defer></script>')
    if demos:
        s += f'\n    <script src="{rel}assets/demos.js?v={ver("assets/demos.js")}" defer></script>'
    return s


def links_html(ids, rel_prefix="", empty="none"):
    if not ids:
        return empty
    return "<br>".join(f'<a href="{rel_prefix}{BY_ID[i]["slug"]}.html">{lab(BY_ID[i])}. {esc(BY_ID[i]["short"])}</a>' for i in ids)


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

    prev_t = TOPICS[i - 1] if i > 0 else None
    next_t = TOPICS[i + 1] if i + 1 < len(TOPICS) else None
    leads = [x["id"] for x in TOPICS if t["id"] in x["builds"]]

    math = t["series"] == "maths"
    s = re.sub(r"<head>.*?</head>", lambda m: head(rel, title, desc, url, math=math), s, count=1, flags=re.S)
    s = re.sub(r"<body[^>]*>", f'<body data-topic="{t["id"]}">', s, count=1)
    cta = None
    hdr = header(rel, [(rel + "index.html#topics", "Topics"), (rel + "map.html", "Map"), (rel + "glossary.html", "Glossary")], cta)
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)

    crumbs = (f'<p class="crumbs"><a href="{rel}index.html#topics">Topics</a><span>/</span>'
              f'<span class="chip{" blue" if t["tone"] == "b" else ""}">{esc(t["part"])}</span><span>{label_text(t)}</span></p>')
    s, n = re.subn(r'<p class="crumbs">.*?</p>', lambda m: crumbs, s, count=1, flags=re.S)
    assert n == 1, f"no breadcrumb in {t['slug']}"
    s = s.replace("<article>", '<article id="main">', 1)

    if math:
        chips = "".join(f'<a href="{x["slug"]}.html"{" class=\"here\" aria-current=\"page\"" if x["id"] == t["id"] else ""} title="{esc(x["title"])}">{x["label"]}</a>'
                        for x in TOPICS if x["series"] == "maths")
        cnav = f'<nav class="course-nav" aria-label="Maths course modules">{chips}</nav>'
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
             f'<div><dt>Category</dt><dd>{esc(t["part"])}</dd></div>\n</dl>')
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
    pv = (f'<a class="prev" href="{prev_t["slug"]}.html"><span class="dir">Previous topic</span>{esc(prev_t["title"])}</a>'
          if prev_t else '<span class="spacer"></span>')
    nx = (f'<a class="next" href="{next_t["slug"]}.html"><span class="dir">Next topic</span>{esc(next_t["title"])}</a>'
          if next_t else '<span class="spacer"></span>')
    pager = f'<nav class="pager" aria-label="Previous and next topic">\n{pv}\n{nx}\n</nav>'
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
    bg = " bg" if t["series"] in ("background", "maths") else ""
    chip = " blue" if t["tone"] == "b" else ""
    return f'''            <li><a class="topic-card" data-id="{t["id"]}" href="{t["path"]}">
                <span class="num{bg}">{lab(t)}</span>
                <span class="title">{esc(t["title"])}</span>
                <span class="desc">{esc(t["blurb"])}</span>
                <span class="tags"><span class="chip{chip}">{esc(t["part"])}</span>{t["minutes"]} min read</span></a></li>'''


def cards():
    groups = [("Start here: no background needed", "start", "Plain-language foundations for anyone starting from school-level maths and science. Read these in order."),
              ("Maths course: university level, with problems", "maths", "A full course in the mathematics behind simulation: every concept explained and derived, worked examples, and graded problems with complete solutions. Twelve modules, in order."),
              ("Background: university-level refresher", "background", "Maths, physics, materials science, numerical methods and programming as the core topics use them."),
              ("Core topics", "core", "The methods themselves, in a sensible reading order.")]
    out = []
    for title, series, sub in groups:
        items = "\n".join(card_html(x) for x in TOPICS if x["series"] == series)
        out.append(f'        <h3 class="group-title">{title}</h3>\n        <p class="section-sub">{sub}</p>\n        <ul class="topic-grid">\n{items}\n        </ul>')
    return "\n".join(out)


def fallback_list(rel_prefix):
    items = []
    for t in TOPICS:
        b = f' <span class="meta">builds on {", ".join(str(x) for x in t["builds"])}</span>' if t["builds"] else ""
        items.append(f'<li><a href="{rel_prefix}{t["path"]}">{lab(t)}. {esc(t["title"])}</a>{b}</li>')
    return "<ol>" + "".join(items) + "</ol>"


def build_index():
    path = ROOT / "index.html"
    s = path.read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", s).group(1)
    desc = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
    s = re.sub(r"<head>.*?</head>", lambda m: head("", title, desc, BASE, "website"), s, count=1, flags=re.S)
    links = [("#start", "Where to start"), ("#map", "Map"), ("#topics", "Topics"), ("glossary.html", "Glossary"), ("#about", "About")]
    hdr = header("", links, None)
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)
    s = replace_region(s, "cards", cards())
    s = replace_region(s, "map", '        <div id="topic-map">' + fallback_list("") + "</div>")
    s = re.sub(r"<footer class=\"site\">.*?</footer>.*?</body>", lambda m: footer("") + "\n    " + scripts("") + "\n</body>", s, count=1, flags=re.S)
    s = add_img_attrs(s, ROOT, lazy=False)
    path.write_text(s, encoding="utf-8")


def build_map():
    title = "Topic Map - MiBeM"
    desc = "How the topics build on each other: prerequisites and what each topic leads to."
    hdr = header("", [("index.html#topics", "Topics"), ("map.html", "Map"), ("glossary.html", "Glossary")], None)
    page = f"""<!DOCTYPE html>
<html lang="en">
{head("", title, desc, BASE + "map.html", "website")}
<body>
    {hdr}

    <main class="wrap" id="main">
        <p class="crumbs"><a href="index.html">Home</a><span>/</span><span>Topic map</span></p>
        <h1>Topic map</h1>
        <p class="lead">Every topic builds on a few others. Follow the arrows from the top to see a sensible order, or jump straight to the topic you need and read what it assumes.</p>

        <div id="topic-map">{fallback_list("")}</div>

        <h2>How to read the map</h2>
        <ul>
            <li><strong>Orange lines</strong> lead from a topic back to what it builds on; <strong>blue lines</strong> lead forward to what it unlocks.</li>
            <li><strong>Dashed related links</strong> mark topics that connect without being required.</li>
            <li>A tick on a topic means you have read most of that page on this device. The record stays in your browser only, and can be cleared with the link in the footer.</li>
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
    hdr = header(rel, [(BASE + "index.html#topics", "Topics"), (BASE + "map.html", "Map"), (BASE + "glossary.html", "Glossary")], None)
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
    hdr = header("", [("index.html#topics", "Topics"), ("map.html", "Map"), ("glossary.html", "Glossary")], None)
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
            if t["series"] == "maths":
                it["x"] = re.sub(r"\\[a-zA-Z]+|[$\\{}^_]", " ", it["x"])
            it["x"] = re.sub(r"\s+", " ", it["x"]).strip()[:2400]
            entries.append(it)
    for g in load_glossary():
        entries.append({"n": 0, "l": "Glossary", "t": "Glossary", "h": g["t"], "u": "glossary.html#" + gslug(g["t"]), "x": g["d"]})
    out = "window.MIBEM_INDEX = " + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "search-index.js").write_text(out, encoding="utf-8")
    return len(entries), len(out)


def build_sitemap():
    urls = [BASE, BASE + "map.html", BASE + "glossary.html"] + [BASE + t["path"] for t in TOPICS]
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
    for i, t in enumerate(TOPICS):
        build_topic(t, i)
    build_index()
    build_map()
    build_404()
    build_glossary()
    build_sitemap()
    write_manifest()
    n, size = build_search()
    print(f"built {len(TOPICS)} topic pages, index.html, map.html, glossary.html, 404.html, sitemap.xml, site.webmanifest")
    print(f"search index: {n} sections, {size // 1024} KB")
