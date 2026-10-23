"""Surface slabs: build, add vacuum, count atoms, compute surface energies with EMT, and draw the slabs."""
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ase.build import fcc100, fcc110, fcc111, bulk
from ase.calculators.emt import EMT
from ase.visualize.plot import plot_atoms
from ase.units import J, m

a = 3.6
bulk_cu = bulk("Cu", "fcc", a=a); bulk_cu.calc = EMT(); e_bulk = bulk_cu.get_potential_energy()
builders = {"(100)": fcc100, "(110)": fcc110, "(111)": fcc111}
print("bulk energy %.4f eV/atom" % e_bulk)
print("%-8s %6s %6s %12s %13s" % ("surface", "layers", "atoms", "area (A^2)", "gamma (J/m2)"))
for name, f in builders.items():
    for layers in (3, 5, 7, 9):
        s = f("Cu", size=(1, 1, layers), a=a, vacuum=8.0)       # 8 A of vacuum on each side
        s.calc = EMT(); E = s.get_potential_energy()
        A = np.linalg.norm(np.cross(s.cell[0], s.cell[1]))
        gamma = (E - len(s) * e_bulk) / (2 * A) / (J / m**2)     # two surfaces
        print("%-8s %6d %6d %12.2f %13.3f" % (name, layers, len(s), A, gamma))

fig, axes = plt.subplots(1, 3, figsize=(8.5, 3.4))
for ax, (name, f) in zip(axes, builders.items()):
    s = f("Cu", size=(3, 3, 5), a=a, vacuum=6.0)
    plot_atoms(s, ax, rotation="-80x,10y,0z", radii=0.9); ax.set_title(name); ax.axis("off")
fig.tight_layout(); fig.savefig("slabs.png", dpi=130)
