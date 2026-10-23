"""Energy against lattice constant for fcc copper (EAM): equilibrium lattice constant, cohesive energy and bulk modulus."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from lammps import lammps

def energy(a, n=4):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    for c in ["units metal", "atom_style atomic", f"lattice fcc {a}", f"region box block 0 {n} 0 {n} 0 {n}", "create_box 1 box",
              "create_atoms 1 box", "mass 1 63.546", "pair_style eam", "pair_coeff 1 1 Cu_u3.eam", "run 0"]:
        lmp.command(c)
    e = lmp.get_thermo("pe") / lmp.get_natoms(); lmp.close()
    return e

a = np.linspace(3.45, 3.80, 15)
E = np.array([energy(x) for x in a])
c = np.polyfit(a, E, 4)                               # quartic fit near the minimum
aa = np.linspace(a[0], a[-1], 2000); Ef = np.polyval(c, aa)
a0 = aa[np.argmin(Ef)]; E0 = Ef.min()
V = a ** 3 / 4                                         # volume per atom
cv = np.polyfit(V, E, 4); Vv = np.linspace(V[0], V[-1], 4000); Evv = np.polyval(cv, Vv)
V0 = Vv[np.argmin(Evv)]
d2 = np.polyval(np.polyder(cv, 2), V0)
B = V0 * d2 * 160.21766                                # eV/A^3 -> GPa
print(f"a0 = {a0:.4f} A   E_coh = {E0:.4f} eV/atom   B = {B:.1f} GPa")
print("a (A)   E (eV/atom)")
for x, e in zip(a[::2], E[::2]): print(f"{x:6.3f}  {e:9.5f}")
plt.figure(figsize=(5.2, 3.6)); plt.plot(a, E, "o"); plt.plot(aa, Ef, "-"); plt.axvline(a0, color="gray", ls=":")
plt.xlabel("lattice constant a (Å)"); plt.ylabel("energy per atom (eV)"); plt.tight_layout(); plt.savefig("cu_energy.png", dpi=130)
