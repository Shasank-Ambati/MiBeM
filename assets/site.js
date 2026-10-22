/* MiBeM shared behaviour. Everything here is an enhancement: pages read fine without it.
   Runs entirely in the browser; there is no server component. */
(function () {
  "use strict";

  var script = document.currentScript;
  var ROOT = script && script.src ? script.src.replace(/assets\/site\.js(\?.*)?$/, "") : "";
  var QS = script && script.src && script.src.indexOf("?") > -1 ? script.src.slice(script.src.indexOf("?")) : "";
  var doc = document;
  var root = doc.documentElement;
  var TOPICS = window.MIBEM_TOPICS || [];

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tLabel(t) {
    if (t.series === "background") return "Background " + String(t.label).replace(/^B/, "");
    if (t.series === "start") return "Start here " + String(t.label).replace(/^S/, "");
    return "Topic " + (t.label || t.id);
  }
  function el(tag, cls, html) { var n = doc.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var ICON = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };

  /* ---------------- theme ---------------- */
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var themeBtn;
  function paintThemeBtn() {
    if (!themeBtn) return;
    var dark = currentTheme() === "dark";
    themeBtn.innerHTML = dark ? ICON.sun : ICON.moon;
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    themeBtn.title = themeBtn.getAttribute("aria-label");
  }
  function setTheme(t) { root.setAttribute("data-theme", t); store.set("mibem-theme", t); paintThemeBtn(); }

  /* ---------------- header buttons ---------------- */
  function addHeaderButtons() {
    var nav = doc.querySelector("header.site nav");
    if (!nav) return;
    var before = nav.querySelector("a.cta");
    var sBtn = el("button", "icon-btn", ICON.search + '<span class="lbl">Search</span><kbd>/</kbd>');
    sBtn.type = "button";
    sBtn.setAttribute("aria-label", "Search all topics");
    sBtn.addEventListener("click", openSearch);
    themeBtn = el("button", "icon-btn");
    themeBtn.type = "button";
    themeBtn.addEventListener("click", function () { setTheme(currentTheme() === "dark" ? "light" : "dark"); });
    nav.insertBefore(sBtn, before);
    nav.insertBefore(themeBtn, before);
    paintThemeBtn();
  }

  /* ---------------- search ---------------- */
  var overlay, input, list, status, results = [], sel = -1, indexReady = false, lastFocus = null;

  function loadIndex(cb) {
    if (window.MIBEM_INDEX) { indexReady = true; return cb(); }
    var s = doc.createElement("script");
    s.src = ROOT + "assets/search-index.js" + QS;
    s.onload = function () { indexReady = true; cb(); };
    s.onerror = function () { status.textContent = "Search index could not be loaded."; };
    doc.head.appendChild(s);
  }

  function buildSearch() {
    overlay = el("div", "search-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Search");
    overlay.innerHTML =
      '<div class="search-box">' +
      '<div class="field">' + ICON.search +
      '<input type="search" autocomplete="off" spellcheck="false" placeholder="Search all topics: equations, methods, terms" aria-controls="sr-list" aria-label="Search query"></div>' +
      '<ul class="search-results" id="sr-list" role="listbox"></ul>' +
      '<div class="search-foot"><span>&uarr; &darr; to move</span><span>Enter to open</span><span>Esc to close</span><span class="st" aria-live="polite"></span></div>' +
      '</div>';
    doc.body.appendChild(overlay);
    input = overlay.querySelector("input");
    list = overlay.querySelector(".search-results");
    status = overlay.querySelector(".st");
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener("input", function () { run(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        var a = list.querySelector('li[aria-selected="true"] a') || list.querySelector("li a");
        if (a) { e.preventDefault(); window.location.href = a.href; }
      }
    });
  }

  function openSearch() {
    if (!overlay) buildSearch();
    lastFocus = doc.activeElement;
    overlay.classList.add("open");
    input.value = "";
    showHome();
    input.focus();
    loadIndex(function () { if (input.value) run(input.value); });
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove("open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function showHome() {
    var items = TOPICS.map(function (t) {
      return '<li role="option"><a href="' + esc(ROOT + "computational/" + t.slug + ".html") + '"><div class="sr-where">' + tLabel(t) + " &middot; " + esc(t.part) + '</div><div class="sr-title">' + esc(t.title) + "</div></a></li>";
    }).join("");
    list.innerHTML = items || '<li class="search-empty">Type to search.</li>';
    status.textContent = "";
    sel = -1;
  }

  function tokens(q) { return q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean); }

  function run(q) {
    var t = tokens(q);
    if (!t.length) { showHome(); return; }
    if (!indexReady) { status.textContent = "Loading index..."; return; }
    var idx = window.MIBEM_INDEX || [];
    var phrase = q.trim().toLowerCase();
    var out = [];
    for (var i = 0; i < idx.length; i++) {
      var e = idx[i];
      if (!e._x) { e._x = e.x.toLowerCase(); e._h = e.h.toLowerCase(); e._t = e.t.toLowerCase(); }
      var score = 0, ok = true;
      for (var j = 0; j < t.length; j++) {
        var term = t[j];
        var inH = e._h.indexOf(term) >= 0, inT = e._t.indexOf(term) >= 0;
        var c = 0, pos = e._x.indexOf(term);
        while (pos >= 0 && c < 5) { c++; pos = e._x.indexOf(term, pos + term.length); }
        if (!inH && !inT && c === 0) { ok = false; break; }
        score += (inH ? 8 : 0) + (inT ? 3 : 0) + c;
      }
      if (!ok) continue;
      if (t.length > 1 && (e._x.indexOf(phrase) >= 0 || e._h.indexOf(phrase) >= 0)) score += 8;
      out.push({ e: e, s: score });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    results = out.slice(0, 12);
    render(results, t);
  }

  function snippet(text, terms) {
    var low = text.toLowerCase(), first = -1;
    for (var i = 0; i < terms.length; i++) { var p = low.indexOf(terms[i]); if (p >= 0 && (first < 0 || p < first)) first = p; }
    var start = Math.max(0, first - 60);
    var piece = text.slice(start, start + 190);
    return (start > 0 ? "&hellip; " : "") + mark(piece, terms) + (start + 190 < text.length ? " &hellip;" : "");
  }
  function mark(s, terms) {
    var safe = esc(s);
    terms.forEach(function (term) {
      var re = new RegExp("(" + esc(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      safe = safe.replace(re, "<mark>$1</mark>");
    });
    return safe;
  }

  function render(rs, terms) {
    if (!rs.length) { list.innerHTML = '<li class="search-empty">No matches. Try fewer or different words.</li>'; status.textContent = "0 results"; sel = -1; return; }
    list.innerHTML = rs.map(function (r, i) {
      var e = r.e;
      return '<li role="option" id="sr-' + i + '"><a href="' + esc(ROOT + e.u) + '"><div class="sr-where">' + esc(e.l || ("Topic " + e.n)) + " &middot; " + esc(e.t) + '</div><div class="sr-title">' + mark(e.h, terms) + '</div><div class="sr-snip">' + snippet(e.x, terms) + "</div></a></li>";
    }).join("");
    status.textContent = rs.length + (rs.length === 1 ? " result" : " results");
    sel = 0; paintSel();
  }
  function paintSel() {
    var items = list.querySelectorAll("li[role=option]");
    items.forEach(function (li, i) { li.setAttribute("aria-selected", i === sel ? "true" : "false"); });
    if (items[sel]) items[sel].scrollIntoView({ block: "nearest" });
  }
  function move(d) {
    var n = list.querySelectorAll("li[role=option]").length;
    if (!n) return;
    sel = (sel + d + n) % n;
    paintSel();
  }

  doc.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if (e.key === "Escape" && overlay && overlay.classList.contains("open")) { closeSearch(); return; }
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); overlay && overlay.classList.contains("open") ? closeSearch() : openSearch(); return; }
    if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); openSearch(); }
  });

  /* ---------------- contents sidebar: current section ---------------- */
  function initScrollSpy() {
    var toc = doc.querySelector(".toc");
    if (!toc) return;
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var heads = Array.prototype.slice.call(doc.querySelectorAll("article h2[id], article h3[id]")).filter(function (h) { return links[h.id]; });
    if (!heads.length) return;
    var current = null, ticking = false;
    function update() {
      ticking = false;
      var y = 120, found = heads[0];
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top <= y) found = heads[i]; else break; }
      if (found === current) return;
      current = found;
      Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); links[k].removeAttribute("aria-current"); });
      var a = links[found.id];
      a.classList.add("active"); a.setAttribute("aria-current", "true");
      if (toc.scrollHeight > toc.clientHeight) {
        var top = a.offsetTop - toc.offsetTop;
        if (top < toc.scrollTop + 20 || top > toc.scrollTop + toc.clientHeight - 60) toc.scrollTop = Math.max(0, top - toc.clientHeight / 3);
      }
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------------- copy buttons ---------------- */
  function initCopy() {
    doc.querySelectorAll("pre").forEach(function (pre) {
      var b = el("button", "copy-btn", "Copy");
      b.type = "button";
      b.setAttribute("aria-label", "Copy code to clipboard");
      b.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = (code || pre).textContent;
        function done() { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
        else { var ta = el("textarea"); ta.value = text; doc.body.appendChild(ta); ta.select(); try { doc.execCommand("copy"); } catch (e) { /* ignore */ } doc.body.removeChild(ta); done(); }
      });
      pre.appendChild(b);
    });
  }

  /* ---------------- back to top ---------------- */
  function initBackTop() {
    if (!doc.querySelector("article")) return;
    var b = el("button", "backtop", "&uarr;");
    b.type = "button"; b.setAttribute("aria-label", "Back to top");
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    doc.body.appendChild(b);
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () { var y = window.scrollY; b.classList.toggle("show", y > 700 && y < lastY); lastY = y; }, { passive: true });
  }

  /* ---------------- reading progress (stored on this device only) ---------------- */
  var VKEY = "mibem-read";
  function readList() { try { return JSON.parse(store.get(VKEY) || "[]"); } catch (e) { return []; } }
  function initProgress() {
    var tid = parseInt(doc.body.getAttribute("data-topic"), 10);
    if (tid && doc.querySelector("article")) {
      var marked = readList().indexOf(tid) >= 0;
      window.addEventListener("scroll", function () {
        if (marked) return;
        var h = doc.documentElement;
        var p = (window.scrollY + window.innerHeight) / h.scrollHeight;
        if (p > 0.82) { marked = true; var v = readList(); if (v.indexOf(tid) < 0) { v.push(tid); store.set(VKEY, JSON.stringify(v)); } ensureClearButton(); }
      }, { passive: true });
    }
    var r = readList();
    doc.querySelectorAll(".topic-card[data-id]").forEach(function (c) { if (r.indexOf(parseInt(c.getAttribute("data-id"), 10)) >= 0) c.classList.add("visited"); });
    ensureClearButton();
  }

  /* ---------------- topic map (tree graph) ---------------- */
  function drawTree() {
    var host = doc.getElementById("topic-map");
    if (!host || !TOPICS.length) return;
    var byId = {};
    TOPICS.forEach(function (t) { byId[t.id] = t; });
    var memo = {};
    function level(t) { if (memo[t.id] != null) return memo[t.id]; var m = 0; t.builds.forEach(function (b) { m = Math.max(m, level(byId[b]) + 1); }); return (memo[t.id] = m); }
    TOPICS.forEach(level);
    var L = 0; TOPICS.forEach(function (t) { L = Math.max(L, memo[t.id]); });
    var rows = []; for (var i = 0; i <= L; i++) rows.push([]);
    TOPICS.forEach(function (t) { rows[memo[t.id]].push(t); });

    var NW = 200, NH = 66, GX = 36, GY = 64, PAD = 14;
    var maxN = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var W = maxN * NW + (maxN - 1) * GX + PAD * 2;
    var H = (L + 1) * NH + L * GY + PAD * 2;
    var pos = {};
    rows.forEach(function (r, li) {
      if (li > 0) {
        r.sort(function (a, b) {
          function bx(t) { var s = 0, n = 0; t.builds.forEach(function (p) { if (pos[p]) { s += pos[p].x; n++; } }); return n ? s / n : 0; }
          return bx(a) - bx(b) || a.id - b.id;
        });
      }
      var total = r.length * NW + (r.length - 1) * GX, x0 = (W - total) / 2;
      r.forEach(function (t, i) { pos[t.id] = { x: x0 + i * (NW + GX), y: PAD + li * (NH + GY) }; });
    });

    function up(id, set) { byId[id].builds.forEach(function (b) { if (!set[b]) { set[b] = 1; up(b, set); } }); return set; }
    function down(id, set) { TOPICS.forEach(function (t) { if (t.builds.indexOf(id) >= 0 && !set[t.id]) { set[t.id] = 1; down(t.id, set); } }); return set; }

    var read = readList();
    var currentId = parseInt(host.getAttribute("data-current"), 10) || 0;

    var edges = "", nodes = "";
    function pathBetween(a, b, related) {
      var pa = pos[a], pb = pos[b];
      if (memo[a] === memo[b]) {
        var left = pa.x < pb.x ? pa : pb, right = pa.x < pb.x ? pb : pa;
        var x1 = left.x + NW, x2 = right.x, y = left.y + NH / 2;
        var bow = left.y + NH + 28;
        return "M" + x1 + " " + y + " C " + (x1 + 30) + " " + bow + ", " + (x2 - 30) + " " + bow + ", " + x2 + " " + y;
      }
      var up_ = memo[a] < memo[b] ? a : b, lo = memo[a] < memo[b] ? b : a;
      var p1 = pos[up_], p2 = pos[lo];
      var x1b = p1.x + NW / 2, y1 = p1.y + NH, x2b = p2.x + NW / 2, y2 = p2.y, dy = (y2 - y1) / 2;
      return "M" + x1b + " " + y1 + " C " + x1b + " " + (y1 + dy) + ", " + x2b + " " + (y2 - dy) + ", " + x2b + " " + y2;
    }
    TOPICS.forEach(function (t) {
      t.builds.forEach(function (b) { edges += '<path class="edge" data-a="' + b + '" data-b="' + t.id + '" d="' + pathBetween(b, t.id) + '" marker-end="url(#arr)"/>'; });
      (t.related || []).forEach(function (r) { if (r > t.id) edges += '<path class="edge related" data-a="' + t.id + '" data-b="' + r + '" d="' + pathBetween(t.id, r, true) + '"/>'; });
    });
    function wrapTitle(s) {
      if (s.length <= 17) return [s];
      var words = s.split(" "), l1 = "", l2 = "";
      words.forEach(function (w) { if ((l1 + " " + w).trim().length <= 17 && !l2) l1 = (l1 + " " + w).trim(); else l2 = (l2 + " " + w).trim(); });
      return l2 ? [l1, l2] : [l1];
    }
    TOPICS.forEach(function (t) {
      var p = pos[t.id], lines = wrapTitle(t.short), cls = "node tone-" + t.tone + (t.id === currentId ? " current" : "");
      var ty = lines.length === 1 ? 31 : 25;
      var tspans = lines.map(function (ln, i) { return '<text class="ttl" x="50" y="' + (ty + i * 15) + '">' + esc(ln) + "</text>"; }).join("");
      nodes += '<g class="' + cls + '" data-id="' + t.id + '" transform="translate(' + p.x + " " + p.y + ')">' +
        '<a href="' + esc(ROOT + "computational/" + t.slug + ".html") + '" aria-label="' + tLabel(t) + ": " + esc(t.title) + '">' +
        '<rect class="box" width="' + NW + '" height="' + NH + '" rx="12"/><rect class="bar" width="7" height="' + NH + '" rx="3"/>' +
        '<text class="num' + (String(t.label).length > 1 ? " two" : "") + '" x="30" y="40" text-anchor="middle">' + esc(t.label) + "</text>" + tspans +
        '<text class="sub" x="50" y="' + (NH - 9) + '">' + esc(t.part) + " &middot; " + t.minutes + " min</text>" +
        (read.indexOf(t.id) >= 0 ? '<text class="tick" x="' + (NW - 18) + '" y="22">&#10003;</text>' : "") +
        "</a></g>";
    });
    host.innerHTML =
      '<div class="tree-wrap"><div class="tree-toolbar"><span class="legend"><span><i></i>builds on</span><span><i class="down"></i>leads to</span><span><i class="rel"></i>related</span></span>' +
      '<label><input type="checkbox" id="rel-toggle"> Show related links</label></div>' +
      '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="Map of how the topics build on each other">' +
      '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor" style="color:var(--muted)"/></marker></defs>' +
      edges + nodes + "</svg>" +
      '<div class="tree-panel" id="tree-panel" aria-live="polite"></div></div>' +
      '<p class="map-note">Hover or tab to a topic to see what it builds on (orange) and what it leads to (blue). Click a topic to open it.</p>';

    var svg = host.querySelector("svg"), panel = host.querySelector("#tree-panel");
    var nodeEls = {}; svg.querySelectorAll(".node").forEach(function (n) { nodeEls[n.getAttribute("data-id")] = n; });
    var edgeEls = svg.querySelectorAll(".edge");
    var pinned = currentId || 0;

    function names(ids) { return ids.length ? ids.map(function (i) { return '<a href="' + esc(ROOT + "computational/" + byId[i].slug + ".html") + '">' + byId[i].label + ". " + esc(byId[i].short) + "</a>"; }).join(", ") : "&mdash;"; }
    function showPanel(id) {
      var t = byId[id];
      var leads = TOPICS.filter(function (x) { return x.builds.indexOf(id) >= 0; }).map(function (x) { return x.id; });
      panel.innerHTML = '<b>' + t.label + ". " + esc(t.title) + '</b><div>' + esc(t.blurb) + '</div><div class="meta2">' + esc(t.part) + " &middot; about " + t.minutes + " min &middot; builds on: " + names(t.builds) + " &middot; leads to: " + names(leads) + '</div><a class="go" href="' + esc(ROOT + "computational/" + t.slug + ".html") + '">Open this topic &rarr;</a>';
    }
    function focusNode(id) {
      var A = up(id, {}), D = down(id, {});
      Object.keys(nodeEls).forEach(function (k) {
        var n = nodeEls[k], on = +k === id || A[k] || D[k];
        n.classList.toggle("dim", !on); n.classList.toggle("sel", +k === id);
      });
      edgeEls.forEach(function (e) {
        var a = +e.getAttribute("data-a"), b = +e.getAttribute("data-b"), rel = e.classList.contains("related");
        e.classList.remove("up", "down");
        if (rel) { e.style.opacity = (a === id || b === id) ? ".8" : ""; return; }
        var inUp = (A[a] || a === id) && (A[b] || b === id), inDown = (D[a] || a === id) && (D[b] || b === id);
        if (inUp && !inDown) e.classList.add("up"); else if (inDown && !inUp) e.classList.add("down");
        else if (inUp && inDown) e.classList.add("up");
      });
      showPanel(id);
    }
    function clearFocus() {
      Object.keys(nodeEls).forEach(function (k) { nodeEls[k].classList.remove("dim", "sel"); });
      edgeEls.forEach(function (e) { e.classList.remove("up", "down"); e.style.opacity = ""; });
      if (pinned) focusNode(pinned); else panel.innerHTML = '<b>Pick a topic</b><div class="meta2">Hover or focus a topic to see its prerequisites and what it unlocks.</div>';
    }
    Object.keys(nodeEls).forEach(function (k) {
      var n = nodeEls[k], id = +k;
      n.addEventListener("mouseenter", function () { focusNode(id); });
      n.addEventListener("mouseleave", clearFocus);
      n.addEventListener("focusin", function () { focusNode(id); });
      n.addEventListener("focusout", clearFocus);
    });
    host.querySelector("#rel-toggle").addEventListener("change", function (e) { host.classList.toggle("show-related", e.target.checked); });
    clearFocus();
  }

  function drawList() {
    var host = doc.getElementById("topic-map");
    var byId = {}; TOPICS.forEach(function (t) { byId[t.id] = t; });
    var read = readList();
    function link(i) { return '<a href="' + esc(ROOT + "computational/" + byId[i].slug + ".html") + '">' + esc(byId[i].label) + ". " + esc(byId[i].short) + "</a>"; }
    host.innerHTML = '<ol class="map-list">' + TOPICS.map(function (t) {
      var b = t.builds.length ? "Builds on: " + t.builds.map(link).join(", ") : "A place to start";
      return '<li class="tone-' + t.tone + (read.indexOf(t.id) >= 0 ? " read" : "") + '"><span class="ml-num">' + esc(t.label) + '</span>' +
        '<a class="ml-title" href="' + esc(ROOT + "computational/" + t.slug + ".html") + '">' + esc(t.title) + '</a>' +
        '<span class="ml-meta">' + esc(t.part) + " &middot; about " + t.minutes + ' min</span><span class="ml-meta">' + b + "</span></li>";
    }).join("") + "</ol>";
  }

  function initMap() {
    var host = doc.getElementById("topic-map");
    if (!host || !TOPICS.length) return;
    var mq = window.matchMedia ? matchMedia("(max-width: 700px)") : null;
    function draw() { if (mq && mq.matches) drawList(); else drawTree(); }
    draw();
    if (mq) { if (mq.addEventListener) mq.addEventListener("change", draw); else if (mq.addListener) mq.addListener(draw); }
  }

  /* ---------------- clear reading progress (footer, with confirmation) ---------------- */
  function ensureClearButton() {
    var nav = doc.querySelector("footer.site nav");
    if (!nav || nav.querySelector(".linklike") || !readList().length) return;
    var b = el("button", "linklike", "Clear reading progress");
    b.type = "button";
    b.addEventListener("click", function () {
      if (!window.confirm("Clear the record of which topics you have read? It is stored only on this device.")) return;
      store.set(VKEY, "[]");
      doc.querySelectorAll(".tick").forEach(function (t) { t.remove(); });
      doc.querySelectorAll(".topic-card.visited").forEach(function (c) { c.classList.remove("visited"); });
      doc.querySelectorAll(".map-list li.read").forEach(function (c) { c.classList.remove("read"); });
      b.remove();
    });
    nav.appendChild(b);
  }

  /* ---------------- phone menu ---------------- */
  function initMenu() {
    var header = doc.querySelector("header.site");
    var nav = header && header.querySelector("nav");
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll("a:not(.cta)"));
    if (!links.length) return;
    var panel = el("div", "menu-panel");
    panel.id = "menu-panel";
    links.forEach(function (a) { var c = a.cloneNode(true); panel.appendChild(c); c.addEventListener("click", close); });
    header.appendChild(panel);
    var btn = el("button", "icon-btn menu-btn", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>');
    btn.type = "button";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "menu-panel");
    var cta = nav.querySelector("a.cta");
    nav.insertBefore(btn, cta);
    function close() { header.classList.remove("menu-open"); btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------------- contents list: collapsible and placed below the introduction on small screens ---------------- */
  function initTocMobile() {
    var toc = doc.querySelector(".toc"), art = doc.querySelector("article");
    if (!toc || !art || !window.matchMedia) return;
    var mq = matchMedia("(max-width: 960px)");
    var marker = doc.createComment("toc-home");
    toc.parentNode.insertBefore(marker, toc);
    var count = toc.querySelectorAll("ol > li").length;
    var toggle = el("button", "toc-toggle", "Contents <span>" + count + " sections</span>");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toc.insertBefore(toggle, toc.firstChild);
    toggle.addEventListener("click", function () {
      var collapsed = toc.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });
    toc.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a") && mq.matches) { toc.classList.add("collapsed"); toggle.setAttribute("aria-expanded", "false"); }
    });
    function apply() {
      if (mq.matches) {
        var h = art.querySelector("h2");
        if (h) art.insertBefore(toc, h);
        toc.classList.add("collapsible", "collapsed");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        marker.parentNode.insertBefore(toc, marker.nextSibling);
        toc.classList.remove("collapsible", "collapsed");
      }
    }
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply);
  }

  /* ---------------- pause control for animated figures ---------------- */
  function initMotion() {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    doc.querySelectorAll("figure img[src*='animations/']").forEach(function (img) {
      var pic = img.parentNode && img.parentNode.tagName === "PICTURE" ? img.parentNode : null;
      var source = pic ? pic.querySelector("source") : null;
      var live = img.getAttribute("src");
      var still = source ? source.getAttribute("srcset") : live.replace(/\.(gif|svg)(\?.*)?$/, ".poster.png");
      if (!still || still === live) return;
      var fig = img.closest("figure");
      var btn = el("button", "motion-btn", "Pause animation");
      btn.type = "button";
      var paused = !!(source && reduce);
      function paint() {
        if (source) source.media = paused ? "all" : "not all";
        else img.setAttribute("src", paused ? still : live);
        btn.textContent = paused ? "Play animation" : "Pause animation";
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
      }
      btn.addEventListener("click", function () { paused = !paused; paint(); });
      if (source) { fig.appendChild(btn); paint(); }
      else {
        var probe = new Image();
        probe.onload = function () { fig.appendChild(btn); if (reduce) { paused = true; } paint(); };
        probe.src = still;
      }
    });
  }

  /* ---------------- click or tap a figure to enlarge it ---------------- */
  function initLightbox() {
    var imgs = doc.querySelectorAll("figure img");
    if (!imgs.length) return;
    var box = null, lastFocus = null;
    function build() {
      box = el("div", "lightbox");
      box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Enlarged figure");
      box.innerHTML = '<div class="lb-bar"><span class="lb-cap"></span><button type="button">Close</button></div><div class="lb-body"><img alt=""></div>';
      doc.body.appendChild(box);
      box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lb-body") || e.target.tagName === "BUTTON") close(); });
    }
    function open(img) {
      if (!box) build();
      lastFocus = doc.activeElement;
      var big = box.querySelector("img");
      big.src = img.currentSrc || img.src; big.alt = img.alt;
      var cap = img.closest("figure") && img.closest("figure").querySelector("figcaption");
      box.querySelector(".lb-cap").textContent = cap ? cap.textContent : img.alt;
      box.classList.add("open");
      box.querySelector("button").focus();
    }
    function close() { if (!box) return; box.classList.remove("open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    imgs.forEach(function (img) {
      img.classList.add("zoomable");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Enlarge figure: " + img.alt);
      img.addEventListener("click", function () { open(img); });
      img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(img); } });
    });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && box && box.classList.contains("open")) close(); });
  }

  /* ---------------- glossary: dotted terms with a definition on hover, focus or tap ---------------- */
  function gslug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function initGlossary() {
    var G = window.MIBEM_GLOSSARY || [];
    var art = doc.querySelector("article");
    if (!art || !G.length || doc.querySelector(".gl-jump")) return;
    var map = {}, words = [];
    G.forEach(function (g) {
      [g.t].concat(g.a || []).forEach(function (w) { map[w.toLowerCase()] = g; words.push(w); });
    });
    words.sort(function (a, b) { return b.length - a.length; });
    var re;
    try {
      re = new RegExp("(^|[^\\p{L}\\p{N}])(" + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?![\\p{L}\\p{N}])", "giu");
    } catch (e) { return; }
    var skipTag = /^(A|CODE|PRE|H1|H2|H3|H4|BUTTON|SCRIPT|STYLE|SUMMARY|TEXTAREA|SELECT|LABEL|OUTPUT|SVG|MARK)$/;
    var skipClass = ["eq", "toc", "demo", "crumbs", "facts", "term", "table-scroll-skip", "pager"];
    var walker = doc.createTreeWalker(art, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        for (var p = n.parentNode; p && p !== art; p = p.parentNode) {
          if (skipTag.test(p.tagName)) return NodeFilter.FILTER_REJECT;
          if (p.classList) for (var i = 0; i < skipClass.length; i++) if (p.classList.contains(skipClass[i])) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], used = {};
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue, last = 0, frag = null, m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        var g = map[m[2].toLowerCase()];
        if (!g || used[g.t]) continue;
        used[g.t] = 1;
        var start = m.index + m[1].length;
        frag = frag || doc.createDocumentFragment();
        frag.appendChild(doc.createTextNode(text.slice(last, start)));
        var span = el("span", "term", esc(m[2]));
        span.tabIndex = 0; span.setAttribute("role", "button"); span.setAttribute("data-term", g.t);
        frag.appendChild(span);
        last = start + m[2].length;
      }
      if (frag) { frag.appendChild(doc.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
    });

    var pop = el("div", "gloss-pop"); pop.setAttribute("role", "tooltip"); pop.hidden = true;
    doc.body.appendChild(pop);
    var current = null, byTerm = {};
    G.forEach(function (g) { byTerm[g.t] = g; });
    function show(t) {
      var g = byTerm[t.getAttribute("data-term")]; if (!g) return;
      current = t;
      pop.innerHTML = "<b>" + esc(g.t) + "</b><p>" + esc(g.d) + '</p><a href="' + esc(ROOT + "glossary.html#" + gslug(g.t)) + '">Glossary entry &rarr;</a>';
      pop.hidden = false;
      var r = t.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
      var left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      var top = r.bottom + 8; if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
      pop.style.left = left + "px"; pop.style.top = top + "px";
    }
    function hide() { pop.hidden = true; current = null; }
    var hideTimer = null;
    art.addEventListener("mouseover", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t) { clearTimeout(hideTimer); show(t); } });
    art.addEventListener("mouseout", function (e) { if (e.target.closest && e.target.closest(".term")) hideTimer = setTimeout(hide, 250); });
    pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    pop.addEventListener("mouseleave", function () { hideTimer = setTimeout(hide, 200); });
    art.addEventListener("focusin", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t) show(t); });
    art.addEventListener("focusout", function (e) { if (e.target.closest && e.target.closest(".term")) hideTimer = setTimeout(hide, 250); });
    art.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t) { e.preventDefault(); if (current === t && !pop.hidden) hide(); else show(t); } });
    art.addEventListener("keydown", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(t); } });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    doc.addEventListener("click", function (e) { if (!e.target.closest(".term") && !e.target.closest(".gloss-pop")) hide(); });
    window.addEventListener("scroll", hide, { passive: true });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    addHeaderButtons();
    initMenu();
    initTocMobile();
    initGlossary();
    initMotion();
    initLightbox();
    initScrollSpy();
    initCopy();
    initBackTop();
    initProgress();
    initMap();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
})();
