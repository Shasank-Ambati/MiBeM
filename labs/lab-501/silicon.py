"""Bulk silicon with periodic DFT in PySCF (Gaussian basis, GTH pseudopotential, PBE): k-points, basis set, lattice constant, bulk modulus and band gap."""
import numpy as np, time
from pyscf.pbc import gto, dft
from ase.eos import EquationOfState
from ase.units import Hartree, GPa

def make_cell(a, basis):
    cell = gto.Cell()
    cell.atom = [["Si", (0, 0, 0)], ["Si", (a / 4, a / 4, a / 4)]]                   # diamond structure, two atoms in the primitive cell
    cell.a = a / 2 * np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
    cell.basis = basis; cell.pseudo = "gth-pbe"; cell.verbose = 0; cell.build()
    return cell

def run(a, k, basis, xc="pbe"):
    cell = make_cell(a, basis)
    mf = dft.KRKS(cell, cell.make_kpts([k, k, k])).density_fit(); mf.xc = xc
    e = mf.kernel(); return cell, mf, e

print("1. k-point convergence (a = 5.43 A, basis gth-szv)")
print("   k mesh   k points   E per cell (Ha)   dE vs the densest (meV/atom)   time (s)")
res = {}
for k in (1, 2, 3, 4):
    t0 = time.time(); cell, mf, e = run(5.43, k, "gth-szv"); res[k] = (len(mf.kpts), e, time.time() - t0)
for k, (n, e, t) in res.items(): print("   %d x %d x %d   %4d     %14.6f        %8.2f                  %5.1f" % (k, k, k, n, e, 1000 * Hartree * (e - res[4][1]) / 2, t), flush=True)

print("\n2. equation of state and band gap")
for basis in ("gth-szv", "gth-dzvp"):
    t0 = time.time(); V, E = [], []
    for a in (5.30, 5.38, 5.46, 5.54, 5.62, 5.70):
        cell, mf, e = run(a, 3, basis); V.append(cell.vol); E.append(e * Hartree)
    v0, e0, B = EquationOfState(V, E, eos="birchmurnaghan").fit()
    a0 = (4 * v0) ** (1 / 3)
    cell, mf, e = run(a0, 4, basis)                                                 # gap at the fitted lattice constant, 4x4x4 mesh
    occ = cell.nelectron // 2; eps = np.array(mf.mo_energy_kpts)
    vbm = eps[:, occ - 1].max(); cbm = eps[:, occ].min(); kg = np.argmin(np.linalg.norm(mf.kpts, axis=1))
    print("   %-9s a0 = %.3f A   B = %5.1f GPa   gap on the 4x4x4 mesh = %.2f eV   direct gap at Gamma = %.2f eV   (%.0f s)" % (basis, a0, B / GPa, (cbm - vbm) * Hartree, (eps[kg, occ] - eps[kg, occ - 1]) * Hartree, time.time() - t0), flush=True)
print("   experiment: a0 = 5.431 A, B = 99 GPa, indirect gap 1.12 eV, direct gap at Gamma 3.4 eV")
