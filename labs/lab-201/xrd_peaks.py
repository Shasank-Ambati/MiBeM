"""Powder X-ray diffraction peak positions of cubic crystals from the lattice constant and the structure factor selection rules."""
import itertools, numpy as np
from ase.build import bulk

lam = 1.5406                                         # Cu K-alpha1, angstrom
def peaks(atoms_name, a, kind):
    out = []
    for h, k, l in itertools.product(range(0, 6), repeat=3):
        if (h, k, l) == (0, 0, 0) or not (h >= k >= l): continue
        par = [h % 2, k % 2, l % 2]
        allowed = {"fcc": len(set(par)) == 1,                                   # all odd or all even
                   "bcc": (h + k + l) % 2 == 0,                                 # sum even
                   "diamond": len(set(par)) == 1 and (all(p == 1 for p in par) or (h + k + l) % 4 == 0)}[kind]
        if not allowed: continue
        d = a / np.sqrt(h * h + k * k + l * l)
        s = lam / (2 * d)
        if s <= 1: out.append((2 * np.degrees(np.arcsin(s)), (h, k, l), d))
    return sorted(out)[:7]

for name, a, kind in (("Cu fcc, a = 3.615", 3.615, "fcc"), ("Fe bcc, a = 2.866", 2.866, "bcc"), ("Si diamond, a = 5.431", 5.431, "diamond")):
    print(name)
    for tt, hkl, d in peaks(name, a, kind):
        print("   (%d %d %d)   d = %.4f A   2theta = %6.2f deg" % (*hkl, d, tt))
