/* Interactive demos for the Maths course. They mount into <div class="demo" data-demo="name"> like the demos in demos.js,
   and use its helpers (shell, slider, button, ...) through window.MIBEM_DEMO. Everything runs in the browser. */
(function () {
  "use strict";
  var D = window.MIBEM_DEMO;
  if (!D) return;
  var doc = document, REG = D.REG, redraws = D.redraws, shell = D.shell, slider = D.slider, button = D.button,
      checkbox = D.checkbox, setRead = D.setRead, fmtN = D.fmtN, colours = D.colours, el = D.el;

  /* ---------- small utilities ---------- */
  var PI = Math.PI, TAU = 2 * Math.PI;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-12, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }
  function parseColour(s) {
    s = (s || "").trim();
    var m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /rgba?\(([^)]+)\)/.exec(s);
    if (m) { var q = m[1].split(","); return [+q[0], +q[1], +q[2]]; }
    return [128, 128, 128];
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgb(c) { return "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")"; }

  function niceStep(span, target) {
    var raw = span / target, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }
  function ticks(lo, hi, target) {
    var st = niceStep(hi - lo, target || 6), t = [], v = Math.ceil(lo / st - 1e-9) * st;
    for (; v <= hi + st * 1e-9; v += st) t.push(Math.abs(v) < st * 1e-9 ? 0 : +v.toFixed(12));
    return t;
  }
  function tickLabel(v) {
    var a = Math.abs(v);
    if (a !== 0 && (a >= 1e4 || a < 1e-3)) return v.toExponential(0).replace("e+", "e");
    return String(+v.toPrecision(6));
  }
  function sup(n) { var m = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" }; return String(n).split("").map(function (c) { return m[c] || c; }).join(""); }

  /* A plotting frame: p = {x0,y0,x1,y1} in canvas px, xr/yr = [lo,hi]; opt.xlog/ylog use log10 limits (given as exponents) */
  function frame(ctx, C, p, xr, yr, opt) {
    opt = opt || {};
    var X = function (v) { return p.x0 + (v - xr[0]) / (xr[1] - xr[0]) * (p.x1 - p.x0); };
    var Y = function (v) { return p.y1 - (v - yr[0]) / (yr[1] - yr[0]) * (p.y1 - p.y0); };
    ctx.save();
    ctx.font = "11px system-ui, sans-serif"; ctx.lineWidth = 1;
    var xt = opt.xticks || (opt.xlog ? decades(xr) : ticks(xr[0], xr[1], opt.nx || 6));
    var yt = opt.yticks || (opt.ylog ? decades(yr) : ticks(yr[0], yr[1], opt.ny || 5));
    var xl = opt.xlog ? function (v) { return "10" + sup(v); } : tickLabel, yl = opt.ylog ? function (v) { return "10" + sup(v); } : tickLabel;
    if (opt.grid !== false) {
      ctx.strokeStyle = C.border; ctx.globalAlpha = .55;
      xt.forEach(function (v) { ctx.beginPath(); ctx.moveTo(X(v), p.y0); ctx.lineTo(X(v), p.y1); ctx.stroke(); });
      yt.forEach(function (v) { ctx.beginPath(); ctx.moveTo(p.x0, Y(v)); ctx.lineTo(p.x1, Y(v)); ctx.stroke(); });
      ctx.globalAlpha = 1;
    }
    if (opt.zero !== false) {
      ctx.strokeStyle = C.muted; ctx.globalAlpha = .6;
      if (yr[0] < 0 && yr[1] > 0 && !opt.ylog) { ctx.beginPath(); ctx.moveTo(p.x0, Y(0)); ctx.lineTo(p.x1, Y(0)); ctx.stroke(); }
      if (xr[0] < 0 && xr[1] > 0 && !opt.xlog) { ctx.beginPath(); ctx.moveTo(X(0), p.y0); ctx.lineTo(X(0), p.y1); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = C.border; ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
    ctx.fillStyle = C.muted;
    ctx.textAlign = "center"; xt.forEach(function (v) { ctx.fillText(xl(v), X(v), p.y1 + 14); });
    ctx.textAlign = "right"; yt.forEach(function (v) { ctx.fillText(yl(v), p.x0 - 6, Y(v) + 4); });
    ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center";
    if (opt.xlabel) ctx.fillText(opt.xlabel, (p.x0 + p.x1) / 2, p.y1 + 32);
    if (opt.ylabel) { ctx.save(); ctx.translate(opt.ylx || 13, (p.y0 + p.y1) / 2); ctx.rotate(-PI / 2); ctx.fillText(opt.ylabel, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X: X, Y: Y, inv: function (px) { return xr[0] + (px - p.x0) / (p.x1 - p.x0) * (xr[1] - xr[0]); }, invY: function (py) { return yr[0] + (p.y1 - py) / (p.y1 - p.y0) * (yr[1] - yr[0]); } };
  }
  function decades(r) { var t = [], a = Math.ceil(r[0]), b = Math.floor(r[1]); if (b - a > 7) { var s = Math.ceil((b - a) / 6); for (var v = a; v <= b; v += s) t.push(v); } else for (var w = a; w <= b; w++) t.push(w); return t; }
  /* shrink and centre the plot rectangle so that one x unit and one y unit have the same length in pixels */
  function eqRect(p, xr, yr) {
    var pw = p.x1 - p.x0, ph = p.y1 - p.y0, sx = pw / (xr[1] - xr[0]), sy = ph / (yr[1] - yr[0]), s = Math.min(sx, sy);
    var w = s * (xr[1] - xr[0]), h = s * (yr[1] - yr[0]), cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
    return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
  }
  function clipRect(ctx, p) { ctx.save(); ctx.beginPath(); ctx.rect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); ctx.clip(); }
  function curve(ctx, f, a, b, n, X, Y, yclip) {
    var pen = false; ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      if (!isFinite(y) || Math.abs(y) > (yclip || 1e9)) { pen = false; continue; }
      if (!pen) { ctx.moveTo(X(x), Y(y)); pen = true; } else ctx.lineTo(X(x), Y(y));
    }
    ctx.stroke();
  }
  function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function arrow(ctx, x0, y0, x1, y1, col, w, head) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy); if (L < 1e-6) return;
    head = head || 8; var ux = dx / L, uy = dy / L;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * head * .6, y1 - uy * head * .6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * head - uy * head * .45, y1 - uy * head + ux * head * .45); ctx.lineTo(x1 - ux * head + uy * head * .45, y1 - uy * head - ux * head * .45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function text(ctx, s, x, y, col, size, align) { ctx.save(); ctx.fillStyle = col; ctx.font = (size || 12) + "px system-ui, sans-serif"; ctx.textAlign = align || "left"; ctx.fillText(s, x, y); ctx.restore(); }

  /* ---------- controls and interaction ---------- */
  var uid2 = 0;
  function select(api, label, options, value, onChange) {
    var id = "mdsel" + (++uid2), wrap = el("label"), top = el("span", null, label + ": "), sel = doc.createElement("select");
    wrap.setAttribute("for", id); sel.id = id;
    options.forEach(function (o, i) { var op = doc.createElement("option"); op.value = i; op.textContent = o; if (i === value) op.selected = true; sel.appendChild(op); });
    sel.addEventListener("change", function () { onChange(+sel.value); });
    wrap.appendChild(top); wrap.appendChild(sel); api.controls.appendChild(wrap);
    return { get: function () { return +sel.value; }, set: function (v) { sel.value = v; }, el: sel };
  }
  function setSlider(s, v) { s.el.value = v; s.el.dispatchEvent(new Event("input")); }
  function pointer(cv, onDown, onMove) {
    var c = cv.c, down = false;
    function pos(e) { var r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.w / r.width, y: (e.clientY - r.top) * cv.h / r.height }; }
    c.style.touchAction = "none"; c.style.cursor = "crosshair";
    c.addEventListener("pointerdown", function (e) { down = true; try { c.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } var q = pos(e); onDown(q.x, q.y); });
    c.addEventListener("pointermove", function (e) { if (down && onMove) { var q = pos(e); onMove(q.x, q.y); } });
    c.addEventListener("pointerup", function () { down = false; });
    c.addEventListener("pointercancel", function () { down = false; });
  }
  function reduceMotion() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  /* runs fn(dtSeconds) about 30 times a second while the demo is on screen and running */
  function animator(host, fn) {
    var running = false, visible = true, last = 0, a = {};
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(host);
    function tick(now) { if (running && visible && now - last > 30) { fn((now - last) / 1000); last = now; } requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    a.start = function () { running = true; }; a.stop = function () { running = false; };
    a.toggle = function () { running = !running; return running; }; a.isRunning = function () { return running; };
    return a;
  }

  /* Gaussian elimination for small dense systems A x = b (A is modified) */
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var piv = i; for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[piv][i])) piv = j;
      var t = A[i]; A[i] = A[piv]; A[piv] = t; var tb = b[i]; b[i] = b[piv]; b[piv] = tb;
      if (Math.abs(A[i][i]) < 1e-300) A[i][i] = 1e-300;
      for (j = i + 1; j < n; j++) { var f = A[j][i] / A[i][i]; for (k = i; k < n; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }

  /* Filled value map plus contour lines for f(x,y) on a rectangle of the canvas */
  function fieldMap(ctx, C, p, xr, yr, f, levels, nx, ny) {
    nx = nx || 90; ny = ny || 60;
    var vals = new Float64Array((nx + 1) * (ny + 1)), lo = 1e300, hi = -1e300, i, j;
    for (j = 0; j <= ny; j++) for (i = 0; i <= nx; i++) { var v = f(xr[0] + (xr[1] - xr[0]) * i / nx, yr[0] + (yr[1] - yr[0]) * j / ny); vals[j * (nx + 1) + i] = v; if (v < lo) lo = v; if (v > hi) hi = v; }
    var cl = parseColour(C.blue), cm = parseColour(C.surface), ch = parseColour(C.soft);
    var cw = (p.x1 - p.x0) / nx, chh = (p.y1 - p.y0) / ny;
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var v0 = (vals[j * (nx + 1) + i] + vals[j * (nx + 1) + i + 1] + vals[(j + 1) * (nx + 1) + i] + vals[(j + 1) * (nx + 1) + i + 1]) / 4;
      var t = hi > lo ? (v0 - lo) / (hi - lo) : 0; t = Math.pow(clamp(t, 0, 1), .6);
      var col = t < .5 ? mix(mix(cl, cm, .55), cm, t * 2) : mix(cm, ch, (t - .5) * 2);
      ctx.fillStyle = rgb(col); ctx.fillRect(p.x0 + i * cw, p.y1 - (j + 1) * chh, cw + .6, chh + .6);
    }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = .75;
    var L = levels || [], li;
    if (!levels) { L = []; for (li = 1; li <= 12; li++) L.push(lo + (hi - lo) * Math.pow(li / 13, 1.6)); }
    var PX = function (a) { return p.x0 + a * cw; }, PY = function (b) { return p.y1 - b * chh; };
    L.forEach(function (lev) {
      ctx.beginPath();
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
        var a = vals[j * (nx + 1) + i] - lev, b = vals[j * (nx + 1) + i + 1] - lev, c = vals[(j + 1) * (nx + 1) + i + 1] - lev, d = vals[(j + 1) * (nx + 1) + i] - lev, pts = [];
        if ((a < 0) !== (b < 0)) pts.push([i + a / (a - b), j]);
        if ((b < 0) !== (c < 0)) pts.push([i + 1, j + b / (b - c)]);
        if ((d < 0) !== (c < 0)) pts.push([i + d / (d - c), j + 1]);
        if ((a < 0) !== (d < 0)) pts.push([i, j + a / (a - d)]);
        if (pts.length >= 2) { ctx.moveTo(PX(pts[0][0]), PY(pts[0][1])); ctx.lineTo(PX(pts[1][0]), PY(pts[1][1])); if (pts.length === 4) { ctx.moveTo(PX(pts[2][0]), PY(pts[2][1])); ctx.lineTo(PX(pts[3][0]), PY(pts[3][1])); } }
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.border; ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
    return { lo: lo, hi: hi };
  }

  /* ================= M1: Taylor polynomials ================= */
  function taylor(host) {
    var api = shell(host, "Taylor polynomials: how well does a few terms approximate a function?",
      "The Taylor polynomial of degree n about x = 0 matches the function and its first n derivatives there. Increase n and watch the region of agreement grow. For ln(1+x), 1/(1&minus;x) and arctan x the series only converges for |x| &lt; 1 (dashed lines): outside it, adding terms makes things <em>worse</em>.");
    var fns = [
      { name: "sin x", f: Math.sin, c: function (k) { return k % 2 ? ((k - 1) / 2 % 2 ? -1 : 1) / fact(k) : 0; }, R: Infinity },
      { name: "cos x", f: Math.cos, c: function (k) { return k % 2 ? 0 : ((k / 2) % 2 ? -1 : 1) / fact(k); }, R: Infinity },
      { name: "exp x", f: Math.exp, c: function (k) { return 1 / fact(k); }, R: Infinity },
      { name: "ln(1+x)", f: function (x) { return x > -1 ? Math.log(1 + x) : NaN; }, c: function (k) { return k ? (k % 2 ? 1 : -1) / k : 0; }, R: 1 },
      { name: "1/(1−x)", f: function (x) { return 1 / (1 - x); }, c: function () { return 1; }, R: 1 },
      { name: "arctan x", f: Math.atan, c: function (k) { return k % 2 ? ((k - 1) / 2 % 2 ? -1 : 1) / k : 0; }, R: 1 }
    ];
    function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
    var cv = api.addCanvas(640, 320), cur = 0;
    var sel = select(api, "Function", fns.map(function (f) { return f.name; }), 0, function (v) { cur = v; draw(); });
    var nsl = slider(api, "Degree n", 0, 21, 1, 3, function (v) { return String(v); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function P(fn, n, x) { var s = 0, xp = 1; for (var k = 0; k <= n; k++) { s += fn.c(k) * xp; xp *= x; } return s; }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, fn = fns[cur], n = nsl.get();
      var p = { x0: 46, y0: 14, x1: W - 14, y1: H - 42 }, xr = [-3, 3], yr = [-3, 3];
      ctx.clearRect(0, 0, W, H);
      var F = frame(ctx, C, p, xr, yr, { xlabel: "x", ylabel: "y" });
      if (isFinite(fn.R)) { ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; [-fn.R, fn.R].forEach(function (v) { ctx.beginPath(); ctx.moveTo(F.X(v), p.y0); ctx.lineTo(F.X(v), p.y1); ctx.stroke(); }); ctx.restore(); }
      clipRect(ctx, p);
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.accent; curve(ctx, fn.f, -3, 3, 600, F.X, F.Y, 50);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; curve(ctx, function (x) { return P(fn, n, x); }, -3, 3, 600, F.X, F.Y, 50);
      ctx.restore();
      text(ctx, "— " + fn.name, p.x0 + 8, p.y0 + 16, C.accent, 12); text(ctx, "— Taylor polynomial, degree " + n, p.x0 + 8, p.y0 + 32, C.blue, 12);
      var e1 = Math.abs(fn.f(0.5) - P(fn, n, 0.5)), e2 = Math.abs(fn.f(1.5) - P(fn, n, 1.5)), e3 = Math.abs(fn.f(2.5) - P(fn, n, 2.5));
      setRead(api, ["error at x = 0.5: <b>" + e1.toExponential(1) + "</b>", "at x = 1.5: <b>" + (isFinite(e2) ? e2.toExponential(1) : "n/a") + "</b>", "at x = 2.5: <b>" + (isFinite(e3) ? e3.toExponential(1) : "n/a") + "</b>", "radius of convergence: <b>" + (isFinite(fn.R) ? fn.R : "infinite") + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M1: Newton's method ================= */
  function newton(host) {
    var api = shell(host, "Newton's method: tangent lines to a root",
      "Each step replaces f by its tangent line at the current guess and jumps to where that line crosses zero. Near a simple root the number of correct digits roughly doubles per step. Try the last function from x<sub>0</sub> = 0: the iteration cycles between 0 and 1 forever, and from x<sub>0</sub> = &minus;2 it converges: the starting guess matters.");
    var fns = [
      { name: "x² − 5", f: function (x) { return x * x - 5; }, d: function (x) { return 2 * x; }, xr: [-1, 4], yr: [-8, 12], root: Math.sqrt(5) },
      { name: "cos x − x", f: function (x) { return Math.cos(x) - x; }, d: function (x) { return -Math.sin(x) - 1; }, xr: [-1, 3], yr: [-3, 2], root: 0.7390851332151607 },
      { name: "eˣ − 3x (two roots)", f: function (x) { return Math.exp(x) - 3 * x; }, d: function (x) { return Math.exp(x) - 3; }, xr: [-0.5, 2.5], yr: [-3, 6], root: 0.6190612867359451 },
      { name: "x³ − 2x + 2 (can cycle)", f: function (x) { return x * x * x - 2 * x + 2; }, d: function (x) { return 3 * x * x - 2; }, xr: [-3, 2.5], yr: [-6, 8], root: -1.7692923542386314 }
    ];
    var cv = api.addCanvas(640, 320), cur = 0, its = [], x0 = 3.0;
    var sel = select(api, "Function", fns.map(function (f) { return f.name; }), 0, function (v) { cur = v; x0 = fns[v].xr[0] + 0.85 * (fns[v].xr[1] - fns[v].xr[0]); if (v === 3) x0 = 0; setSlider(xs, x0); reset(); });
    var xs = slider(api, "Start x₀", -3, 4, 0.05, x0, function (v) { return v.toFixed(2); }, function (v) { x0 = v; reset(); });
    button(api, "Step", true, function () { step(); draw(); });
    button(api, "Run 5 steps", false, function () { for (var i = 0; i < 5; i++) step(); draw(); });
    button(api, "Reset", false, function () { reset(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function reset() { its = [x0]; draw(); }
    function step() { var f = fns[cur], x = its[its.length - 1], d = f.d(x); if (Math.abs(d) < 1e-12 || its.length > 40) return; its.push(x - f.f(x) / d); }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, f = fns[cur];
      var p = { x0: 46, y0: 14, x1: W - 14, y1: H - 42 }, xr = f.xr, yr = f.yr;
      ctx.clearRect(0, 0, W, H);
      var F = frame(ctx, C, p, xr, yr, { xlabel: "x", ylabel: "f(x)" });
      clipRect(ctx, p);
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.accent; curve(ctx, f.f, xr[0], xr[1], 500, F.X, F.Y, 1e6);
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.blue;
      for (var i = 0; i < its.length; i++) {
        var x = its[i], y = f.f(x);
        ctx.beginPath(); ctx.moveTo(F.X(x), F.Y(0)); ctx.lineTo(F.X(x), F.Y(y)); ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        if (i < its.length - 1) { ctx.beginPath(); ctx.moveTo(F.X(x), F.Y(y)); ctx.lineTo(F.X(its[i + 1]), F.Y(0)); ctx.stroke(); }
        dot(ctx, F.X(x), F.Y(0), i === its.length - 1 ? 5 : 3.5, i === its.length - 1 ? C.ink : C.blue);
      }
      ctx.restore();
      var last = its[its.length - 1];
      setRead(api, ["iterations: <b>" + (its.length - 1) + "</b>", "x<sub>n</sub> = <b>" + last.toPrecision(10) + "</b>", "|f(x<sub>n</sub>)| = <b>" + Math.abs(f.f(last)).toExponential(2) + "</b>", "last 3 iterates: " + its.slice(-3).map(function (v) { return v.toPrecision(6); }).join(", ")]);
    }
    x0 = fns[0].xr[0] + 0.85 * (fns[0].xr[1] - fns[0].xr[0]); setSlider(xs, x0);
    redraws.push(draw); reset();
  }

  /* ================= M1: finite-difference error ================= */
  function fderr(host) {
    var api = shell(host, "Finite differences: truncation error versus rounding error",
      "Derivative of f at x = 1 computed in ordinary double precision. Each formula's error first falls as a power of h (slopes 1, 2, 4 on this log&ndash;log plot, from the Taylor series) and then rises again like (machine precision)/h once rounding takes over. Smaller steps are not always better, and a higher-order formula allows a larger step.");
    var cv = api.addCanvas(640, 320), fi = 0;
    var fns = [{ n: "exp x", f: Math.exp, d: Math.exp }, { n: "sin x", f: Math.sin, d: Math.cos }, { n: "x³ ln x", f: function (x) { return x * x * x * Math.log(x); }, d: function (x) { return 3 * x * x * Math.log(x) + x * x; } }];
    var sel = select(api, "Function", fns.map(function (f) { return f.n; }), 0, function (v) { fi = v; draw(); });
    var hs = slider(api, "log₁₀ h", -12, -1, 0.1, -3, function (v) { return "h = 10" + sup(v.toFixed(1).replace(".0", "")); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var methods = [
      { n: "forward, O(h)", f: function (f, x, h) { return (f(x + h) - f(x)) / h; }, col: "accent" },
      { n: "central, O(h²)", f: function (f, x, h) { return (f(x + h) - f(x - h)) / (2 * h); }, col: "blue" },
      { n: "5-point, O(h⁴)", f: function (f, x, h) { return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h); }, col: "ink" }
    ];
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, fn = fns[fi], x = 1;
      var p = { x0: 56, y0: 14, x1: W - 14, y1: H - 44 }, xr = [-12, -1], yr = [-14, 1];
      ctx.clearRect(0, 0, W, H);
      var F = frame(ctx, C, p, xr, yr, { xlabel: "step size h", ylabel: "|error|", xlog: true, ylog: true });
      var ex = fn.d(x);
      clipRect(ctx, p);
      ctx.lineWidth = 2;
      methods.forEach(function (m) {
        ctx.strokeStyle = C[m.col]; ctx.beginPath(); var pen = false;
        for (var i = 0; i <= 220; i++) { var lh = -12 + 11 * i / 220, h = Math.pow(10, lh), e = Math.abs(m.f(fn.f, x, h) - ex); if (e === 0) e = 1e-17; var yy = Math.log(e) / Math.LN10; if (!pen) { ctx.moveTo(F.X(lh), F.Y(yy)); pen = true; } else ctx.lineTo(F.X(lh), F.Y(yy)); }
        ctx.stroke();
      });
      ctx.restore();
      var lh0 = hs.get(); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(F.X(lh0), p.y0); ctx.lineTo(F.X(lh0), p.y1); ctx.stroke(); ctx.setLineDash([]);
      var yl = 20; methods.forEach(function (m) { text(ctx, "— " + m.n, p.x1 - 130, p.y0 + yl, C[m.col], 12); yl += 16; });
      var h0 = Math.pow(10, lh0);
      setRead(api, ["h = <b>" + h0.toExponential(1) + "</b>"].concat(methods.map(function (m) { return m.n.split(",")[0] + " error <b>" + Math.abs(m.f(fn.f, x, h0) - ex).toExponential(1) + "</b>"; })));
    }
    redraws.push(draw); draw();
  }

  /* ================= M2: gradient, Hessian and stationary points ================= */
  function contour(host) {
    var api = shell(host, "Gradient, Hessian and stationary points of a 2D energy surface",
      "Click anywhere on the surface. The orange arrow is the force &minus;&nabla;f (steepest descent). The short crossed lines are the principal axes of the Hessian: blue where the curvature is positive, orange where it is negative. At a minimum both are blue, at a saddle point (a transition state) one is orange. &ldquo;Descend&rdquo; follows the force downhill.");
    var fields = [
      { name: "double well: x⁴ − 2x² + y²", f: function (x, y) { return x * x * x * x - 2 * x * x + y * y; }, g: function (x, y) { return [4 * x * x * x - 4 * x, 2 * y]; }, H: function (x, y) { return [12 * x * x - 4, 0, 2]; }, xr: [-2, 2], yr: [-1.5, 1.5], pts: [[-1, 0, "min"], [1, 0, "min"], [0, 0, "saddle"]] },
      { name: "four wells: x⁴ + y⁴ − 2x² − 2y²", f: function (x, y) { return x * x * x * x + y * y * y * y - 2 * x * x - 2 * y * y; }, g: function (x, y) { return [4 * x * x * x - 4 * x, 4 * y * y * y - 4 * y]; }, H: function (x, y) { return [12 * x * x - 4, 0, 12 * y * y - 4]; }, xr: [-1.8, 1.8], yr: [-1.8, 1.8], pts: [[-1, -1, "min"], [1, -1, "min"], [-1, 1, "min"], [1, 1, "min"], [0, 1, "saddle"], [0, -1, "saddle"], [1, 0, "saddle"], [-1, 0, "saddle"], [0, 0, "max"]] },
      { name: "bowl: x² + 3y²", f: function (x, y) { return x * x + 3 * y * y; }, g: function (x, y) { return [2 * x, 6 * y]; }, H: function () { return [2, 0, 6]; }, xr: [-2, 2], yr: [-1.5, 1.5], pts: [[0, 0, "min"]] },
      { name: "saddle: x² − y²", f: function (x, y) { return x * x - y * y; }, g: function (x, y) { return [2 * x, -2 * y]; }, H: function () { return [2, 0, -2]; }, xr: [-2, 2], yr: [-1.5, 1.5], pts: [[0, 0, "saddle"]] },
      { name: "curved valley: (1−x)² + 10(y−x²)²", f: function (x, y) { var t = y - x * x; return (1 - x) * (1 - x) + 10 * t * t; }, g: function (x, y) { var t = y - x * x; return [-2 * (1 - x) - 40 * x * t, 20 * t]; }, H: function (x, y) { var t = y - x * x; return [2 - 40 * t + 80 * x * x, -40 * x, 20]; }, xr: [-1.5, 2], yr: [-0.5, 3], pts: [[1, 1, "min"]] }
    ];
    var cv = api.addCanvas(640, 340), cur = 0, pt = [0.55, 0.65], path = [];
    var sel = select(api, "Surface", fields.map(function (f) { return f.name; }), 0, function (v) { cur = v; var f = fields[v]; pt = [f.xr[0] + 0.78 * (f.xr[1] - f.xr[0]), f.yr[0] + 0.75 * (f.yr[1] - f.yr[0])]; path = []; draw(); });
    button(api, "Descend", true, function () { descend(); draw(); });
    button(api, "Clear path", false, function () { path = []; draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var P, F;
    function geom() { var f = fields[cur]; P = eqRect({ x0: 50, y0: 12, x1: cv.w - 12, y1: cv.h - 40 }, f.xr, f.yr); }
    pointer(cv, function (x, y) { geom(); var f = fields[cur], X = f.xr[0] + (x - P.x0) / (P.x1 - P.x0) * (f.xr[1] - f.xr[0]), Y = f.yr[0] + (P.y1 - y) / (P.y1 - P.y0) * (f.yr[1] - f.yr[0]); if (X >= f.xr[0] && X <= f.xr[1] && Y >= f.yr[0] && Y <= f.yr[1]) { pt = [X, Y]; path = []; draw(); } });
    function descend() {
      var f = fields[cur], x = pt[0], y = pt[1], a = 0.25; path = [[x, y]];
      for (var i = 0; i < 1500; i++) {
        var g = f.g(x, y), gn = Math.sqrt(g[0] * g[0] + g[1] * g[1]); if (gn < 1e-4) break;
        var f0 = f.f(x, y), st = a, nx, ny, k = 0;
        do { nx = x - st * g[0]; ny = y - st * g[1]; st *= 0.5; k++; } while (f.f(nx, ny) > f0 - 1e-4 * st * 2 * gn * gn && k < 40);
        x = clamp(nx, f.xr[0], f.xr[1]); y = clamp(ny, f.yr[0], f.yr[1]); if (i % 3 === 0) path.push([x, y]);
      }
      path.push([x, y]);
    }
    function eig(h) { var a = h[0], b = h[1], c = h[2], m = (a + c) / 2, d = Math.sqrt(((a - c) / 2) * ((a - c) / 2) + b * b); var l1 = m + d, l2 = m - d, th = 0.5 * Math.atan2(2 * b, a - c); return { l1: l1, l2: l2, th: th }; }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, f = fields[cur]; geom();
      ctx.clearRect(0, 0, W, H);
      fieldMap(ctx, C, P, f.xr, f.yr, f.f);
      F = frame(ctx, C, P, f.xr, f.yr, { xlabel: "x", ylabel: "y", grid: false, zero: false });
      f.pts.forEach(function (q) { var col = q[2] === "min" ? C.blue : q[2] === "max" ? C.ink : C.accent; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.fillStyle = C.surface; ctx.beginPath(); if (q[2] === "saddle") { ctx.rect(F.X(q[0]) - 4.5, F.Y(q[1]) - 4.5, 9, 9); } else ctx.arc(F.X(q[0]), F.Y(q[1]), 5, 0, TAU); ctx.fill(); ctx.stroke(); });
      if (path.length > 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); path.forEach(function (q, i) { if (i) ctx.lineTo(F.X(q[0]), F.Y(q[1])); else ctx.moveTo(F.X(q[0]), F.Y(q[1])); }); ctx.stroke(); }
      var g = f.g(pt[0], pt[1]), gn = Math.sqrt(g[0] * g[0] + g[1] * g[1]), px = F.X(pt[0]), py = F.Y(pt[1]);
      var h = f.H(pt[0], pt[1]), e = eig(h), sc = (P.x1 - P.x0) / (f.xr[1] - f.xr[0]);
      [[e.l1, e.th], [e.l2, e.th + PI / 2]].forEach(function (q) { var L = 30; ctx.strokeStyle = q[0] >= 0 ? C.blue : C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px - L * Math.cos(q[1]), py + L * Math.sin(q[1])); ctx.lineTo(px + L * Math.cos(q[1]), py - L * Math.sin(q[1])); ctx.stroke(); });
      if (gn > 1e-6) { var Lg = clamp(gn * sc * 0.25, 10, 70); arrow(ctx, px, py, px - g[0] / gn * Lg, py + g[1] / gn * Lg, C.accent, 3, 11); }
      dot(ctx, px, py, 4.5, C.ink);
      var type = gn < 0.06 ? (e.l1 > 0 && e.l2 > 0 ? "minimum" : e.l1 < 0 && e.l2 < 0 ? "maximum" : "saddle point") : "not stationary";
      setRead(api, ["f = <b>" + fmtN(f.f(pt[0], pt[1]), 2) + "</b>", "&nabla;f = <b>(" + fmtN(g[0], 2) + ", " + fmtN(g[1], 2) + ")</b>, |&nabla;f| = <b>" + fmtN(gn, 2) + "</b>", "Hessian eigenvalues: <b>" + fmtN(e.l1, 2) + "</b>, <b>" + fmtN(e.l2, 2) + "</b>", "here: <b>" + type + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M3: divergence and curl ================= */
  function vecfield(host) {
    var api = shell(host, "Divergence and curl of a vector field",
      "Click to move the probe. The circle of radius &rho; measures the net outward flux and the circulation of the field around it; divided by the area, they approach the divergence and the curl as &rho; shrinks (the divergence and Stokes theorems at work). The orange dot marks the singular point of the last two fields, where the theorems need care.");
    var fields = [
      { name: "source: (x, y)", F: function (x, y) { return [x, y]; } },
      { name: "rotation: (−y, x)", F: function (x, y) { return [-y, x]; } },
      { name: "saddle flow: (x, −y)", F: function (x, y) { return [x, -y]; } },
      { name: "shear: (y, 0)", F: function (x, y) { return [y, 0]; } },
      { name: "sink with swirl: (−x−y, x−y)", F: function (x, y) { return [-x - y, x - y]; } },
      { name: "point source: r/r³ (inverse square, 2D slice)", F: function (x, y) { var r2 = x * x + y * y + 1e-9, r3 = Math.pow(r2, 1.5); return [x / r3, y / r3]; }, sing: true },
      { name: "line vortex: (−y, x)/r²", F: function (x, y) { var r2 = x * x + y * y + 1e-9; return [-y / r2, x / r2]; }, sing: true }
    ];
    var xr = [-3, 3], yr = [-2, 2], cv = api.addCanvas(640, 300), cur = 1, pt = [0.8, 0.4], rho = 0.6;
    var sel = select(api, "Field", fields.map(function (f) { return f.name; }), 1, function (v) { cur = v; draw(); });
    var rs = slider(api, "Probe radius ρ", 0.1, 1.5, 0.05, rho, function (v) { return v.toFixed(2); }, function (v) { rho = v; draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var P;
    pointer(cv, function (x, y) { var X = xr[0] + (x - P.x0) / (P.x1 - P.x0) * (xr[1] - xr[0]), Y = yr[0] + (P.y1 - y) / (P.y1 - P.y0) * (yr[1] - yr[0]); if (X > xr[0] && X < xr[1] && Y > yr[0] && Y < yr[1]) { pt = [X, Y]; draw(); } }, function (x, y) { var X = xr[0] + (x - P.x0) / (P.x1 - P.x0) * (xr[1] - xr[0]), Y = yr[0] + (P.y1 - y) / (P.y1 - P.y0) * (yr[1] - yr[0]); if (X > xr[0] && X < xr[1] && Y > yr[0] && Y < yr[1]) { pt = [X, Y]; draw(); } });
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, f = fields[cur];
      P = eqRect({ x0: 14, y0: 10, x1: W - 14, y1: H - 10 }, xr, yr);
      var sc = (P.x1 - P.x0) / (xr[1] - xr[0]);
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.bg; ctx.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); ctx.strokeStyle = C.border; ctx.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
      var X = function (v) { return P.x0 + (v - xr[0]) * sc; }, Y = function (v) { return P.y1 - (v - yr[0]) * sc; };
      var maxm = 0, i, j, pts = [];
      for (i = 0; i <= 12; i++) for (j = 0; j <= 8; j++) { var x = xr[0] + (xr[1] - xr[0]) * (i + 0.5) / 13, y = yr[0] + (yr[1] - yr[0]) * (j + 0.5) / 9, v = f.F(x, y), m = Math.sqrt(v[0] * v[0] + v[1] * v[1]); pts.push([x, y, v, m]); if (m > maxm && (!f.sing || (x * x + y * y) > 0.35)) maxm = m; }
      pts.forEach(function (q) { var L = clamp(q[3] / maxm, 0, 1) * 0.42 * sc; if (q[3] < 1e-9) return; var ux = q[2][0] / q[3], uy = q[2][1] / q[3]; arrow(ctx, X(q[0]) - ux * L / 2, Y(q[1]) + uy * L / 2, X(q[0]) + ux * L / 2, Y(q[1]) - uy * L / 2, C.muted, 1.5, 6); });
      if (f.sing) dot(ctx, X(0), Y(0), 4, C.accent);
      var cx = pt[0], cy = pt[1], N = 240, flux = 0, circ = 0;
      for (i = 0; i < N; i++) { var th = TAU * (i + .5) / N, nx = Math.cos(th), ny = Math.sin(th), v = f.F(cx + rho * nx, cy + rho * ny), ds = TAU * rho / N; flux += (v[0] * nx + v[1] * ny) * ds; circ += (-v[0] * ny + v[1] * nx) * ds; }
      var A = PI * rho * rho, h = 1e-4;
      var fxp = f.F(cx + h, cy), fxm = f.F(cx - h, cy), fyp = f.F(cx, cy + h), fym = f.F(cx, cy - h);
      var div = (fxp[0] - fxm[0] + fyp[1] - fym[1]) / (2 * h), curl = (fxp[1] - fxm[1] - fyp[0] + fym[0]) / (2 * h);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X(cx), Y(cy), rho * sc, 0, TAU); ctx.stroke();
      dot(ctx, X(cx), Y(cy), 3.5, C.accent);
      var enc = f.sing && Math.sqrt(cx * cx + cy * cy) < rho;
      setRead(api, ["divergence at centre = <b>" + fmtN(div, 2) + "</b>", "flux out of circle / area = <b>" + fmtN(flux / A, 2) + "</b>", "curl (z) at centre = <b>" + fmtN(curl, 2) + "</b>", "circulation / area = <b>" + fmtN(circ / A, 2) + "</b>"].concat(enc ? ["circle contains the singular point: total flux = <b>" + fmtN(flux, 2) + "</b>, circulation = <b>" + fmtN(circ, 2) + "</b>"] : []));
    }
    redraws.push(draw); draw();
  }

  /* ================= M4: lattice, planes and the reciprocal lattice ================= */
  function lattice2d(host) {
    var api = shell(host, "A 2D lattice, its lattice planes and its reciprocal lattice",
      "Left: lattice points ia<sub>1</sub> + ja<sub>2</sub> with the primitive cell shaded. The orange lines are the lattice planes (h k): equally spaced lines with d = 2&pi;/|<b>G</b>|. Right: the reciprocal lattice with <b>b</b><sub>i</sub>&middot;<b>a</b><sub>j</sub> = 2&pi;&delta;<sub>ij</sub>. <b>G</b><sub>hk</sub> = h<b>b</b><sub>1</sub> + k<b>b</b><sub>2</sub> is perpendicular to the planes. Make the real cell large and the reciprocal one shrinks.");
    var cv = api.addCanvas(640, 310), preset = 0;
    var presets = [["square", 1, 90], ["hexagonal", 1, 120], ["rectangular", 1.6, 90], ["oblique", 1.3, 70]];
    var sel = select(api, "Preset", presets.map(function (q) { return q[0]; }), 1, function (v) { setSlider(rs, presets[v][1]); setSlider(gs, presets[v][2]); });
    var rs = slider(api, "|a₂| / |a₁|", 0.5, 2, 0.05, 1, function (v) { return v.toFixed(2); }, draw);
    var gs = slider(api, "angle γ between a₁, a₂", 30, 150, 1, 120, function (v) { return v + "°"; }, draw);
    var hs = slider(api, "h", -3, 3, 1, 1, function (v) { return String(v); }, draw);
    var ks = slider(api, "k", -3, 3, 1, 0, function (v) { return String(v); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, r = rs.get(), g = gs.get() * PI / 180, h = hs.get(), k = ks.get();
      var a1 = [1, 0], a2 = [r * Math.cos(g), r * Math.sin(g)], area = a1[0] * a2[1] - a1[1] * a2[0];
      var b1 = [TAU * a2[1] / area, -TAU * a2[0] / area], b2 = [-TAU * a1[1] / area, TAU * a1[0] / area];
      var G = [h * b1[0] + k * b2[0], h * b1[1] + k * b2[1]], Gn = Math.sqrt(G[0] * G[0] + G[1] * G[1]);
      ctx.clearRect(0, 0, W, H);
      var pl = { x0: 8, y0: 8, x1: W / 2 - 6, y1: H - 8 }, pr = { x0: W / 2 + 6, y0: 8, x1: W - 8, y1: H - 8 };
      [pl, pr].forEach(function (p) { ctx.fillStyle = C.bg; ctx.fillRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); ctx.strokeStyle = C.border; ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); });
      /* real space */
      var s = 52, ox = (pl.x0 + pl.x1) / 2 - 0.5 * s * (a1[0] + a2[0]), oy = (pl.y0 + pl.y1) / 2 + 0.5 * s * (a1[1] + a2[1]);
      var RX = function (v) { return ox + s * v[0]; }, RY = function (v) { return oy - s * v[1]; };
      ctx.save(); ctx.beginPath(); ctx.rect(pl.x0, pl.y0, pl.x1 - pl.x0, pl.y1 - pl.y0); ctx.clip();
      if (h !== 0 || k !== 0) {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.3; ctx.globalAlpha = .7;
        var ux = G[0] / Gn, uy = G[1] / Gn, tx = -uy, ty = ux, mmax = Math.ceil(10 * Gn / TAU) + 4;
        for (var m = -mmax; m <= mmax; m++) {
          var d0 = TAU * m / Gn, cx0 = ux * d0, cy0 = uy * d0;
          ctx.beginPath(); ctx.moveTo(RX([cx0 - tx * 8, cy0 - ty * 8]), RY([cx0 - tx * 8, cy0 - ty * 8])); ctx.lineTo(RX([cx0 + tx * 8, cy0 + ty * 8]), RY([cx0 + tx * 8, cy0 + ty * 8])); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = C.soft; ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(RX([0, 0]), RY([0, 0])); ctx.lineTo(RX(a1), RY(a1)); ctx.lineTo(RX([a1[0] + a2[0], a1[1] + a2[1]]), RY([a1[0] + a2[0], a1[1] + a2[1]])); ctx.lineTo(RX(a2), RY(a2)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = C.muted; ctx.stroke();
      for (var i = -8; i <= 8; i++) for (var j = -8; j <= 8; j++) { var q = [i * a1[0] + j * a2[0], i * a1[1] + j * a2[1]]; dot(ctx, RX(q), RY(q), (i === 0 && j === 0) ? 4.5 : 3, (i === 0 && j === 0) ? C.ink : C.blue); }
      arrow(ctx, RX([0, 0]), RY([0, 0]), RX(a1), RY(a1), C.ink, 2, 9); arrow(ctx, RX([0, 0]), RY([0, 0]), RX(a2), RY(a2), C.ink, 2, 9);
      text(ctx, "a₁", RX(a1) + 4, RY(a1) + 14, C.ink, 12); text(ctx, "a₂", RX(a2) + 4, RY(a2) - 4, C.ink, 12);
      ctx.restore();
      text(ctx, "real space", pl.x0 + 8, pl.y0 + 16, C.muted, 12);
      /* reciprocal space */
      var bm = Math.max(Math.sqrt(b1[0] * b1[0] + b1[1] * b1[1]), Math.sqrt(b2[0] * b2[0] + b2[1] * b2[1])), sb = 78 / bm, qx = (pr.x0 + pr.x1) / 2, qy = (pr.y0 + pr.y1) / 2;
      var QX = function (v) { return qx + sb * v[0]; }, QY = function (v) { return qy - sb * v[1]; };
      ctx.save(); ctx.beginPath(); ctx.rect(pr.x0, pr.y0, pr.x1 - pr.x0, pr.y1 - pr.y0); ctx.clip();
      for (var i2 = -6; i2 <= 6; i2++) for (var j2 = -6; j2 <= 6; j2++) { var q2 = [i2 * b1[0] + j2 * b2[0], i2 * b1[1] + j2 * b2[1]], on = (i2 === h && j2 === k); dot(ctx, QX(q2), QY(q2), on ? 5 : (i2 === 0 && j2 === 0 ? 4.5 : 3), on ? C.accent : (i2 === 0 && j2 === 0 ? C.ink : C.blue)); if (Math.abs(i2) <= 1 && Math.abs(j2) <= 1 && !(i2 === 0 && j2 === 0)) text(ctx, "(" + i2 + j2 + ")", QX(q2) + 5, QY(q2) - 5, C.muted, 10); }
      arrow(ctx, QX([0, 0]), QY([0, 0]), QX(b1), QY(b1), C.ink, 2, 9); arrow(ctx, QX([0, 0]), QY([0, 0]), QX(b2), QY(b2), C.ink, 2, 9);
      text(ctx, "b₁", QX(b1) + 4, QY(b1) + 12, C.ink, 12); text(ctx, "b₂", QX(b2) + 4, QY(b2) - 4, C.ink, 12);
      if (h !== 0 || k !== 0) arrow(ctx, QX([0, 0]), QY([0, 0]), QX(G), QY(G), C.accent, 2.5, 10);
      ctx.restore();
      text(ctx, "reciprocal space", pr.x0 + 8, pr.y0 + 16, C.muted, 12);
      var b1n = Math.sqrt(b1[0] * b1[0] + b1[1] * b1[1]), b2n = Math.sqrt(b2[0] * b2[0] + b2[1] * b2[1]);
      setRead(api, ["cell area |a₁×a₂| = <b>" + fmtN(Math.abs(area), 3) + "</b>", "reciprocal cell area = <b>" + fmtN(TAU * TAU / Math.abs(area), 2) + "</b> (= (2π)²/area)", "|b₁| = <b>" + fmtN(b1n, 2) + "</b>, |b₂| = <b>" + fmtN(b2n, 2) + "</b>", (h || k) ? "plane (" + h + " " + k + "): d = 2π/|G| = <b>" + fmtN(TAU / Gn, 3) + "</b>" : "choose (h, k) ≠ (0, 0) to see the planes"]);
    }
    setSlider(gs, 120); redraws.push(draw); draw();
  }

  /* ================= M5: what a 2x2 matrix does ================= */
  function ellipse(host) {
    var api = shell(host, "What a 2×2 matrix does: eigenvectors and singular vectors",
      "The matrix A maps the unit circle (dashed) to an ellipse. Drag the test vector v (slider) and watch A<b>v</b>: when v lies along an eigenvector (blue line), A<b>v</b> points the same way and is only stretched by the eigenvalue. The ellipse axes (black) are the singular directions, with lengths equal to the singular values. For a symmetric matrix the two coincide; for a rotation there are no real eigenvectors.");
    var presets = [
      ["symmetric stretch", 1.5, 0.5, 0.5, 1.5], ["rotation by 40°", 0.766, -0.643, 0.643, 0.766], ["shear", 1, 1, 0, 1], ["singular (projection)", 1, 1, 0.5, 0.5],
      ["reflection", 1, 0, 0, -1], ["general (non-symmetric)", 1.4, -0.6, 0.2, 0.7], ["indefinite symmetric (saddle)", 1.2, 0.8, 0.8, -0.9]
    ];
    var cv = api.addCanvas(640, 330);
    var sel = select(api, "Preset", presets.map(function (q) { return q[0]; }), 0, function (v) { var q = presets[v]; setSlider(sa, q[1]); setSlider(sb, q[2]); setSlider(sc, q[3]); setSlider(sd, q[4]); });
    var sa = slider(api, "a", -2, 2, 0.05, 1.5, function (v) { return v.toFixed(2); }, draw), sb = slider(api, "b", -2, 2, 0.05, 0.5, function (v) { return v.toFixed(2); }, draw),
        sc = slider(api, "c", -2, 2, 0.05, 0.5, function (v) { return v.toFixed(2); }, draw), sd = slider(api, "d", -2, 2, 0.05, 1.5, function (v) { return v.toFixed(2); }, draw);
    var th = slider(api, "test vector angle", 0, 360, 1, 25, function (v) { return v + "°"; }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, a = sa.get(), b = sb.get(), c = sc.get(), d = sd.get();
      var xr = [-4.4, 4.4], yr = [-2.6, 2.6], P = eqRect({ x0: 8, y0: 8, x1: W - 8, y1: H - 8 }, xr, yr), sc2 = (P.x1 - P.x0) / (xr[1] - xr[0]);
      var X = function (v) { return P.x0 + (v - xr[0]) * sc2; }, Y = function (v) { return P.y1 - (v - yr[0]) * sc2; };
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.bg; ctx.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); ctx.strokeStyle = C.border; ctx.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
      ctx.save(); ctx.beginPath(); ctx.rect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); ctx.clip();
      ctx.strokeStyle = C.border; ctx.lineWidth = 1; for (var g = -4; g <= 4; g++) { ctx.beginPath(); ctx.moveTo(X(g), P.y0); ctx.lineTo(X(g), P.y1); ctx.stroke(); } for (var g2 = -2; g2 <= 2; g2++) { ctx.beginPath(); ctx.moveTo(P.x0, Y(g2)); ctx.lineTo(P.x1, Y(g2)); ctx.stroke(); }
      ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(P.x0, Y(0)); ctx.lineTo(P.x1, Y(0)); ctx.moveTo(X(0), P.y0); ctx.lineTo(X(0), P.y1); ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.arc(X(0), Y(0), sc2, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 200; i++) { var t = TAU * i / 200, x = Math.cos(t), y = Math.sin(t), u = a * x + b * y, v = c * x + d * y; if (i) ctx.lineTo(X(u), Y(v)); else ctx.moveTo(X(u), Y(v)); }
      ctx.stroke();
      var tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det, eigTxt, real = disc >= -1e-12, l1, l2;
      if (real) {
        var sq = Math.sqrt(Math.max(disc, 0)); l1 = (tr + sq) / 2; l2 = (tr - sq) / 2;
        [l1, l2].forEach(function (l, idx) {
          var vx, vy; if (Math.abs(b) > 1e-9) { vx = b; vy = l - a; } else if (Math.abs(c) > 1e-9) { vx = l - d; vy = c; } else { vx = idx === 0 ? (Math.abs(a - l) < 1e-9 ? 1 : 0) : (Math.abs(a - l) < 1e-9 ? 1 : 0); vy = Math.abs(d - l) < 1e-9 && !(Math.abs(a - l) < 1e-9) ? 1 : 0; if (vx === 0 && vy === 0) { vx = 1; } }
          var n = Math.sqrt(vx * vx + vy * vy) || 1; vx /= n; vy /= n;
          ctx.strokeStyle = C.blue; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(-6 * vx), Y(-6 * vy)); ctx.lineTo(X(6 * vx), Y(6 * vy)); ctx.stroke();
        });
        eigTxt = "eigenvalues <b>" + fmtN(l1, 3) + "</b>, <b>" + fmtN(l2, 3) + "</b>";
      } else eigTxt = "eigenvalues <b>" + fmtN(tr / 2, 2) + " ± " + fmtN(Math.sqrt(-disc) / 2, 2) + " i</b> (complex: no real eigenvector)";
      /* singular values via A^T A */
      var p11 = a * a + c * c, p12 = a * b + c * d, p22 = b * b + d * d, m = (p11 + p22) / 2, dd = Math.sqrt(((p11 - p22) / 2) * ((p11 - p22) / 2) + p12 * p12);
      var s1 = Math.sqrt(Math.max(m + dd, 0)), s2 = Math.sqrt(Math.max(m - dd, 0)), ang = 0.5 * Math.atan2(2 * p12, p11 - p22);
      [[s1, ang], [s2, ang + PI / 2]].forEach(function (q) { var vx = Math.cos(q[1]), vy = Math.sin(q[1]), u = (a * vx + b * vy) , w = (c * vx + d * vy); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(u), Y(w)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(-u), Y(-w)); ctx.stroke(); });
      var tv = th.get() * PI / 180, vx = Math.cos(tv), vy = Math.sin(tv), ax = a * vx + b * vy, ay = c * vx + d * vy;
      arrow(ctx, X(0), Y(0), X(vx), Y(vy), C.blue, 3, 11); arrow(ctx, X(0), Y(0), X(ax), Y(ay), C.accent, 3, 11);
      ctx.restore();
      var la = Math.sqrt(ax * ax + ay * ay), cross = vx * ay - vy * ax, dotp = vx * ax + vy * ay, angle = Math.atan2(cross, dotp) * 180 / PI;
      text(ctx, "v (unit)", X(vx) + 6, Y(vy) - 6, C.blue, 12); text(ctx, "Av", X(ax) + 6, Y(ay) - 6, C.accent, 12);
      setRead(api, ["trace <b>" + fmtN(tr, 2) + "</b>, determinant <b>" + fmtN(det, 2) + "</b>", eigTxt, "singular values <b>" + fmtN(s1, 3) + "</b>, <b>" + fmtN(s2, 3) + "</b>" + (s2 > 1e-9 ? ", condition number <b>" + fmtN(s1 / s2, 2) + "</b>" : " (singular matrix)"), "|Av| = <b>" + fmtN(la, 2) + "</b>, angle from v to Av = <b>" + fmtN(angle, 0) + "°</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M5: normal modes of a chain ================= */
  function modes(host) {
    var api = shell(host, "Normal modes of N masses between two walls",
      "Each eigenvector of the force-constant matrix is a normal mode in which all masses oscillate at one frequency, ω<sub>n</sub> = 2√(k/m) sin(nπ/[2(N+1)]). Mode 1 is the long-wavelength &ldquo;acoustic&rdquo; mode; the last mode alternates neighbour against neighbour. The N frequencies lie on the continuous dispersion curve (right).");
    var cv = api.addCanvas(640, 330), N = 6, n = 1, t = 0;
    var ns = slider(api, "number of masses N", 2, 14, 1, 6, function (v) { return String(v); }, function (v) { N = v; draw(); });
    var ms = slider(api, "mode n", 1, 14, 1, 1, function (v) { return String(v); }, function (v) { n = v; draw(); });
    var an = animator(host, function (dt) { t += dt; draw(); });
    var btn = button(api, reduceMotion() ? "Play" : "Pause", true, function () { btn.textContent = an.toggle() ? "Pause" : "Play"; });
    if (!reduceMotion()) an.start();
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, nn = Math.min(n, N), w = 2 * Math.sin(nn * PI / (2 * (N + 1)));
      ctx.clearRect(0, 0, W, H);
      var x0 = 30, x1 = W / 2 - 10, yc = 110, dx = (x1 - x0) / (N + 1), A = 52, ph = Math.cos(w * t * 2.2);
      ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x1, yc); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.fillRect(x0 - 4, yc - 70, 5, 140); ctx.fillRect(x1 - 1, yc - 70, 5, 140);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); for (var s = 0; s <= 120; s++) { var xx = x0 + (x1 - x0) * s / 120, yy = yc - A * Math.sin(nn * PI * s / 120); if (s) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yc);
      for (var j = 1; j <= N; j++) ctx.lineTo(x0 + dx * j, yc - A * Math.sin(nn * PI * j / (N + 1)) * ph); ctx.lineTo(x1, yc); ctx.stroke();
      for (var k = 1; k <= N; k++) dot(ctx, x0 + dx * k, yc - A * Math.sin(nn * PI * k / (N + 1)) * ph, 7, C.accent);
      text(ctx, "N = " + N + ", mode n = " + nn, x0, 24, C.muted, 12); text(ctx, "displacements drawn transverse for clarity", x0, H - 78, C.muted, 11);
      /* dispersion */
      var p = { x0: W / 2 + 40, y0: 20, x1: W - 16, y1: H - 78 }, xr = [0, 1], yr = [0, 2.2];
      var F = frame(ctx, C, p, xr, yr, { xlabel: "n / (N+1)", ylabel: "ω / √(k/m)", nx: 5, ny: 5 });
      ctx.strokeStyle = C.border; ctx.lineWidth = 1.5; curve(ctx, function (q) { return 2 * Math.sin(q * PI / 2); }, 0, 1, 80, F.X, F.Y);
      for (var m = 1; m <= N; m++) { var q = m / (N + 1), om = 2 * Math.sin(q * PI / 2); dot(ctx, F.X(q), F.Y(om), m === nn ? 6 : 3.5, m === nn ? C.accent : C.blue); }
      setRead(api, ["ω<sub>n</sub> = <b>" + fmtN(w, 3) + "</b> √(k/m)", "wavelength = <b>" + (2 * (N + 1) / nn).toFixed(2) + "</b> lattice spacings", "all <b>" + N + "</b> frequencies lie between <b>" + fmtN(2 * Math.sin(PI / (2 * (N + 1))), 2) + "</b> and <b>" + fmtN(2 * Math.sin(N * PI / (2 * (N + 1))), 2) + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M6: Mohr's circle ================= */
  function mohr(host) {
    var api = shell(host, "Mohr's circle: stress on a plane at angle \u03B8",
      "A plane stress state (\u03C3<sub>x</sub>, \u03C3<sub>y</sub>, \u03C4<sub>xy</sub>) is a point pair on a circle in the (\u03C3, \u03C4) plane. Rotating the plane by \u03B8 moves the stress point through 2\u03B8 around the circle. The circle crosses the horizontal axis at the principal stresses (zero shear) and its top is the maximum shear stress. Tension is positive; on the element, orange arrows show normal stress and blue arrows shear stress on the rotated faces.");
    var cv = api.addCanvas(640, 330);
    var sx = slider(api, "\u03C3<sub>x</sub> (MPa)", -100, 200, 5, 80, function (v) { return String(v); }, draw), sy = slider(api, "\u03C3<sub>y</sub> (MPa)", -100, 200, 5, 20, function (v) { return String(v); }, draw),
        txy = slider(api, "\u03C4<sub>xy</sub> (MPa)", -100, 100, 5, 30, function (v) { return String(v); }, draw), tn = slider(api, "plane angle \u03B8", 0, 180, 1, 30, function (v) { return v + "\u00B0"; }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, X0 = sx.get(), Y0 = sy.get(), T = txy.get(), th = tn.get() * PI / 180;
      var c = (X0 + Y0) / 2, a = (X0 - Y0) / 2, R = Math.sqrt(a * a + T * T), phi = Math.atan2(T, a), s1 = c + R, s2 = c - R;
      ctx.clearRect(0, 0, W, H);
      var p0 = { x0: 52, y0: 12, x1: 392, y1: H - 42 }, half = Math.max(R * 1.45, 60), ratio = (p0.y1 - p0.y0) / (p0.x1 - p0.x0);
      var xr = [c - half, c + half], yr = [-half * ratio, half * ratio];
      var F = frame(ctx, C, p0, xr, yr, { xlabel: "normal stress \u03C3 (MPa)", ylabel: "shear \u03C4 (MPa)", ny: 4, ylx: 14 });
      clipRect(ctx, p0);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); for (var i = 0; i <= 120; i++) { var t = TAU * i / 120; var px = F.X(c + R * Math.cos(t)), py = F.Y(R * Math.sin(t)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
      var A1 = [X0, T], B1 = [Y0, -T], Pp = [c + R * Math.cos(phi - 2 * th), R * Math.sin(phi - 2 * th)];
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(F.X(A1[0]), F.Y(A1[1])); ctx.lineTo(F.X(B1[0]), F.Y(B1[1])); ctx.stroke();
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(F.X(c), F.Y(0)); ctx.lineTo(F.X(Pp[0]), F.Y(Pp[1])); ctx.stroke();
      dot(ctx, F.X(A1[0]), F.Y(A1[1]), 4.5, C.ink); dot(ctx, F.X(B1[0]), F.Y(B1[1]), 4.5, C.ink);
      dot(ctx, F.X(s1), F.Y(0), 5, C.accent); dot(ctx, F.X(s2), F.Y(0), 5, C.accent); dot(ctx, F.X(c), F.Y(R), 4, C.muted); dot(ctx, F.X(c), F.Y(-R), 4, C.muted);
      dot(ctx, F.X(Pp[0]), F.Y(Pp[1]), 6.5, C.blue);
      ctx.restore();
      text(ctx, "x", F.X(A1[0]) + 7, F.Y(A1[1]) - 6, C.ink, 12); text(ctx, "y", F.X(B1[0]) + 7, F.Y(B1[1]) + 14, C.ink, 12); text(ctx, "\u03C3\u2081", F.X(s1) + 4, F.Y(0) - 9, C.accent, 12); text(ctx, "\u03C3\u2082", F.X(s2) - 18, F.Y(0) - 9, C.accent, 12);
      /* rotated element, local axes x' (right, rotated by theta) and y' (up) */
      var ex = 520, ey = 140, S = 54, sxp = c + a * Math.cos(2 * th) + T * Math.sin(2 * th), syp = c - a * Math.cos(2 * th) - T * Math.sin(2 * th), tp = -a * Math.sin(2 * th) + T * Math.cos(2 * th);
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(-th); ctx.scale(1, -1);
      ctx.fillStyle = C.soft; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.fillRect(-S / 2, -S / 2, S, S); ctx.strokeRect(-S / 2, -S / 2, S, S);
      var sc = 0.3, Ln = function (v) { return clamp(Math.abs(v) * sc, 5, 44); };
      function normal(nx, ny, s) { var L = Ln(s), fx = nx * S / 2, fy = ny * S / 2; if (s >= 0) arrow(ctx, fx, fy, fx + nx * L, fy + ny * L, C.accent, 2.5, 8); else arrow(ctx, fx + nx * L, fy + ny * L, fx, fy, C.accent, 2.5, 8); }
      function shear(nx, ny, tx, ty, s) { var L = Ln(s), fx = nx * (S / 2 + 7), fy = ny * (S / 2 + 7), d = s >= 0 ? 1 : -1; arrow(ctx, fx - tx * d * L / 2, fy - ty * d * L / 2, fx + tx * d * L / 2, fy + ty * d * L / 2, C.blue, 2, 8); }
      normal(1, 0, sxp); normal(-1, 0, sxp); normal(0, 1, syp); normal(0, -1, syp);
      shear(1, 0, 0, 1, tp); shear(-1, 0, 0, -1, tp); shear(0, 1, 1, 0, tp); shear(0, -1, -1, 0, tp);
      ctx.restore();
      text(ctx, "element rotated by \u03B8 = " + fmtN(th * 180 / PI, 0) + "\u00B0", ex, 232, C.muted, 12, "center");
      var vm = Math.sqrt(s1 * s1 - s1 * s2 + s2 * s2);
      setRead(api, ["principal stresses <b>" + fmtN(s1, 1) + "</b>, <b>" + fmtN(s2, 1) + "</b> MPa at \u03B8<sub>p</sub> = <b>" + fmtN(phi * 90 / PI, 1) + "\u00B0</b>", "max in-plane shear = <b>" + fmtN(R, 1) + "</b> MPa", "on the plane: \u03C3\u2032 = <b>" + fmtN(sxp, 1) + "</b>, \u03C4\u2032 = <b>" + fmtN(tp, 1) + "</b> MPa", "von Mises (plane stress) = <b>" + fmtN(vm, 1) + "</b> MPa"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M6: anisotropy of a cubic crystal ================= */
  function cubicE(host) {
    var api = shell(host, "Young's modulus of a cubic crystal depends on direction",
      "In the (001) plane the Young's modulus along the direction at angle φ from [100] is 1/E = S<sub>11</sub> &minus; 2(S<sub>11</sub> &minus; S<sub>12</sub> &minus; S<sub>44</sub>/2) sin²φ cos²φ. The dashed circle is the isotropic (Voigt&ndash;Reuss&ndash;Hill) polycrystal average. The further the Zener ratio A = 2C<sub>44</sub>/(C<sub>11</sub> &minus; C<sub>12</sub>) is from 1, the more the single crystal departs from a circle.");
    var mats = [["Al", 108, 62, 28], ["Cu", 168.4, 121.4, 75.4], ["Fe (bcc)", 231.4, 134.7, 116.4], ["W", 522.4, 204.4, 160.8], ["Ni", 246.5, 147.3, 124.7], ["Si", 165.7, 63.9, 79.6], ["isotropic model", 200, 100, 50]];
    var cv = api.addCanvas(640, 320);
    var sel = select(api, "Material", mats.map(function (m) { return m[0]; }), 1, function (v) { setSlider(c11, mats[v][1]); setSlider(c12, mats[v][2]); setSlider(c44, mats[v][3]); });
    var c11 = slider(api, "C₁₁ (GPa)", 50, 600, 0.5, 168.4, function (v) { return v.toFixed(1); }, draw), c12 = slider(api, "C₁₂ (GPa)", 0, 400, 0.5, 121.4, function (v) { return v.toFixed(1); }, draw), c44 = slider(api, "C₄₄ (GPa)", 10, 300, 0.5, 75.4, function (v) { return v.toFixed(1); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, a = c11.get(), b = c12.get(), d = c44.get();
      ctx.clearRect(0, 0, W, H);
      var stable = a > Math.abs(b) && a + 2 * b > 0 && d > 0;
      if (!stable) { text(ctx, "Born stability criteria violated (C11 > |C12|, C11 + 2C12 > 0, C44 > 0): the crystal is mechanically unstable", 20, 140, C.accent, 13); setRead(api, ["unstable: no finite Young's modulus in some directions"]); return; }
      var den = (a - b) * (a + 2 * b), S11 = (a + b) / den, S12 = -b / den, S44 = 1 / d, K = S11 - S12 - S44 / 2;
      var E = function (q) { return 1 / (S11 - 2 * K * q); };
      var B = (a + 2 * b) / 3, Gv = (a - b + 3 * d) / 5, Gr = 5 / (4 * (S11 - S12) + 3 * S44), G = (Gv + Gr) / 2, Eiso = 9 * B * G / (3 * B + G);
      var emax = 1, emin = 1e9, i; for (i = 0; i <= 90; i++) { var ph = i * PI / 180, v = E(Math.pow(Math.cos(ph) * Math.sin(ph), 2)); if (v > emax) emax = v; if (v < emin) emin = v; }
      var cx = 165, cy = 160, sc = 130 / Math.max(emax, Eiso) ;
      ctx.strokeStyle = C.border; ctx.lineWidth = 1; [0.5, 1].forEach(function (f) { ctx.beginPath(); ctx.arc(cx, cy, 130 * f, 0, TAU); ctx.stroke(); }); ctx.beginPath(); ctx.moveTo(cx - 140, cy); ctx.lineTo(cx + 140, cy); ctx.moveTo(cx, cy - 140); ctx.lineTo(cx, cy + 140); ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.arc(cx, cy, Eiso * sc, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); for (i = 0; i <= 360; i++) { var f = i * PI / 180, r = E(Math.pow(Math.cos(f) * Math.sin(f), 2)) * sc; var px = cx + r * Math.cos(f), py = cy - r * Math.sin(f); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
      text(ctx, "[100]", cx + 134, cy + 14, C.muted, 11, "right"); text(ctx, "[010]", cx + 6, cy - 134, C.muted, 11); text(ctx, "E(φ) in the (001) plane", 12, 18, C.muted, 12);
      var p = { x0: 360, y0: 24, x1: W - 16, y1: H - 54 }, top = Math.ceil(Math.max(emax, Eiso) / 50) * 50 + 0;
      var F = frame(ctx, C, p, [0, 90], [0, top], { xlabel: "angle φ from [100] (deg)", ylabel: "E (GPa)", nx: 6, ny: 5, xticks: [0, 15, 30, 45, 60, 75, 90] });
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; curve(ctx, function (x) { var ph = x * PI / 180; return E(Math.pow(Math.cos(ph) * Math.sin(ph), 2)); }, 0, 90, 180, F.X, F.Y);
      ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(F.X(0), F.Y(Eiso)); ctx.lineTo(F.X(90), F.Y(Eiso)); ctx.stroke(); ctx.setLineDash([]);
      var A = 2 * d / (a - b), E100 = 1 / S11, E110 = E(0.25), E111 = E(1 / 3);
      setRead(api, ["E<sub>[100]</sub> = <b>" + fmtN(E100, 0) + "</b> GPa", "E<sub>[110]</sub> = <b>" + fmtN(E110, 0) + "</b>", "E<sub>[111]</sub> = <b>" + fmtN(E111, 0) + "</b>", "Zener ratio A = <b>" + fmtN(A, 2) + "</b>", "isotropic (VRH) E = <b>" + fmtN(Eiso, 0) + "</b> GPa"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M7: phase plane of a 2x2 linear system ================= */
  function phaseplane(host) {
    var api = shell(host, "Phase plane of ẋ = Ay: the trace–determinant plane",
      "For A = [[0, 1], [−Δ, τ]] the trace is τ and the determinant Δ. The eigenvalues are λ = (τ ± √(τ² − 4Δ))/2, so the point (τ, Δ) on the right decides the character of the fixed point on the left: it is stable only if τ &lt; 0 and Δ &gt; 0, oscillatory when the point lies above the parabola Δ = τ²/4, and a saddle for Δ &lt; 0.");
    var cv = api.addCanvas(640, 330), pre = [["stable spiral", -1, 2], ["stable node", -3, 1.5], ["unstable spiral", 0.8, 2], ["saddle", 0.5, -2], ["centre", 0, 2], ["critical damping", -2, 1]];
    var sel = select(api, "Preset", pre.map(function (q) { return q[0]; }), 0, function (v) { setSlider(ts, pre[v][1]); setSlider(ds, pre[v][2]); });
    var ts = slider(api, "trace τ", -4, 4, 0.1, -1, function (v) { return v.toFixed(1); }, draw), ds = slider(api, "determinant Δ", -3, 6, 0.1, 2, function (v) { return v.toFixed(1); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, tr = ts.get(), de = ds.get(), disc = tr * tr - 4 * de;
      ctx.clearRect(0, 0, W, H);
      var p1 = { x0: 40, y0: 12, x1: 330, y1: H - 40 }, R = 3, F1 = frame(ctx, C, p1, [-R, R], [-R, R], { xlabel: "x", ylabel: "y", nx: 6, ny: 6 });
      var f = function (x, y) { return [y, -de * x + tr * y]; };
      clipRect(ctx, p1); ctx.lineWidth = 1.6;
      var starts = []; for (var i = 0; i < 14; i++) { var a = TAU * i / 14; starts.push([2.4 * Math.cos(a), 2.4 * Math.sin(a)]); starts.push([1.0 * Math.cos(a + .2), 1.0 * Math.sin(a + .2)]); }
      starts.forEach(function (s0, idx) {
        var x = s0[0], y = s0[1], h = 0.02; ctx.strokeStyle = idx % 2 ? C.blue : C.accent; ctx.globalAlpha = .8; ctx.beginPath(); ctx.moveTo(F1.X(x), F1.Y(y));
        for (var k = 0; k < 600; k++) {
          var k1 = f(x, y), k2 = f(x + h / 2 * k1[0], y + h / 2 * k1[1]), k3 = f(x + h / 2 * k2[0], y + h / 2 * k2[1]), k4 = f(x + h * k3[0], y + h * k3[1]);
          x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
          if (Math.abs(x) > 8 || Math.abs(y) > 8) break; ctx.lineTo(F1.X(x), F1.Y(y));
        }
        ctx.stroke(); ctx.globalAlpha = 1; dot(ctx, F1.X(s0[0]), F1.Y(s0[1]), 2.5, idx % 2 ? C.blue : C.accent);
      });
      if (disc >= 0) { var sq = Math.sqrt(disc); [(tr + sq) / 2, (tr - sq) / 2].forEach(function (l) { var n = Math.sqrt(1 + l * l); ctx.strokeStyle = C.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(F1.X(-6 / n), F1.Y(-6 * l / n)); ctx.lineTo(F1.X(6 / n), F1.Y(6 * l / n)); ctx.stroke(); ctx.setLineDash([]); }); }
      ctx.restore(); dot(ctx, F1.X(0), F1.Y(0), 4, C.ink);
      var p2 = { x0: 392, y0: 12, x1: W - 12, y1: H - 40 }, F2 = frame(ctx, C, p2, [-4, 4], [-3, 6], { xlabel: "trace τ", ylabel: "determinant Δ", nx: 4, ny: 5, ylx: p2.x0 - 32 });
      clipRect(ctx, p2); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; curve(ctx, function (t) { return t * t / 4; }, -4, 4, 100, F2.X, F2.Y); ctx.restore();
      text(ctx, "saddle", F2.X(-3.7), F2.Y(-1.8), C.muted, 11); text(ctx, "stable", F2.X(-3.7), F2.Y(5.3), C.blue, 11); text(ctx, "unstable", F2.X(1.4), F2.Y(5.3), C.accent, 11); text(ctx, "spirals", F2.X(-0.5), F2.Y(4.2), C.muted, 11); text(ctx, "nodes", F2.X(-3.6), F2.Y(0.5), C.muted, 11);
      dot(ctx, F2.X(tr), F2.Y(de), 6, C.ink);
      var kind, eig;
      if (disc >= 0) { var q = Math.sqrt(disc), l1 = (tr + q) / 2, l2 = (tr - q) / 2; eig = fmtN(l1, 2) + ", " + fmtN(l2, 2); kind = de < 0 ? "saddle (unstable)" : Math.abs(disc) < 1e-9 ? "degenerate node" : (l1 < 0 ? "stable node" : "unstable node"); if (Math.abs(de) < 1e-9) kind = "line of fixed points"; }
      else { var re = tr / 2, im = Math.sqrt(-disc) / 2; eig = fmtN(re, 2) + " ± " + fmtN(im, 2) + " i"; kind = Math.abs(tr) < 1e-9 ? "centre (closed orbits)" : (tr < 0 ? "stable spiral" : "unstable spiral"); }
      setRead(api, ["eigenvalues <b>" + eig + "</b>", "fixed point: <b>" + kind + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M7: integrators for the harmonic oscillator ================= */
  function integrators(host) {
    var api = shell(host, "Time integrators on a harmonic oscillator (exact motion: a circle in phase space)",
      "Integrating x&Prime; = &minus;x for about 6 periods. Explicit Euler spirals outward (the energy grows by 1 + h² per step); implicit Euler spirals inward (artificial damping); velocity Verlet stays on a closed curve and its energy only oscillates slightly; RK4 is very accurate at small h but slowly loses or gains energy. For a long molecular dynamics run, Verlet's behaviour is what you want.");
    var cv = api.addCanvas(640, 310), mi = 0;
    var names = ["explicit Euler", "implicit (backward) Euler", "velocity Verlet", "Runge–Kutta 4"];
    var sel = select(api, "Method", names, 2, function (v) { mi = v; draw(); });
    mi = 2;
    var hs = slider(api, "time step h", 0.02, 1.5, 0.01, 0.2, function (v) { return v.toFixed(2); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function run(h) {
      var T = 38, n = Math.max(1, Math.round(T / h)), x = 1, v = 0, xs = [x], vs = [v], E = [0.5], i;
      for (i = 0; i < n; i++) {
        if (mi === 0) { var xn = x + h * v, vn = v - h * x; x = xn; v = vn; }
        else if (mi === 1) { var x2 = (x + h * v) / (1 + h * h); v = v - h * x2; x = x2; }
        else if (mi === 2) { var x3 = x + h * v - 0.5 * h * h * x; v = v - 0.5 * h * (x + x3); x = x3; }
        else { var f = function (a, b) { return [b, -a]; }, k1 = f(x, v), k2 = f(x + h / 2 * k1[0], v + h / 2 * k1[1]), k3 = f(x + h / 2 * k2[0], v + h / 2 * k2[1]), k4 = f(x + h * k3[0], v + h * k3[1]); x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); v += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); }
        xs.push(x); vs.push(v); E.push(0.5 * (x * x + v * v)); if (!isFinite(x) || Math.abs(x) > 1e8) break;
      }
      return { xs: xs, vs: vs, E: E, h: h };
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, h = hs.get(), r = run(h);
      ctx.clearRect(0, 0, W, H);
      var p1 = { x0: 44, y0: 12, x1: 300, y1: H - 40 }, R = 2.2, F1 = frame(ctx, C, p1, [-R, R], [-R, R], { xlabel: "x", ylabel: "v", nx: 4, ny: 4 });
      clipRect(ctx, p1); ctx.strokeStyle = C.muted; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(F1.X(0), F1.Y(0), (p1.x1 - p1.x0) / (2 * R), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.8; ctx.beginPath(); r.xs.forEach(function (x, i) { var X = F1.X(x), Y = F1.Y(r.vs[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke();
      if (r.xs.length < 400) r.xs.forEach(function (x, i) { dot(ctx, F1.X(x), F1.Y(r.vs[i]), 2.2, C.accent); });
      ctx.restore(); dot(ctx, F1.X(1), F1.Y(0), 4, C.ink);
      var p2 = { x0: 366, y0: 12, x1: W - 12, y1: H - 40 }, top = 3, F2 = frame(ctx, C, p2, [0, 38], [0, top], { xlabel: "time", ylabel: "E(t) / E(0)", nx: 5, ny: 3, ylx: p2.x0 - 34 });
      clipRect(ctx, p2); ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(F2.X(0), F2.Y(1)); ctx.lineTo(F2.X(38), F2.Y(1)); ctx.stroke();
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath(); r.E.forEach(function (e, i) { var X = F2.X(i * h), Y = F2.Y(Math.min(e / 0.5, top * 1.5)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
      var last = r.E[r.E.length - 1] / 0.5, mx = 0, mn = 9; r.E.forEach(function (e) { var q = e / 0.5; if (q > mx) mx = q; if (q < mn) mn = q; });
      setRead(api, ["steps per period <b>" + fmtN(TAU / h, 0) + "</b>", "final energy / initial = <b>" + (last > 1e4 ? last.toExponential(1) : fmtN(last, 3)) + "</b>", "range of E/E₀: <b>" + (mx > 1e4 ? mn.toFixed(3) + " – " + mx.toExponential(1) : fmtN(mn, 3) + " – " + fmtN(mx, 3)) + "</b>", (mi === 2 && h >= 2) ? "unstable: hω ≥ 2" : ""]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M8: sampling and aliasing ================= */
  function aliasing(host) {
    var api = shell(host, "Sampling and aliasing",
      "A cosine of frequency f is sampled once per unit time (sampling rate 1, Nyquist frequency 0.5). Below the Nyquist frequency the samples (dots) track the wave. Above it they are exactly the samples of a slower wave (dashed) at the aliased frequency |f &minus; m| with m the nearest integer: the fast signal is misread as a slow one. This is how a 3000 cm<sup>&minus;1</sup> C&ndash;H stretch can show up as a spurious low-frequency peak if the trajectory is saved too rarely.");
    var cv = api.addCanvas(640, 340);
    var fs = slider(api, "signal frequency f (sampling rate = 1)", 0.05, 3, 0.01, 0.35, function (v) { return v.toFixed(2); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, f = fs.get(), m = Math.round(f), fa = Math.abs(f - m);
      ctx.clearRect(0, 0, W, H);
      var p1 = { x0: 44, y0: 12, x1: W - 14, y1: 190 }, T = 10, F = frame(ctx, C, p1, [0, T], [-1.3, 1.3], { xlabel: "time (units of the sampling interval)", ylabel: "signal", nx: 10, ny: 4 });
      clipRect(ctx, p1);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2; curve(ctx, function (t) { return Math.cos(TAU * f * t); }, 0, T, 1200, F.X, F.Y);
      if (fa > 0.003 && f > 0.5) { ctx.strokeStyle = C.blue; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; curve(ctx, function (t) { return Math.cos(TAU * fa * t); }, 0, T, 800, F.X, F.Y); ctx.setLineDash([]); }
      for (var n = 0; n <= T; n++) dot(ctx, F.X(n), F.Y(Math.cos(TAU * f * n)), 4.5, C.ink);
      ctx.restore();
      var X2 = function (v) { return 44 + v / 3 * (W - 14 - 44); }, yb = 292;
      ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X2(0), yb); ctx.lineTo(X2(3), yb); ctx.stroke();
      for (var q = 0; q <= 3; q += 0.5) { ctx.beginPath(); ctx.moveTo(X2(q), yb - 4); ctx.lineTo(X2(q), yb + 4); ctx.stroke(); text(ctx, String(q), X2(q), yb + 17, C.muted, 11, "center"); }
      ctx.strokeStyle = C.muted; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X2(0.5), 246); ctx.lineTo(X2(0.5), yb); ctx.stroke(); ctx.setLineDash([]); text(ctx, "Nyquist", X2(0.5) + 5, 258, C.muted, 11);
      arrow(ctx, X2(f), 252, X2(f), yb - 2, C.accent, 3, 9); text(ctx, "true f", X2(f) - 4, 244, C.accent, 11, f > 2.6 ? "right" : "left");
      if (f > 0.5) { arrow(ctx, X2(fa), 252, X2(fa), yb - 2, C.blue, 3, 9); text(ctx, "apparent", X2(fa) - 4, 244, C.blue, 11, fa > 0.2 ? "left" : "right"); }
      text(ctx, "frequency (sampling rate = 1)", (44 + W - 14) / 2, 330, C.muted, 12, "center");
      setRead(api, ["true frequency <b>" + fmtN(f, 2) + "</b>", "apparent frequency <b>" + fmtN(f > 0.5 ? fa : f, 2) + "</b>", f > 0.5 ? "<b>aliased</b>: above the Nyquist frequency 0.5" : "resolved: below the Nyquist frequency 0.5"]);
    }
    redraws.push(draw); draw();
  }

  /* ---------- numerical helpers for the PDE demos ---------- */
  function erf(z) { var s = z < 0 ? -1 : 1; z = Math.abs(z); var t = 1 / (1 + 0.3275911 * z); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z); return s * y; }
  function erfinv(y) { if (y <= -1) return -6; if (y >= 1) return 6; var x = 0, i; for (i = 0; i < 40; i++) { var e = erf(x) - y; x -= e / (2 / Math.sqrt(PI) * Math.exp(-x * x)); } return x; }
  function fft(re, im, inv) {
    var n = re.length, i, j = 0, k, m;
    for (i = 1; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { var t1 = re[i]; re[i] = re[j]; re[j] = t1; var t2 = im[i]; im[i] = im[j]; im[j] = t2; } }
    for (var len = 2; len <= n; len <<= 1) {
      var ang = TAU / len * (inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
      for (i = 0; i < n; i += len) { var cr = 1, ci = 0; for (k = 0; k < len / 2; k++) { var a = i + k, b = i + k + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; var ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr; } }
    }
    if (inv) for (m = 0; m < n; m++) { re[m] /= n; im[m] /= n; }
  }

  /* ================= M9: similarity solution of diffusion ================= */
  function erfProfile(host) {
    var api = shell(host, "Diffusion into a semi-infinite solid: the erf profile",
      "Surface held at c<sub>s</sub> = 1.0 wt%, bulk at c<sub>0</sub> = 0.2 wt% (carburising). The profile is c = c<sub>s</sub> &minus; (c<sub>s</sub> &minus; c<sub>0</sub>) erf[x / (2&radic;(Dt))]. Curves are drawn at t/4, t/2 and t: a contour of fixed concentration moves as &radic;t, so doubling its depth takes four times as long.");
    var cv = api.addCanvas(640, 310);
    var ds = slider(api, "log₁₀ D (m²/s)", -13, -9, 0.05, -10.96, function (v) { return "D = " + Math.pow(10, v).toExponential(1); }, draw);
    var ts = slider(api, "time t (hours)", 0.5, 100, 0.5, 8, function (v) { return v + " h"; }, draw);
    var cs = slider(api, "target concentration c*", 0.3, 0.9, 0.01, 0.5, function (v) { return v.toFixed(2) + " wt%"; }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, D = Math.pow(10, ds.get()), t = ts.get() * 3600, cst = cs.get(), c0 = 0.2, cS = 1.0;
      var L = 2 * Math.sqrt(D * t) * 2.6 * 1e3, xmax = Math.max(0.2, L);
      ctx.clearRect(0, 0, W, H);
      var p = { x0: 56, y0: 14, x1: W - 16, y1: H - 44 }, F = frame(ctx, C, p, [0, xmax], [0, 1.1], { xlabel: "depth x (mm)", ylabel: "concentration (wt%)", nx: 6, ny: 5 });
      clipRect(ctx, p);
      [[0.25, C.border, 1.5], [0.5, C.muted, 1.8], [1, C.accent, 2.8]].forEach(function (q) { ctx.strokeStyle = q[1]; ctx.lineWidth = q[2]; curve(ctx, function (x) { return cS - (cS - c0) * erf(x * 1e-3 / (2 * Math.sqrt(D * t * q[0]))); }, 0, xmax, 300, F.X, F.Y); });
      ctx.restore();
      ctx.strokeStyle = C.blue; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x0, F.Y(cst)); ctx.lineTo(p.x1, F.Y(cst)); ctx.stroke(); ctx.setLineDash([]);
      var z = erfinv((cS - cst) / (cS - c0)), x1 = 2 * z * Math.sqrt(D * t) * 1e3; if (x1 < xmax) { ctx.beginPath(); ctx.moveTo(F.X(x1), F.Y(cst)); ctx.lineTo(F.X(x1), p.y1); ctx.stroke(); dot(ctx, F.X(x1), F.Y(cst), 5, C.blue); }
      text(ctx, "t", F.X(0) + 8, F.Y(0.2) - 6, C.accent, 12); text(ctx, "faint curves: t/4, t/2", p.x1 - 8, p.y0 + 16, C.muted, 11, "right");
      setRead(api, ["diffusion length 2&radic;(Dt) = <b>" + fmtN(2 * Math.sqrt(D * t) * 1e3, 2) + " mm</b>", "depth where c = " + cst.toFixed(2) + " wt%: <b>" + fmtN(x1, 2) + " mm</b>", "time to double that depth: <b>" + fmtN(ts.get() * 4, 0) + " h</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M9: explicit and implicit finite differences ================= */
  function ftcs(host) {
    var api = shell(host, "Explicit versus implicit finite differences for the diffusion equation",
      "c<sub>j</sub><sup>n+1</sup> = c<sub>j</sub><sup>n</sup> + r(c<sub>j+1</sub> &minus; 2c<sub>j</sub> + c<sub>j&minus;1</sub>), r = DΔt/Δx². The explicit scheme is stable only for r ≤ 1/2: above that the shortest-wavelength (zig-zag) mode grows at every step and wrecks the solution. The implicit scheme solves a tridiagonal system each step and is stable for any r. Edges are held at zero.");
    var N = 61, c = new Float64Array(N), cv = api.addCanvas(640, 290), n = 0, bad = false, ic = 0;
    var meth = select(api, "Scheme", ["explicit (FTCS)", "implicit (backward Euler)"], 0, function () { reset(); });
    var init = select(api, "Initial profile", ["top hat", "narrow spike"], 0, function (v) { ic = v; reset(); });
    var rs = slider(api, "r = DΔt/Δx²", 0.05, 0.9, 0.01, 0.4, function (v) { return v.toFixed(2); }, function () { reset(); });
    var an = animator(host, function () { for (var s = 0; s < 3; s++) step(); draw(); });
    var btn = button(api, reduceMotion() ? "Run" : "Pause", true, function () { btn.textContent = an.toggle() ? "Pause" : "Run"; });
    button(api, "Reset", false, function () { reset(); });
    if (!reduceMotion()) an.start();
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function reset() { n = 0; bad = false; for (var i = 0; i < N; i++) { var x = i / (N - 1); c[i] = ic === 0 ? (x > 0.3 && x < 0.7 ? 1 : 0) : (i === (N - 1) / 2 ? 1 : 0); } c[0] = c[N - 1] = 0; draw(); }
    function step() {
      if (bad) return; var r = rs.get(), i, nc = new Float64Array(N);
      if (meth.get() === 0) { for (i = 1; i < N - 1; i++) nc[i] = c[i] + r * (c[i + 1] - 2 * c[i] + c[i - 1]); }
      else { var cp = new Float64Array(N), dp = new Float64Array(N), a = -r, b = 1 + 2 * r; cp[1] = a / b; dp[1] = c[1] / b; for (i = 2; i < N - 1; i++) { var den = b - a * cp[i - 1]; cp[i] = a / den; dp[i] = (c[i] - a * dp[i - 1]) / den; } nc[N - 2] = dp[N - 2]; for (i = N - 3; i >= 1; i--) nc[i] = dp[i] - cp[i] * nc[i + 1]; }
      for (i = 0; i < N; i++) { c[i] = nc[i]; if (!isFinite(c[i]) || Math.abs(c[i]) > 1e6) bad = true; } n++;
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, mx = 0, mn = 0, tot = 0, i;
      for (i = 0; i < N; i++) { if (c[i] > mx) mx = c[i]; if (c[i] < mn) mn = c[i]; tot += c[i]; }
      ctx.clearRect(0, 0, W, H);
      var top = Math.max(1.2, Math.min(mx * 1.1, 5)), bot = Math.min(-0.2, Math.max(mn * 1.1, -5));
      var p = { x0: 46, y0: 12, x1: W - 14, y1: H - 42 }, F = frame(ctx, C, p, [0, 1], [bot, top], { xlabel: "position", ylabel: "concentration", nx: 5, ny: 4 });
      clipRect(ctx, p); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath(); for (i = 0; i < N; i++) { var X = F.X(i / (N - 1)), Y = F.Y(c[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke();
      for (i = 0; i < N; i++) dot(ctx, F.X(i / (N - 1)), F.Y(c[i]), 2.4, C.accent); ctx.restore();
      var r = rs.get(), stable = meth.get() === 1 || r <= 0.5;
      setRead(api, ["step <b>" + n + "</b>", "max |c| = <b>" + (bad ? "overflow" : fmtN(Math.max(mx, -mn), 3)) + "</b>", "stability limit r ≤ 0.5: <b>" + (meth.get() === 1 ? "not needed (implicit)" : (stable ? "satisfied" : "violated, the solution will blow up")) + "</b>"]);
    }
    redraws.push(draw); reset();
  }

  /* ================= M9: spinodal decomposition (Cahn-Hilliard in one dimension) ================= */
  function spinodal(host) {
    var api = shell(host, "Spinodal decomposition: the Cahn–Hilliard equation in 1D",
      "c<sub>t</sub> = ∂<sub>x</sub>²(c³ − c) − κ∂<sub>x</sub>⁴c, started from the mean composition c₀ plus tiny noise (a semi-implicit spectral solver). Linear stability says modes with wavenumber k grow at σ(k) = −k²(f″ + κk²) with f″ = 3c₀² − 1: only inside the spinodal (|c₀| &lt; 0.577) does the mean composition decompose, and the pattern wavelength is close to 2π√(2κ/|f″|). Time runs downwards in the upper picture.");
    var N = 128, ROWS = 150, re = new Float64Array(N), im = new Float64Array(N), c = new Float64Array(N), t = 0, rnd = rng(7), stepN = 0, early = null;
    var cv = api.addCanvas(640, 330), off = doc.createElement("canvas"); off.width = N; off.height = ROWS; var octx = off.getContext("2d"), img = octx.createImageData(N, 1);
    var c0s = slider(api, "mean composition c₀", -0.9, 0.9, 0.01, 0, function (v) { return v.toFixed(2); }, function () { reset(); });
    var ks = slider(api, "gradient coefficient κ", 0.3, 4, 0.05, 1, function (v) { return v.toFixed(2); }, function () { reset(); });
    var an = animator(host, function () { for (var s = 0; s < 6; s++) step(); pushRow(); draw(); });
    var btn = button(api, reduceMotion() ? "Run" : "Pause", true, function () { btn.textContent = an.toggle() ? "Pause" : "Run"; });
    button(api, "Restart", false, function () { reset(); });
    if (!reduceMotion()) an.start();
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var kk = new Float64Array(N); for (var q = 0; q < N; q++) kk[q] = TAU * (q <= N / 2 ? q : q - N) / N;   /* dx = 1 */
    function reset() { rnd = rng(7); t = 0; stepN = 0; early = null; var c0 = c0s.get(); for (var i = 0; i < N; i++) c[i] = c0 + 0.02 * (rnd() - 0.5) * 2; octx.clearRect(0, 0, N, ROWS); rowCount = 0; pushRow(); draw(); }
    var rowCount = 0;
    function step() {
      var dt = 0.2, A = 2, kap = ks.get(), i, g = new Float64Array(N), gi = new Float64Array(N);
      for (i = 0; i < N; i++) { re[i] = c[i]; im[i] = 0; g[i] = c[i] * c[i] * c[i] - c[i]; }
      fft(re, im, false); var gr = new Float64Array(g), gim = new Float64Array(N); fft(gr, gim, false);
      for (i = 0; i < N; i++) { var k2 = kk[i] * kk[i], den = 1 + dt * kap * k2 * k2 + dt * A * k2; re[i] = (re[i] * (1 + dt * A * k2) - dt * k2 * gr[i]) / den; im[i] = (im[i] * (1 + dt * A * k2) - dt * k2 * gim[i]) / den; }
      fft(re, im, true); for (i = 0; i < N; i++) c[i] = re[i]; t += dt; stepN++;
      if (early === null) { var dev = 0, c0m = c0s.get(); for (i = 0; i < N; i++) dev = Math.max(dev, Math.abs(c[i] - c0m)); if (dev > 0.2) { var r2 = new Float64Array(c), i2 = new Float64Array(N), bst = 0, bk = 1; fft(r2, i2, false); for (i = 1; i < N / 2; i++) { var pw2 = r2[i] * r2[i] + i2[i] * i2[i]; if (pw2 > bst) { bst = pw2; bk = i; } } early = N / bk; } }
    }
    function colour(v, C) { var tt = clamp((v + 1.2) / 2.4, 0, 1), a = parseColour(C.blue), b = parseColour(C.accent), m = parseColour(C.surface); return tt < .5 ? mix(a, m, tt * 2) : mix(m, b, (tt - .5) * 2); }
    function pushRow() {
      var C = colours(), i, col;
      if (rowCount >= ROWS) { octx.drawImage(off, 0, 1, N, ROWS - 1, 0, 0, N, ROWS - 1); rowCount = ROWS - 1; }
      for (i = 0; i < N; i++) { col = colour(c[i], C); img.data[4 * i] = col[0]; img.data[4 * i + 1] = col[1]; img.data[4 * i + 2] = col[2]; img.data[4 * i + 3] = 255; }
      octx.putImageData(img, 0, rowCount); rowCount++;
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, i, c0 = c0s.get(), kap = ks.get(), fpp = 3 * c0 * c0 - 1;
      ctx.clearRect(0, 0, W, H);
      var p = { x0: 46, y0: 10, x1: W - 14, y1: 168 };
      ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, N, ROWS, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); ctx.strokeStyle = C.border; ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
      text(ctx, "time", 8, 92, C.muted, 11); text(ctx, "↓", 22, 108, C.muted, 14);
      var p2 = { x0: 46, y0: 196, x1: W - 14, y1: H - 36 }, F = frame(ctx, C, p2, [0, N], [-1.3, 1.3], { xlabel: "position x", ylabel: "c(x)", nx: 8, ny: 4 });
      clipRect(ctx, p2); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath(); for (i = 0; i < N; i++) { var X = F.X(i + 0.5), Y = F.Y(c[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore();
      var rr = new Float64Array(c), ii = new Float64Array(N); fft(rr, ii, false); var best = 0, bi = 1; for (i = 1; i < N / 2; i++) { var pw = rr[i] * rr[i] + ii[i] * ii[i]; if (pw > best) { best = pw; bi = i; } }
      var info = fpp < 0 ? "unstable: predicted wavelength <b>" + fmtN(TAU * Math.sqrt(2 * kap / -fpp), 1) + "</b>, observed <b>" + (stepN > 20 ? fmtN(N / bi, 1) : "…") + "</b>" : "stable (f″ > 0): composition stays uniform";
      setRead(api, ["f″(c₀) = <b>" + fmtN(fpp, 2) + "</b>", info, "time <b>" + fmtN(t, 0) + "</b>"]);
    }
    redraws.push(function () { draw(); }); reset();
  }

  /* ================= M10: the central limit theorem ================= */
  function clt(host) {
    var api = shell(host, "The central limit theorem: averages of N samples",
      "Each histogram shows the average of N independent samples, repeated 4000 times. As N grows the distribution of the average becomes Gaussian (curve) with width σ/√N whatever the shape of the original distribution, so the error bar of a mean shrinks like 1/√N. The Cauchy distribution has no finite variance: averaging does not narrow it at all.");
    var dists = [
      { n: "uniform (0, 1)", mu: 0.5, sd: Math.sqrt(1 / 12), draw: function (r) { return r(); }, lo: 0, hi: 1 },
      { n: "exponential (waiting times)", mu: 1, sd: 1, draw: function (r) { return -Math.log(1 - r()); }, lo: 0, hi: 4 },
      { n: "Bernoulli, p = 0.1", mu: 0.1, sd: 0.3, draw: function (r) { return r() < 0.1 ? 1 : 0; }, lo: -0.05, hi: 1.05 },
      { n: "two-valued ±1 plus noise", mu: 0, sd: Math.sqrt(1.01), draw: function (r) { return (r() < 0.5 ? -1 : 1) + 0.1 * gauss(r); }, lo: -2.5, hi: 2.5 },
      { n: "Cauchy (no finite variance)", mu: 0, sd: NaN, draw: function (r) { return Math.tan(PI * (r() - 0.5)); }, lo: -6, hi: 6 }
    ];
    var cv = api.addCanvas(640, 300), di = 1, M = 4000, seed = 1, bins = 56;
    var sel = select(api, "Distribution of one sample", dists.map(function (d) { return d.n; }), 1, function (v) { di = v; draw(); });
    var ns = slider(api, "samples averaged, N", 1, 200, 1, 1, function (v) { return String(v); }, draw);
    button(api, "Draw new samples", false, function () { seed++; draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, d = dists[di], N = ns.get(), r = rng(seed * 977 + di * 31 + N), means = new Float64Array(M), i, j;
      for (i = 0; i < M; i++) { var s = 0; for (j = 0; j < N; j++) s += d.draw(r); means[i] = s / N; }
      var lo, hi; if (isNaN(d.sd)) { lo = d.lo; hi = d.hi; } else { var w = d.sd / Math.sqrt(N); lo = d.mu - 4 * Math.max(w, 0.05 * d.sd); hi = d.mu + 4 * Math.max(w, 0.05 * d.sd); if (N === 1) { lo = d.lo; hi = d.hi; } }
      var h = new Float64Array(bins), mean = 0, m2 = 0; for (i = 0; i < M; i++) { var b = Math.floor((means[i] - lo) / (hi - lo) * bins); if (b >= 0 && b < bins) h[b]++; mean += means[i]; } mean /= M; for (i = 0; i < M; i++) m2 += (means[i] - mean) * (means[i] - mean); var sdm = Math.sqrt(m2 / (M - 1));
      var bw = (hi - lo) / bins, dens = Array.prototype.map.call(h, function (v) { return v / (M * bw); }), top = 0; dens.forEach(function (v) { if (v > top) top = v; });
      var gs = isNaN(d.sd) ? 0 : d.sd / Math.sqrt(N), gtop = gs > 0 ? 1 / (gs * Math.sqrt(TAU)) : 0, ymax = Math.max(top, gtop) * 1.1 || 1;
      ctx.clearRect(0, 0, W, H);
      var p = { x0: 50, y0: 12, x1: W - 14, y1: H - 42 }, F = frame(ctx, C, p, [lo, hi], [0, ymax], { xlabel: "average of N samples", ylabel: "probability density", nx: 6, ny: 4 });
      clipRect(ctx, p); ctx.fillStyle = C.blue; ctx.globalAlpha = .55; for (i = 0; i < bins; i++) { var x0 = F.X(lo + i * bw), x1 = F.X(lo + (i + 1) * bw), y = F.Y(dens[i]); ctx.fillRect(x0 + 0.5, y, x1 - x0 - 1, p.y1 - y); } ctx.globalAlpha = 1;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; if (isNaN(d.sd)) { curve(ctx, function (x) { return 1 / (PI * (1 + x * x)); }, lo, hi, 300, F.X, F.Y); } else if (N > 0) { curve(ctx, function (x) { return Math.exp(-0.5 * (x - d.mu) * (x - d.mu) / (gs * gs)) / (gs * Math.sqrt(TAU)); }, lo, hi, 300, F.X, F.Y); }
      ctx.restore();
      text(ctx, isNaN(d.sd) ? "curve: the Cauchy density of a single sample" : "curve: Gaussian, mean μ, width σ/√N", p.x1 - 8, p.y0 + 16, C.accent, 12, "right");
      setRead(api, isNaN(d.sd) ? ["spread of the averages (std. dev.): <b>" + fmtN(sdm, 1) + "</b> (dominated by rare huge values, does not shrink with N)", "typical size (interquartile) stays near <b>1</b>"] : ["mean of the averages = <b>" + fmtN(mean, 3) + "</b> (μ = " + fmtN(d.mu, 3) + ")", "std. dev. of the averages = <b>" + fmtN(sdm, 3) + "</b>", "predicted σ/√N = <b>" + fmtN(gs, 3) + "</b>"]);
    }
    redraws.push(draw); draw();
  }

  /* ================= M11: overfitting and ridge regression ================= */
  function polyfit(host) {
    var api = shell(host, "Overfitting: polynomial degree, noise and regularisation",
      "Ten noisy points (blue) from the curve sin(2πx) (dashed). Raise the degree and the fit passes closer to the points (training error falls) but swings wildly between them; the leave-one-out error, which predicts new data, falls then rises. Adding ridge regularisation λ tames the wiggles of a high-degree fit. &ldquo;True error&rdquo; is measured against the dashed curve.");
    var n = 10, xs = [], ys0 = [], seed = 3, cv = api.addCanvas(640, 310);
    var deg = slider(api, "polynomial degree", 0, 9, 1, 3, function (v) { return String(v); }, draw);
    var noise = slider(api, "noise level σ", 0, 0.5, 0.01, 0.2, function (v) { return v.toFixed(2); }, function () { gen(); draw(); });
    var lam = slider(api, "log₁₀ λ (ridge)", -8, 1, 0.1, -8, function (v) { return v <= -8 ? "none" : "λ = 10" + sup(v.toFixed(1).replace(".0", "")); }, draw);
    button(api, "New noise", false, function () { seed++; gen(); draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var z = []; for (var i = 0; i < n; i++) { xs.push(i / (n - 1)); z.push(2 * i / (n - 1) - 1); }
    var eps = [];
    function gen() { var r = rng(seed * 101); eps = []; for (var i = 0; i < n; i++) eps.push(gauss(r)); }
    function truth(x) { return Math.sin(TAU * x); }
    function fit(d, L) {
      var p = d + 1, X = [], i, j, k; for (i = 0; i < n; i++) { var row = []; for (j = 0; j < p; j++) row.push(Math.pow(z[i], j)); X.push(row); }
      var M = [], b = [], y = []; for (i = 0; i < n; i++) y.push(truth(xs[i]) + noise.get() * eps[i]);
      for (j = 0; j < p; j++) { M.push([]); for (k = 0; k < p; k++) { var s = 0; for (i = 0; i < n; i++) s += X[i][j] * X[i][k]; M[j].push(s + (j === k && j > 0 ? L : 0)); } var sb = 0; for (i = 0; i < n; i++) sb += X[i][j] * y[i]; b.push(sb); }
      var A = M.map(function (r) { return r.slice(); }), beta = solve(A, b.slice());
      /* leave-one-out via the hat matrix */
      var Minv = []; for (j = 0; j < p; j++) { var e = new Array(p).fill(0); e[j] = 1; Minv.push(solve(M.map(function (r) { return r.slice(); }), e)); }
      var loo = 0, tr = 0, big = false; for (i = 0; i < n; i++) { var pr = 0; for (j = 0; j < p; j++) pr += beta[j] * X[i][j]; var res = y[i] - pr, h = 0; for (j = 0; j < p; j++) for (k = 0; k < p; k++) h += X[i][j] * Minv[k][j] * X[i][k]; tr += res * res; var den = 1 - h; if (den < 1e-6) { big = true; den = 1e-6; } loo += Math.pow(res / den, 2); }
      return { beta: beta, y: y, train: Math.sqrt(tr / n), loo: Math.sqrt(loo / n), big: big };
    }
    function pred(beta, x) { var zz = 2 * x - 1, s = 0, zp = 1; for (var j = 0; j < beta.length; j++) { s += beta[j] * zp; zp *= zz; } return s; }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, d = deg.get(), L = lam.get() <= -8 ? 1e-12 : Math.pow(10, lam.get());
      var f = fit(d, L);
      ctx.clearRect(0, 0, W, H);
      var p = { x0: 46, y0: 12, x1: W - 14, y1: H - 42 }, F = frame(ctx, C, p, [0, 1], [-2, 2], { xlabel: "x", ylabel: "y", nx: 5, ny: 4 });
      clipRect(ctx, p); ctx.strokeStyle = C.muted; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.8; curve(ctx, truth, 0, 1, 200, F.X, F.Y); ctx.setLineDash([]);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.6; curve(ctx, function (x) { return pred(f.beta, x); }, 0, 1, 300, F.X, F.Y, 1e6); ctx.restore();
      for (var i = 0; i < n; i++) dot(ctx, F.X(xs[i]), F.Y(f.y[i]), 4.5, C.blue);
      var te = 0, m = 200; for (i = 0; i <= m; i++) { var x = i / m, e = pred(f.beta, x) - truth(x); te += e * e; } te = Math.sqrt(te / (m + 1));
      setRead(api, ["parameters: <b>" + (d + 1) + "</b> for 10 points", "training RMS error <b>" + fmtN(f.train, 3) + "</b>", "leave-one-out RMS error <b>" + (f.loo > 50 ? ">50" : fmtN(f.loo, 3)) + "</b>" + (f.big ? " (fit interpolates the data)" : ""), "true RMS error vs sin(2πx): <b>" + (te > 50 ? ">50" : fmtN(te, 3)) + "</b>"]);
    }
    gen(); redraws.push(draw); draw();
  }

  /* ================= M11: blocking analysis of correlated data ================= */
  function blocking(host) {
    var api = shell(host, "Correlated simulation data and the blocking analysis",
      "A time series with correlation ρ between successive samples (like an energy trace from molecular dynamics). The naive error bar σ/√N assumes independent samples and is too small. Averaging in blocks of increasing length b, the standard error of the block means rises and levels off at the true value once the blocks are longer than the correlation time; its plateau matches σ√(2τ<sub>int</sub>/N).");
    var Nn = 32768, cv = api.addCanvas(640, 330), series = new Float64Array(Nn), seed = 5;
    var rs = slider(api, "correlation between successive samples ρ", 0, 0.99, 0.01, 0.9, function (v) { return v.toFixed(2); }, function () { gen(); draw(); });
    button(api, "New random series", false, function () { seed++; gen(); draw(); });
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function gen() { var r = rng(seed * 4099), rho = rs.get(), s = Math.sqrt(1 - rho * rho), x = gauss(r); for (var i = 0; i < Nn; i++) { x = rho * x + s * gauss(r); series[i] = x; } }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, rho = rs.get(), i, mean = 0, v = 0;
      for (i = 0; i < Nn; i++) mean += series[i]; mean /= Nn; for (i = 0; i < Nn; i++) v += (series[i] - mean) * (series[i] - mean); var sd = Math.sqrt(v / (Nn - 1));
      var tau = (1 + rho) / (2 * (1 - rho)), naive = sd / Math.sqrt(Nn), truth = sd * Math.sqrt(2 * tau / Nn), pts = [];
      for (var k = 0; k <= 11; k++) { var b = Math.pow(2, k), nb = Math.floor(Nn / b), bm = [], j, m = 0; for (j = 0; j < nb; j++) { var s = 0; for (i = j * b; i < (j + 1) * b; i++) s += series[i]; bm.push(s / b); m += s / b; } m /= nb; var q = 0; bm.forEach(function (u) { q += (u - m) * (u - m); }); pts.push([k, Math.sqrt(q / (nb - 1) / nb)]); }
      ctx.clearRect(0, 0, W, H);
      var p1 = { x0: 46, y0: 10, x1: W - 14, y1: 108 }, F1 = frame(ctx, C, p1, [0, 400], [-4, 4], { ylabel: "x", nx: 8, ny: 4, xlabel: "sample number (first 400 shown)" });
      clipRect(ctx, p1); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.4; ctx.beginPath(); for (i = 0; i < 400; i++) { var X = F1.X(i), Y = F1.Y(series[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore();
      var top = Math.max(truth, pts[pts.length - 1][1], naive) * 1.35, p2 = { x0: 56, y0: 160, x1: W - 14, y1: H - 42 }, F2 = frame(ctx, C, p2, [0, 11], [0, top], { xlabel: "block length b = 2^k  (k shown)", ylabel: "standard error of the mean", nx: 11, ny: 4, ylx: 12, xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] });
      ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p2.x0, F2.Y(naive)); ctx.lineTo(p2.x1, F2.Y(naive)); ctx.stroke(); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(p2.x0, F2.Y(truth)); ctx.lineTo(p2.x1, F2.Y(truth)); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "naive σ/√N", p2.x1 - 6, F2.Y(naive) + 14, C.muted, 11, "right"); text(ctx, "true (from τ_int)", p2.x1 - 6, F2.Y(truth) - 5, C.ink, 11, "right");
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(function (q, idx) { var X = F2.X(q[0]), Y = F2.Y(q[1]); if (idx) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); pts.forEach(function (q) { dot(ctx, F2.X(q[0]), F2.Y(q[1]), 4, C.accent); });
      var plateau = pts[8][1];
      setRead(api, ["τ<sub>int</sub> = <b>" + fmtN(tau, 1) + "</b> samples; N<sub>eff</sub> = N/(2τ<sub>int</sub>) = <b>" + fmtN(Nn / (2 * tau), 0) + "</b>", "naive error <b>" + naive.toFixed(4) + "</b>", "blocked error (b = 256) <b>" + plateau.toFixed(4) + "</b>", "true error <b>" + truth.toFixed(4) + "</b> (" + fmtN(truth / naive, 1) + "× naive)"]);
    }
    gen(); redraws.push(draw); draw();
  }

  /* ================= M12: gradient descent, conjugate gradients, Newton ================= */
  function descent(host) {
    var api = shell(host, "Optimising a stretched quadratic: gradient descent, conjugate gradients and Newton",
      "f(x, y) = ½(x² + κy²) has Hessian eigenvalues 1 and κ, so κ is the condition number. Gradient descent zigzags across the narrow valley and slows down as κ grows (rate (κ−1)/(κ+1) with the best step); too large a step (αλ<sub>max</sub> &gt; 2) diverges. Conjugate gradients finish a 2-variable quadratic in 2 steps, and Newton's method in 1. Click the picture to move the starting point.");
    var cv = api.addCanvas(640, 320), start = [4, 1], meth = 0;
    var ms = select(api, "Method", ["gradient descent, chosen step", "gradient descent, best step", "conjugate gradients", "Newton"], 1, function (v) { meth = v; draw(); });
    meth = 1;
    var ks = slider(api, "condition number κ", 1, 100, 1, 10, function (v) { return String(v); }, function () { start = [4, 4 / Math.sqrt(ks.get())]; draw(); });
    var as = slider(api, "step α·λₘₐₓ (for the chosen-step method)", 0.1, 2.2, 0.01, 1, function (v) { return v.toFixed(2); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    var P, xr = [-5, 5], yr;
    pointer(cv, function (x, y) { var X = xr[0] + (x - P.x0) / (P.x1 - P.x0) * 10, Y = yr[0] + (P.y1 - y) / (P.y1 - P.y0) * (yr[1] - yr[0]); start = [clamp(X, -4.8, 4.8), clamp(Y, yr[0] * 0.95, yr[1] * 0.95)]; draw(); });
    function run(k, st) {
      var x = st[0], y = st[1], path = [[x, y]], f0 = 0.5 * (x * x + k * y * y), lmax = Math.max(1, k), alpha, it, conv = false;
      if (meth === 3) { path.push([0, 0]); return { path: path, it: 1, conv: true, rate: 0 }; }
      if (meth === 2) {
        var gx = x, gy = k * y, dx = -gx, dy = -gy;
        for (it = 0; it < 4; it++) { var Hd = [dx, k * dy], num = gx * gx + gy * gy, den = dx * Hd[0] + dy * Hd[1]; if (den < 1e-300) break; var a = num / den; x += a * dx; y += a * dy; path.push([x, y]); var ngx = x, ngy = k * y, nn = ngx * ngx + ngy * ngy; if (nn < 1e-24) { conv = true; break; } var beta = nn / num; dx = -ngx + beta * dx; dy = -ngy + beta * dy; gx = ngx; gy = ngy; }
        return { path: path, it: path.length - 1, conv: true, rate: (Math.sqrt(k) - 1) / (Math.sqrt(k) + 1) };
      }
      alpha = meth === 1 ? 2 / (1 + k) : as.get() / lmax;
      for (it = 0; it < 4000; it++) { x -= alpha * x; y -= alpha * k * y; if (path.length < 300) path.push([x, y]); var fv = 0.5 * (x * x + k * y * y); if (!isFinite(fv) || fv > 1e12 * f0) break; if (fv < 1e-8 * f0) { conv = true; break; } }
      return { path: path, it: it + 1, conv: conv, rate: Math.max(Math.abs(1 - alpha), Math.abs(1 - alpha * k)) };
    }
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, k = ks.get(); yr = [-5 / Math.sqrt(k) * 1.0, 5 / Math.sqrt(k) * 1.0]; if (k < 2) yr = [-2.5, 2.5];
      P = { x0: 54, y0: 12, x1: W - 14, y1: H - 40 };
      ctx.clearRect(0, 0, W, H);
      fieldMap(ctx, C, P, xr, yr, function (x, y) { return 0.5 * (x * x + k * y * y); }, null, 100, 60);
      var F = frame(ctx, C, P, xr, yr, { xlabel: "x", ylabel: "y", grid: false, zero: false, nx: 6, ny: 4 });
      var r = run(k, start);
      clipRect(ctx, P); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); r.path.forEach(function (q, i) { var X = F.X(q[0]), Y = F.Y(q[1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke();
      if (r.path.length < 60) r.path.forEach(function (q) { dot(ctx, F.X(q[0]), F.Y(q[1]), 2.6, C.accent); }); ctx.restore();
      dot(ctx, F.X(start[0]), F.Y(start[1]), 5.5, C.blue); dot(ctx, F.X(0), F.Y(0), 4, C.ink);
      var rate = r.rate; var theory = (k - 1) / (k + 1);
      setRead(api, ["κ = <b>" + k + "</b>", r.conv ? "iterations to reduce f by 10⁸: <b>" + r.it + "</b>" : "<b>does not converge</b> (step too large)", meth <= 1 ? "convergence factor per step <b>" + fmtN(rate, 3) + "</b> (best possible " + fmtN(theory, 3) + ")" : meth === 2 ? "bound factor (√κ−1)/(√κ+1) = <b>" + fmtN(rate, 3) + "</b>, but a 2-variable quadratic needs only 2 steps" : "one step: Newton uses the full Hessian"]);
    }
    redraws.push(draw); start = [4, 4 / Math.sqrt(10)]; draw();
  }

  /* ================= M12: a diffuse interface ================= */
  function interfaceDemo(host) {
    var api = shell(host, "The equilibrium diffuse interface: c = tanh(x/w)",
      "Minimising F = ∫[f(c) + ½κ c′²]dx with the double well f = (A/4)(1 − c²)² gives c(x) = tanh(x/w) with w = √(2κ/A). The two energy contributions are equal at every point, and the interface energy is γ = (2/3)Aw. A thin interface needs a fine grid: the dots are grid points.");
    var cv = api.addCanvas(640, 310);
    var ks = slider(api, "gradient coefficient κ (10⁻¹⁰ J/m)", 0.2, 10, 0.1, 1, function (v) { return v.toFixed(1); }, draw);
    var as = slider(api, "double-well height A (10⁸ J/m³)", 0.5, 10, 0.1, 2, function (v) { return v.toFixed(1); }, draw);
    var dx = slider(api, "grid spacing Δx (nm)", 0.25, 3, 0.05, 1, function (v) { return v.toFixed(2); }, draw);
    api.controls.parentNode.insertBefore(api.controls, cv.c);
    api.finish();
    function draw() {
      var C = colours(), ctx = cv.ctx, W = cv.w, H = cv.h, kap = ks.get() * 1e-10, A = as.get() * 1e8, w = Math.sqrt(2 * kap / A) * 1e9, gam = 2 / 3 * A * w * 1e-9, h = dx.get();
      ctx.clearRect(0, 0, W, H);
      var L = 6, p1 = { x0: 52, y0: 10, x1: W - 14, y1: 150 }, F1 = frame(ctx, C, p1, [-L, L], [-1.2, 1.2], { ylabel: "c(x)", nx: 6, ny: 4, xlabel: "" });
      clipRect(ctx, p1); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.6; curve(ctx, function (x) { return Math.tanh(x / w); }, -L, L, 300, F1.X, F1.Y); ctx.restore();
      for (var x = -Math.floor(L / h) * h; x <= L + 1e-9; x += h) dot(ctx, F1.X(x), F1.Y(Math.tanh(x / w)), 3, C.blue);
      var p2 = { x0: 52, y0: 178, x1: W - 14, y1: H - 38 }, e0 = A / 4, F2 = frame(ctx, C, p2, [-L, L], [0, e0 * 1.05 * 1e-8], { xlabel: "position x (nm)", ylabel: "energy density (10⁸ J/m³)", nx: 6, ny: 3, yticks: ticks(0, e0 * 1.05 * 1e-8, 3), ylx: 14 });
      clipRect(ctx, p2);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; curve(ctx, function (x) { var c = Math.tanh(x / w); return A / 4 * Math.pow(1 - c * c, 2) * 1e-8; }, -L, L, 300, F2.X, F2.Y);
      ctx.strokeStyle = C.blue; ctx.setLineDash([5, 3]); ctx.lineWidth = 2; curve(ctx, function (x) { var c = Math.tanh(x / w), cp = (1 - c * c) / (w * 1e-9); return 0.5 * kap * cp * cp * 1e-8; }, -L, L, 300, F2.X, F2.Y); ctx.setLineDash([]); ctx.restore();
      text(ctx, "— bulk f(c)", p2.x1 - 130, p2.y0 + 14, C.accent, 12); text(ctx, "- - gradient ½κc′² (equal everywhere)", p2.x1 - 215, p2.y0 + 30, C.blue, 12);
      var pts = 2.2 * w / h;
      setRead(api, ["width w = √(2κ/A) = <b>" + fmtN(w, 2) + " nm</b>", "interface energy γ = (2/3)Aw = <b>" + fmtN(gam, 3) + " J/m²</b>", "grid points across the interface (10–90%): <b>" + fmtN(pts, 1) + "</b> " + (pts < 4 ? "(too coarse: the interface is under-resolved)" : "(adequate)")]);
    }
    redraws.push(draw); draw();
  }

  /* ---------- registration ---------- */
  var ADD = { taylor: taylor, newton: newton, fderr: fderr, contour: contour, vecfield: vecfield, lattice2d: lattice2d, ellipse: ellipse, modes: modes, mohr: mohr, cubicE: cubicE, phaseplane: phaseplane, integrators: integrators, aliasing: aliasing, erfprofile: erfProfile, ftcs: ftcs, spinodal: spinodal, clt: clt, polyfit: polyfit, blocking: blocking, descent: descent, interfacedemo: interfaceDemo };
  for (var k in ADD) if (ADD.hasOwnProperty(k)) REG[k] = ADD[k];
})();
