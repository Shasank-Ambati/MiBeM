"""Hydrogen molecule: dissociation curve with restricted and unrestricted Hartree-Fock, DFT (LDA, PBE) and the exact answer (full CI), basis cc-pVTZ."""
import numpy as np
from pyscf import gto, scf, dft, fci

BASIS = "cc-pvtz"
def molecule_energies(r):
    mol = gto.M(atom=f"H 0 0 0; H 0 0 {r}", basis=BASIS, verbose=0)
    rhf = scf.RHF(mol).run()
    out = {"RHF": rhf.e_tot}
    # unrestricted solution started from a broken-symmetry guess: extra alpha density on atom 0 and extra beta density on atom 1
    uhf = scf.UHF(mol); dm = np.array(uhf.get_init_guess())
    idx = mol.search_ao_label("0 H 1s")[0], mol.search_ao_label("1 H 1s")[0]
    dm[0][idx[0], idx[0]] += 0.5; dm[1][idx[1], idx[1]] += 0.5
    out["UHF"] = uhf.run(dm).e_tot
    for name, xc in (("LDA", "lda,vwn"), ("PBE", "pbe,pbe")):
        ks = dft.RKS(mol); ks.xc = xc; out[name] = ks.run().e_tot
    out["FCI"] = fci.FCI(rhf).kernel()[0]                 # exact within the basis (two electrons)
    return out

def atom_energies():
    atom = gto.M(atom="H 0 0 0", basis=BASIS, spin=1, verbose=0)
    out = {"RHF": scf.UHF(atom).run().e_tot}              # for one electron, UHF is exact in the basis; RHF is not defined for an open shell
    out["UHF"] = out["RHF"]
    for name, xc in (("LDA", "lda,vwn"), ("PBE", "pbe,pbe")):
        ks = dft.UKS(atom); ks.xc = xc; out[name] = ks.run().e_tot
    out["FCI"] = out["UHF"]
    return out

methods = ["RHF", "UHF", "LDA", "PBE", "FCI"]
rs = [0.5, 0.6, 0.7, 0.74, 0.8, 1.0, 1.5, 2.0, 3.0, 5.0]
print("  r (A)     RHF         UHF         LDA         PBE      exact (FCI)      [Hartree]")
rows = []
for r in rs:
    e = molecule_energies(r); rows.append([e[m] for m in methods])
    print("  %4.2f  " % r + "".join("%11.6f " % v for v in rows[-1]))
rows = np.array(rows); eh = atom_energies()
print("\nenergy of one H atom (open-shell, same method):  " + "  ".join("%s %.6f" % (m, eh[m]) for m in methods))
print("exact hydrogen atom: -0.500000 Ha\n")
print("method   E_min(H2) (Ha)   r_min on the grid (A)   D_e = 2E(H) - E_min (eV)")
for k, m in enumerate(methods):
    i = rows[:, k].argmin(); print("  %-4s    %10.6f           %.2f                  %5.2f" % (m, rows[i, k], rs[i], (2 * eh[m] - rows[i, k]) * 27.2114))
print("experiment: r_e = 0.741 A, D_e = 4.75 eV (with zero-point energy removed)")
