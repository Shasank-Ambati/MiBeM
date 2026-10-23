"""Solidification of an alloy with x_B = 0.10: equilibrium (lever rule) against Scheil-Gulliver (no diffusion in the solid)."""
import numpy as np
from tools505 import load, state

db = load()
x0, dT = 0.10, 4.0

# liquidus temperature of the alloy
T = 1000.0
while len(state(db, x0, T)) == 1: T -= 1.0
T_liq = T + 1.0
print("liquidus temperature of x_B = %.2f: about %.0f K" % (x0, T_liq))

# equilibrium: just above the eutectic temperature the liquid has the eutectic composition, the solid alpha its limit
s = {p: (n, x) for p, n, x in state(db, x0, 668.0)}
print("equilibrium at 668 K:", {p: (round(n, 3), round(x, 3)) for p, (n, x) in s.items()})
f_eq = s["LIQUID"][0] if "LIQUID" in s else 0.0
print("equilibrium fraction of liquid (which turns into eutectic) at 668 K: %.3f" % f_eq)

# Scheil: remove the solid formed at every step; the liquid keeps the composition of the tie line
F, xL, T = 1.0, x0, T_liq - 1.0
print("\n  T (K)   liquid fraction   x_B in liquid   x_B in solid formed")
k = 0
while T > 660:
    s = state(db, xL, T)
    d = {p: (n, x) for p, n, x in s}
    if "LIQUID" not in d: break
    if "ALPHA" in d:
        nL, xLnew = d["LIQUID"]; xs = d["ALPHA"][1]
        F *= nL; xL = xLnew
        if k % 5 == 0: print("  %5.0f    %.4f          %.4f           %.4f" % (T, F, xL, xs))
        k += 1
    T -= dT
print("last liquid before the eutectic: T = %.0f K, liquid fraction F = %.4f, x_B = %.3f" % (T + dT, F, xL))
print("Scheil: eutectic constituent = %.3f of the alloy;   equilibrium: %.3f" % (F, f_eq))
