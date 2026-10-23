"""Cost of molecular dynamics: time per atom and step for a Lennard-Jones liquid and for copper (EAM), one core, against the number of atoms and the neighbour-list skin."""
import time, numpy as np
from lammps import lammps
def run(style, ncell, steps, skin=None):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    if style == "LJ":
        cmds = ["units lj", "atom_style atomic", "boundary p p p", "lattice fcc 0.8442", f"region box block 0 {ncell} 0 {ncell} 0 {ncell}", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "velocity all create 0.85 4928 loop geom", f"neighbor {skin or 0.3} bin", "timestep 0.004"]
    else:
        cmds = ["units metal", "atom_style atomic", "boundary p p p", "lattice fcc 3.615", f"region box block 0 {ncell} 0 {ncell} 0 {ncell}", "create_box 1 box", "create_atoms 1 box", "mass 1 63.546",
                "pair_style eam", "pair_coeff 1 1 Cu_u3.eam", "velocity all create 300 4928 loop geom", f"neighbor {skin or 1.0} bin", "timestep 0.002"]
    lmp.commands_list(cmds + ["thermo 100000", "fix 1 all nve", "run 200"])
    t0 = time.perf_counter(); lmp.command(f"run {steps}"); dt = time.perf_counter() - t0
    n = lmp.get_natoms(); lmp.close(); return n, dt
print("system   atoms   steps   wall time (s)   microseconds per atom and step    steps/s")
for style, cells, steps in (("LJ", (3, 4, 6, 8, 10, 14), 1000), ("Cu EAM", (3, 4, 6, 8, 10, 14), 500)):
    for c in cells:
        n, t = run("LJ" if style == "LJ" else "Cu", c, steps)
        print(f"{style:7s} {n:6d}  {steps:5d}   {t:8.2f}        {t / (n * steps) * 1e6:8.3f}                    {steps / t:8.1f}")
print("\nneighbour-list skin (LJ, 1372 atoms of 7^3 cells; the list is rebuilt when an atom has moved half the skin):")
print("  skin   wall time for 2000 steps (s)")
for skin in (0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1.2):
    n, t = run("LJ", 7, 2000, skin); print(f"  {skin:4.2f}     {t:7.2f}")
