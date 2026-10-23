"""First ionisation potential: -eps(HOMO) versus the energy difference E(cation) - E(neutral), per method."""
from pyscf import gto, scf, dft
EV = 27.211386
BASIS = "aug-cc-pvtz"
mols = {"H2O": ("O 0 0 0; H 0.7569 0.5859 0; H -0.7569 0.5859 0", 12.62), "N2": ("N 0 0 0; N 0 0 1.0977", 15.58), "CO": ("C 0 0 0; O 0 0 1.1283", 14.01)}
def calc(method, geom, charge, spin):
    mol = gto.M(atom=geom, basis=BASIS, charge=charge, spin=spin, verbose=0)
    if method == "HF": mf = scf.RHF(mol) if spin == 0 else scf.UHF(mol)
    else:
        mf = dft.RKS(mol) if spin == 0 else dft.UKS(mol)
        mf.xc = {"LDA": "lda,vwn", "PBE": "pbe", "B3LYP": "b3lyp"}[method]; mf.grids.level = 5
    mf.conv_tol = 1e-10; e = mf.kernel()
    return e, mf
print("first ionisation energy in eV (experimental vertical values: H2O 12.62, N2 15.58, CO 14.01)")
print("molecule   method   -eps(HOMO)   Delta-SCF   experiment")
for name, (geom, exp) in mols.items():
    for m in ("HF", "LDA", "PBE", "B3LYP"):
        e0, mf0 = calc(m, geom, 0, 0)
        homo = mf0.mo_energy[mf0.mo_occ > 0].max() * EV
        e1, _ = calc(m, geom, 1, 1)
        print(f"{name:5s}      {m:5s}   {-homo:8.2f}     {(e1 - e0) * EV:8.2f}     {exp:6.2f}")
