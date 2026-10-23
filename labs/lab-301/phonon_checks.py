"""Three tests that every phonon calculation needs: supercell size, the reference structure, and dynamical stability."""
import warnings; warnings.filterwarnings("ignore")
import numpy as np
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.filters import FrechetCellFilter
from phonons_cu import make_phonopy

X = [0.5, 0, 0.5]
def freq_X(ph):
    ph.run_qpoints([X]); return ph.qpoints.frequencies[0]

cu = bulk("Cu", "fcc", a=3.6); cu.calc = EMT(); BFGS(FrechetCellFilter(cu), logfile=None).run(fmax=1e-4)
print("1. supercell size (relaxed Cu, frequencies at X in THz)")
for n in (2, 3, 4, 5, 6):
    ph = make_phonopy(cu, n); f = freq_X(ph)
    print("   %d x %d x %d  (%3d atoms)   %s   lowest acoustic at Gamma: %.3f" % (n, n, n, n**3, "  ".join("%6.3f" % x for x in f), (lambda q: (ph.run_qpoints([[0, 0, 0]]), ph.qpoints.frequencies[0].min())[1])(0)))

print("\n2. reference lattice constant (4x4x4 supercell; the relaxed value is 3.5898 A)")
for a in (3.50, 3.5898, 3.70):
    c = bulk("Cu", "fcc", a=a); ph = make_phonopy(c, 4)
    print("   a = %.4f A   X: %s THz" % (a, "  ".join("%6.3f" % x for x in freq_X(ph))))

print("\n3. dynamical stability: bcc copper (a = 2.85 A, relaxed) with the same potential")
b = bulk("Cu", "bcc", a=2.85); b.calc = EMT(); BFGS(FrechetCellFilter(b), logfile=None).run(fmax=1e-4)
print("   E(bcc) - E(fcc) = %.1f meV/atom" % (1000 * (b.get_potential_energy() - cu.get_potential_energy())))
ph = make_phonopy(b, 4)
for name, q in {"H": [0.5, -0.5, 0.5], "N": [0, 0, 0.5], "P": [0.25, 0.25, 0.25]}.items():
    ph.run_qpoints([q]); print("   %-2s %s THz" % (name, "  ".join("%7.3f" % x for x in ph.qpoints.frequencies[0])))
