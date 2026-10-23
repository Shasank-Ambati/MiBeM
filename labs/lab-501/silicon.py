"""Bulk silicon with periodic DFT in PySCF (Gaussian basis, GTH-PBE pseudopotential, PBE): k points, lattice constant, bulk modulus and band gap."""
import numpy as np, time
from pyscf.pbc import gto, dft
from ase.eos import EquationOfState
from ase.units import Hartree, GPa, Bohr

def make_cell(a, basis="gth-dzvp"):
    cell = gto.Cell()
    cell.atom = [["Si", (0, 0, 0)], ["Si", (a / 4, a / 4, a / 4)]]                   # diamond structure, two atoms in the primitive cell
    cell.a = a / 2 * np.array([[0, 1, 1], [1, 0, 1], [1, 1, 0]])
    cell.basis = basis; cell.pseudo = "gth-pbe"; cell.verbose = 0; cell.build()
    return cell

def run(a, k, basis="gth-dzvp"):
    cell = make_cell(a, basis)
    mf = dft.KRKS(cell, cell.make_kpts([k, k, k])); mf.xc = "pbe"; mf.conv_tol = 1e-8
    mf.kernel(); return cell, mf

if __name__ == "__main__":
    print("1. k-point convergence (a = 5.43 A, basis gth-dzvp)")
    print("   k mesh   k points   E per cell (Ha)   E - E(k=5)  (meV/atom)   time (s)")
    res = {}
    for k in (2, 3, 4, 5):
        t0 = time.time(); cell, mf = run(5.43, k); res[k] = (len(mf.kpts), mf.e_tot, time.time() - t0)
        print("   %d x %d x %d   %4d     %14.6f" % (k, k, k, res[k][0], res[k][1]), flush=True)
    print("\n   (differences from the densest mesh)")
    for k, (n, e, t) in res.items(): print("   %d x %d x %d   %4d   %8.1f meV/atom   %5.0f s" % (k, k, k, n, 1000 * Hartree * (e - res[5][1]) / 2, t))

    print("\n2. equation of state (k = 4)")
    V, E = [], []
    for a in (5.33, 5.38, 5.43, 5.48, 5.53, 5.58):
        cell, mf = run(a, 4); V.append(cell.vol * Bohr**3); E.append(mf.e_tot * Hartree)      # PySCF volumes are in bohr^3
        print("   a = %.2f A   V = %7.3f A^3   E = %.5f eV" % (a, V[-1], E[-1]), flush=True)
    v0, e0, B = EquationOfState(V, E, eos="birchmurnaghan").fit()
    a0 = (4 * v0) ** (1 / 3)
    print("   Birch-Murnaghan fit: a0 = %.3f A   B = %.1f GPa     (experiment: 5.431 A, 99 GPa)" % (a0, B / GPa))

    print("\n3. band gap at the fitted lattice constant")
    cell, mf = run(a0, 4)
    occ = cell.nelectron // 2
    # non-self-consistent bands along Gamma -> X (scaled coordinates of the reciprocal lattice)
    path = np.array([[0, 0, 0]]) + np.linspace(0, 1, 41)[:, None] * np.array([[0.5, 0, 0.5]])
    eps = np.array(mf.get_bands(cell.get_abs_kpts(path))[0])
    vbm = eps[:, occ - 1].max(); cbm = eps[:, occ].min(); i = eps[:, occ].argmin()
    print("   a0 = %.3f A:  valence-band maximum at Gamma, conduction-band minimum at %.2f of the way from Gamma to X" % (a0, i / 40))
    print("   indirect gap = %.2f eV ; direct gap at Gamma = %.2f eV   (experiment: 1.12 eV and 3.4 eV)" % ((cbm - vbm) * Hartree, (eps[0, occ] - eps[0, occ - 1]) * Hartree))
