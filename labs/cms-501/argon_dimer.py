"""The argon dimer: dispersion is missing from semilocal DFT and Hartree-Fock; counterpoise-corrected interaction energies."""
import numpy as np
from pyscf import gto, scf, dft, mp, cc
MEV = 27211.386
BASIS = "aug-cc-pvtz"
def e_method(method, mol):
    if method in ("HF", "MP2", "CCSD(T)"):
        mf = scf.RHF(mol).run()
        if method == "HF": return mf.e_tot
        if method == "MP2": return mp.MP2(mf).run().e_tot
        m = cc.CCSD(mf).run(); return m.e_tot + m.ccsd_t()
    mf = dft.RKS(mol); mf.xc = {"LDA": "lda,vwn", "PBE": "pbe", "B3LYP": "b3lyp"}[method]; mf.grids.level = 5; return mf.kernel()
methods = ["HF", "LDA", "PBE", "B3LYP", "MP2", "CCSD(T)"]
mon = {m: e_method(m, gto.M(atom="Ar 0 0 0", basis=BASIS, verbose=0)) for m in methods}
print("counterpoise-corrected interaction energy E(Ar2) - 2 E(Ar in the dimer basis), meV   (experiment: minimum -12.3 meV at 3.76 A)")
print("  R (A)   " + "  ".join(f"{m:>8s}" for m in methods))
best = {m: (0.0, None) for m in methods}
for R in (3.0, 3.4, 3.76, 4.2, 4.6, 5.0, 6.0):
    dimer = f"Ar 0 0 0; Ar 0 0 {R}"
    ghost1 = f"Ar 0 0 0; ghost-Ar 0 0 {R}"
    row = []
    for m in methods:
        ed = e_method(m, gto.M(atom=dimer, basis=BASIS, verbose=0))
        eg = e_method(m, gto.M(atom=ghost1, basis=BASIS, verbose=0))      # monomer in the full dimer basis (counterpoise)
        e_int = (ed - 2 * eg) * MEV; row.append(e_int)
        if e_int < best[m][0]: best[m] = (e_int, R)
    print(f"  {R:5.2f}   " + "  ".join(f"{x:8.2f}" for x in row))
print("\nminimum on this grid:  " + "   ".join(f"{m} {best[m][0]:.1f} meV at {best[m][1]} A" for m in methods))
