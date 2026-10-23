"""Numerical differentiation and quadrature."""
import numpy as np, math
from scipy import integrate
from scipy.special import roots_legendre

print("1. forward, central and 4th-order differences for f = exp(x) at x = 1 (exact f' = e):")
print("        h         forward err     central err     4th-order err")
x0 = 1.0; ex = math.exp(1.0)
for k in range(1, 17, 1):
    h = 10.0**(-k)
    fw = (math.exp(x0 + h) - math.exp(x0)) / h - ex
    ce = (math.exp(x0 + h) - math.exp(x0 - h)) / (2 * h) - ex
    f4 = (-math.exp(x0 + 2*h) + 8*math.exp(x0 + h) - 8*math.exp(x0 - h) + math.exp(x0 - 2*h)) / (12 * h) - ex
    print(f"   1e-{k:02d}   {abs(fw):13.3e}  {abs(ce):13.3e}  {abs(f4):13.3e}")
eps = np.finfo(float).eps
print(f"   theory for the optimal h: forward ~ sqrt(eps) = {math.sqrt(eps):.1e}, central ~ eps^(1/3) = {eps**(1/3):.1e}, 4th order ~ eps^(1/5) = {eps**0.2:.1e}")

print("\n2. complex-step derivative f'(x) ~ Im f(x + i h)/h (no subtraction, so h can be tiny):")
for h in (1e-4, 1e-8, 1e-20, 1e-100):
    d = np.exp(complex(x0, h)).imag / h
    print(f"   h = {h:7.0e}   error = {abs(d - ex):.3e}")

print("\n3. Richardson extrapolation of the central difference (h = 0.1, 0.05):")
D = lambda h: (math.exp(x0 + h) - math.exp(x0 - h)) / (2 * h)
R = (4 * D(0.05) - D(0.1)) / 3
print(f"   D(0.1) error {abs(D(0.1) - ex):.3e}   D(0.05) error {abs(D(0.05) - ex):.3e}   Richardson error {abs(R - ex):.3e}")

print("\n4. quadrature of the integral of exp(x) on [0,1] (exact e - 1): error vs number of points")
exact = math.e - 1
def trap(f, a, b, n):
    x = np.linspace(a, b, n + 1); y = f(x); return (b - a) / n * (y.sum() - 0.5 * (y[0] + y[-1]))
def simpson(f, a, b, n):
    x = np.linspace(a, b, n + 1); y = f(x); h = (b - a) / n
    return h / 3 * (y[0] + y[-1] + 4 * y[1:-1:2].sum() + 2 * y[2:-1:2].sum())
print("      n      trapezoid     Simpson      Gauss-Legendre (fewer points)")
for n in (2, 4, 8, 16, 32):
    xg, wg = roots_legendre(n // 2 + 1)                       # about the same cost as n+1 points
    gl = 0.5 * np.sum(wg * np.exp(0.5 * (xg + 1)))
    print(f"   {n:4d}   {abs(trap(np.exp, 0, 1, n) - exact):10.2e}   {abs(simpson(np.exp, 0, 1, n) - exact):10.2e}   {abs(gl - exact):10.2e}  ({n//2+1} points)")

print("\n5. a singular integrand: integral of 1/sqrt(x) on [0,1] = 2 (trapezoid cannot even start at x = 0)")
for n in (10, 100, 1000, 10000):
    x = (np.arange(n) + 0.5) / n
    print(f"   midpoint rule, n = {n:6d}   error = {abs((1 / np.sqrt(x)).sum() / n - 2):.3e}")
v, e = integrate.quad(lambda x: 1 / np.sqrt(x), 0, 1)
print(f"   scipy.integrate.quad: {v:.12f} with estimated error {e:.1e}")
v2, _ = integrate.quad(lambda t: 2.0, 0, 1)    # substitution x = t^2
print("   with the substitution x = t^2 the integrand becomes 2 (smooth) and any rule is exact")

print("\n6. materials example: the Debye heat capacity. C_V/(3 N k) = 3 (T/theta)^3 * int_0^{theta/T} x^4 e^x/(e^x-1)^2 dx")
integrand = lambda x: x**4 * np.exp(x) / np.expm1(x)**2 if x > 1e-8 else x**2
print("    T/theta     integral        C_V/(3Nk)")
for t in (0.05, 0.1, 0.2, 0.5, 1.0, 2.0):
    I, err = integrate.quad(integrand, 0, 1 / t)
    print(f"    {t:6.2f}   {I:12.6f}   {3 * t**3 * I:10.6f}")
print("   low T: C_V/(3Nk) -> (4 pi^4/5)(T/theta)^3 =", f"{4 * math.pi**4 / 5:.4f} (T/theta)^3 ;  at T/theta = 0.05:", f"{4 * math.pi**4 / 5 * 0.05**3:.6f}")
