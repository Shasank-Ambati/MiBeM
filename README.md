# MiBeM

A free university curriculum in computational materials science, from first-year mathematics, physics and materials science to graduate simulation methods. Each course is a self-contained page of lecture notes with worked examples, interactive demos, problems with solutions and references.

Open `index.html` in a browser, or publish the repository with GitHub Pages. There is no server component: everything, including search and the demos, runs in the visitor's browser.

## Layout

- `index.html`: landing page. `curriculum.html`: the course list by level (generated). `map.html`: prerequisite map.
- `computational/`: one HTML page per course.
- `assets/style.css`: shared stylesheet (light and dark themes).
- `assets/site.js`: search, theme toggle, contents tracking, copy buttons, topic map.
- `assets/demos.js`: interactive demos (Boltzmann, Gibbs energy, Ising model, diffusion solver, Lennard-Jones).
- `assets/katex/` and `assets/math.js`: the bundled KaTeX and the script that typesets `$...$` and `$$...$$` on the Maths course pages (no CDN).
- `assets/mathdemos.js`: the interactive figures of the Maths course (built on the helpers in `demos.js`).
- `assets/animations/`: animated GIF and SVG figures.
- `assets/topics.js`: the course list, prerequisites and key takeaways (single source of truth), plus `MIBEM_PLANNED`, the courses that are announced but not yet written. Courses use university-style codes: a subject (MATH, PHYS, MSE, COMP, CMS) and a three-digit number whose first digit is the level (1 to 4 for years 1 to 4, 5 graduate, 7 doctoral). A course that is not yet written is listed in `MIBEM_PLANNED`; `python tools/add_course.py` moves it into the live list.
- `assets/glossary.js`: plain-language definitions. Terms are underlined on topic pages with a hover/tap definition, and the build writes `glossary.html` from this file.
- `assets/search-index.js`, `sitemap.xml`, `site.webmanifest`: generated.

## Adding or editing a course

1. Write or edit the page in `computational/` (copy an existing page for the structure: breadcrumb, lead, goals callout, numbered sections, an `id="check"` section, references).
2. Add or update its entry in `assets/topics.js`.
3. Run `python tools/build.py`. It regenerates the header, footer, the glossary page, previous/next links, the "builds on / leads to" strip, the takeaways box, the landing cards, the topic map, the sitemap and the search index, and refreshes reading times.

Commit the generated files together with the page.

## Animations

Figures in `assets/animations/` are GIFs or animated SVGs. Each has a still `*.poster.png` used by the "Pause animation" button and by visitors who ask their system to reduce motion. After adding or changing an animation, run `python tools/make_posters.py` (needs Pillow and Edge or Chrome), then `python tools/build.py`.

## The Maths course

Course pages are written as source files with a small header, converted with `python tools/new_page.py source.html` (which also builds the contents list, escapes `&`, `<`, `>` inside formulas so you can write plain TeX, and stores the key takeaways in `assets/topics.js`), then finished with `python tools/build.py`. Register a new course first with `python tools/add_course.py`. Conventions inside a module: formulas as `$...$` / `$$...$$` (no maths in headings), boxes `div.note.def|thm|warn|mat`, worked examples `div.example`, problems `div.problem#pN-K` with `details.hint` and `details.solution`, and demos `div.demo[data-demo]` registered in `assets/mathdemos.js`. Ticks on problems are kept in the visitor's browser only.
