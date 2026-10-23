"""Pressure against density (isotherms of the Lennard-Jones fluid) from many short NVT runs."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from lammps import lammps

def pressure(T, rho):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    for c in ["units lj", "atom_style atomic", f"lattice fcc {rho}", "region box block 0 6 0 6 0 6", "create_box 1 box",
              "create_atoms 1 box", "mass 1 1.0", "pair_style lj/cut 3.0", "pair_coeff 1 1 1.0 1.0 3.0",
              "pair_modify tail yes", "neighbor 0.3 bin", "velocity all create 2.5 4928 dist gaussian", "timestep 0.004",
              "fix th all nvt temp 2.5 2.5 0.4", "run 3000",          # melt the starting lattice first
              f"fix th all nvt temp {T} {T} 0.4", "thermo_style custom step temp press", "run 6000",
              "fix av all ave/time 10 100 1000 c_thermo_press", "run 6000"]:
        lmp.command(c)
    p = lmp.extract_fix("av", 0, 0)           # last time-averaged pressure
    lmp.close()
    return p

fig, ax = plt.subplots(figsize=(5.8, 4))
for T in (0.85, 2.0):
    rhos = np.arange(0.1, 1.11, 0.1)
    P = [pressure(T, r) for r in rhos]
    print(f"T* = {T}")
    for r, p in zip(rhos, P):
        print(f"   rho* = {r:4.2f}   P* = {p:7.3f}   ideal gas rho*T* = {r * T:5.2f}")
    ax.plot(rhos, P, "o-", label=f"$T^*={T}$")
    ax.plot(rhos, rhos * T, ":", color=ax.lines[-1].get_color())
ax.set(xlabel=r"$\rho^*$", ylabel=r"$P^*$"); ax.axhline(0, color="k", lw=.5); ax.legend(); fig.tight_layout(); fig.savefig("eos.png", dpi=130)
