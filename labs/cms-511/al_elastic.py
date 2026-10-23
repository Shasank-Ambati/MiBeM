"""Elastic constants of aluminium from the energy of strained cells (PySCF, GTH-PBE, k = 6, Fermi-Dirac smearing 0.02 Ha)."""
import re, numpy as np
from pyscf.pbc import gto, dft
from pyscf.pbc.scf import addons
from ase.units import Bohr, GPa

HA = 27.211386
a0 = float(re.search(r"a0 = ([0-9.]+) A", open("out_al_pbe.txt").read()).group(1))
B = float(re.search(r"B = ([0-9.]+) GPa", open("out_al_pbe.txt").read()).group(1))
A0 = a0 / 2 * np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
def energy(eps, k=6):
    cell = gto.Cell(); cell.atom = "Al 0 0 0"; cell.a = A0 @ (np.eye(3) + eps).T
    cell.basis = "gth-dzvp"; cell.pseudo = "gth-pbe"; cell.verbose = 0; cell.unit = "A"; cell.build()
    kmf = dft.KRKS(cell, kpts=cell.make_kpts([k, k, k])); kmf.xc = "pbe"; kmf.conv_tol = 1e-9
    kmf = addons.smearing_(kmf, sigma=0.02, method="fermi"); kmf.kernel()
    return kmf.e_tot * HA, cell.vol * Bohr**3
def strain(kind, d):
    z = d * d / (1 - d * d)
    if kind == "tetragonal": return np.diag([d, -d, z])
    e = np.zeros((3, 3)); e[0, 1] = e[1, 0] = d; e[2, 2] = z; return e
print(f"a0 = {a0:.3f} A and B = {B:.1f} GPa from the equation of state (out_al_pbe.txt)")
res = {}
for kind in ("tetragonal", "shear"):
    ds = np.array([-0.008, -0.004, 0.0, 0.004, 0.008]); E = []
    for d in ds:
        e, V = energy(strain(kind, d)); E.append(e)
    E = np.array(E); V0 = energy(np.zeros((3, 3)))[1]
    c2 = np.polyfit(ds, E - E[2], 2)[0]          # E(d) - E(0) = c2 d^2   (eV per atom)
    res[kind] = c2 / V0 / GPa * 1.0
    print(f"{kind:10s}: E(delta) - E(0) = " + ", ".join(f"{(x - E[2]) * 1000:7.3f}" for x in E) + f" meV for delta = {', '.join(str(x) for x in ds)};  c2 = {c2 * 1000:.3f} meV")
Cp = res["tetragonal"] / 2                 # (C11 - C12) delta^2 per volume  ->  C11 - C12 = c2/V ; C' = (C11 - C12)/2
C44 = res["shear"] / 2                     # energy density 2 C44 delta^2
C12 = B - 2 / 3 * Cp; C11 = B + 4 / 3 * Cp
print(f"C' = (C11-C12)/2 = {Cp:.1f} GPa,  C44 = {C44:.1f} GPa")
print(f"C11 = {C11:.1f} GPa, C12 = {C12:.1f} GPa, C44 = {C44:.1f} GPa     (experiment at low temperature: 114, 62, 32 GPa; room temperature 108, 62, 28 GPa)")
print(f"Zener anisotropy ratio A = 2 C44/(C11 - C12) = {2 * C44 / (C11 - C12):.2f}   (experiment: 1.2)")
