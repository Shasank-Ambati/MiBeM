"""Check the hand-made hull construction of phasediagram.py against pycalphad on the same model."""
import numpy as np
from pycalphad import Database, equilibrium, calculate, variables as v

db = Database("eutectic.tdb"); comps = ["A", "B", "VA"]; phases = ["LIQUID", "ALPHA", "BETA"]
def eq(x, T):
    r = equilibrium(db, comps, phases, {v.X("B"): x, v.T: T, v.P: 101325, v.N: 1})
    out = []
    ph = r.Phase.values.squeeze(); npv = r.NP.values.squeeze(); xb = r.X.sel(component="B").values.squeeze()
    for p, n, c in zip(np.atleast_1d(ph), np.atleast_1d(npv), np.atleast_1d(xb)):
        if p and n > 1e-9: out.append((str(p), float(n), float(c)))
    return sorted(out, key=lambda t: t[2]), r
print("pycalphad equilibria for the alloy x_B = 0.30 (phase, fraction, composition x_B):")
for T in (1000.0, 900.0, 801.0, 795.0, 600.0):
    res, r = eq(0.30, T)
    print(f"   T = {T:6.1f} K:  " + "   ".join(f"{p:6s} {n:.3f}  x = {c:.4f}" for p, n, c in res))
print("\nthe chemical potentials at 900 K (J/mol, relative to the reference states): the equal-potential condition")
res, r = eq(0.30, 900.0)
mu = r.MU.values.squeeze()
print(f"   mu_A = {mu[0]:.2f}, mu_B = {mu[1]:.2f};  the tie line (alpha 0.0598, liquid 0.3208) of the hull construction has the common tangent with these intercepts")
x1, x2 = 0.0598, 0.3208
R = 8.314462618; T = 900.0
GL = lambda x: (1 - x) * (12000 - 10 * T) + x * (15000 - 10 * T) + R * T * (x * np.log(x) + (1 - x) * np.log(1 - x)) - 5000 * x * (1 - x)
Ga = lambda x: x * 3000 + R * T * (x * np.log(x) + (1 - x) * np.log(1 - x)) + 15000 * x * (1 - x)
slope = (GL(x2) - Ga(x1)) / (x2 - x1); muA_h = Ga(x1) - slope * x1; muB_h = muA_h + slope
print(f"   hull tie line: mu_A = {muA_h:.2f}, mu_B = {muB_h:.2f}")
print("\nthe eutectic: scan the temperature at x_B = 0.421")
for T in (803.0, 801.0, 800.5, 799.0, 797.0):
    res, _ = eq(0.421, T)
    print(f"   T = {T:6.1f} K:  " + "  ".join(f"{p} ({n:.3f})" for p, n, c in res))
