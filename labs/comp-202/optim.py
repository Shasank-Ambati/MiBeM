"""Optimisation: gradient descent, conjugate gradients, Newton, BFGS; and Lennard-Jones clusters."""
import numpy as np
from scipy.optimize import minimize

print("1. steepest descent on the quadratic f = (x^2 + k y^2)/2 : iterations to reach |x| < 1e-6 with an exact line search")
print("   condition number k   steepest descent   conjugate gradients   (exact line search for both)")
def sd_iterations(k):
    x = np.array([k, 1.0]); n = 0
    while np.linalg.norm(x) > 1e-6 and n < 10**6:
        g = np.array([x[0], k * x[1]]); alpha = (g @ g) / (g[0]**2 + k * g[1]**2)      # exact line search
        x = x - alpha * g; n += 1
    return n
def cg_iterations(k):
    A = np.diag([1.0, k]); x = np.array([k, 1.0]); r = -A @ x; p = r.copy(); n = 0
    while np.linalg.norm(x) > 1e-6 and n < 100:
        Ap = A @ p; alpha = (r @ r) / (p @ Ap); x = x + alpha * p; rn = r - alpha * Ap
        p = rn + (rn @ rn) / (r @ r) * p; r = rn; n += 1
    return n
for k in (1, 10, 100, 1000, 10000):
    print(f"   {k:12d}        {sd_iterations(k):10d}            {cg_iterations(k):6d}")

print("\n2. the Rosenbrock function f = (1-x)^2 + 100 (y - x^2)^2, minimum (1, 1), started from (-1.2, 1)")
rosen = lambda p: (1 - p[0])**2 + 100 * (p[1] - p[0]**2)**2
grad = lambda p: np.array([-2 * (1 - p[0]) - 400 * p[0] * (p[1] - p[0]**2), 200 * (p[1] - p[0]**2)])
hess = lambda p: np.array([[2 - 400 * p[1] + 1200 * p[0]**2, -400 * p[0]], [-400 * p[0], 200.0]])
print("   method                 iterations   f evals   grad evals   final f        distance from (1,1)")
cases = [("Nelder-Mead (no gradient)", dict(method="Nelder-Mead", options=dict(xatol=1e-10, fatol=1e-14, maxiter=10000))),
         ("conjugate gradient",       dict(method="CG", jac=grad, options=dict(gtol=1e-10))),
         ("BFGS",                     dict(method="BFGS", jac=grad, options=dict(gtol=1e-10))),
         ("BFGS, numerical gradient", dict(method="BFGS", options=dict(gtol=1e-8))),
         ("Newton-CG (Hessian)",      dict(method="Newton-CG", jac=grad, hess=hess, options=dict(xtol=1e-12)))]
for name, kw in cases:
    r = minimize(rosen, [-1.2, 1.0], **kw)
    print(f"   {name:24s} {r.nit:7d}   {r.nfev:8d}   {getattr(r, 'njev', 0):8d}    {r.fun:.3e}      {np.linalg.norm(r.x - 1):.2e}")
x = np.array([-1.2, 1.0]); n = 0
while np.linalg.norm(grad(x)) > 1e-6 and n < 200000:
    x = x - 1e-3 * grad(x); n += 1
print(f"   plain gradient descent, fixed step 1e-3: {n} iterations to reach |grad f| < 1e-6" + ("" if n < 200000 else " (not reached)") + f", f = {rosen(x):.3e}")

print("\n3. Lennard-Jones clusters (epsilon = sigma = 1): local minima found from 200 random starts with BFGS")
def lj(xflat):
    X = xflat.reshape(-1, 3); d = X[:, None, :] - X[None, :, :]; r2 = (d**2).sum(-1); np.fill_diagonal(r2, 1.0)
    inv6 = 1 / r2**3
    e = 2 * (inv6**2 - inv6).sum()                                   # 4 sum_{i<j} (r^-12 - r^-6); the diagonal was set to r = 1, where inv6**2 - inv6 = 0
    coef = 4 * (-12 * inv6**2 + 6 * inv6) / r2                       # (1/r) dV/dr
    np.fill_diagonal(coef, 0.0)
    return e, (coef[:, :, None] * d).sum(1).ravel()
rng = np.random.default_rng(3)
known = {7: -16.505384, 13: -44.326801, 19: -72.659782}
def random_start(N):
    """N points in a sphere of radius 0.8 N^(1/3), at least 0.8 apart (random but not overlapping)."""
    R = 0.8 * N ** (1 / 3); pts = []
    while len(pts) < N:
        p = rng.uniform(-R, R, 3)
        if np.linalg.norm(p) < R and all(np.linalg.norm(p - q) > 0.8 for q in pts): pts.append(p)
    return np.array(pts).ravel()
def is_bound(z):
    X = z.reshape(-1, 3); d = np.linalg.norm(X[:, None] - X[None], axis=-1); np.fill_diagonal(d, 9.0)
    return bool(np.all(d.min(1) < 1.5))                      # every atom has a neighbour within 1.5 sigma
print("    N   global minimum (literature)   best found   bound clusters   distinct minima among them   runs ending in the best")
for N in (7, 13, 19):
    es = []
    for _ in range(200):
        r = minimize(lambda z: lj(z)[0], random_start(N), jac=lambda z: lj(z)[1], method="BFGS", options=dict(gtol=1e-7, maxiter=3000))
        if is_bound(r.x): es.append(r.fun)
    es = np.array(es); u = np.unique(np.round(es, 3)); best = es.min()
    print(f"   {N:3d}   {known[N]:12.6f}              {best:10.6f}      {len(es):6d}             {len(u):6d}                       {np.sum(np.abs(es - best) < 1e-3):6d}")
