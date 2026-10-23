"""How big can the time step be?  Measure energy conservation in NVE for several time steps."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from lammps import lammps

def setup(lmp, T=0.85, rho=0.8442):
    for c in ["units lj", "atom_style atomic", f"lattice fcc {rho}", "region box block 0 6 0 6 0 6", "create_box 1 box",
              "create_atoms 1 box", "mass 1 1.0", "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0 2.5",
              "neighbor 0.3 bin", f"velocity all create {T} 12345 dist gaussian", "timestep 0.004",
              f"fix th all nvt temp {T} {T} 0.4", "run 5000", "unfix th", "fix mv all nve"]:
        lmp.command(c)

t_total = 8.0                      # same physical time for every run (reduced units)
print(" dt      steps   drift of E_tot per unit time   fluctuation (std of E_tot)")
results = []
for dt in [0.001, 0.004, 0.008, 0.012, 0.016, 0.024]:
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    setup(lmp)
    lmp.command(f"timestep {dt}")
    n = int(round(t_total / dt))
    E, t = [], []
    for k in range(40):                              # 40 samples
        lmp.command(f"run {n // 40} pre no post no")
        E.append(lmp.get_thermo("etotal")); t.append((k + 1) * t_total / 40)
    E = np.array(E)
    drift = np.polyfit(t, E, 1)[0]
    results.append((dt, drift, E.std()))
    print(f" {dt:5.3f}  {n:6d}   {drift:+.2e}                    {E.std():.2e}")
    lmp.close()
r = np.array(results)
plt.figure(figsize=(5.5, 3.8)); plt.loglog(r[:, 0], np.abs(r[:, 1]), "o-", label="|drift| per unit time"); plt.loglog(r[:, 0], r[:, 2], "s--", label="std of $E_{tot}$")
plt.xlabel(r"time step $\Delta t^*$"); plt.ylabel("energy error (reduced units)"); plt.legend(); plt.tight_layout(); plt.savefig("dt.png", dpi=130)
