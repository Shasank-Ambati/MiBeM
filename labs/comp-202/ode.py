"""Ordinary differential equations: order of Euler/RK2/RK4, stability, stiffness, adaptive solvers."""
import numpy as np, time
from scipy.integrate import solve_ivp

def euler(f, y, t, h): return y + h * f(t, y)
def rk2(f, y, t, h):                      # midpoint method
    k1 = f(t, y); return y + h * f(t + h / 2, y + h / 2 * k1)
def rk4(f, y, t, h):
    k1 = f(t, y); k2 = f(t + h / 2, y + h / 2 * k1); k3 = f(t + h / 2, y + h / 2 * k2); k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
def integrate(step, f, y0, T, n):
    y = np.array(y0, float); h = T / n; t = 0.0
    for _ in range(n): y = step(f, y, t, h); t += h
    return y

print("1. order of convergence: y' = -2y + sin t, y(0) = 1, error at t = 5 against the exact solution")
f = lambda t, y: -2 * y + np.sin(t)
exact = lambda t: (1 + 1 / 5) * np.exp(-2 * t) + (2 * np.sin(t) - np.cos(t)) / 5
print("      h       Euler err    ratio    RK2 err      ratio    RK4 err       ratio")
prev = [None] * 3
for n in (10, 20, 40, 80, 160):
    h = 5 / n; row = f"   {h:6.4f}"
    for i, st in enumerate((euler, rk2, rk4)):
        e = abs(integrate(st, f, [1.0], 5.0, n)[0] - exact(5.0))
        row += f"  {e:10.3e}" + (f"  {prev[i] / e:6.2f}" if prev[i] else "        ")
        prev[i] = e
    print(row)
print("   (ratio of successive errors = 2^p: 2 for Euler, 4 for RK2, 16 for RK4)")

print("\n2. long-time energy of the harmonic oscillator x'' = -x (E = 1/2 at t = 0), h = 0.1, T = 1000")
def osc(t, y): return np.array([y[1], -y[0]])
y = np.array([1.0, 0.0]); h = 0.1; E = []
for k in range(10000):
    y = rk4(osc, y, k * h, h)
    if (k + 1) % 2000 == 0: E.append(0.5 * (y[0]**2 + y[1]**2))
print("   RK4          E at t = 200, 400, ..., 1000:", " ".join(f"{e:.6f}" for e in E))
x, v = 1.0, 0.0; E = []
for k in range(10000):
    v -= 0.5 * h * x; x += h * v; v -= 0.5 * h * x
    if (k + 1) % 2000 == 0: E.append(0.5 * (v * v + x * x))
print("   velocity Verlet E at the same times:", " ".join(f"{e:.6f}" for e in E))
print("   RK4 loses energy steadily (artificial damping); Verlet oscillates around the exact value but does not drift")

print("\n3. stability: y' = -lambda y, lambda = 50, y(0) = 1, integrated to t = 1")
lam = 50
for h in (0.05, 0.04, 0.021, 0.019):
    n = int(round(1 / h)); yE = (1 - lam * h)**n; yI = (1 / (1 + lam * h))**n
    print(f"   h = {h:5.3f}  (lambda h = {lam*h:4.2f}):  explicit Euler y(1) = {yE: .3e}   implicit Euler y(1) = {yI:.3e}   exact {np.exp(-lam):.3e}")
print("   explicit Euler is stable only for lambda h < 2 (here h < 0.04); implicit Euler for every h")

print("\n4. stiffness: Robertson's chemical-kinetics problem, t from 0 to 1e5 (rate constants differ by 9 orders of magnitude; RK45 is only run to t = 1e3, where it already needs about two minutes)")
def rob(t, y):
    return [-0.04 * y[0] + 1e4 * y[1] * y[2], 0.04 * y[0] - 1e4 * y[1] * y[2] - 3e7 * y[1]**2, 3e7 * y[1]**2]
def rob_jac(t, y):
    return [[-0.04, 1e4 * y[2], 1e4 * y[1]], [0.04, -1e4 * y[2] - 6e7 * y[1], -1e4 * y[1]], [0, 6e7 * y[1], 0]]
print("   method    steps   f evals   Jacobians   time (s)    y(1e5) = (A, B, C)")
for meth, T in (("RK45", 1e2), ("Radau", 1e2), ("RK45", 1e3), ("Radau", 1e3), ("Radau", 1e5), ("BDF", 1e5), ("LSODA", 1e5)):
    t0 = time.perf_counter()
    kw = dict(jac=rob_jac) if meth in ("Radau", "BDF") else {}
    s = solve_ivp(rob, [0, T], [1, 0, 0], method=meth, rtol=1e-6, atol=1e-10, **kw)
    dt = time.perf_counter() - t0
    print(f"   {meth:6s} T={T:6.0e} {len(s.t):6d}   {s.nfev:8d}   {getattr(s, 'njev', 0):6d}   {dt:8.3f}    ({s.y[0,-1]:.5f}, {s.y[1,-1]:.3e}, {s.y[2,-1]:.5f})")

print("\n5. adaptive control: the same equation as part 1, RK45 with rtol = atol = tolerance, T = 5")
print("   tolerance    steps   f evals   max error against exact")
for tol in (1e-3, 1e-5, 1e-7, 1e-9, 1e-11):
    s = solve_ivp(f, [0, 5], [1.0], method="RK45", rtol=tol, atol=tol, dense_output=True)
    tt = np.linspace(0, 5, 501)
    print(f"   {tol:8.0e}   {len(s.t) - 1:6d}   {s.nfev:7d}   {np.max(np.abs(s.sol(tt)[0] - exact(tt))):.3e}")
