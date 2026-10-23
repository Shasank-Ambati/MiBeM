"""Check the numerics: how do the cutoff and the system size change the results?  (liquid, T*=0.85, rho*=0.8442)"""
import numpy as np
from lammps import lammps

def run(n_cells, rc, tail=False, T=0.85, rho=0.8442):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    for c in ["units lj", "atom_style atomic", f"lattice fcc {rho}", f"region box block 0 {n_cells} 0 {n_cells} 0 {n_cells}", "create_box 1 box",
              "create_atoms 1 box", "mass 1 1.0", f"pair_style lj/cut {rc}", f"pair_coeff 1 1 1.0 1.0 {rc}",
              "pair_modify tail yes" if tail else "pair_modify tail no", "neighbor 0.3 bin", f"velocity all create {T} 12345 dist gaussian",
              "timestep 0.004", f"fix th all nvt temp {T} {T} 0.4", "run 4000", "compute m all msd"]:
        lmp.command(c)
    # production: 10000 steps; MSD is measured from the configuration at the start of this stage
    P, PE, t, M = [], [], [], []
    for k in range(50):
        lmp.command("run 200 post no")
        P.append(lmp.get_thermo("press")); PE.append(lmp.get_thermo("pe")); M.append(lmp.extract_compute("m", 0, 1)[3]); t.append((k + 1) * 200 * 0.004)
    N = int(lmp.get_natoms()); lmp.close()
    m = np.array(t) > 0.25 * t[-1]
    D = np.polyfit(np.array(t)[m], np.array(M)[m], 1)[0] / 6
    return N, np.mean(P), np.mean(PE), D

print("cutoff study (6x6x6 cells, 864 atoms)")
for rc, tail in [(2.0, False), (2.5, False), (2.5, True), (3.5, False), (3.5, True), (5.0, False)]:
    N, P, PE, D = run(6, rc, tail)
    print(f"  rc = {rc:3.1f} sigma, tail correction {'yes' if tail else 'no ':3s}:  <P*> = {P:6.3f}   <U*>/N = {PE:7.4f}   D* = {D:.4f}")
print("system-size study (rc = 2.5)")
for n in (3, 4, 6, 8):
    N, P, PE, D = run(n, 2.5)
    print(f"  N = {N:5d}:  <P*> = {P:6.3f}   <U*>/N = {PE:7.4f}   D* = {D:.4f}")
