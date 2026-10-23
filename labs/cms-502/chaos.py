"""Sensitivity to initial conditions: two copies of a Lennard-Jones liquid differing by 1e-10 in one coordinate (Lyapunov exponent)."""
import numpy as np
from lammps import lammps
def make():
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units lj", "atom_style atomic", "atom_modify map array sort 0 0.0", "boundary p p p", "lattice fcc 0.8442", "region box block 0 4 0 4 0 4", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                       "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "pair_modify shift yes", "velocity all create 0.85 4928 loop geom", "neighbor 0.3 bin", "timestep 0.002", "thermo 100000",
                       "fix 1 all nvt temp 0.85 0.85 0.5", "run 10000", "unfix 1", "fix 2 all nve"])
    return lmp
A = make(); B = make()
B.commands_list(["group first id 1", "displace_atoms first move 1e-10 0.0 0.0 units box"])
print("time   RMS distance between the two trajectories (configuration space)    ln(distance)")
ts, ds = [], []
for k in range(0, 1401):
    if k % 100 == 0:
        xa = np.array(A.gather_atoms("x", 1, 3)).reshape(-1, 3); xb = np.array(B.gather_atoms("x", 1, 3)).reshape(-1, 3)
        d = xa - xb; L = A.extract_box()[1][0]; d -= L * np.round(d / L); r = np.sqrt(np.mean(np.sum(d**2, axis=1)))
        ts.append(k * 0.002 * 10); ds.append(r)
        print(f"{ts[-1]:5.1f}   {r:.3e}      {np.log(r):8.3f}")
    A.command("run 10"); B.command("run 10")
ts, ds = np.array(ts), np.array(ds)
sel = (ds > 1e-9) & (ds < 0.3)
lam = np.polyfit(ts[sel], np.log(ds[sel]), 1)[0]
print(f"fit of ln(distance) against time in the exponential regime: largest Lyapunov exponent ~ {lam:.2f} per time unit (1 time unit = 2.16 ps for argon)")
print(f"the initial 1e-10 difference reaches the size of a particle (0.3) after ~ {np.log(0.3 / 1e-10) / lam:.0f} time units = {np.log(0.3 / 1e-10) / lam * 2.16:.0f} ps")
A.close(); B.close()
