"""Root finding: bisection, Newton, secant, fixed point, Brent; and a materials example."""
import numpy as np
from scipy.optimize import brentq, newton

def bisect(f, a, b, tol=1e-12):
    fa = f(a); n = 0; hist = []
    while b - a > tol:
        m = 0.5 * (a + b); fm = f(m); n += 1
        if fa * fm <= 0: b = m
        else: a, fa = m, fm
        hist.append(m)
    return 0.5 * (a + b), n, hist

def newton_it(f, df, x, tol=1e-14, maxit=50):
    hist = [x]
    for _ in range(maxit):
        dx = f(x) / df(x); x -= dx; hist.append(x)
        if abs(dx) < tol: break
    return x, hist

def secant(f, x0, x1, tol=1e-14, maxit=50):
    hist = [x0, x1]
    for _ in range(maxit):
        f0, f1 = f(x0), f(x1)
        if f1 == f0: break
        x0, x1 = x1, x1 - f1 * (x1 - x0) / (f1 - f0); hist.append(x1)
        if abs(x1 - x0) < tol: break
    return x1, hist

f = lambda x: x**3 - 2 * x - 5          # Wallis's classic cubic
df = lambda x: 3 * x**2 - 2
root = brentq(f, 2, 3, xtol=1e-15)
print(f"f(x) = x^3 - 2x - 5, reference root (Brent) = {root:.15f}\n")

r, n, h = bisect(f, 2.0, 3.0)
print(f"bisection: {n} halvings of [2,3] to reach an interval of 1e-12 ; root {r:.12f}")
print("  error after k halvings:", "  ".join(f"{k}:{abs(h[k-1]-root):.1e}" for k in (1, 5, 10, 20, 30, 39)))

r, h = newton_it(f, df, 3.0)
print("\nNewton from x0 = 3:")
errs = [abs(x - root) for x in h]
for k, (x, e) in enumerate(zip(h, errs)):
    print(f"  k={k}  x={x:.15f}  error={e:.3e}")
print("  error_{k+1}/error_k^2 :", "  ".join(f"{errs[k+1]/errs[k]**2:.3f}" for k in range(3)),
      "  (theory f''/(2f') =", f"{(6*root)/(2*df(root)):.3f})")

r, h = secant(f, 2.0, 3.0)
errs = [abs(x - root) for x in h]
print("\nsecant from x0 = 2, x1 = 3:")
for k, (x, e) in enumerate(zip(h, errs)):
    print(f"  k={k}  x={x:.15f}  error={e:.3e}")
ee = errs[2:7]                     # the iterates after the start-up phase, before rounding takes over
p = [np.log(ee[k+1]/ee[k]) / np.log(ee[k]/ee[k-1]) for k in range(1, len(ee)-1)]
print("  estimated order p = ln(e_{k+1}/e_k)/ln(e_k/e_{k-1}):", " ".join(f"{q:.2f}" for q in p), " (theory 1.618)")

print("\nNewton can fail:")
g = lambda x: np.cbrt(x)
x = 1.0
print("  f = cbrt(x) from x0 = 1 :", end=" ")
for _ in range(6):
    x = x - g(x) / (1 / (3 * np.cbrt(x)**2)); print(f"{x:.1f}", end=" ")
print("(diverges: |x| doubles every step)")
h2 = lambda x: (x - 1)**2 * (x + 2)    # double root at 1
r, h = newton_it(h2, lambda x: 2*(x-1)*(x+2) + (x-1)**2, 3.0, tol=1e-15, maxit=60)
e = [abs(x - 1) for x in h]
print(f"  double root: error ratio e_(k+1)/e_k = {e[5]/e[4]:.3f}, {e[8]/e[7]:.3f} -> linear (1/2), not quadratic; {len(h)-1} iterations")
print("  Newton from x0 = 0 on x^3 - 2x - 5 :", end=" ")
r, h = newton_it(f, df, 0.0, maxit=12); print(" ".join(f"{x:.3g}" for x in h[:9]), "...")

print("\nMaterials example: the miscibility gap of a regular solution")
print("  chemical-potential difference  ln(x/(1-x)) + 2.5 (1 - 2x) = 0   (Omega/kT = 2.5)")
phi = lambda x, w=2.5: np.log(x / (1 - x)) + w * (1 - 2 * x)
xs = np.linspace(1e-6, 1 - 1e-6, 200001)
s = np.sign(phi(xs)); idx = np.where(s[:-1] != s[1:])[0]
roots = [brentq(phi, xs[i], xs[i+1], xtol=1e-14) for i in idx]
print("  roots of mu(x) = 0:", ", ".join(f"{r:.8f}" for r in roots))
print("  x = 0.5 is always a root (the symmetric state); the other two are the two phases in equilibrium (the binodal) because the model is symmetric")
# spinodal: d mu/dx = 0 -> 1/(x(1-x)) = 2 w -> x(1-x) = 1/(2w)
w = 2.5; xsp = 0.5 * (1 - np.sqrt(1 - 2 / w)); print(f"  spinodal points x(1-x) = 1/(2 Omega/kT): x = {xsp:.6f} and {1-xsp:.6f}")
print("  Tc: 1/(x(1-x)) = 2 w at x = 1/2 -> Omega/kT = 2 ; here Omega/kT = 2.5 so T/Tc =", 2/2.5)

print("\n  Newton's method on the same equation (derivative 1/(x(1-x)) - 2 Omega/kT) from different starts:")
dphi = lambda x, w=2.5: 1 / (x * (1 - x)) - 2 * w
for x0 in (0.05, 0.1, 0.2, 0.3, 0.4):
    x = x0; h = [x]
    for _ in range(7):
        x = x - phi(x) / dphi(x); h.append(x)
    print(f"   x0 = {x0:4.2f}  ->", " ".join(f"{v:.5f}" for v in h), f"   limit {h[-1]:.5f}")
