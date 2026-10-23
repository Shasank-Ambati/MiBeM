"""Equilibrium calculations: phases, amounts and compositions; the lever rule; and the eutectic point."""
import numpy as np
from tools505 import *

db = load()
print("alloy x_B = 0.20 on cooling")
print("   T (K)   phases (amount, x_B in the phase)")
for T in (1100, 900, 850, 800, 700, 680, 660, 600, 400):
    s = state(db, 0.20, T)
    print("  %5d    " % T + "   ".join("%s %.3f (%.3f)" % (p, n, x) for p, n, x in s))

# lever rule check at 800 K
s = state(db, 0.20, 800); d = {p: (n, x) for p, n, x in s}
xl, xa = d["LIQUID"][1], d["ALPHA"][1]
print("\nlever rule at 800 K: x_L = %.4f, x_alpha = %.4f -> f_L = (0.20 - x_alpha)/(x_L - x_alpha) = %.4f ; pycalphad: %.4f"
      % (xl, xa, (0.20 - xa) / (xl - xa), d["LIQUID"][0]))

# eutectic temperature: lowest T at which the liquid is stable for x_B = 0.385 (scan down)
print("\nscan of the alloy x_B = 0.385 through the eutectic")
for T in np.arange(672, 658, -2.0):
    s = state(db, 0.385, T)
    print("  T = %5.1f   " % T + "   ".join("%s %.3f" % (p, n) for p, n, x in s))
