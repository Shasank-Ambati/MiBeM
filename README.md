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
- `assets/topics.js`: the topic list, prerequisites and key takeaways (single source of truth).
- `assets/search-index.js`, `sitemap.xml`, `site.webmanifest`: generated.

## Adding or editing a topic

1. Write or edit the page in `computational/` (copy an existing page for the structure: breadcrumb, lead, goals callout, numbered sections, an `id="check"` section, references).
2. Add or update its entry in `assets/topics.js`.
3. Run `python tools/build.py`. It regenerates the header, footer, previous/next links, the "builds on / leads to" strip, the takeaways box, the landing cards, the topic map, the sitemap and the search index, and refreshes reading times.

Commit the generated files together with the page.
