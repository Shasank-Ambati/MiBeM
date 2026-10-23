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

  /* ================= Fourier synthesis of a square wave ================= */
  function fourier(host) {
    var api = shell(host, "Fourier synthesis: building a square wave from sine waves",
      "The square wave is the sum (4/&pi;)[sin x + sin 3x / 3 + sin 5x / 5 + &hellip;]. Each added term sharpens the edge, but near the jump the sum always overshoots by about 9% of the jump height (the Gibbs phenomenon), which is why sharp features cause ringing in plane-wave and spectral methods.");
    var cv = api.addCanvas(640, 300);
    var nsl = slider(api, "Number of terms", 1, 60, 1, 3, function (v) { return String(v); }, draw);
    var showTarget = true;
    checkbox(api, "Show the target square wave", function (v) { showTarget = v; draw(); }).checked = true;
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, N = nsl.get();
      var p = { x0: 50, y0: 16, x1: W - 16, y1: H - 44 }, lo = -1.5, hi = 1.5;
      var X = function (x) { return p.x0 + x / (2 * Math.PI) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "x (one period, 0 to 2π)", "f(x)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "right";
      [-1, 0, 1].forEach(function (v) { ctx.fillText(v, p.x0 - 6, Y(v) + 4); });
      ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]);
      [-1, 1].forEach(function (v) { ctx.beginPath(); ctx.moveTo(p.x0, Y(v)); ctx.lineTo(p.x1, Y(v)); ctx.stroke(); }); ctx.setLineDash([]);
      if (showTarget) {
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(1)); ctx.lineTo(X(Math.PI), Y(1)); ctx.lineTo(X(Math.PI), Y(-1)); ctx.lineTo(X(2 * Math.PI), Y(-1)); ctx.lineTo(X(2 * Math.PI), Y(0));
        ctx.stroke(); ctx.lineWidth = 1;
      }
      var maxv = -9, steps = 4000;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var x = 2 * Math.PI * i / steps, s = 0;
        for (var k = 1; k <= 2 * N - 1; k += 2) s += Math.sin(k * x) / k;
        s *= 4 / Math.PI; if (s > maxv) maxv = s;
        if (i === 0) ctx.moveTo(X(x), Y(s)); else ctx.lineTo(X(x), Y(s));
      }
      ctx.stroke(); ctx.lineWidth = 1;
      setRead(api, ["terms = <b>" + N + "</b> (highest harmonic " + (2 * N - 1) + ")", "peak value = <b>" + fmtN(maxv, 3) + "</b>", "overshoot = <b>" + fmtN((maxv - 1) / 2 * 100, 1) + "%</b> of the jump (limit about 9%)"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= Particle in a box ================= */
  function box(host) {
    var api = shell(host, "Particle in a box: confinement sets the energy scale",
      "E<sub>n</sub> = n&sup2;h&sup2;/(8mL&sup2;) = n&sup2; &times; 37.6 eV&middot;&Aring;&sup2; / L&sup2; for an electron. Narrowing the box raises every level; higher states have more nodes in the wavefunction &psi;<sub>n</sub> = &radic;(2/L) sin(n&pi;x/L).");
    var cv = api.addCanvas(640, 320);
    var Lsl = slider(api, "Box width L", 2, 20, 0.5, 6, function (v) { return v.toFixed(1) + " Å"; }, draw);
    var nsl = slider(api, "Level n", 1, 6, 1, 1, function (v) { return String(v); }, draw);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, L = Lsl.get(), n = nsl.get();
      var E1 = 37.61 / (L * L);
      ctx.clearRect(0, 0, W, H);
      // left: level diagram
      var a = { x0: 52, y0: 20, x1: 250, y1: H - 30 };
      ctx.strokeStyle = C.border; ctx.strokeRect(a.x0, a.y0, a.x1 - a.x0, a.y1 - a.y0);
      ctx.fillStyle = C.muted; ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("energy levels", (a.x0 + a.x1) / 2, a.y1 + 20);
      var Emax = 36 * E1;
      for (var k = 1; k <= 6; k++) {
        var y = a.y1 - (k * k * E1) / Emax * (a.y1 - a.y0 - 8) - 4;
        ctx.strokeStyle = k === n ? C.accent : C.blue; ctx.lineWidth = k === n ? 3.5 : 2;
        ctx.beginPath(); ctx.moveTo(a.x0 + 30, y); ctx.lineTo(a.x1 - 14, y); ctx.stroke();
        ctx.fillStyle = k === n ? C.accent : C.ink; ctx.textAlign = "right"; ctx.font = (k === n ? "bold " : "") + "11px system-ui, sans-serif";
        ctx.fillText("n=" + k, a.x0 + 26, y + 4);
        if (k <= 4 || k === n) { ctx.textAlign = "left"; ctx.fillStyle = C.muted; ctx.fillText((k * k * E1).toFixed(2) + " eV", a.x1 - 70, y - 5); }
      }
      ctx.lineWidth = 1;
      // right: wavefunction
      var b = { x0: 300, y0: 20, x1: W - 16, y1: H - 30 };
      ctx.strokeStyle = C.border; ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
      var ymid = (b.y0 + b.y1) / 2, amp = (b.y1 - b.y0) * 0.38;
      ctx.beginPath(); ctx.moveTo(b.x0, ymid); ctx.lineTo(b.x1, ymid); ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      var bx0 = b.x0 + 24, bx1 = b.x1 - 24;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx0, b.y0 + 6); ctx.lineTo(bx0, b.y1 - 6); ctx.moveTo(bx1, b.y0 + 6); ctx.lineTo(bx1, b.y1 - 6); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(bx0, b.y1 - 6);
      for (var i = 0; i <= 200; i++) { var x = i / 200, v = Math.pow(Math.sin(n * Math.PI * x), 2); ctx.lineTo(bx0 + x * (bx1 - bx0), b.y1 - 6 - v * amp * 1.3); }
      ctx.lineTo(bx1, b.y1 - 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.8; ctx.beginPath();
      for (var j = 0; j <= 200; j++) { var xx = j / 200, psi = Math.sin(n * Math.PI * xx); if (j === 0) ctx.moveTo(bx0, ymid - psi * amp); else ctx.lineTo(bx0 + xx * (bx1 - bx0), ymid - psi * amp); }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = C.muted; ctx.textAlign = "center"; ctx.font = "12px system-ui, sans-serif";
      ctx.fillText("wavefunction ψ (line) and probability density |ψ|² (shaded), n = " + n, (b.x0 + b.x1) / 2, b.y1 + 20);
      setRead(api, ["E<sub>1</sub> = <b>" + fmtN(E1, 3) + " eV</b>", "E<sub>" + n + "</sub> = <b>" + fmtN(n * n * E1, 3) + " eV</b>", "spacing E<sub>2</sub> &minus; E<sub>1</sub> = <b>" + fmtN(3 * E1, 3) + " eV</b>", "nodes inside the box = <b>" + (n - 1) + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= finite-difference step size: truncation versus round-off ================= */
  function fdstep(host) {
    var api = shell(host, "Finite-difference step size: truncation error versus round-off",
      "Error in estimating the derivative of sin(x). For large h the truncation error dominates and falls as h (forward) or h&sup2; (central); for small h round-off error grows like &epsilon;/h. The best step is about &radic;&epsilon; for forward and &epsilon;<sup>1/3</sup> for central differences. Below about 10<sup>&minus;16</sup> the step vanishes (x + h = x) and the error plateaus at |cos x|.");
    var cv = api.addCanvas(640, 340);
    var xsl = slider(api, "Evaluation point x", 0.2, 3, 0.1, 1, function (v) { return v.toFixed(1); }, draw);
    var single = false;
    checkbox(api, "Single precision (float32)", function (v) { single = v; draw(); });
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, x0 = xsl.get();
      var fr = single ? Math.fround : function (v) { return v; };
      var f = function (x) { return fr(Math.sin(x)); };
      var exact = Math.cos(x0);
      var p = { x0: 56, y0: 18, x1: W - 16, y1: H - 50 }, lx0 = -16, lx1 = 0, ly0 = -17, ly1 = 1;
      var X = function (e) { return p.x0 + (e - lx0) / (lx1 - lx0) * (p.x1 - p.x0); }, Y = function (e) { return p.y1 - (e - ly0) / (ly1 - ly0) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "step size h (log scale)", "error in derivative (log scale)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      for (var e = lx0; e <= lx1; e += 2) ctx.fillText("1e" + e, X(e), p.y1 + 15);
      ctx.textAlign = "right";
      for (var q = -16; q <= 0; q += 4) { ctx.fillText("1e" + q, p.x0 - 6, Y(q) + 4); ctx.strokeStyle = C.border; ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(p.x0, Y(q)); ctx.lineTo(p.x1, Y(q)); ctx.stroke(); ctx.globalAlpha = 1; }
      function curve(fn, colour) {
        ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.beginPath();
        var best = { le: 0, err: 9 };
        for (var k = 0; k <= 320; k++) {
          var le = lx0 + (lx1 - lx0) * k / 320, h = Math.pow(10, le);
          var err = Math.abs(fn(h) - exact);
          if (err < best.err) best = { le: le, err: err };
          var yy = Y(Math.log10(Math.max(err, 1e-17)));
          if (k === 0) ctx.moveTo(X(le), yy); else ctx.lineTo(X(le), yy);
        }
        ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(X(best.le), Y(Math.log10(Math.max(best.err, 1e-17))), 5, 0, 6.2832); ctx.fill();
        return best;
      }
      var fwd = function (h) { var xh = fr(x0 + h); return fr(fr(f(xh) - f(x0)) / fr(h)); };
      var cen = function (h) { var a = fr(x0 + h), b = fr(x0 - h); return fr(fr(f(a) - f(b)) / fr(2 * h)); };
      var bf = curve(fwd, C.accent), bc = curve(cen, C.blue);
      ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillStyle = C.accent; ctx.fillText("forward difference", p.x0 + 10, p.y0 + 16);
      ctx.fillStyle = C.blue; ctx.fillText("central difference", p.x0 + 10, p.y0 + 34);
      setRead(api, ["forward: best h = <b>" + Math.pow(10, bf.le).toExponential(1) + "</b>, error <b>" + bf.err.toExponential(1) + "</b>", "central: best h = <b>" + Math.pow(10, bc.le).toExponential(1) + "</b>, error <b>" + bc.err.toExponential(1) + "</b>", "machine epsilon = <b>" + (single ? "1.2e-7" : "2.2e-16") + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= beginner demos ================= */

  function units(host) {
    var api = shell(host, "Unit converter: energy and length",
      "Type a value and pick its unit. Scientists move between these units constantly, so it is worth getting a feel for the sizes: 1 eV is the energy an electron gains crossing 1 volt, and 1 Ångström is a tenth of a nanometre, about the size of an atom.");
    var E = { "eV": 1, "meV": 1e-3, "J": 1 / 1.602176634e-19, "kJ/mol": 1 / 96.485332, "kcal/mol": 1 / 23.060548, "K (as energy/kᴮ)": 1 / 11604.518, "Hartree": 27.211386 };
    var Lg = { "Å": 1, "pm": 0.01, "nm": 10, "µm": 1e4, "mm": 1e7, "m": 1e10 };
    function block(title, table, def, unit0, dec) {
      var wrap = el("div"); wrap.style.minWidth = "260px"; wrap.style.flex = "1 1 260px";
      wrap.appendChild(el("b", null, title));
      var row = el("div"); row.style.cssText = "display:flex;gap:8px;margin:8px 0";
      var inp = doc.createElement("input"); inp.type = "number"; inp.value = def; inp.step = "any"; inp.style.cssText = "flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit";
      inp.setAttribute("aria-label", title + " value");
      var sel = doc.createElement("select"); sel.style.cssText = "padding:6px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit";
      sel.setAttribute("aria-label", title + " unit");
      Object.keys(table).forEach(function (u) { var o = doc.createElement("option"); o.value = u; o.textContent = u; if (u === unit0) o.selected = true; sel.appendChild(o); });
      row.appendChild(inp); row.appendChild(sel); wrap.appendChild(row);
      var res = el("div"); res.style.cssText = "font-size:.88rem;color:var(--muted);line-height:1.7"; wrap.appendChild(res);
      function upd() {
        var base = parseFloat(inp.value) * table[sel.value], h = "";
        if (isNaN(base)) { res.textContent = "Enter a number."; return; }
        Object.keys(table).forEach(function (u) { if (u !== sel.value) { var v = base / table[u]; h += "<div>= <b>" + (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(3) : +v.toPrecision(5)) + "</b> " + u + "</div>"; } });
        res.innerHTML = h;
      }
      inp.addEventListener("input", upd); sel.addEventListener("change", upd); upd();
      api.controls.appendChild(wrap);
    }
    block("Energy", E, 1, "eV");
    block("Length", Lg, 2.5, "Å");
    api.controls.style.alignItems = "flex-start";
    api.finish();
  }

  /* ---- graph explorer ---- */
  function graphs(host) {
    var api = shell(host, "Graph explorer: four shapes you will keep meeting",
      "Straight lines describe steady change, parabolas describe the bottom of an energy valley, exponentials describe growth and decay, and power laws describe scaling. Tick the log scale box with the exponential: it becomes a straight line.");
    var cv = api.addCanvas(640, 320);
    var type = "linear", logy = false;
    var selWrap = el("label"); selWrap.appendChild(el("span", null, "Shape"));
    var sel = doc.createElement("select"); sel.style.cssText = "padding:6px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit";
    [["linear", "Straight line  y = m x + c"], ["quad", "Parabola  y = a (x − 3)² + c"], ["exp", "Exponential  y = A e^(k x)"], ["power", "Power law  y = A x^p"]].forEach(function (o) { var op = doc.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op); });
    selWrap.appendChild(sel); api.controls.appendChild(selWrap);
    var p1 = slider(api, "parameter 1", -3, 3, 0.1, 1, function (v) { return v.toFixed(1); }, draw);
    var p2 = slider(api, "parameter 2", -5, 5, 0.1, 1, function (v) { return v.toFixed(1); }, draw);
    var lab1 = p1.el.parentNode.firstChild, lab2 = p2.el.parentNode.firstChild;
    function relabel() {
      var cfg = { linear: ["slope m", -3, 3, 1, "intercept c", -5, 5, 1], quad: ["a (opening)", -1, 1, 0.3, "c (height of the bottom)", -5, 5, 0], exp: ["rate k", -0.8, 0.8, 0.3, "starting value A", 0.1, 5, 1], power: ["power p", -2, 3, 2, "scale A", 0.1, 3, 1] }[type];
      lab1.childNodes[0].nodeValue = cfg[0] + ": "; lab2.childNodes[0].nodeValue = cfg[4] + ": ";
      p1.el.min = cfg[1]; p1.el.max = cfg[2]; p1.el.value = cfg[3];
      p2.el.min = cfg[5]; p2.el.max = cfg[6]; p2.el.value = cfg[7];
      p1.el.dispatchEvent(new Event("input")); p2.el.dispatchEvent(new Event("input"));
    }
    sel.addEventListener("change", function () { type = sel.value; relabel(); });
    checkbox(api, "Log scale on the y axis", function (v) { logy = v; draw(); });
    api.finish();
    function f(x) {
      var a = p1.get(), b = p2.get();
      if (type === "linear") return a * x + b;
      if (type === "quad") return a * (x - 3) * (x - 3) + b;
      if (type === "exp") return b * Math.exp(a * x);
      return b * Math.pow(Math.max(x, 1e-9), a);
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      var p = { x0: 56, y0: 16, x1: W - 16, y1: H - 44 }, N = 200, xs = [], ys = [], i;
      for (i = 0; i <= N; i++) { xs.push(10 * i / N); ys.push(f(xs[i])); }
      var ok = !logy || ys.every(function (v) { return v > 0 && isFinite(v); });
      var vals = logy && ok ? ys.map(function (v) { return Math.log10(v); }) : ys.filter(isFinite);
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
      if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
      var pad = (hi - lo) * 0.1; lo -= pad; hi += pad;
      var X = function (x) { return p.x0 + x / 10 * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "x", logy && ok ? "log₁₀ of y" : "y");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      for (i = 0; i <= 10; i += 2) ctx.fillText(i, X(i), p.y1 + 15);
      ctx.textAlign = "right";
      for (i = 0; i <= 4; i++) { var v = lo + (hi - lo) * i / 4; ctx.fillText(v.toFixed(Math.abs(hi - lo) < 5 ? 2 : 1), p.x0 - 6, Y(v) + 4); }
      if (lo < 0 && hi > 0) { ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.stroke(); ctx.setLineDash([]); }
      if (!ok) { ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = "14px system-ui, sans-serif"; ctx.fillText("A log scale needs positive values: choose a shape and settings where y > 0.", W / 2, H / 2); }
      else {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
        var started = false;
        for (i = 0; i <= N; i++) { var yv = logy ? Math.log10(ys[i]) : ys[i]; if (!isFinite(yv)) continue; var yy = Y(yv); if (!started) { ctx.moveTo(X(xs[i]), yy); started = true; } else ctx.lineTo(X(xs[i]), yy); }
        ctx.stroke(); ctx.lineWidth = 1;
      }
      var a = p1.get(), b = p2.get(), msg;
      if (type === "linear") msg = "slope = <b>" + fmtN(a, 1) + "</b> (y changes by this much for each step in x); crosses the y axis at <b>" + fmtN(b, 1) + "</b>";
      else if (type === "quad") msg = "lowest or highest point at x = <b>3</b>, y = <b>" + fmtN(b, 1) + "</b>; " + (a > 0 ? "opens upward like an energy valley" : a < 0 ? "opens downward like a hill" : "a = 0 gives a flat line");
      else if (type === "exp") msg = a > 0 ? "doubling time = ln 2 / k = <b>" + fmtN(Math.LN2 / a, 2) + "</b>" : a < 0 ? "half-life = ln 2 / |k| = <b>" + fmtN(Math.LN2 / -a, 2) + "</b>" : "k = 0 gives a flat line";
      else msg = "doubling x multiplies y by <b>" + fmtN(Math.pow(2, a), 2) + "</b>";
      setRead(api, [msg]);
    }
    relabel(); redraws.push(draw);
  }

  /* ---- tangent and slope ---- */
  function tangent(host) {
    var api = shell(host, "Slope at a point: from secant to tangent",
      "The slope between two points on a curve (blue, a secant) approaches the slope of the curve at one point (orange, the tangent) as the two points move together. That limit is the derivative.");
    var cv = api.addCanvas(640, 320);
    var fn = "x2";
    var sel = doc.createElement("select"); sel.style.cssText = "padding:6px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit";
    [["x2", "f(x) = x²"], ["sin", "f(x) = sin x"], ["cubic", "f(x) = x³/3 − x"]].forEach(function (o) { var op = doc.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op); });
    var w0 = el("label"); w0.appendChild(el("span", null, "Curve")); w0.appendChild(sel); api.controls.appendChild(w0);
    sel.addEventListener("change", function () { fn = sel.value; draw(); });
    var x0s = slider(api, "Point x", -2.5, 2.5, 0.05, 1, function (v) { return v.toFixed(2); }, draw);
    var hs = slider(api, "Gap h to the second point", 0.02, 2, 0.02, 1.2, function (v) { return v.toFixed(2); }, draw);
    api.finish();
    var F = { x2: [function (x) { return x * x; }, function (x) { return 2 * x; }], sin: [Math.sin, Math.cos], cubic: [function (x) { return x * x * x / 3 - x; }, function (x) { return x * x - 1; }] };
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, f = F[fn][0], d = F[fn][1], x0 = x0s.get(), h = hs.get();
      var p = { x0: 50, y0: 16, x1: W - 16, y1: H - 40 }, lo = -3, hi = 5, xl = -3, xh = 3;
      var X = function (x) { return p.x0 + (x - xl) / (xh - xl) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - lo) / (hi - lo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "x", "f(x)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      for (var t = -3; t <= 3; t++) ctx.fillText(t, X(t), p.y1 + 15);
      ctx.textAlign = "right"; for (var u = -2; u <= 4; u += 2) ctx.fillText(u, p.x0 - 6, Y(u) + 4);
      ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.moveTo(X(0), p.y0); ctx.lineTo(X(0), p.y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.beginPath(); ctx.rect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); ctx.clip();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 200; i++) { var x = xl + (xh - xl) * i / 200; if (i === 0) ctx.moveTo(X(x), Y(f(x))); else ctx.lineTo(X(x), Y(f(x))); }
      ctx.stroke();
      var y0 = f(x0), sec = (f(x0 + h) - y0) / h, tan = d(x0);
      function line(slope, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X(xl), Y(y0 + slope * (xl - x0))); ctx.lineTo(X(xh), Y(y0 + slope * (xh - x0))); ctx.stroke(); }
      line(sec, C.blue, 2); line(tan, C.accent, 2.5);
      ctx.restore(); ctx.lineWidth = 1;
      [[x0, C.accent], [x0 + h, C.blue]].forEach(function (pt) { ctx.fillStyle = pt[1]; ctx.beginPath(); ctx.arc(X(pt[0]), Y(f(pt[0])), 5.5, 0, 6.2832); ctx.fill(); });
      setRead(api, ["secant slope (blue) = <b>" + fmtN(sec, 3) + "</b>", "tangent slope, the derivative (orange) = <b>" + fmtN(tan, 3) + "</b>", "difference = <b>" + fmtN(Math.abs(sec - tan), 3) + "</b> (shrinks as h shrinks)"]);
    }
    redraws.push(draw); draw();
  }

  /* ---- area under a curve ---- */
  function area(host) {
    var api = shell(host, "Adding up thin slices: the area under a curve",
      "Left-edge rectangles approximate the area under the curve. With more, thinner rectangles the sum approaches the exact area: that limit is the integral.");
    var cv = api.addCanvas(640, 320);
    var fn = "x2";
    var sel = doc.createElement("select"); sel.style.cssText = "padding:6px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit";
    [["x2", "f(x) = x² from 0 to 3"], ["sin", "f(x) = sin x from 0 to π"], ["speed", "speed = 2x from 0 to 4"]].forEach(function (o) { var op = doc.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op); });
    var w0 = el("label"); w0.appendChild(el("span", null, "Curve")); w0.appendChild(sel); api.controls.appendChild(w0);
    sel.addEventListener("change", function () { fn = sel.value; draw(); });
    var ns = slider(api, "Number of rectangles", 1, 100, 1, 6, function (v) { return String(v); }, draw);
    api.finish();
    var CF = { x2: { f: function (x) { return x * x; }, a: 0, b: 3, ex: 9, top: 10 }, sin: { f: Math.sin, a: 0, b: Math.PI, ex: 2, top: 1.2 }, speed: { f: function (x) { return 2 * x; }, a: 0, b: 4, ex: 16, top: 9 } };
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, c = CF[fn], n = ns.get();
      var p = { x0: 50, y0: 16, x1: W - 16, y1: H - 40 };
      var X = function (x) { return p.x0 + (x - c.a) / (c.b - c.a) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - v / c.top * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "x", "f(x)");
      var dx = (c.b - c.a) / n, sum = 0;
      ctx.fillStyle = C.soft; ctx.strokeStyle = C.accent;
      for (var i = 0; i < n; i++) { var xl = c.a + i * dx, v = c.f(xl); sum += v * dx; ctx.fillRect(X(xl), Y(v), X(xl + dx) - X(xl), p.y1 - Y(v)); if (n <= 60) ctx.strokeRect(X(xl), Y(v), X(xl + dx) - X(xl), p.y1 - Y(v)); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var k = 0; k <= 200; k++) { var x = c.a + (c.b - c.a) * k / 200; if (k === 0) ctx.moveTo(X(x), Y(c.f(x))); else ctx.lineTo(X(x), Y(c.f(x))); }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = C.muted; ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(c.a.toFixed(0), X(c.a), p.y1 + 15); ctx.fillText(c.b.toFixed(2), X(c.b), p.y1 + 15);
      setRead(api, ["rectangles = <b>" + n + "</b>", "sum of areas = <b>" + fmtN(sum, 3) + "</b>", "exact area = <b>" + fmtN(c.ex, 3) + "</b>", "error = <b>" + fmtN(Math.abs(sum - c.ex), 3) + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ---- a chemical bond as an energy curve ---- */
  function bond(host) {
    var D0 = 1.0, a = 0.8, r0 = 2.5;
    var api = shell(host, "Why atoms stay at a distance: a bond as an energy curve",
      "Too close and the atoms repel; too far and they attract; the energy is lowest at the bond length. The force is minus the slope of the energy curve. A deeper well (a stronger bond) is stiffer, which is why strongly bonded materials are stiffer and melt at higher temperatures. This uses a Morse curve with typical numbers: bond length 2.5 Å.");
    var cv = api.addCanvas(640, 320);
    var rs = slider(api, "Distance between the atoms", 1.8, 6, 0.05, 3.4, function (v) { return v.toFixed(2) + " Å"; }, draw);
    var Ds = slider(api, "Bond strength (well depth)", 0.2, 3, 0.1, 1, function (v) { return v.toFixed(1) + " eV"; }, draw);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, r = rs.get(), D = Ds.get();
      var U = function (x) { var e = Math.exp(-a * (x - r0)); return D * ((1 - e) * (1 - e) - 1); };
      var F = function (x) { var e = Math.exp(-a * (x - r0)); return -2 * D * a * (1 - e) * e; }; // -dU/dr
      var p = { x0: 56, y0: 120, x1: W - 16, y1: H - 40 }, rl = 1.8, rh = 6, ulo = -3.2, uhi = 3;
      var X = function (x) { return p.x0 + (x - rl) / (rh - rl) * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - ulo) / (uhi - ulo) * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "distance between atoms (Å)", "energy (eV)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "right";
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (v) { ctx.fillText(v, p.x0 - 6, Y(v) + 4); });
      ctx.textAlign = "center"; for (var t = 2; t <= 6; t++) ctx.fillText(t, X(t), p.y1 + 15);
      ctx.strokeStyle = C.border; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.beginPath(); ctx.rect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); ctx.clip();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= 240; i++) { var x = rl + (rh - rl) * i / 240; if (i === 0) ctx.moveTo(X(x), Y(U(x))); else ctx.lineTo(X(x), Y(U(x))); }
      ctx.stroke(); ctx.restore(); ctx.lineWidth = 1;
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(r), Y(U(r)), 6, 0, 6.2832); ctx.fill();
      // the two atoms
      var cx = W / 2, cy = 56, scale = 34, d = (r - rl) * 0 + r * scale * 0.55;
      var ax = cx - d / 2, bx = cx + d / 2;
      [ax, bx].forEach(function (px) { ctx.fillStyle = C.blue; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(px, cy, 17, 0, 6.2832); ctx.fill(); ctx.stroke(); });
      var f = F(r), mag = Math.min(60, Math.abs(f) * 90), dir = f > 0 ? 1 : -1; // f>0: pushes apart
      var state = Math.abs(f) < 0.01 ? "balanced: the bond length" : (f > 0 ? "too close: repulsion pushes the atoms apart" : "too far: attraction pulls the atoms together");
      if (mag > 2) {
        ctx.strokeStyle = C.accent; ctx.fillStyle = C.accent; ctx.lineWidth = 3;
        [[ax - 20, -dir], [bx + 20, dir]].forEach(function (a2) { var x1 = a2[0], x2 = a2[0] + a2[1] * mag; ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x2, cy); ctx.stroke(); var s = a2[1] > 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x2, cy); ctx.lineTo(x2 - s * 9, cy - 6); ctx.lineTo(x2 - s * 9, cy + 6); ctx.closePath(); ctx.fill(); });
        ctx.lineWidth = 1;
      }
      var k = 2 * D * a * a;
      setRead(api, ["energy = <b>" + fmtN(U(r), 2) + " eV</b>", "force = <b>" + fmtN(Math.abs(f), 2) + " eV/Å</b>", state, "stiffness at the bond length = <b>" + fmtN(k, 2) + " eV/Å²</b> (about " + fmtN(k * 16.02, 0) + " N/m)"]);
    }
    redraws.push(draw); draw();
  }

  /* ---- a 2D crystal with defects ---- */
  function crystal2d(host) {
    var cols = 14, rows = 9, R = 17, state = [], hexMode = true;
    var api = shell(host, "A crystal with defects: click atoms to change them",
      "Click an atom to turn it into a vacancy (an empty site), click again for a different kind of atom (a solute, as in an alloy), and once more to restore it. Real crystals always contain such defects, and they control many properties.");
    var cv = api.addCanvas(640, 335);
    var kT = 0.08617;
    api.finish();
    function reset() { state = []; for (var i = 0; i < cols * rows; i++) state.push(0); draw(); }
    button(api, "Add 6 random vacancies", false, function () { for (var k = 0; k < 6; k++) state[(Math.random() * state.length) | 0] = 1; draw(); });
    button(api, "Add 6 random solute atoms", false, function () { for (var k = 0; k < 6; k++) state[(Math.random() * state.length) | 0] = 2; draw(); });
    button(api, "Reset", false, reset);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    function pos(i) { var c = i % cols, r = (i / cols) | 0, dx = 2 * R + 6, dy = hexMode ? dx * 0.866 : dx; return { x: 44 + c * dx + (hexMode && r % 2 ? dx / 2 : 0), y: 30 + r * dy }; }
    cv.c.style.cursor = "pointer";
    cv.c.addEventListener("click", function (e) {
      var rect = cv.c.getBoundingClientRect(), sx = cv.w / rect.width, mx = (e.clientX - rect.left) * sx, my = (e.clientY - rect.top) * sx, best = -1, bd = 1e9;
      for (var i = 0; i < state.length; i++) { var q = pos(i), d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = i; } }
      if (best >= 0 && bd < R + 6) { state[best] = (state[best] + 1) % 3; draw(); }
    });
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < state.length; i++) {
        var q = pos(i);
        if (state[i] === 1) { ctx.strokeStyle = C.muted; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]); }
        else { ctx.fillStyle = state[i] === 2 ? C.accent : C.blue; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(q.x, q.y, state[i] === 2 ? R * 0.75 : R, 0, 6.2832); ctx.fill(); ctx.stroke(); }
      }
      var v = state.filter(function (s) { return s === 1; }).length, s2 = state.filter(function (s) { return s === 2; }).length, n = state.length;
      setRead(api, ["sites = <b>" + n + "</b>", "vacancies = <b>" + v + "</b> (" + fmtN(100 * v / n, 1) + "%)", "solute atoms = <b>" + s2 + "</b> (" + fmtN(100 * s2 / n, 1) + "%)", "for comparison: at 1000 K a vacancy costing 1 eV is present at only about <b>" + Math.exp(-1 / (kT * 1000 / 1000) * (1 / 1)).toExponential(1).replace("e", " × 10^") + "</b> of sites"]);
    }
    reset(); redraws.push(draw);
  }

  /* ---- mass on a spring ---- */
  function oscillator(host) {
    var atomMode = false, t0 = performance.now();
    var api = shell(host, "A mass on a spring: stiffness and mass set the rhythm",
      "A stiffer spring or a lighter mass vibrates faster: the period is T = 2π√(m/k). Atoms joined by bonds behave the same way: with bond-like stiffness and an atom’s mass the frequency is a few trillion times per second. In atomic mode the animation is slowed down by a factor of a trillion so that 1 second on screen is 1 picosecond.");
    var cv = api.addCanvas(640, 260);
    var ks = slider(api, "Stiffness k", 1, 50, 1, 10, function (v) { return v + " N/m"; }, function () { draw(); });
    var ms = slider(api, "Mass m", 0.1, 5, 0.1, 1, function (v) { return v.toFixed(1) + (atomMode ? " (× atom mass 63.5 u)" : " kg"); }, function () { draw(); });
    var btn = button(api, "Switch to atomic scale", false, function () { atomMode = !atomMode; btn.textContent = atomMode ? "Switch to everyday scale" : "Switch to atomic scale"; ms.el.dispatchEvent(new Event("input")); draw(); });
    api.finish();
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(host);
    function period() { var k = ks.get(), m = ms.get() * (atomMode ? 63.5 * 1.66054e-27 : 1); return 2 * Math.PI * Math.sqrt(m / k); }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, T = period();
      var tdisp = atomMode ? T * 1e12 : T; // seconds on screen
      var t = (performance.now() - t0) / 1000, x = Math.cos(2 * Math.PI * t / tdisp);
      ctx.clearRect(0, 0, W, H);
      var wall = 40, eq = 230, amp = 90, px = eq + x * amp, cy = 80;
      ctx.fillStyle = C.border; ctx.fillRect(wall - 12, cy - 40, 12, 80);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wall, cy);
      var coils = 14, len = px - 22 - wall;
      for (var i = 1; i <= coils; i++) ctx.lineTo(wall + len * (i - 0.5) / coils, cy + (i % 2 ? -14 : 14));
      ctx.lineTo(px - 22, cy); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.rect(px - 22, cy - 22, 44, 44); ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(eq, cy - 50); ctx.lineTo(eq, cy + 50); ctx.stroke(); ctx.setLineDash([]);
      // trace
      var p = { x0: 300, y0: 20, x1: W - 16, y1: 150 }; ctx.strokeStyle = C.border; ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var j = 0; j <= 160; j++) { var tt = t - 2 * tdisp + 2 * tdisp * j / 160; var xx = Math.cos(2 * Math.PI * tt / tdisp); var X = p.x0 + (p.x1 - p.x0) * j / 160, Y = (p.y0 + p.y1) / 2 - xx * 52; if (j === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = C.muted; ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("position against time (two periods)", (p.x0 + p.x1) / 2, p.y1 + 18);
      setRead(api, atomMode ? ["period = <b>" + fmtN(T * 1e12, 3) + " ps</b>", "frequency = <b>" + fmtN(1 / T / 1e12, 2) + " THz</b> (trillions of vibrations per second)"] : ["period = <b>" + fmtN(T, 2) + " s</b>", "frequency = <b>" + fmtN(1 / T, 2) + " Hz</b>"]);
    }
    function loop() { if (visible) draw(); setTimeout(loop, 40); }
    redraws.push(draw); loop();
  }

  /* ---- atoms jiggle with temperature ---- */
  function jiggle(host) {
    var cols = 12, rows = 8, sp = 46, phase = [], freq = [], rw = [], t0 = performance.now(), visible = true;
    var api = shell(host, "Temperature is atomic jiggling",
      "Each atom vibrates about its lattice site; heating makes the vibrations larger. The rms displacement grows as the square root of temperature. When it reaches roughly a tenth of the atomic spacing (the Lindemann rule of thumb) the crystal melts and atoms begin to wander. Move the temperature past the melting point.");
    var cv = api.addCanvas(640, 350);
    var Ts = slider(api, "Temperature", 10, 3500, 10, 300, function (v) { return v + " K"; }, function () { draw(); });
    var Ms = slider(api, "Melting point of this material", 500, 3500, 50, 1500, function (v) { return v + " K"; }, function () { draw(); });
    api.finish();
    for (var i = 0; i < cols * rows; i++) { phase.push([Math.random() * 6.28, Math.random() * 6.28]); freq.push(0.8 + Math.random() * 0.8); rw.push([0, 0]); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(host);
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, T = Ts.get(), Tm = Ms.get(), t = (performance.now() - t0) / 1000;
      var frac = 0.11 * Math.sqrt(T / Tm), melted = T >= Tm, amp = frac * sp;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < cols * rows; i++) {
        var c = i % cols, r = (i / cols) | 0, bx = 60 + c * sp + (r % 2 ? sp / 2 : 0), by = 40 + r * sp * 0.866, dx, dy;
        if (melted) { rw[i][0] = Math.max(-0.7 * sp, Math.min(0.7 * sp, rw[i][0] + (Math.random() - 0.5) * 0.5 * sp * (T / Tm))); rw[i][1] = Math.max(-0.7 * sp, Math.min(0.7 * sp, rw[i][1] + (Math.random() - 0.5) * 0.5 * sp * (T / Tm))); dx = rw[i][0]; dy = rw[i][1]; }
        else { rw[i][0] *= 0.8; rw[i][1] *= 0.8; dx = amp * Math.cos(freq[i] * 6 * t + phase[i][0]); dy = amp * Math.cos(freq[i] * 6 * t + phase[i][1]); }
        var u = Math.min(1, Math.hypot(dx, dy) / (0.25 * sp));
        ctx.fillStyle = "rgb(" + Math.round(43 + u * 190) + "," + Math.round(108 - u * 30) + "," + Math.round(176 - u * 140) + ")";
        ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(bx + dx, by + dy, 14, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
      var v = Math.sqrt(3 * 1.380649e-23 * T / (63.5 * 1.66054e-27));
      setRead(api, ["T = <b>" + T + " K</b> (thermal energy k<sub>B</sub>T = <b>" + fmtN(T * 8.617333e-5, 3) + " eV</b>)", "rms displacement = <b>" + fmtN(frac * 100, 1) + "%</b> of the atomic spacing", melted ? "<span class='status-bad'>above the melting point: liquid</span>" : "<span class='status-ok'>solid</span>", "typical speed of a copper-mass atom = <b>" + fmtN(v, 0) + " m/s</b>"]);
    }
    function loop() { if (visible) draw(); setTimeout(loop, 50); }
    redraws.push(draw); loop();
  }

  /* ---- coin averages ---- */
  function coins(host) {
    var api = shell(host, "More samples, smaller error: averaging coin flips",
      "Each experiment flips a fair coin n times and records the fraction of heads. Doing 1000 experiments shows how the results are spread: the spread shrinks as 1/√n, so to halve the error you need four times as many flips. This is the idea behind error bars on every simulation.");
    var cv = api.addCanvas(640, 300);
    var ns = slider(api, "Flips per experiment, n", 1, 400, 1, 10, function (v) { return String(v); }, function () { run(); });
    button(api, "Run again", true, function () { run(); });
    api.finish();
    var data = [];
    function run() {
      var n = ns.get(); data = [];
      for (var e = 0; e < 1000; e++) { var h = 0; for (var i = 0; i < n; i++) if (Math.random() < 0.5) h++; data.push(h / n); }
      draw();
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, n = ns.get();
      var p = { x0: 50, y0: 16, x1: W - 16, y1: H - 44 }, bins = 41, hist = [], i;
      for (i = 0; i < bins; i++) hist.push(0);
      data.forEach(function (v) { hist[Math.min(bins - 1, Math.floor(v * bins))]++; });
      var mx = Math.max.apply(null, hist) || 1;
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "fraction of heads in one experiment", "number of experiments");
      var bw = (p.x1 - p.x0) / bins;
      ctx.fillStyle = C.accent;
      hist.forEach(function (c, k) { var h = c / mx * (p.y1 - p.y0 - 6); ctx.fillRect(p.x0 + k * bw + 1, p.y1 - h, bw - 2, h); });
      ctx.fillStyle = C.muted; ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "center";
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { ctx.fillText(v, p.x0 + v * (p.x1 - p.x0), p.y1 + 15); });
      var mean = data.reduce(function (a, b) { return a + b; }, 0) / data.length;
      var sd = Math.sqrt(data.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (data.length - 1));
      ctx.strokeStyle = C.blue; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x0 + 0.5 * (p.x1 - p.x0), p.y0); ctx.lineTo(p.x0 + 0.5 * (p.x1 - p.x0), p.y1); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      setRead(api, ["n = <b>" + n + "</b> flips", "average of the 1000 results = <b>" + fmtN(mean, 3) + "</b> (true value 0.5)", "spread (standard deviation) = <b>" + fmtN(sd, 3) + "</b>", "prediction 0.5/√n = <b>" + fmtN(0.5 / Math.sqrt(n), 3) + "</b>"]);
    }
    redraws.push(draw); run();
  }

  /* ---- Euler stepping: tea cooling ---- */
  function cooling(host) {
    var api = shell(host, "Your first time-stepping simulation: a cooling cup of tea",
      "The rule: the tea cools at a rate proportional to how much hotter it is than the room, dT/dt = −k (T − T<sub>room</sub>). The simulation applies the rule in steps of size dt: new T = old T + dt × rate. The orange curve is the exact solution; the blue dots are the simulation. Make dt smaller and the dots follow the curve more closely.");
    var cv = api.addCanvas(640, 300);
    var dts = slider(api, "Time step dt", 0.5, 20, 0.5, 10, function (v) { return v + " min"; }, draw);
    var ks = slider(api, "Cooling rate k", 0.02, 0.15, 0.01, 0.05, function (v) { return v.toFixed(2) + " per min"; }, draw);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, dt = dts.get(), k = ks.get(), Tr = 20, T0 = 90, tmax = 60;
      var p = { x0: 56, y0: 16, x1: W - 16, y1: H - 44 };
      var X = function (t) { return p.x0 + t / tmax * (p.x1 - p.x0); }, Y = function (v) { return p.y1 - (v - 10) / 90 * (p.y1 - p.y0); };
      ctx.clearRect(0, 0, W, H);
      axes(ctx, C, p, "time (minutes)", "temperature (°C)");
      ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
      [0, 10, 20, 30, 40, 50, 60].forEach(function (v) { ctx.fillText(v, X(v), p.y1 + 15); });
      ctx.textAlign = "right"; [20, 40, 60, 80, 100].forEach(function (v) { ctx.fillText(v, p.x0 - 6, Y(v) + 4); });
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 120; i++) { var t = tmax * i / 120, T = Tr + (T0 - Tr) * Math.exp(-k * t); if (i === 0) ctx.moveTo(X(t), Y(T)); else ctx.lineTo(X(t), Y(T)); }
      ctx.stroke(); ctx.lineWidth = 1;
      var Te = T0, t2 = 0; ctx.fillStyle = C.blue; ctx.strokeStyle = C.blue;
      ctx.beginPath(); ctx.moveTo(X(0), Y(Te));
      var pts = [[0, Te]];
      while (t2 + dt <= tmax + 1e-9) { Te = Te + dt * (-k * (Te - Tr)); t2 += dt; pts.push([t2, Te]); ctx.lineTo(X(t2), Y(Te)); }
      ctx.stroke();
      pts.forEach(function (q) { ctx.beginPath(); ctx.arc(X(q[0]), Y(q[1]), 4, 0, 6.2832); ctx.fill(); });
      var tEnd = pts[pts.length - 1][0], exact = Tr + (T0 - Tr) * Math.exp(-k * tEnd);
      setRead(api, ["steps taken = <b>" + (pts.length - 1) + "</b>", "at t = " + tEnd + " min: simulation <b>" + fmtN(Te, 1) + " °C</b>, exact <b>" + fmtN(exact, 1) + " °C</b>", "error = <b>" + fmtN(Math.abs(Te - exact), 2) + " °C</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ---- random walkers: diffusion from coin flips ---- */
  function walkers(host) {
    var N = 3000, L = 150, x = new Int16Array(N), x0 = new Int16Array(N), t = 0, running = true, visible = true;
    var api = shell(host, "Diffusion from random walkers",
      "Every walker takes one step left or right, chosen by a coin flip, each time step. Walkers that started on the left are orange, those that started on the right are blue. Watch the sharp boundary blur: this is diffusion. The mean squared distance grows in proportion to time, MSD = t, so D = MSD/(2t) = 1/2 in these units. The dashed curve is the exact diffusion solution.");
    var cv = api.addCanvas(640, 340);
    var runBtn = button(api, "Pause", true, function () { running = !running; runBtn.textContent = running ? "Pause" : "Run"; });
    button(api, "Reset", false, function () { reset(); });
    var sp = slider(api, "Steps per frame", 1, 20, 1, 3, function (v) { return String(v); }, function () {});
    api.finish();
    function reset() { t = 0; for (var i = 0; i < N; i++) { x0[i] = x[i] = i < N / 2 ? -1 - ((Math.random() * L) | 0) : ((Math.random() * L) | 0); } draw(); }
    function step() { for (var i = 0; i < N; i++) { var v = x[i] + (Math.random() < 0.5 ? -1 : 1); if (v < -L) v = -L + 1; if (v >= L) v = L - 2; x[i] = v; } t++; }
    function erfc(z) { var s = z < 0 ? -1 : 1; z = Math.abs(z); var q = 1 / (1 + 0.3275911 * z), y = 1 - (((((1.061405429 * q - 1.453152027) * q) + 1.421413741) * q - 0.284496736) * q + 0.254829592) * q * Math.exp(-z * z); return s < 0 ? 1 + y : 1 - y; }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.clearRect(0, 0, W, H);
      var sx = function (v) { return 20 + (v + L) / (2 * L) * (W - 40); };
      // top strip: sample of walkers
      ctx.strokeStyle = C.border; ctx.strokeRect(20, 10, W - 40, 100);
      for (var i = 0; i < N; i += 6) { ctx.fillStyle = x0[i] < 0 ? C.accent : C.blue; ctx.globalAlpha = .75; ctx.fillRect(sx(x[i]) - 1.5, 14 + ((i * 7919) % 90), 3, 3); }
      ctx.globalAlpha = 1;
      // bottom: profile of orange fraction
      var p = { x0: 50, y0: 140, x1: W - 20, y1: H - 40 }, bins = 50, a = new Float64Array(bins), b = new Float64Array(bins);
      for (var j = 0; j < N; j++) { var k = Math.min(bins - 1, Math.floor((x[j] + L) / (2 * L) * bins)); if (x0[j] < 0) a[k]++; else b[k]++; }
      axes(ctx, C, p, "position", "fraction orange");
      ctx.fillStyle = C.muted; ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "right";
      [0, 0.5, 1].forEach(function (v) { ctx.fillText(v, p.x0 - 6, p.y1 - v * (p.y1 - p.y0) + 4); });
      var bw = (p.x1 - p.x0) / bins;
      for (var m = 0; m < bins; m++) { var tot = a[m] + b[m]; if (!tot) continue; var fr = a[m] / tot; ctx.fillStyle = C.accent; ctx.globalAlpha = .55; ctx.fillRect(p.x0 + m * bw + 1, p.y1 - fr * (p.y1 - p.y0), bw - 2, fr * (p.y1 - p.y0)); }
      ctx.globalAlpha = 1;
      if (t > 0) { ctx.strokeStyle = C.ink; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); for (var q = 0; q <= 200; q++) { var xx = -L + 2 * L * q / 200, c = 0.5 * erfc((xx + 0.5) / Math.sqrt(2 * t)); var X = p.x0 + (xx + L) / (2 * L) * (p.x1 - p.x0), Y = p.y1 - c * (p.y1 - p.y0); if (q === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); } ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; }
      var msd = 0; for (var r = 0; r < N; r++) { var d = x[r] - x0[r]; msd += d * d; } msd /= N;
      setRead(api, ["time steps t = <b>" + t + "</b>", "mean squared distance = <b>" + fmtN(msd, 1) + "</b>", "D = MSD/(2t) = <b>" + (t ? fmtN(msd / (2 * t), 3) : "–") + "</b> (expected 0.5)", "typical spread √t = <b>" + fmtN(Math.sqrt(t), 1) + "</b>"]);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(host);
    function loop() { if (running && visible && t < 4000) { var n = sp.get(); for (var s = 0; s < n; s++) step(); draw(); } setTimeout(loop, 40); }
    reset(); redraws.push(draw); loop();
  }

  var REG = { boltzmann: boltzmann, gibbs: gibbs, ising: ising, diffusion: diffusion, lj: lj, fourier: fourier, box: box, fdstep: fdstep, units: units, graphs: graphs, tangent: tangent, area: area, bond: bond, crystal2d: crystal2d, oscillator: oscillator, jiggle: jiggle, coins: coins, cooling: cooling, walkers: walkers };
  window.MIBEM_DEMO = { REG: REG, redraws: redraws, css: css, colours: colours, el: el, shell: shell, slider: slider, button: button, checkbox: checkbox, setRead: setRead, fmtN: fmtN, axes: axes };
  function boot() {
    doc.querySelectorAll(".demo[data-demo]").forEach(function (h) { var f = REG[h.getAttribute("data-demo")]; if (f) { try { f(h); } catch (e) { h.innerHTML = '<div class="demo-body"><p class="demo-note">This demo could not start in your browser.</p></div>'; if (window.console) console.error(e); } } });
    var redrawAll = function () { redraws.forEach(function (f) { f(); }); };
    new MutationObserver(redrawAll).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", redrawAll); }
  }
  if (doc.readyState === "complete") boot(); else doc.addEventListener("DOMContentLoaded", boot);
})();
