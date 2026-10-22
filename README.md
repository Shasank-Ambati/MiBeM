# MiBeM

A static knowledge repository for learning computational materials science. Each topic is a self-contained page covering the concepts, equations, trade-offs and practical advice for one method or idea, with animated figures, interactive demos and references.

Open `index.html` in a browser, or publish the repository with GitHub Pages. There is no server component: everything, including search and the demos, runs in the visitor's browser.

## Layout

- `index.html`: landing page. `map.html`: topic map (a tree of how topics build on each other).
- `computational/`: one HTML page per topic.
- `assets/style.css`: shared stylesheet (light and dark themes).
- `assets/site.js`: search, theme toggle, contents tracking, copy buttons, topic map.
- `assets/demos.js`: interactive demos (Boltzmann, Gibbs energy, Ising model, diffusion solver, Lennard-Jones).
- `assets/animations/`: animated GIF and SVG figures.
- `assets/topics.js`: the topic list, prerequisites and key takeaways (single source of truth). Pages come in three series: Start here (S0-S6, school-level, from zero), Background (B1-B5) and Core (1-11).
- `assets/glossary.js`: plain-language definitions. Terms are underlined on topic pages with a hover/tap definition, and the build writes `glossary.html` from this file.
- `assets/search-index.js`, `sitemap.xml`, `site.webmanifest`: generated.

## Adding or editing a topic

1. Write or edit the page in `computational/` (copy an existing page for the structure: breadcrumb, lead, goals callout, numbered sections, an `id="check"` section, references).
2. Add or update its entry in `assets/topics.js`.
3. Run `python tools/build.py`. It regenerates the header, footer, the glossary page, previous/next links, the "builds on / leads to" strip, the takeaways box, the landing cards, the topic map, the sitemap and the search index, and refreshes reading times.

Commit the generated files together with the page.

## Animations

Figures in `assets/animations/` are GIFs or animated SVGs. Each has a still `*.poster.png` used by the "Pause animation" button and by visitors who ask their system to reduce motion. After adding or changing an animation, run `python tools/make_posters.py` (needs Pillow and Edge or Chrome), then `python tools/build.py`.
