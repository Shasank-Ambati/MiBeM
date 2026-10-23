"""Chemical equilibrium and Ellingham-type diagrams with ILLUSTRATIVE thermochemical data (not measured values)."""
import numpy as np
R = 8.314462618

print("1. oxidation  M + O2 -> MO2 with dG(T) = dH - T dS  (illustrative: dH = -900 kJ/mol O2, dS = -180 J/(mol K) per mol O2)")
dH, dS = -900e3, -180.0
print("      T (K)    dG (kJ/mol O2)    equilibrium p(O2) = exp(dG/RT) (bar)    log10 p(O2)")
for T in (500, 800, 1000, 1200, 1500):
    dG = dH - T * dS
    p = np.exp(dG / (R * T))
    print(f"     {T:5d}      {dG / 1e3:9.1f}              {p:12.3e}                 {np.log10(p):8.1f}")
print("   the slope of dG(T) is -dS = +180 J/(mol K): the Ellingham line rises with T because a gas is consumed (negative dS)")

print("\n2. competition between two oxides: M1 (dH = -900 kJ, dS = -180) and M2 (dH = -600 kJ, dS = -175, per mol O2): which reduces which?")
for T in (500, 1000, 1500, 2000, 2500):
    d1 = -900e3 + 180 * T; d2 = -600e3 + 175 * T
    print(f"   T = {T:5d} K: dG1 = {d1 / 1e3:8.1f} kJ, dG2 = {d2 / 1e3:8.1f} kJ -> {'M1 is the more stable oxide: M1 reduces the oxide M2O2' if d1 < d2 else 'M2 is the more stable oxide'}")
print("   the lines are nearly parallel (similar dS), so the order of stability does not change; it would change only if they crossed (a difference of slopes)")

print("\n3. reaction in an ideal-gas mixture: A <-> 2B, dG0 = -2 kJ/mol at 500 K and a total pressure of 1 bar: equilibrium composition")
from scipy.optimize import brentq
T = 500.0; dG0 = -2000.0; K = np.exp(-dG0 / (R * T))
def f(xi, P=1.0):                       # extent xi for 1 mol of A initially: n_A = 1 - xi, n_B = 2 xi, n = 1 + xi
    return (2 * xi / (1 + xi))**2 * P / ((1 - xi) / (1 + xi)) - K
xi = brentq(f, 1e-9, 1 - 1e-9)
print(f"   K = exp(-dG0/RT) = {K:.4f};  extent xi = {xi:.4f}; mole fractions: x_A = {(1 - xi) / (1 + xi):.4f}, x_B = {2 * xi / (1 + xi):.4f}")
xi2 = brentq(lambda z: f(z, 10.0), 1e-9, 1 - 1e-9)
print(f"   at 10 bar (Le Chatelier: pressure favours fewer moles of gas): xi = {xi2:.4f}, x_A = {(1 - xi2) / (1 + xi2):.4f}")
