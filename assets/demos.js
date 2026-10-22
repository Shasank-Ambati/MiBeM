/* Interactive demos. Each one mounts into <div class="demo" data-demo="name">.
   They run in the visitor's browser with no server. */
(function () {
  "use strict";
  var doc = document;
  var redraws = [];

  function css(name) { return getComputedStyle(doc.documentElement).getPropertyValue(name).trim(); }
  function colours() {
    return { ink: css("--ink"), muted: css("--muted"), accent: css("--accent"), blue: css("--blue"), border: css("--border"), bg: css("--bg"), soft: css("--accent-soft"), code: css("--code-bg"), surface: css("--surface") };
  }
  function el(tag, cls, html) { var n = doc.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var uid = 0;
  function shell(host, title, note) {
    host.innerHTML = "";
    var head = el("div", "demo-head", '<span class="chip blue">Interactive</span><b>' + title + "</b>");
    var body = el("div", "demo-body");
    var controls = el("div", "demo-controls");
    var read = el("div", "demo-read");
    read.setAttribute("aria-live", "polite");
    body.appendChild(controls);
    var api = { host: host, body: body, controls: controls, read: read };
    api.addCanvas = function (w, h, cls) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var c = doc.createElement("canvas");
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.style.aspectRatio = w + " / " + h;
      if (cls) c.className = cls;
      var ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      body.appendChild(c);
      return { c: c, ctx: ctx, w: w, h: h };
    };
    api.finish = function () {
      body.appendChild(read);
      if (note) body.appendChild(el("p", "demo-note", note));
      host.appendChild(head); host.appendChild(body);
    };
    return api;
  }
  function slider(api, label, min, max, step, value, fmt, onInput) {
    var id = "dm" + (++uid);
    var wrap = el("label");
    wrap.setAttribute("for", id);
    var out = el("output");
    var top = el("span", null, label + ": ");
    top.appendChild(out);
    var inp = doc.createElement("input");
    inp.type = "range"; inp.id = id; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    function upd() { out.textContent = fmt(+inp.value); onInput(+inp.value); }
    inp.addEventListener("input", upd);
    wrap.appendChild(top); wrap.appendChild(inp);
    api.controls.appendChild(wrap);
    out.textContent = fmt(+inp.value);
    return { get: function () { return +inp.value; }, el: inp };
  }
  function button(api, label, primary, onClick) {
    var b = el("button", primary ? "primary" : "", label);
    b.type = "button";
    b.addEventListener("click", function () { onClick(b); });
    api.controls.appendChild(b);
    return b;
  }
  function checkbox(api, label, onChange) {
    var id = "dm" + (++uid);
    var wrap = el("label"); wrap.setAttribute("for", id); wrap.style.flexDirection = "row"; wrap.style.alignItems = "center"; wrap.style.gap = "8px";
    var inp = doc.createElement("input"); inp.type = "checkbox"; inp.id = id;
    inp.addEventListener("change", function () { onChange(inp.checked); });
    wrap.appendChild(inp); wrap.appendChild(doc.createTextNode(label));
    api.controls.appendChild(wrap);
    return inp;
  }
  function setRead(api, items) {
    api.read.innerHTML = items.map(function (i) { return "<span>" + i + "</span>"; }).join("");
  }
  function fmtN(x, d) { return (+x).toFixed(d); }

  function axes(ctx, C, p, xl, yl) {
    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
    ctx.fillStyle = C.muted; ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center";
    if (xl) ctx.fillText(xl, (p.x0 + p.x1) / 2, p.y1 + 34);
    if (yl) { ctx.save(); ctx.translate(14, (p.y0 + p.y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yl, 0, 0); ctx.restore(); }
  }

  /* ================= Boltzmann populations ================= */
  function boltzmann(host) {
    var kB = 0.08617; // meV per K
    var api = shell(host, "Boltzmann populations of equally spaced levels",
      "Populations follow p<sub>i</sub> &prop; exp(&minus;i&epsilon;/k<sub>B</sub>T). When k<sub>B</sub>T is much smaller than the spacing &epsilon; nearly everything sits in the lowest level; when k<sub>B</sub>T is much larger, all levels fill almost equally.");
    var eps, T;
    var cv = api.addCanvas(640, 280);
    eps = slider(api, "Level spacing &epsilon;", 10, 200, 1, 50, function (v) { return v + " meV"; }, draw);
    T = slider(api, "Temperature", 50, 1500, 10, 300, function (v) { return v + " K"; }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      var e = eps.get(), t = T.get(), x = e / (kB * t);
      var n = 8, w = [], Z = 0, i;
      for (i = 0; i < n; i++) { w[i] = Math.exp(-i * x); Z += w[i]; }
      ctx.clearRect(0, 0, W, H);
      var p = { x0: 56, y0: 18, x1: W - 16, y1: H - 50 };
      axes(ctx, C, p, "energy level", "probability");
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "right"; ctx.fillStyle = C.muted;
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { var y = p.y1 - v * (p.y1 - p.y0); ctx.fillText(v, p.x0 - 6, y + 4); ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(p.x0, y); ctx.lineTo(p.x1, y); ctx.globalAlpha = .35; ctx.stroke(); ctx.globalAlpha = 1; });
      var slot = (p.x1 - p.x0) / n, bw = slot * 0.62, meanE = 0;
      for (i = 0; i < n; i++) {
        var pr = w[i] / Z; meanE += i * pr;
        var h = pr * (p.y1 - p.y0), bx = p.x0 + slot * i + (slot - bw) / 2;
        ctx.fillStyle = i === 0 ? C.accent : C.blue; ctx.fillRect(bx, p.y1 - h, bw, h);
        ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = "12px system-ui, sans-serif";
        ctx.fillText(i + "ε", bx + bw / 2, p.y1 + 16);
        if (pr > 0.015) ctx.fillText((pr * 100).toFixed(0) + "%", bx + bw / 2, p.y1 - h - 5);
      }
      setRead(api, ["k<sub>B</sub>T/&epsilon; = <b>" + fmtN(1 / x, 2) + "</b>", "ground-level population = <b>" + fmtN(100 * w[0] / Z, 1) + "%</b>", "mean level &lang;i&rang; = <b>" + fmtN(meanE, 2) + "</b>", "partition function Z = <b>" + fmtN(Z, 2) + "</b> (8 levels)"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= Gibbs energy of a regular solution ================= */
  function gibbs(host) {
    var R = 8.314;
    var api = shell(host, "Gibbs energy of mixing and the miscibility gap",
      "Regular solution: G<sub>mix</sub> = &Omega;x(1&minus;x) + RT[x ln x + (1&minus;x) ln(1&minus;x)]. The gap closes at T<sub>c</sub> = &Omega;/2R. Orange dots mark the common-tangent (binodal) compositions; the shaded band is the spinodal, where the curve bends downward.");
    var cv = api.addCanvas(640, 340);
    var om = slider(api, "Interaction &Omega;", 0, 30, 0.5, 20, function (v) { return v.toFixed(1) + " kJ/mol"; }, draw);
    var T = slider(api, "Temperature", 200, 2000, 10, 800, function (v) { return v + " K"; }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function g(x, O, t) { return O * x * (1 - x) + R * t * (x * Math.log(x) + (1 - x) * Math.log(1 - x)); }
    function binodal(O, t) {
      if (O <= 0) return null;
      var f = function (x) { return O * (1 - 2 * x) + R * t * Math.log(x / (1 - x)); };
      var prev = 1e-12, fp = f(prev), N = 4000, a = null, b = null;
      for (var i = 1; i < N; i++) {
        var x = 0.5 * i / N, fx = f(x);
        if (fp < 0 && fx >= 0) { a = prev; b = x; break; }
        prev = x; fp = fx;
      }
      if (a == null) return null;
      for (var k = 0; k < 60; k++) { var m = (a + b) / 2; if (f(m) < 0) a = m; else b = m; }
      return (a + b) / 2;
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      var O = om.get() * 1000, t = T.get();
      var p = { x0: 64, y0: 20, x1: W - 18, y1: H - 52 };
      var xs = [], gs = [], i, gmin = 0, gmax = 0;
      for (i = 1; i < 400; i++) { var x = i / 400; xs.push(x); var gv = g(x, O, t) / 1000; gs.push(gv); gmin = Math.min(gmin, gv); gmax = Math.max(gmax, gv); }
      var span = Math.max(gmax - gmin, 0.5), lo = gmin - 0.12 * span, hi = gmax + 0.12 * span;
      var X = function (x) { return p.x0 + x * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      var Tc = O / (2 * R), xb = binodal(O, t);
      if (xb != null && t < Tc) {
        var u = O > 0 ? R * t / (2 * O) : 0, disc = 1 - 4 * u;
        if (disc > 0) { var s1 = (1 - Math.sqrt(disc)) / 2, s2 = (1 + Math.sqrt(disc)) / 2; ctx.fillStyle = C.soft; ctx.fillRect(X(s1), p.y0, X(s2) - X(s1), p.y1 - p.y0); }
      }
      axes(ctx, C, p, "composition x (fraction of B)", "G mix (kJ/mol)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { ctx.fillText(v, X(v), p.y1 + 15); });
      ctx.textAlign = "right";
      for (var tk = 0; tk < 5; tk++) { var vv = lo + (hi - lo) * tk / 4; ctx.fillText(vv.toFixed(Math.abs(hi - lo) < 3 ? 2 : 1), p.x0 - 6, Y(vv) + 4); }
      if (lo < 0 && hi > 0) { ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.stroke(); ctx.setLineDash([]); }
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
      xs.forEach(function (x, k) { var px = X(x), py = Y(gs[k]); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
      ctx.stroke(); ctx.lineWidth = 1;
      var status;
      if (O <= 0) status = "<span class='status-ok'>ideal solution: no gap</span>";
      else if (xb == null || t >= Tc) status = "<span class='status-ok'>T &ge; T<sub>c</sub>: one phase is stable at every composition</span>";
      else {
        var gb = g(xb, O, t) / 1000;
        ctx.strokeStyle = C.blue; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(xb), Y(gb)); ctx.lineTo(X(1 - xb), Y(gb)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
        [xb, 1 - xb].forEach(function (x) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(x), Y(gb), 5.5, 0, 6.2832); ctx.fill(); ctx.strokeStyle = C.surface; ctx.stroke(); });
        status = "<span class='status-bad'>two phases coexist for x between " + fmtN(xb, 3) + " and " + fmtN(1 - xb, 3) + "</span>";
      }
      setRead(api, ["T<sub>c</sub> = &Omega;/2R = <b>" + (O > 0 ? fmtN(Tc, 0) + " K" : "none") + "</b>", "T = <b>" + t + " K</b>", status]);
    }
    redraws.push(draw); draw();
  }

  /* ================= Ising model, Metropolis Monte Carlo ================= */
  function ising(host) {
    var N = 48, S = 8, spins = new Int8Array(N * N), sweeps = 0, userPaused = false, visible = true;
    var api = shell(host, "Ising model with Metropolis Monte Carlo",
      "Each site holds a spin of +1 or &minus;1 and prefers to align with its neighbours. Temperature is in units of J/k<sub>B</sub>; the exact critical temperature of the 2D square lattice is about 2.27. Run it below T<sub>c</sub> to watch domains coarsen, then drag the slider through T<sub>c</sub>.");
    var cv = api.addCanvas(N * S, N * S, "sq");
    var Tsl = slider(api, "Temperature T/J", 0.5, 4, 0.05, 1.6, function (v) { return v.toFixed(2); }, function () { setRead2(); });
    var runBtn = button(api, "Pause", true, function () { userPaused = !userPaused; syncBtn(); });
    button(api, "Random start", false, function () { randomise(); sweeps = 0; draw(); });
    button(api, "Ordered start", false, function () { spins.fill(1); sweeps = 0; draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function randomise() { for (var i = 0; i < spins.length; i++) spins[i] = Math.random() < 0.5 ? 1 : -1; }
    function syncBtn() { runBtn.textContent = userPaused ? "Run" : "Pause"; }
    function sweep(T) {
      var e4 = Math.exp(-4 / T), e8 = Math.exp(-8 / T);
      for (var k = 0; k < N * N; k++) {
        var i = (Math.random() * N) | 0, j = (Math.random() * N) | 0, id = i * N + j;
        var nb = spins[((i + 1) % N) * N + j] + spins[((i + N - 1) % N) * N + j] + spins[i * N + (j + 1) % N] + spins[i * N + (j + N - 1) % N];
        var dE = 2 * spins[id] * nb;
        if (dE <= 0 || Math.random() < (dE === 4 ? e4 : e8)) spins[id] = -spins[id];
      }
      sweeps++;
    }
    function stats() {
      var m = 0, e = 0, i, j;
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) { var s = spins[i * N + j]; m += s; e -= s * (spins[((i + 1) % N) * N + j] + spins[i * N + (j + 1) % N]); }
      return { m: Math.abs(m) / (N * N), e: e / (N * N) };
    }
    function setRead2() { var st = stats(), T = Tsl.get(); setRead(api, ["T/J = <b>" + fmtN(T, 2) + "</b> " + (T < 2.27 ? "(below T<sub>c</sub>)" : "(above T<sub>c</sub>)"), "|magnetisation| per spin = <b>" + fmtN(st.m, 2) + "</b>", "energy per spin = <b>" + fmtN(st.e, 2) + "</b> J", "sweeps = <b>" + sweeps + "</b>"]); }
    function draw() {
      var C = colours(), ctx = cv.ctx;
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) { ctx.fillStyle = spins[i * N + j] > 0 ? C.accent : C.code; ctx.fillRect(j * S, i * S, S, S); }
      setRead2();
    }
    function frame() {
      if (visible && !userPaused) { var T = Tsl.get(); sweep(T); sweep(T); draw(); }
      setTimeout(frame, 40);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.2 }).observe(host); else visible = true;
    randomise(); draw(); redraws.push(draw); setTimeout(frame, 40);
  }

  /* ================= Explicit diffusion solver and its stability limit ================= */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function diffusion(host) {
    var N = 120, c = new Float64Array(N), tmp = new Float64Array(N), n = 0, running = false, blown = false;
    var api = shell(host, "Explicit finite-difference diffusion: when does it blow up?",
      "The scheme c<sub>i</sub> &larr; c<sub>i</sub> + r(c<sub>i+1</sub> &minus; 2c<sub>i</sub> + c<sub>i&minus;1</sub>) with r = D&Delta;t/&Delta;x&sup2; is stable only for r &le; 0.5. Set r above that and press Run: the solution oscillates and grows without bound. Below it, the numerical profile (orange) follows the exact error-function solution (blue dashed).");
    var cv = api.addCanvas(640, 320);
    var rsl = slider(api, "Stability number r", 0.05, 0.8, 0.01, 0.25, function (v) { return v.toFixed(2); }, function () { readout(); });
    var runBtn = button(api, "Run", true, function () { if (blown) reset(); running = !running; runBtn.textContent = running ? "Pause" : "Run"; });
    button(api, "Reset", false, function () { reset(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function reset() { for (var i = 0; i < N; i++) c[i] = i < N / 2 ? 1 : 0; n = 0; blown = false; running = false; runBtn.textContent = "Run"; draw(); }
    function step() {
      var r = rsl.get();
      for (var i = 1; i < N - 1; i++) tmp[i] = c[i] + r * (c[i + 1] - 2 * c[i] + c[i - 1]);
      tmp[0] = 1; tmp[N - 1] = 0;
      var mx = 0;
      for (i = 0; i < N; i++) { c[i] = tmp[i]; mx = Math.max(mx, Math.abs(c[i])); }
      n++;
      if (mx > 1e3) { blown = true; running = false; runBtn.textContent = "Run"; }
    }
    function readout() {
      var r = rsl.get(), mn = 1e9, mx = -1e9;
      for (var i = 0; i < N; i++) { mn = Math.min(mn, c[i]); mx = Math.max(mx, c[i]); }
      var st = blown ? "<span class='status-bad'>blown up (values exceed 1000)</span>" : (r <= 0.5 ? "<span class='status-ok'>stable (r &le; 0.5)</span>" : "<span class='status-bad'>unstable (r &gt; 0.5)</span>");
      setRead(api, ["r = <b>" + fmtN(r, 2) + "</b>", "time steps = <b>" + n + "</b>", "min c = <b>" + (Math.abs(mn) > 1e3 ? mn.toExponential(1) : fmtN(mn, 3)) + "</b>, max c = <b>" + (Math.abs(mx) > 1e3 ? mx.toExponential(1) : fmtN(mx, 3)) + "</b>", st]);
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      var p = { x0: 52, y0: 16, x1: W - 16, y1: H - 46 }, lo = -0.5, hi = 1.5;
      var X = function (i) { return p.x0 + i / (N - 1) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (Math.max(lo - 0.1, Math.min(hi + 0.1, v)) - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "position (grid cells)", "concentration c");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "right";
      [-0.5, 0, 0.5, 1, 1.5].forEach(function (v) { ctx.fillText(v, p.x0 - 6, Y(v) + 4); });
      ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]);
      [0, 1].forEach(function (v) { ctx.beginPath(); ctx.moveTo(p.x0, Y(v)); ctx.lineTo(p.x1, Y(v)); ctx.stroke(); }); ctx.setLineDash([]);
      var r = rsl.get();
      if (n > 0 && r <= 0.5 && !blown) {
        var dt = r * n; ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath();
        for (var i = 0; i < N; i++) { var cc = 0.5 * (1 - erf((i - (N / 2 - 0.5)) / (2 * Math.sqrt(dt)))); if (i === 0) ctx.moveTo(X(i), Y(cc)); else ctx.lineTo(X(i), Y(cc)); }
        ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      }
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var k = 0; k < N; k++) { if (k === 0) ctx.moveTo(X(k), Y(c[k])); else ctx.lineTo(X(k), Y(c[k])); }
      ctx.stroke(); ctx.lineWidth = 1;
      readout();
    }
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(host);
    function frame() { if (running && visible && n < 1500) { for (var s = 0; s < 3; s++) { if (!blown) step(); } draw(); } else if (n >= 1500 && running) { running = false; runBtn.textContent = "Run"; } setTimeout(frame, 30); }
    reset(); redraws.push(draw); setTimeout(frame, 30);
  }

  /* ================= Lennard-Jones potential ================= */
  function lj(host) {
    var api = shell(host, "Lennard-Jones potential explorer",
      "U(r) = 4&epsilon;[(&sigma;/r)<sup>12</sup> &minus; (&sigma;/r)<sup>6</sup>]. The minimum is at 2<sup>1/6</sup>&sigma; with depth &epsilon;, the energy is zero at r = &sigma;, and the force vanishes at the minimum. The defaults are typical values for argon. Truncating at a cutoff ignores the small attractive tail beyond it.");
    var cv = api.addCanvas(640, 340);
    var eps = slider(api, "Well depth &epsilon;", 5, 60, 0.5, 10.4, function (v) { return v.toFixed(1) + " meV"; }, draw);
    var sig = slider(api, "Size &sigma;", 2, 4.5, 0.05, 3.4, function (v) { return v.toFixed(2) + " Å"; }, draw);
    var rc = slider(api, "Cutoff r<sub>c</sub>/&sigma;", 1.5, 4, 0.1, 2.5, function (v) { return v.toFixed(1); }, draw);
    var forceMode = false;
    checkbox(api, "Plot force instead of energy", function (v) { forceMode = v; draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      var e = eps.get(), s = sig.get(), cut = rc.get();
      var U = function (r) { var q = Math.pow(s / r, 6); return 4 * e * (q * q - q); };
      var F = function (r) { var q = Math.pow(s / r, 6); return 24 * e / r * (2 * q * q - q); };
      var f = forceMode ? F : U;
      var r0 = 0.88 * s, r1 = 3.6 * s;
      var lo = forceMode ? -3 * e / s : -1.4 * e, hi = forceMode ? 8 * e / s : 2.2 * e;
      var p = { x0: 66, y0: 18, x1: W - 18, y1: H - 50 };
      var X = function (r) { return p.x0 + (r - r0) / (r1 - r0) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (Math.max(lo - (hi - lo) * 0.05, Math.min(hi + (hi - lo) * 0.05, v)) - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "separation r (Å)", forceMode ? "force (meV/Å)" : "energy U (meV)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      for (var tk = 0; tk <= 6; tk++) { var rv = r0 + (r1 - r0) * tk / 6; ctx.fillText(rv.toFixed(1), X(rv), p.y1 + 15); }
      ctx.textAlign = "right";
      var unit = forceMode ? e / s : e, ticks = forceMode ? [-2, 0, 2, 4, 6, 8] : [-1, 0, 1, 2];
      ticks.forEach(function (m) { var yv = m * unit; ctx.fillText(yv.toFixed(forceMode ? 1 : 1), p.x0 - 6, Y(yv) + 4); ctx.strokeStyle = C.border; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(p.x0, Y(yv)); ctx.lineTo(p.x1, Y(yv)); ctx.stroke(); ctx.globalAlpha = 1; });
      ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      var rmin = Math.pow(2, 1 / 6) * s;
      ctx.strokeStyle = C.blue; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(cut * s), p.y0); ctx.lineTo(X(cut * s), p.y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.blue; ctx.textAlign = "left"; ctx.fillText("cutoff", X(cut * s) + 4, p.y0 + 12);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
      var first = true;
      for (var k = 0; k <= 400; k++) { var r = r0 + (r1 - r0) * k / 400, v = f(r); if (v > hi * 1.05 && first) continue; var px = X(r), py = Y(v); if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py); }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(rmin), Y(f(rmin)), 5.5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(forceMode ? "force = 0 at r_min" : "minimum", X(rmin) + 9, Y(f(rmin)) + (forceMode ? -8 : 14));
      var uc = U(cut * s);
      setRead(api, ["r<sub>min</sub> = 2<sup>1/6</sup>&sigma; = <b>" + fmtN(rmin, 2) + " &Aring;</b>", "U at cutoff = <b>" + fmtN(uc, 3) + " meV</b> (" + fmtN(100 * Math.abs(uc) / e, 2) + "% of &epsilon;)", "U(&sigma;) = <b>0</b>, U(r<sub>min</sub>) = <b>&minus;" + fmtN(e, 1) + " meV</b>"]);
    }
    redraws.push(draw); draw();
  }

  var REG = { boltzmann: boltzmann, gibbs: gibbs, ising: ising, diffusion: diffusion, lj: lj };
  function boot() {
    doc.querySelectorAll(".demo[data-demo]").forEach(function (h) { var f = REG[h.getAttribute("data-demo")]; if (f) { try { f(h); } catch (e) { h.innerHTML = '<div class="demo-body"><p class="demo-note">This demo could not start in your browser.</p></div>'; if (window.console) console.error(e); } } });
    var redrawAll = function () { redraws.forEach(function (f) { f(); }); };
    new MutationObserver(redrawAll).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", redrawAll); }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
})();
