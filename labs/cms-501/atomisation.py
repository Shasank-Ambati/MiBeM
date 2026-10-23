"""Atomisation energies of small molecules (experimental geometries, cc-pVTZ): Hartree-Fock, DFT and CCSD(T)."""
import time
from pyscf import gto, scf, dft, cc

EV = 27.211386
BASIS = "cc-pvtz"
atoms = {"H": ("H 0 0 0", 1), "C": ("C 0 0 0", 2), "N": ("N 0 0 0", 3), "O": ("O 0 0 0", 2)}
mols = {   # name: (geometry, spin = number of unpaired electrons, atoms)
    "H2":  ("H 0 0 0; H 0 0 0.7414", 0, ["H", "H"]),
    "N2":  ("N 0 0 0; N 0 0 1.0977", 0, ["N", "N"]),
    "CO":  ("C 0 0 0; O 0 0 1.1283", 0, ["C", "O"]),
    "O2":  ("O 0 0 0; O 0 0 1.2075", 2, ["O", "O"]),
    "H2O": ("O 0 0 0; H 0.7569 0.5859 0; H -0.7569 0.5859 0", 0, ["O", "H", "H"]),
    "CH4": ("C 0 0 0; H 0.6291 0.6291 0.6291; H -0.6291 -0.6291 0.6291; H -0.6291 0.6291 -0.6291; H 0.6291 -0.6291 -0.6291", 0, ["C", "H", "H", "H", "H"]),
}
methods = ["HF", "LDA", "PBE", "B3LYP", "CCSD(T)"]

def energy(geom, spin, method):
    mol = gto.M(atom=geom, basis=BASIS, spin=spin, verbose=0)
    if method == "HF" or method == "CCSD(T)":
        mf = (scf.RHF(mol) if spin == 0 else scf.UHF(mol)); mf.conv_tol = 1e-10; mf.run()
        if method == "HF": return mf.e_tot
        m = cc.CCSD(mf).run(); return m.e_tot + m.ccsd_t()
    mf = (dft.RKS(mol) if spin == 0 else dft.UKS(mol)); mf.xc = {"LDA": "lda,vwn", "PBE": "pbe", "B3LYP": "b3lyp"}[method]
    mf.grids.level = 5; mf.conv_tol = 1e-10; return mf.kernel()

t0 = time.time()
Eat = {m: {k: energy(g, s, m) for k, (g, s) in atoms.items()} for m in methods}
print(f"atomisation energies D_e = sum E(atoms) - E(molecule) in eV (no zero-point energy), basis {BASIS}, fixed experimental geometries")
print("molecule     HF      LDA     PBE    B3LYP   CCSD(T)     LDA-CC   PBE-CC  B3LYP-CC   HF-CC")
errs = {m: [] for m in methods}
for name, (geom, spin, comp) in mols.items():
    d = {}
    for m in methods:
        e_mol = energy(geom, spin, m)
        d[m] = (sum(Eat[m][a] for a in comp) - e_mol) * EV
    for m in methods: errs[m].append(d[m] - d["CCSD(T)"])
    print(f"{name:5s}    {d['HF']:7.3f} {d['LDA']:7.3f} {d['PBE']:7.3f} {d['B3LYP']:7.3f} {d['CCSD(T)']:8.3f}     {d['LDA']-d['CCSD(T)']:6.3f}  {d['PBE']-d['CCSD(T)']:6.3f}  {d['B3LYP']-d['CCSD(T)']:7.3f}  {d['HF']-d['CCSD(T)']:7.3f}")
import numpy as np
print("mean absolute error against CCSD(T) (eV):  " + "   ".join(f"{m} {np.mean(np.abs(errs[m])):.3f}" for m in methods[:-1]))
print(f"total time {time.time() - t0:.0f} s")
