"""A restricted Hartree-Fock self-consistent-field loop written from scratch (integrals from PySCF), compared with pyscf.scf.RHF."""
import numpy as np
from pyscf import gto, scf

mol = gto.M(atom="O 0 0 0; H 0.7569 0.5859 0; H -0.7569 0.5859 0", basis="6-31g", verbose=0)
S = mol.intor("int1e_ovlp"); T = mol.intor("int1e_kin"); V = mol.intor("int1e_nuc"); eri = mol.intor("int2e")   # eri[p,q,r,s] = (pq|rs)
h = T + V; n = mol.nao; nocc = mol.nelectron // 2; Enuc = mol.energy_nuc()
print(f"water, 6-31G: {n} basis functions, {nocc} occupied orbitals, nuclear repulsion {Enuc:.6f} Ha")

# symmetric orthogonalisation
s, U = np.linalg.eigh(S); X = U @ np.diag(s**-0.5) @ U.T

def fock(D):
    J = np.einsum("pqrs,rs->pq", eri, D); K = np.einsum("prqs,rs->pq", eri, D)
    return h + 2 * J - K                                   # D = C_occ C_occ^T, closed shell
def energy(D, F): return np.sum(D * (h + F)) + Enuc
def density(F):
    e, Cp = np.linalg.eigh(X.T @ F @ X); C = X @ Cp
    return C[:, :nocc] @ C[:, :nocc].T, e

def scf_loop(mode, damp=0.5, maxit=100, tol=1e-9):
    D, _ = density(h)                                       # initial guess: core Hamiltonian
    E_old = 0.0; hist = []; errs = []; Fs = []
    for it in range(1, maxit + 1):
        F = fock(D); E = energy(D, F)
        err = X.T @ (F @ D @ S - S @ D @ F) @ X             # commutator FDS - SDF: zero at convergence
        if mode == "diis":
            Fs.append(F.copy()); errs.append(err.copy()); Fs, errs = Fs[-8:], errs[-8:]
            if len(Fs) > 1:
                m = len(Fs); B = -np.ones((m + 1, m + 1)); B[m, m] = 0
                for i in range(m):
                    for j in range(m): B[i, j] = np.sum(errs[i] * errs[j])
                rhs = np.zeros(m + 1); rhs[m] = -1; c = np.linalg.solve(B, rhs)[:m]
                F = sum(ci * Fi for ci, Fi in zip(c, Fs))
        Dn, eps = density(F)
        if mode == "damped": Dn = damp * D + (1 - damp) * Dn
        hist.append((it, E, np.linalg.norm(err)))
        if abs(E - E_old) < tol and np.linalg.norm(err) < 1e-6: return E, it, hist, eps
        E_old = E; D = Dn
    return E, maxit, hist, eps

ref = scf.RHF(mol).run()
print(f"pyscf.scf.RHF: E = {ref.e_tot:.9f} Ha in {ref.cycles} cycles\n")
print("our loop, plain iteration (core-Hamiltonian guess):  iteration   energy (Ha)         |FDS - SDF|")
E, it, hist, eps = scf_loop("plain")
for k, e, r in hist[:8] + hist[-3:]: print(f"                                                        {k:3d}     {e:16.9f}      {r:10.2e}")
print(f"   converged in {it} iterations, E = {E:.9f}, difference from pyscf {E - ref.e_tot:.1e} Ha")
for mode in ("damped", "diis"):
    E2, it2, _, _ = scf_loop(mode); print(f"   {mode:7s}: {it2:3d} iterations, E = {E2:.9f}, difference from pyscf {E2 - ref.e_tot:.1e} Ha")
print("\norbital energies (Ha) of our final iteration: " + " ".join(f"{e:8.4f}" for e in eps[: nocc + 3]) + "   (first 5 occupied, then virtual)")
print("pyscf orbital energies:                       " + " ".join(f"{e:8.4f}" for e in ref.mo_energy[: nocc + 3]))
print(f"HOMO energy = {eps[nocc - 1] * 27.2114:.2f} eV (Koopmans' estimate of the ionisation energy in this small basis)")
