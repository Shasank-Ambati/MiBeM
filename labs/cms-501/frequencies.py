"""Harmonic vibrational frequencies of water by Hartree-Fock and DFT at the optimised geometry (cc-pVTZ)."""
import numpy as np
from pyscf import gto, scf, dft
import sys, os, io, contextlib
from pyscf.geomopt.geometric_solver import optimize
from pyscf.hessian import thermo
CM = 219474.63
def run(method):
    mol = gto.M(atom="O 0 0 0; H 0.7569 0.5859 0; H -0.7569 0.5859 0", basis="cc-pvtz", verbose=0)
    if method == "HF": mf = scf.RHF(mol)
    else:
        mf = dft.RKS(mol); mf.xc = {"LDA": "lda,vwn", "PBE": "pbe", "B3LYP": "b3lyp"}[method]; mf.grids.level = 5
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):     # geomeTRIC writes a long banner and log
        mol_eq = optimize(mf, maxsteps=100)
    mf2 = (scf.RHF(mol_eq) if method == "HF" else dft.RKS(mol_eq))
    if method != "HF": mf2.xc = mf.xc; mf2.grids.level = 5
    mf2.conv_tol = 1e-11; mf2.kernel()
    h = mf2.Hessian().kernel()
    res = thermo.harmonic_analysis(mol_eq, h)
    f = np.sort(res["freq_wavenumber"])
    xyz = mol_eq.atom_coords() * 0.529177
    r = np.linalg.norm(xyz[1] - xyz[0]); a = np.degrees(np.arccos(np.dot(xyz[1] - xyz[0], xyz[2] - xyz[0]) / (r * np.linalg.norm(xyz[2] - xyz[0]))))
    return r, a, f
print("harmonic frequencies (cm^-1) of H2O: bend, symmetric stretch, asymmetric stretch; experimental harmonic values 1649, 3832, 3943 (anharmonic fundamentals 1595, 3657, 3756)")
print("method    r(OH) (A)  angle     bend    sym.str.  asym.str.")
for m in ("HF", "LDA", "PBE", "B3LYP"):
    r, a, f = run(m)
    print(f"{m:6s}    {r:7.4f}   {a:6.2f}   {f[0]:7.1f}  {f[1]:7.1f}  {f[2]:7.1f}")
