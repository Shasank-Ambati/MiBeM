"""Read a CIF with only the asymmetric unit and the space group: ASE expands it to the full cell; then check density and symmetry."""
import spglib
from ase.io import read
a = read("nacl.cif")
print(a)
print("atoms in the conventional cell:", len(a), "  formula:", a.get_chemical_formula())
print("scaled positions of Na:", a[[s == "Na" for s in a.get_chemical_symbols()]].get_scaled_positions().round(3).tolist())
mass = a.get_masses().sum(); V = a.get_volume()
print("volume %.2f A^3, density %.3f g/cm3 (measured 2.165)" % (V, mass / V * 1.66054))
ds = spglib.get_symmetry_dataset((a.cell.array, a.get_scaled_positions(), a.numbers))
print("spglib:", ds.international, ds.number, "Wyckoff", "".join(ds.wyckoffs))
d = a.get_all_distances(mic=True); import numpy as np
print("shortest interatomic distance %.3f A (Na-Cl; sum of ionic radii 1.02 + 1.81 = 2.83 A)" % d[d > 0].min())
