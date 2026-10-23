"""Reference for lj_mc.py: molecular dynamics (LAMMPS, Nose-Hoover NVT) of the same Lennard-Jones state point."""
import numpy as np
from lammps import lammps
N, rho, T = 256, 0.8442, 0.85
lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", f"lattice fcc {rho}", "region box block 0 4 0 4 0 4", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                   "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "pair_modify tail yes", f"velocity all create {T} 4928 loop geom", "neighbor 0.3 bin", "timestep 0.004", "thermo 100000",
                   f"fix 1 all nvt temp {T} {T} 0.5", "run 10000"])
E, P = [], []
for _ in range(4000):
    lmp.command("run 20"); E.append(lmp.get_thermo("pe")); P.append(lmp.get_thermo("press"))
lmp.close(); E = np.array(E); P = np.array(P); nb = 20; n = len(E) // nb
blk = lambda v: v[:n * nb].reshape(nb, n).mean(1).std(ddof=1) / np.sqrt(nb)
print(f"MD (Nose-Hoover NVT, {len(E) * 20} steps of 0.004): <U>/N = {E.mean():.4f} +- {blk(E):.4f};  P = {P.mean():.4f} +- {blk(P):.4f}")
np.savetxt("lj_md_result.txt", [E.mean(), blk(E), P.mean(), blk(P)])
