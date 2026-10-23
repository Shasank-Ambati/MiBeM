"""Thermodynamic functions from a heat capacity: H, S, G, Maxwell checks, and the driving force for solidification of aluminium.
Heat capacities are approximate textbook (Kelley-type) values for Al, used as an illustration: not a database."""
import numpy as np
from scipy.integrate import quad

R = 8.314462618
Tm, dHm = 933.47, 10711.0                       # melting point (K) and enthalpy of fusion (J/mol)
cps = lambda T: 20.67 + 12.38e-3 * T            # solid Al, J/(mol K)  (valid 298-933 K)
cpl = lambda T: 31.75 + 0.0 * T                 # liquid Al, J/(mol K)

print("1. thermodynamic functions of solid Al relative to 298.15 K (from Cp = 20.67 + 12.38e-3 T)")
print("      T (K)    H(T)-H(298) (J/mol)    S(T)-S(298) (J/mol/K)    G = H - T S (J/mol)    -dG/dT (numerical)   |  S - (-dG/dT)")
T0 = 298.15
H = lambda T: quad(cps, T0, T)[0]
S = lambda T: quad(lambda t: cps(t) / t, T0, T)[0]
G = lambda T: H(T) - T * S(T)
for T in (300, 500, 700, 900):
    h = 1e-3
    dGdT = -(G(T + h) - G(T - h)) / (2 * h)
    # G here is measured from the 298 K state, so the entropy at 298 K enters as - S298 (T - T0): the derivative of H - T (S - S298) is S - S298
    print(f"   {T:6.0f}      {H(T):12.1f}            {S(T):12.4f}              {G(T):12.1f}           {dGdT:12.4f}        {abs(S(T) - dGdT):.1e}")
print("   (G is measured from the state at 298.15 K with S(298) set to zero, so -dG/dT = S(T) - S(298); the Maxwell-type relation G = H - TS and S = -dG/dT hold to the accuracy of the differentiation)")

print("\n2. the driving force for solidification of Al: dG(T) = G_liquid - G_solid below the melting point")
def dG_exact(T):
    # d(dG)/dT = -(S_l - S_s);  dS(T) = dHm/Tm + int_Tm^T (cpl - cps)/t dt ;  dH(T) = dHm + int_Tm^T (cpl - cps) dt
    dH = dHm + quad(lambda t: cpl(t) - cps(t), Tm, T)[0]
    dS = dHm / Tm + quad(lambda t: (cpl(t) - cps(t)) / t, Tm, T)[0]
    return dH - T * dS
print("   undercooling   exact dG (J/mol)   Turnbull dHm dT/Tm   Turnbull/exact   Hoffman dHm dT/Tm (T/Tm)")
for dT in (10, 50, 100, 200, 300):
    T = Tm - dT
    ex = dG_exact(T); tb = dHm * dT / Tm; tb2 = dHm * (Tm - T) / Tm * (T / Tm)
    print(f"   {dT:6.0f} K      {ex:12.1f}      {tb:12.1f}        {tb / abs(ex):10.4f}      {tb2:10.1f}")
print("   dG = G_liquid - G_solid is positive below Tm: the solid is more stable and dG is the driving force for solidification.  Turnbull's approximation dHm dT/Tm neglects the heat-capacity difference between liquid and solid; Hoffman's adds a factor T/Tm.")

print("\n3. heat of fusion from the Gibbs energies at the melting point: dG(Tm) = 0 and dH = Tm dS")
print(f"   dG(Tm) = {dG_exact(Tm):.1e} J/mol,  dS(Tm) = dHm/Tm = {dHm / Tm:.3f} J/(mol K) = {dHm / Tm / R:.3f} R (Richards' rule: about R for many metals)")
