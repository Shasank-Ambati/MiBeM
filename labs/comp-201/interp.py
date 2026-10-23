"""Polynomial interpolation: Runge phenomenon, Chebyshev nodes, splines."""
import numpy as np
from scipy.interpolate import CubicSpline, BarycentricInterpolator

f = lambda x: 1 / (1 + 25 * x**2)
xf = np.linspace(-1, 1, 4001)
print("interpolating f(x) = 1/(1 + 25 x^2) on [-1, 1]: maximum error over 4001 points")
print("   n (nodes)   equispaced poly   Chebyshev nodes poly   cubic spline (equispaced)")
for n in (5, 9, 13, 17, 21, 41):
    xe = np.linspace(-1, 1, n)
    xc = np.cos((2 * np.arange(n) + 1) * np.pi / (2 * n))
    pe = BarycentricInterpolator(xe, f(xe))(xf); pc = BarycentricInterpolator(xc, f(xc))(xf)
    cs = CubicSpline(xe, f(xe))(xf)
    print(f"   {n:5d}   {np.max(np.abs(pe - f(xf))):15.3e}   {np.max(np.abs(pc - f(xf))):18.3e}   {np.max(np.abs(cs - f(xf))):18.3e}")

print("\nthe Lebesgue constant (worst-case amplification of errors in the data) for n nodes")
for n in (5, 11, 21, 41):
    for name, nodes in (("equispaced", np.linspace(-1, 1, n)),
                         ("Chebyshev ", np.cos((2 * np.arange(n) + 1) * np.pi / (2 * n)))):
        xx = np.linspace(-1, 1, 20001); lam = np.zeros_like(xx)
        for j in range(n):
            lj = np.ones_like(xx)
            for m in range(n):
                if m != j: lj *= (xx - nodes[m]) / (nodes[j] - nodes[m])
            lam += np.abs(lj)
        print(f"   n = {n:3d}  {name}  Lebesgue constant = {lam.max():.4g}")

print("\ncubic spline convergence for f = sin(2 pi x) on [0, 1]: error vs number of intervals")
g = lambda x: np.sin(2 * np.pi * x); xg = np.linspace(0, 1, 5001)
prev = None
for n in (4, 8, 16, 32, 64, 128):
    xn = np.linspace(0, 1, n + 1)
    e = np.max(np.abs(CubicSpline(xn, g(xn), bc_type="periodic")(xg) - g(xg)))
    print(f"   n = {n:4d}   max error = {e:.3e}" + (f"   ratio {prev / e:5.2f}" if prev else ""))
    prev = e

print("\ndata with noise: interpolation vs fit (n = 15 points of sin(2 pi x) + noise of size 0.1)")
rng = np.random.default_rng(1)
xd = np.linspace(0, 1, 15); yd = g(xd) + 0.1 * rng.standard_normal(15)
pi = BarycentricInterpolator(xd, yd)(xg); pf = np.polyval(np.polyfit(xd, yd, 5), xg)
print(f"   max |interpolating polynomial - truth| = {np.max(np.abs(pi - g(xg))):.3f}   max |degree-5 least-squares fit - truth| = {np.max(np.abs(pf - g(xg))):.3f}")
