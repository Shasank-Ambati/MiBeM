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


def esc(s):
    return html.escape(s, quote=True)


# ----------------------------------------------------------------- templates
def head(rel, title, desc, url, og_type="article"):
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
    <link rel="stylesheet" href="{rel}assets/style.css">
</head>"""


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
        <nav><a href="{rel}index.html#topics">All topics</a><a href="{rel}map.html">Topic map</a><a href="#main">Back to top</a></nav>
    </div></footer>"""


def scripts(rel, demos=False):
    s = f'<script src="{rel}assets/topics.js"></script>\n    <script src="{rel}assets/site.js" defer></script>'
    if demos:
        s += f'\n    <script src="{rel}assets/demos.js" defer></script>'
    return s


def links_html(ids, rel_prefix="", empty="none"):
    if not ids:
        return empty
    return "<br>".join(f'<a href="{rel_prefix}{BY_ID[i]["slug"]}.html">{i}. {esc(BY_ID[i]["short"])}</a>' for i in ids)


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

    s = re.sub(r"<head>.*?</head>", lambda m: head(rel, title, desc, url), s, count=1, flags=re.S)
    s = re.sub(r"<body[^>]*>", f'<body data-topic="{t["id"]}">', s, count=1)
    cta = (next_t["slug"] + ".html", "Next topic") if next_t else None
    hdr = header(rel, [(rel + "index.html#topics", "Topics"), (rel + "map.html", "Map")], cta)
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)

    crumbs = (f'<p class="crumbs"><a href="{rel}index.html#topics">Topics</a><span>/</span>'
              f'<span class="chip{" blue" if t["tone"] == "b" else ""}">{esc(t["part"])}</span><span>Topic {t["id"]}</span></p>')
    s, n = re.subn(r'<p class="crumbs">.*?</p>', lambda m: crumbs, s, count=1, flags=re.S)
    assert n == 1, f"no breadcrumb in {t['slug']}"
    s = s.replace("<article>", '<article id="main">', 1)

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
               lambda m: footer(rel) + "\n    " + scripts(rel, demos='class="demo"' in s) + "\n</body>", s, count=1, flags=re.S)
    path.write_text(s, encoding="utf-8")


# ----------------------------------------------------------------- landing + map
def cards():
    out = []
    for t in TOPICS:
        out.append(f'''            <li><a class="topic-card" data-id="{t["id"]}" href="{t["path"]}">
                <span class="num">{t["id"]}</span>
                <span class="title">{esc(t["title"])}</span>
                <span class="desc">{esc(t["blurb"])}</span>
                <span class="tags"><span class="chip{" blue" if t["tone"] == "b" else ""}">{esc(t["part"])}</span>{t["minutes"]} min read</span></a></li>''')
    return "\n".join(out)


def fallback_list(rel_prefix):
    items = []
    for t in TOPICS:
        b = f' <span class="meta">builds on {", ".join(str(x) for x in t["builds"])}</span>' if t["builds"] else ""
        items.append(f'<li><a href="{rel_prefix}{t["path"]}">{t["id"]}. {esc(t["title"])}</a>{b}</li>')
    return "<ol>" + "".join(items) + "</ol>"


def build_index():
    path = ROOT / "index.html"
    s = path.read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", s).group(1)
    desc = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
    s = re.sub(r"<head>.*?</head>", lambda m: head("", title, desc, BASE, "website"), s, count=1, flags=re.S)
    links = [("#start", "Where to start"), ("#map", "Map"), ("#topics", "Topics"), ("#about", "About")]
    hdr = header("", links, ("computational/introduction.html", "Start reading"))
    s = re.sub(r'(<body[^>]*>)\s*.*?(?=<(?:div|main) class="wrap")', lambda m: m.group(1) + "\n    " + hdr + "\n\n    ", s, count=1, flags=re.S)
    s = replace_region(s, "cards", '        <ul class="topic-grid">\n' + cards() + "\n        </ul>")
    s = replace_region(s, "map", '        <div id="topic-map">' + fallback_list("") + "</div>")
    s = re.sub(r"<footer class=\"site\">.*?</footer>.*?</body>", lambda m: footer("") + "\n    " + scripts("") + "\n</body>", s, count=1, flags=re.S)
    path.write_text(s, encoding="utf-8")


def build_map():
    title = "Topic Map - MiBeM"
    desc = "How the topics build on each other: prerequisites and what each topic leads to."
    hdr = header("", [("index.html#topics", "Topics"), ("map.html", "Map")], ("computational/introduction.html", "Start reading"))
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
            <li>A tick on a topic means you have read most of that page on this device. The record stays in your browser and can be cleared below the map.</li>
        </ul>
    </main>

    {footer("")}
    {scripts("")}
</body>
</html>
"""
    (ROOT / "map.html").write_text(page, encoding="utf-8")


# ----------------------------------------------------------------- search index + sitemap
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

    def start(self, h, hid):
        if self.cur and self.cur["x"].strip():
            self.items.append(self.cur)
        self.cur = {"n": self.topic["id"], "t": self.topic["title"], "h": h, "u": self.page + (f"#{hid}" if hid else ""), "x": ""}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
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
            self.cur["x"] += " " + data


def build_search():
    entries = []
    for t in TOPICS:
        p = Sections(t)
        p.feed((ROOT / t["path"]).read_text(encoding="utf-8"))
        for it in p.items:
            it["x"] = re.sub(r"\s+", " ", it["x"]).strip()[:2400]
            entries.append(it)
    out = "window.MIBEM_INDEX = " + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "search-index.js").write_text(out, encoding="utf-8")
    return len(entries), len(out)


def build_sitemap():
    urls = [BASE, BASE + "map.html"] + [BASE + t["path"] for t in TOPICS]
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

if __name__ == "__main__":
    for i, t in enumerate(TOPICS):
        build_topic(t, i)
    write_minutes()
    build_index()
    build_map()
    build_sitemap()
    write_manifest()
    n, size = build_search()
    print(f"built {len(TOPICS)} topic pages, index.html, map.html, sitemap.xml, site.webmanifest")
    print(f"search index: {n} sections, {size // 1024} KB")
