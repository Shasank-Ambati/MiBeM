"""The one-electron molecule H2+ stretched: Hartree-Fock is exact, approximate density functionals are not (delocalisation error)."""
from pyscf import gto, scf, dft
EV = 27.211386
BASIS = "aug-cc-pvqz"
def run(method, geom, charge, spin, guess="minao"):
    mol = gto.M(atom=geom, basis=BASIS, charge=charge, spin=spin, verbose=0)
    if method == "HF": mf = scf.UHF(mol)
    else:
        mf = dft.UKS(mol); mf.xc = {"LDA": "lda,vwn", "PBE": "pbe", "B3LYP": "b3lyp"}[method]; mf.grids.level = 5
    mf.conv_tol = 1e-10; mf.init_guess = guess; mf.max_cycle = 200; return mf.kernel()
def lowest(method, geom, charge, spin):
    """Several starting guesses give different self-consistent solutions for a stretched molecule: keep the lowest."""
    es = [run(method, geom, charge, spin, g) for g in ("minao", "1e")]
    return min(es), abs(es[0] - es[1])
methods = ["HF", "LDA", "PBE", "B3LYP"]
EH = {m: run(m, "H 0 0 0", 0, 1) for m in methods}
print("(each point is the lowest of two self-consistent solutions, found from the atomic-superposition and the core-Hamiltonian starting guesses; the last column shows how often the two differ)")
print("energy of H2+ relative to (H atom + proton) computed with the same method, in eV: exact value 0 at infinite separation")
print("   R (A)     HF        LDA       PBE      B3LYP")
for R in (0.8, 1.06, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0, 12.0):
    row = []; spread = 0.0
    for m in methods:
        e, d = lowest(m, f"H 0 0 0; H 0 0 {R}", 1, 1)
        row.append((e - EH[m]) * EV); spread = max(spread, d * EV)
    print(f"  {R:5.2f}   " + "  ".join(f"{x:8.3f}" for x in row) + (f"    (two different solutions, up to {spread:.2f} eV apart)" if spread > 0.01 else ""))
print("(H atom energies in Hartree: " + ", ".join(f"{m} {EH[m]:.5f}" for m in methods) + "; exact -0.5)")
