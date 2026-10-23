"""Space group, Wyckoff positions and number of symmetry operations of common structures, found with spglib."""
import numpy as np, spglib
from ase.build import bulk
from ase.spacegroup import crystal

structures = {
    "Cu (fcc)":               bulk("Cu", "fcc", a=3.615, cubic=True),
    "Fe (bcc)":               bulk("Fe", "bcc", a=2.866, cubic=True),
    "Mg (hcp)":               bulk("Mg", "hcp", a=3.209, c=5.211),
    "Si (diamond)":           bulk("Si", "diamond", a=5.431, cubic=True),
    "NaCl (rocksalt)":        bulk("NaCl", "rocksalt", a=5.640, cubic=True),
    "CsCl":                   bulk("CsCl", "cesiumchloride", a=4.123),
    "ZnS (zincblende)":       bulk("ZnS", "zincblende", a=5.409, cubic=True),
    "CaF2 (fluorite)":        crystal(["Ca", "F"], basis=[(0, 0, 0), (0.25, 0.25, 0.25)], spacegroup=225, cellpar=[5.463] * 3 + [90] * 3),
    "SrTiO3 (perovskite)":    crystal(["Sr", "Ti", "O"], basis=[(0, 0, 0), (0.5, 0.5, 0.5), (0.5, 0.5, 0)], spacegroup=221, cellpar=[3.905] * 3 + [90] * 3),
    "alpha-quartz SiO2":      crystal(["Si", "O"], basis=[(0.4697, 0, 0), (0.4135, 0.2669, 0.1191)], spacegroup=152, cellpar=[4.916, 4.916, 5.405, 90, 90, 120]),
}
print("%-22s %-12s %4s  %-10s %5s  %5s %s" % ("structure", "space group", "no.", "point grp", "ops", "atoms", "Wyckoff letters (conventional cell)"))
for name, a in structures.items():
    ds = spglib.get_symmetry_dataset((a.cell.array, a.get_scaled_positions(), a.numbers), symprec=1e-3)
    print("%-22s %-12s %4d  %-10s %5d  %5d %s" % (name, ds.international, ds.number, ds.pointgroup, len(ds.rotations), len(a), "".join(ds.wyckoffs)))
