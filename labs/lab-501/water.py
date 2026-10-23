"""Water molecule: basis-set convergence, geometry optimisation and the dependence on the functional."""
import numpy as np, time
from pyscf import gto, scf, dft
from pyscf.geomopt.geometric_solver import optimize

exp_geom = "O 0 0 0.1173; H 0 0.7572 -0.4692; H 0 -0.7572 -0.4692"      # experimental: r(OH) = 0.9572 A, angle 104.52 deg
def build(basis, atom=exp_geom): return gto.M(atom=atom, basis=basis, verbose=0)

print("1. basis-set convergence at the experimental geometry (PBE)")
print("   basis        functions   E (Hartree)     E - E(QZ) (mHa)   time (s)")
res = {}
for b in ("sto-3g", "6-31g", "cc-pvdz", "cc-pvtz", "cc-pvqz"):
    t0 = time.time(); mol = build(b); mf = dft.RKS(mol); mf.xc = "pbe,pbe"; e = mf.run().e_tot; res[b] = (mol.nao, e, time.time() - t0)
for b, (n, e, t) in res.items(): print("   %-10s   %5d     %12.6f     %10.2f         %5.1f" % (b, n, e, 1000 * (e - res["cc-pvqz"][1]), t))

def geometry(mol):
    c = mol.atom_coords(unit="Angstrom"); v1, v2 = c[1] - c[0], c[2] - c[0]
    r = np.linalg.norm(v1); ang = np.degrees(np.arccos(v1 @ v2 / np.linalg.norm(v1) / np.linalg.norm(v2))); return r, ang

print("\n2. geometry optimisation with cc-pVTZ")
print("   method     r(OH) (A)   angle (deg)   E (Hartree)")
for name, kind in (("HF", None), ("LDA", "lda,vwn"), ("PBE", "pbe,pbe"), ("B3LYP", "b3lyp")):
    mol0 = build("cc-pvtz", "O 0 0 0; H 0 0.76 0.59; H 0 -0.76 0.59")                       # a rough starting structure
    mf = scf.RHF(mol0) if kind is None else dft.RKS(mol0)
    if kind is not None: mf.xc = kind
    mol = optimize(mf, maxsteps=50)
    mf2 = scf.RHF(mol) if kind is None else dft.RKS(mol)
    if kind is not None: mf2.xc = kind
    e = mf2.run().e_tot; r, ang = geometry(mol); print("   %-7s    %.4f      %6.2f     %12.6f" % (name, r, ang, e))
print("experiment    0.9572      104.52")
