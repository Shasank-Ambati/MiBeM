"""Identify the space group of a structure with spglib (the same engine used by pymatgen and many codes)."""
import spglib
from ase.build import bulk
from ase.spacegroup import crystal

def sg(atoms, symprec=1e-3):
    cell = (atoms.cell.array, atoms.get_scaled_positions(), atoms.numbers)
    return spglib.get_spacegroup(cell, symprec=symprec)

srtio3 = crystal(["Sr", "Ti", "O"], basis=[(0, 0, 0), (0.5, 0.5, 0.5), (0.5, 0.5, 0)], spacegroup=221, cellpar=[3.905] * 3 + [90] * 3)
cu = bulk("Cu", "fcc", a=3.615, cubic=True)
print("%-22s %s" % ("Cu fcc", sg(cu)))
print("%-22s %s" % ("Fe bcc", sg(bulk("Fe", "bcc", a=2.866, cubic=True))))
print("%-22s %s" % ("Mg hcp", sg(bulk("Mg", "hcp", a=3.209, c=5.211))))
print("%-22s %s" % ("Si diamond", sg(bulk("Si", "diamond", a=5.431))))
print("%-22s %s" % ("NaCl", sg(bulk("NaCl", "rocksalt", a=5.64))))
print("%-22s %s" % ("SrTiO3", sg(srtio3)))

# tolerance matters: displace atoms randomly and watch the symmetry disappear
import numpy as np
rng = np.random.default_rng(1)
for amp in (0.0, 0.0005, 0.005, 0.05):
    a = cu.repeat((2, 2, 2)); a.positions += rng.normal(0, amp, a.positions.shape)
    print("noise %.4f A, symprec 1e-3 : %s ;  symprec 1e-1 : %s" % (amp, sg(a, 1e-3), sg(a, 1e-1)))
