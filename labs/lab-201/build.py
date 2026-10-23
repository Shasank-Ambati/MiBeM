"""Build the standard crystals with ASE and print what the Atoms object holds."""
from ase.build import bulk
from ase.spacegroup import crystal
from ase.units import kg, m

cu = bulk("Cu", "fcc", a=3.615, cubic=True)
print(cu)
print("cell (angstrom):"); print(cu.cell.array)
print("scaled positions:"); print(cu.get_scaled_positions())
print("volume %.2f A^3, density %.2f g/cm3" % (cu.get_volume(), cu.get_masses().sum() / cu.get_volume() * 1.66054))

structures = {
    "Cu  fcc":          bulk("Cu", "fcc", a=3.615, cubic=True),
    "Fe  bcc":          bulk("Fe", "bcc", a=2.866, cubic=True),
    "Mg  hcp":          bulk("Mg", "hcp", a=3.209, c=5.211),
    "Si  diamond":      bulk("Si", "diamond", a=5.431, cubic=True),
    "NaCl rocksalt":    bulk("NaCl", "rocksalt", a=5.640, cubic=True),
    "CsCl":             bulk("CsCl", "cesiumchloride", a=4.123),
    "ZnS zincblende":   bulk("ZnS", "zincblende", a=5.409, cubic=True),
    "SrTiO3 perovskite": crystal(["Sr", "Ti", "O"], basis=[(0, 0, 0), (0.5, 0.5, 0.5), (0.5, 0.5, 0)],
                                 spacegroup=221, cellpar=[3.905, 3.905, 3.905, 90, 90, 90]),
}
print("\n%-18s %5s %-12s %8s %10s" % ("structure", "atoms", "formula", "V (A^3)", "rho g/cm3"))
for name, a in structures.items():
    rho = a.get_masses().sum() / a.get_volume() * 1.66054
    print("%-18s %5d %-12s %8.2f %10.3f" % (name, len(a), a.get_chemical_formula(), a.get_volume(), rho))
