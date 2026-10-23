"""Isothermal compressibility of a Lennard-Jones liquid from volume fluctuations in the NPT ensemble, compared with the equation of state from NVT runs."""
import numpy as np
from lammps import lammps
T0 = 0.85; N = 500
def nvt_pressure(rho, steps=40000):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", f"lattice fcc {rho}", "region box block 0 5 0 5 0 5", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                       "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "pair_modify tail yes", f"velocity all create {T0} 3281 loop geom", "neighbor 0.3 bin", "timestep 0.004", "thermo 100000",
                       f"fix 1 all nvt temp {T0} {T0} 0.5", "run 8000"])
    P = []
    for _ in range(steps // 20):
        lmp.command("run 20"); P.append(lmp.get_thermo("press"))
    lmp.close(); P = np.array(P); nb = 20; n = len(P) // nb
    return P.mean(), P[:n * nb].reshape(nb, n).mean(1).std(ddof=1) / np.sqrt(nb)
rhos = (0.8342, 0.8442, 0.8542)
Ps = [nvt_pressure(r) for r in rhos]
print("NVT equation of state at T* = 0.85 (500 atoms, with the tail correction of the cutoff):")
for r, (p, e) in zip(rhos, Ps): print(f"   rho* = {r:.4f}   P* = {p:7.4f} +- {e:.4f}")
dPdrho = (Ps[2][0] - Ps[0][0]) / (rhos[2] - rhos[0])
kappa_eos = 1 / (rhos[1] * dPdrho)
print(f"   dP/drho = {dPdrho:.3f}  ->  isothermal compressibility kappa_T = 1/(rho dP/drho) = {kappa_eos:.4f}  (in units of sigma^3/epsilon)")
P0 = Ps[1][0]
lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", "lattice fcc 0.8442", "region box block 0 5 0 5 0 5", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                   "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", "pair_modify tail yes", f"velocity all create {T0} 3281 loop geom", "neighbor 0.3 bin", "timestep 0.004", "thermo 100000",
                   f"fix 1 all nvt temp {T0} {T0} 0.5", "run 8000", "unfix 1", f"fix 2 all npt temp {T0} {T0} 0.5 iso {P0} {P0} 2.0", "run 20000"])
V = []
for _ in range(2000):
    lmp.command("run 20"); V.append(lmp.get_thermo("vol"))
lmp.close(); V = np.array(V); Vm = V.mean()
nb = 20; n = len(V) // nb
var = V.var(); kappa_fl = var / (T0 * Vm)
blocks = [np.var(V[i * n:(i + 1) * n]) / (T0 * V[i * n:(i + 1) * n].mean()) for i in range(nb)]
print(f"\nNPT run at P* = {P0:.3f}: <V> = {Vm:.2f} (rho = {N / Vm:.4f}), std(V) = {V.std():.3f}")
print(f"   kappa_T from the volume fluctuations <dV^2>/(kT <V>) = {kappa_fl:.4f} +- {np.std(blocks, ddof=1) / np.sqrt(nb):.4f}   (equation-of-state value {kappa_eos:.4f})")
