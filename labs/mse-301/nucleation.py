"""Nucleation from the driving force: critical radius and barrier for solid Al in undercooled liquid (illustrative interfacial energy)."""
import numpy as np
from scipy.optimize import brentq

kB = 1.380649e-23; NA = 6.02214076e23
Tm, dHm = 933.47, 10711.0                 # K, J/mol
Vm = 10.0e-6                              # molar volume of Al, m^3/mol (approximate)
gamma = 0.093                             # solid-liquid interfacial energy, J/m^2 (illustrative value of the order of the literature)
dHv = dHm / Vm
print(f"Al: Tm = {Tm} K, dHm = {dHm} J/mol, Vm = {Vm * 1e6:.1f} cm^3/mol -> dH_v = {dHv:.3e} J/m^3;  gamma_sl = {gamma} J/m^2 (illustrative)")
print("\n1. critical nucleus: r* = 2 gamma/dGv,  dG* = 16 pi gamma^3/(3 dGv^2),  with dGv = dHv dT/Tm (Turnbull)")
print("   undercooling   dGv (J/m^3)    r* (nm)    atoms in nucleus   dG* (1e-19 J)    dG*/kT      exp(-dG*/kT)")
def barrier(dT):
    T = Tm - dT; dGv = dHv * dT / Tm; rs = 2 * gamma / dGv; dGs = 16 * np.pi * gamma**3 / (3 * dGv**2)
    n = 4 / 3 * np.pi * rs**3 / (Vm / NA)
    return T, dGv, rs, n, dGs, dGs / (kB * T)
for dT in (5, 20, 50, 100, 150, 200, 250):
    T, dGv, rs, n, dGs, x = barrier(dT)
    print(f"     {dT:5.0f} K     {dGv:11.3e}    {rs * 1e9:6.3f}     {n:12.0f}       {dGs / 1e-19:8.3f}      {x:8.1f}     {np.exp(-x):.2e}")
print("\n2. how much undercooling is needed before homogeneous nucleation becomes observable?")
f = lambda dT: barrier(dT)[5] - 60.0
dT60 = brentq(f, 5, 400)
print(f"   with dG*/kT = 60 (a common rule of thumb for observable nucleation; the exact number depends on the volume and the observation time) dT = {dT60:.0f} K = {dT60 / Tm:.3f} Tm")
print("   (experiments on small clean droplets of many metals reach undercoolings of order 0.2 Tm, Turnbull's rule; the model value above uses an illustrative interfacial energy and the Turnbull driving force)")
print("\n3. effect of the interfacial energy: dT for dG*/kT = 60")
for g in (0.06, 0.093, 0.12):
    gamma = g
    print(f"   gamma = {g:.3f} J/m^2: dT = {brentq(lambda dT: barrier(dT)[5] - 60.0, 5, 600):6.1f} K ({brentq(lambda dT: barrier(dT)[5] - 60.0, 5, 600) / Tm:.3f} Tm)")
