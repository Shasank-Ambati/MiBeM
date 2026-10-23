"""Equation of state of copper with ASE's built-in EMT calculator: lattice constant and bulk modulus."""
import numpy as np
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.eos import EquationOfState
from ase.units import GPa

cu = bulk("Cu", "fcc", a=3.6)
volumes, energies = [], []
for a in np.linspace(3.4, 3.8, 9):
    cu.set_cell(bulk("Cu", "fcc", a=a).cell, scale_atoms=True)
    cu.calc = EMT()
    volumes.append(cu.get_volume()); energies.append(cu.get_potential_energy())
    print("a = %.3f A   V = %6.3f A^3   E = %8.4f eV" % (a, volumes[-1], energies[-1]))
eos = EquationOfState(volumes, energies, eos="birchmurnaghan")
v0, e0, B = eos.fit()
a0 = (4 * v0) ** (1 / 3)
print("\nEquilibrium: a0 = %.4f A, E0 = %.4f eV/atom, B = %.1f GPa" % (a0, e0, B / GPa))
