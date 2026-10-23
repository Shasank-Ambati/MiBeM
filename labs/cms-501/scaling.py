"""Cost of an SCF calculation against system size: linear chains of H2 molecules, cc-pVDZ, density fitting."""
import time, numpy as np
from pyscf import gto, scf, dft
print("   n(H2)   atoms   basis functions   t(HF) (s)   t(PBE) (s)   E(HF)/atom (Ha)")
nb, th, tp = [], [], []
for n in (2, 4, 8, 16, 24):
    atom = "; ".join(f"H 0 0 {1.5 * i * 1.0 + (0.74 if j else 0.0) :.3f}" for i in range(n) for j in range(2))
    mol = gto.M(atom=atom, basis="cc-pvdz", verbose=0, max_memory=8000)
    t0 = time.time(); mf = scf.RHF(mol).density_fit(); mf.conv_tol = 1e-7; e = mf.kernel(); t_hf = time.time() - t0
    t0 = time.time(); ks = dft.RKS(mol).density_fit(); ks.xc = "pbe"; ks.grids.level = 3; ks.conv_tol = 1e-7; ks.kernel(); t_ks = time.time() - t0
    nb.append(mol.nao); th.append(t_hf); tp.append(t_ks)
    print(f"   {n:4d}   {2 * n:4d}      {mol.nao:6d}        {t_hf:8.2f}    {t_ks:8.2f}      {e / (2 * n):10.5f}")
p_hf = np.polyfit(np.log(nb[1:]), np.log(th[1:]), 1)[0]; p_ks = np.polyfit(np.log(nb[1:]), np.log(tp[1:]), 1)[0]
print(f"exponent of the time against the number of basis functions (last four sizes): HF {p_hf:.2f}, PBE {p_ks:.2f}")
