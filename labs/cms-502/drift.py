"""Energy conservation of velocity Verlet in LAMMPS: Lennard-Jones liquid, 256 atoms, T* = 0.85, rho* = 0.8442, for several time steps."""
import numpy as np
from lammps import lammps
print("   dt     std(E)/N      drift of E/N per 1000 time units   <T>      max |E - E0|/N")
for dt in (0.002, 0.004, 0.008, 0.012, 0.016, 0.024):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", "lattice fcc 0.8442", "region box block 0 4 0 4 0 4", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                       "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "pair_modify shift yes", "velocity all create 1.0 4928 loop geom", "neighbor 0.3 bin", "neigh_modify every 1 delay 0 check yes",
                       f"timestep {dt}", "thermo 100000", "fix 1 all nvt temp 0.85 0.85 0.5", f"run {int(round(20.0 / dt))}", "unfix 1", "fix 2 all nve", f"run {int(round(4.0 / dt))}"])
    nsteps = int(round(400.0 / dt)); every = max(1, int(round(0.4 / dt)))
    E, T = [], []
    try:
        for _ in range(nsteps // every):
            lmp.command(f"run {every}"); E.append(lmp.get_thermo("etotal")); T.append(lmp.get_thermo("temp"))
    except Exception as exc:
        print(f"{dt:6.3f}   the simulation crashed: {str(exc).splitlines()[0]}"); lmp.close(); continue
    E = np.array(E); t = np.arange(len(E)) * every * dt
    slope = np.polyfit(t, E, 1)[0] * 1000
    print(f"{dt:6.3f}   {E.std():.2e}      {slope:+.2e}                       {np.mean(T):.4f}   {np.max(np.abs(E - E[0])):.2e}")
    lmp.close()
print("(lj units: 'etotal' is normalised per atom; the pair energy is shifted to be continuous at the cutoff, the force is not)")
