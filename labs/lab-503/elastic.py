"""Elastic constants C11, C12, C44 of Cu from the stresses of small strains (EAM, 0 K), with the checks that go with them."""
from lammps import lammps

def stresses(cmds, a=3.6149, n=4):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    for c in ["units metal", "atom_style atomic", f"lattice fcc {a}", f"region box block 0 {n} 0 {n} 0 {n}", "create_box 1 box",
              "create_atoms 1 box", "mass 1 63.546", "pair_style eam", "pair_coeff 1 1 Cu_u3.eam"] + cmds + ["run 0"]:
        lmp.command(c)
    p = [lmp.get_thermo(k) for k in ("pxx", "pyy", "pzz", "pxy", "pxz", "pyz")]
    ly = lmp.get_thermo("ly"); lmp.close()
    return [-x / 1e4 for x in p], ly           # stress in GPa (sigma = -pressure; 1 bar = 1e-4 GPa)

s0, ly = stresses([])
print(f"reference stress (should be ~0):  sxx = {s0[0]:.3f} GPa")
for e in (0.001, 0.002, 0.004):
    sp, _ = stresses([f"change_box all x scale {1 + e} remap"])
    sm, _ = stresses([f"change_box all x scale {1 - e} remap"])
    C11 = (sp[0] - sm[0]) / (2 * e); C12 = (sp[1] - sm[1]) / (2 * e)
    st, ly = stresses(["change_box all triclinic", f"change_box all xy delta {e * 4 * 3.6149} remap units box"])
    C44 = abs(st[3]) / e
    print(f"strain {e:5.3f}:  C11 = {C11:6.1f}   C12 = {C12:6.1f}   C44 = {C44:5.1f}  GPa")
B = (C11 + 2 * C12) / 3; A = 2 * C44 / (C11 - C12)
print(f"bulk modulus B = (C11+2C12)/3 = {B:.1f} GPa    Zener anisotropy A = 2C44/(C11-C12) = {A:.2f}    Cauchy pressure C12-C44 = {C12 - C44:.1f} GPa")
