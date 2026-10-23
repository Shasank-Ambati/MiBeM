/* Typesets the maths on the course pages ($...$ inline, $$...$$ display) with the bundled KaTeX.
   Runs before site.js so the glossary pass sees finished markup, not raw TeX. */
(function () {
  "use strict";
  var art = document.getElementById("main");
  if (!art || typeof renderMathInElement !== "function") return;
  try {
    renderMathInElement(art, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false,
      strict: "ignore",
      macros: {
        "\\d": "\\mathrm{d}",
        "\\vb": "\\mathbf{#1}",
        "\\R": "\\mathbb{R}",
        "\\pd": "\\frac{\\partial #1}{\\partial #2}",
        "\\dd": "\\frac{\\mathrm{d} #1}{\\mathrm{d} #2}",
        "\\grad": "\\nabla",
        "\\kB": "k_{\\mathrm{B}}"
      }
    });
  } catch (e) { /* leave the raw TeX readable if rendering fails */ }
})();
