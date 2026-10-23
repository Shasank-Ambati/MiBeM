"""Thermostats compared: fluctuations of the kinetic energy of 256 Lennard-Jones atoms (T* = 0.85, rho* = 0.8442) in the NVE, Berendsen, Langevin and Nose-Hoover ensembles."""
import numpy as np
from lammps import lammps

N = 256; T0 = 0.85
def run(method, nprod=40000, nsample=10):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", "lattice fcc 1.0902", "region box block 0 4 0 4 0 4", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                       "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", f"velocity all create {T0} 4928 loop geom", "neighbor 0.3 bin", "timestep 0.004",
                       "thermo_style custom step temp ke pe etotal press", "thermo 100000"])
    # equilibrate in NVE-like fashion with velocity rescaling, then switch to the ensemble under test
    lmp.commands_list(["fix eq all nve", f"fix rs all temp/rescale 10 {T0} {T0} 0.02 1.0", "run 5000", "unfix rs", "unfix eq"])
    fixes = {"NVE (microcanonical)": ["fix 1 all nve"],
             "Berendsen (tau = 0.4)": ["fix 1 all nve", f"fix 2 all temp/berendsen {T0} {T0} 0.4"],
             "Langevin (damp = 0.4)": ["fix 1 all nve", f"fix 2 all langevin {T0} {T0} 0.4 2917"],
             "Nose-Hoover (tau = 0.4)": [f"fix 1 all nvt temp {T0} {T0} 0.4"]}[method]
    lmp.commands_list(fixes + ["run 5000"])                              # equilibration with the thermostat
    T, KE, PE = [], [], []
    for _ in range(nprod // nsample):
        lmp.command(f"run {nsample}")
        T.append(lmp.get_thermo("temp")); KE.append(lmp.get_thermo("ke")); PE.append(lmp.get_thermo("pe"))
    v = lmp.numpy.extract_atom("v").copy(); lmp.close()
    return np.array(T), np.array(KE), np.array(PE), v
print(f"N = {N} atoms; canonical prediction: relative standard deviation of the kinetic energy sqrt(2/(3N)) = {np.sqrt(2 / (3 * N)):.4f}  (sqrt(2/(3(N-1))) = {np.sqrt(2 / (3 * (N - 1))):.4f} with the centre-of-mass constraint)")
def block_error(x, nb=20):
    n = len(x) // nb; return x[:n * nb].reshape(nb, n).mean(1).std(ddof=1) / np.sqrt(nb)
print("ensemble                <T>      error of <T>   std(T)/<T>   ratio to canonical")
for m in ("NVE (microcanonical)", "Berendsen (tau = 0.4)", "Langevin (damp = 0.4)", "Nose-Hoover (tau = 0.4)"):
    T, KE, PE, v = run(m)
    rel = T.std() / T.mean(); canon = np.sqrt(2 / (3 * (N - 1)))
    print(f"{m:24s} {T.mean():7.4f}    {block_error(T):7.4f}      {rel:9.4f}      {rel / canon:8.3f}")
