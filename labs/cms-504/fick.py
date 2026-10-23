"""Fick's second law: finite-difference solution against the exact erf solution, the thin-film (Gaussian) solution, and the effect of time step and mesh."""
import numpy as np
from scipy.special import erf, erfc
import scipy.sparse as sp, scipy.sparse.linalg as spl

# carburising of steel (C in gamma-Fe): textbook parameters D0 = 2.3e-5 m^2/s, Q = 148 kJ/mol (approximate, Callister)
R = 8.314462618
D0, Q = 2.3e-5, 148e3
T = 927 + 273.15
D = D0 * np.exp(-Q / (R * T))
print(f"carbon in austenite at {T - 273.15:.0f} C: D = D0 exp(-Q/RT) = {D:.3e} m^2/s")
Cs, C0 = 1.0, 0.25                                   # surface and initial carbon content (wt%)
t = 10 * 3600.0
xd = 2 * np.sqrt(D * t)
print(f"after {t / 3600:.0f} h: diffusion length sqrt(D t) = {np.sqrt(D * t) * 1e3:.3f} mm; 2 sqrt(D t) = {xd * 1e3:.3f} mm")
exact = lambda x, t: Cs - (Cs - C0) * erf(x / (2 * np.sqrt(D * t)))
x_c = 2 * np.sqrt(D * t) * __import__("scipy.special", fromlist=["erfinv"]).erfinv((Cs - 0.8) / (Cs - C0))
print(f"depth at which the carbon content equals 0.8 wt% (the eutectoid composition): x = {x_c * 1e3:.3f} mm")
print(f"time to reach 0.8 wt% at 1.0 mm depth: t = x^2 / (4 D z^2) with z = erfinv((Cs-0.8)/(Cs-C0)) = {(1e-3)**2 / (4 * D * (__import__('scipy.special', fromlist=['erfinv']).erfinv((Cs - 0.8) / (Cs - C0)))**2) / 3600:.1f} h")

def solve(nx, nt, L=8e-3, theta=0.5):
    x = np.linspace(0, L, nx + 1); h = x[1] - x[0]; dt = t / nt
    c = np.full(nx + 1, C0); c[0] = Cs
    m = nx - 1
    Lap = sp.diags([1.0, -2.0, 1.0], [-1, 0, 1], shape=(m, m), format="csc") / h**2
    I = sp.identity(m, format="csc")
    lu = spl.splu((I - theta * dt * D * Lap).tocsc()); B = (I + (1 - theta) * dt * D * Lap).tocsc()
    u = c[1:-1].copy(); bc = np.zeros(m); bc[0] = D / h**2 * Cs; bc[-1] = D / h**2 * C0        # Dirichlet values c(0) = Cs and c(L) = C0 enter as source terms
    for _ in range(nt):
        u = lu.solve(B @ u + dt * bc)
    c[1:-1] = u; return x, c
print("\nconvergence of the finite-difference solution (Crank-Nicolson), maximum error against the exact solution:")
print("    nx     nt       h (um)     dt (s)     max error (wt%)")
for nx, nt in ((50, 50), (100, 100), (200, 200), (400, 400), (800, 800)):
    x, c = solve(nx, nt); err = np.max(np.abs(c - exact(x, t)))
    print(f"   {nx:4d}  {nt:5d}     {(x[1] - x[0]) * 1e6:7.2f}    {t / nt:8.1f}      {err:.3e}")
print("\nbackward Euler (theta = 1) against Crank-Nicolson at nx = 400:")
for nt in (10, 40, 160, 640):
    e1 = np.max(np.abs(solve(400, nt, theta=1.0)[1] - exact(solve(400, nt, theta=1.0)[0], t))); e2 = np.max(np.abs(solve(400, nt, theta=0.5)[1] - exact(solve(400, nt, theta=0.5)[0], t)))
    print(f"   nt = {nt:4d} (dt = {t / nt:7.1f} s):  backward Euler {e1:.3e},  Crank-Nicolson {e2:.3e}")

print("\nthin-film (instantaneous source) solution c(x,t) = M / sqrt(pi D t) exp(-x^2 / 4Dt): drive-in of a boron layer (M = 1e15 atoms/cm^2) in silicon at 1000 C")
kB = 8.617333e-5; Dsi = 0.76 * np.exp(-3.46 / (kB * 1273.15))          # cm^2/s, textbook Arrhenius parameters (approximate): D0 = 0.76 cm^2/s, E = 3.46 eV
print(f"   D(B in Si, 1000 C) = 0.76 exp(-3.46 eV/kT) = {Dsi:.2e} cm^2/s")
for th in (0.5, 1, 2, 4):
    tt = th * 3600
    print(f"   after {th:3.1f} h: peak concentration {1e15 / np.sqrt(np.pi * Dsi * tt):.2e} cm^-3, width (2 sqrt(Dt)) {2 * np.sqrt(Dsi * tt) * 1e4:.3f} um")
