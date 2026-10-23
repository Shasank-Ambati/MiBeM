"""Metallic aluminium with periodic DFT (PySCF, GTH-PBE pseudopotential, gth-dzvp basis): k points, smearing, equation of state."""
import time, numpy as np
from pyscf.pbc import gto, dft
from pyscf.pbc.scf import addons
from ase.eos import EquationOfState
from ase.units import Bohr, GPa

def make_cell(a):
    cell = gto.Cell()
    cell.atom = "Al 0 0 0"
    cell.a = a / 2 * np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
    cell.basis = "gth-dzvp"; cell.pseudo = "gth-pbe"; cell.verbose = 0; cell.unit = "A"
    cell.build(); return cell
def run(a, k, sigma):
    cell = make_cell(a)
    kmf = dft.KRKS(cell, kpts=cell.make_kpts([k, k, k])); kmf.xc = "pbe"; kmf.conv_tol = 1e-8
    kmf = addons.smearing_(kmf, sigma=sigma, method="fermi")
    kmf.kernel()
    return kmf.e_tot, kmf.e_free if hasattr(kmf, "e_free") else None, kmf.entropy if hasattr(kmf, "entropy") else None, cell.vol * Bohr**3, kmf
HA = 27.211386

print("1. convergence with the k mesh at a = 4.05 A, Fermi-Dirac smearing sigma = 0.01 Ha (0.27 eV):  energy per atom relative to the densest mesh")
print("    k mesh     k points    E_total (Ha)      E - E(k=12) (meV)   time (s)")
res = {}; tim = {}
for k in (4, 6, 8, 10, 12):
    t0 = time.time(); res[k] = run(4.05, k, 0.01)[0]; tim[k] = time.time() - t0
for k in (4, 6, 8, 10, 12):
    print(f"   {k:2d}x{k:2d}x{k:2d}     {k**3:5d}      {res[k]:14.8f}       {(res[k] - res[12]) * HA * 1000:8.1f}           {tim[k]:6.1f}")

print("\n2. effect of the smearing width at k = 10 (a = 4.05 A): total energy, free energy and entropy term")
print("    sigma (Ha)   sigma (eV)    E_total (Ha)      E_free (Ha)     -TS (meV)    E_free - E_total")
for sig in (0.005, 0.01, 0.02, 0.04):
    e, ef, s, v, kmf = run(4.05, 10, sig)
    print(f"      {sig:5.3f}       {sig * HA:5.3f}     {e:14.8f}   {ef if ef is not None else float('nan'):14.8f}   {(ef - e) * HA * 1000 if ef is not None else float('nan'):8.2f}")

print("\n3. equation of state, k = 10, sigma = 0.01 Ha (Birch-Murnaghan fit of the energy per atom against the volume per atom)")
alat = np.array([3.95, 4.00, 4.05, 4.10, 4.15, 4.20]); E = []; V = []
for a in alat:
    e, ef, s, v, _ = run(a, 10, 0.01); E.append(e * HA); V.append(v)
    print(f"   a = {a:.2f} A   V = {v:7.3f} A^3/atom   E = {e * HA:12.5f} eV")
v0, e0, B = EquationOfState(V, E, eos="birchmurnaghan").fit()
a0 = (4 * v0)**(1 / 3)
print(f"   fit: V0 = {v0:.3f} A^3, a0 = {a0:.3f} A, B = {B / GPa:.1f} GPa     (experiment at room temperature: a = 4.05 A, B = 76 GPa)")
