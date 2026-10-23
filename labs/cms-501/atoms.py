"""Total energies of He, Be and Ne atoms: Hartree-Fock, three density functionals and coupled cluster, in a large basis."""
import time
from pyscf import gto, scf, dft, cc, fci

HA = 27.211386
exact = {"He": -2.903724, "Be": -14.667356, "Ne": -128.937620}      # non-relativistic exact energies (Chakravorty et al. 1993, Davidson et al.)
print("total energies in Hartree, basis aug-cc-pVQZ (He, Be) and cc-pVQZ (Ne); the 'exact' column is the non-relativistic limit from the literature")
print("atom   HF           LDA          PBE          B3LYP        CCSD(T)      exact        E_corr(exact-HF)   time (s)")
for sym, spin, basis in (("He", 0, "aug-cc-pvqz"), ("Be", 0, "aug-cc-pvqz"), ("Ne", 0, "cc-pvqz")):
    t0 = time.time()
    mol = gto.M(atom=f"{sym} 0 0 0", basis=basis, spin=spin, verbose=0)
    mf = scf.RHF(mol).run(); e_hf = mf.e_tot
    out = {}
    for name, xc in (("LDA", "lda,vwn"), ("PBE", "pbe"), ("B3LYP", "b3lyp")):
        ks = dft.RKS(mol); ks.xc = xc; ks.grids.level = 5; out[name] = ks.kernel()
    if sym == "He":
        e_cc = fci.FCI(mf).kernel()[0]
    else:
        mcc = cc.CCSD(mf).run(); e_cc = mcc.e_tot + mcc.ccsd_t()
    print(f"{sym:3s}  {e_hf:11.6f}  {out['LDA']:11.6f}  {out['PBE']:11.6f}  {out['B3LYP']:11.6f}  {e_cc:11.6f}  {exact[sym]:11.6f}   {exact[sym] - e_hf:10.6f}      {time.time() - t0:6.1f}")
