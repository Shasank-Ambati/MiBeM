"""Numerical-integration grid and SCF threshold in a DFT calculation: error of the PBE energy of water against the grid level."""
import time
from pyscf import gto, dft
mol = gto.M(atom="O 0 0 0; H 0.7569 0.5859 0; H -0.7569 0.5859 0", basis="cc-pvtz", verbose=0)
def energy(level, conv=1e-10):
    ks = dft.RKS(mol); ks.xc = "pbe"; ks.grids.level = level; ks.conv_tol = conv
    t0 = time.time(); e = ks.kernel(); return e, time.time() - t0, ks.grids.size
ref, _, _ = energy(9)
print("PBE/cc-pVTZ energy of water against the grid level (the reference is level 9):")
print("  level   grid points   E (Ha)           E - E(9) (microHa)   time (s)")
for lv in (0, 1, 2, 3, 4, 5, 7, 9):
    e, t, n = energy(lv)
    print(f"   {lv}      {n:8d}     {e:14.8f}   {(e - ref) * 1e6:12.2f}       {t:5.1f}")
print("\nbad energy differences from a coarse grid: a rotated molecule has a different energy on a coarse grid (the grid is not rotationally invariant)")
import numpy as np
c = np.cos(np.radians(37.0)); s = np.sin(np.radians(37.0))
R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
xyz = np.array([[0, 0, 0], [0.7569, 0.5859, 0], [-0.7569, 0.5859, 0]]) @ R.T
mol_r = gto.M(atom=[("O", xyz[0]), ("H", xyz[1]), ("H", xyz[2])], basis="cc-pvtz", verbose=0)
for lv in (1, 3, 5):
    e1 = energy(lv)[0]
    ks = dft.RKS(mol_r); ks.xc = "pbe"; ks.grids.level = lv; ks.conv_tol = 1e-10; e2 = ks.kernel()
    print(f"   grid level {lv}: E(original) - E(rotated by 37 degrees) = {(e1 - e2) * 1e6:9.2f} microHa = {(e1 - e2) * 627509:7.4f} cal/mol")
