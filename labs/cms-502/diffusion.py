"""Diffusion in a Lennard-Jones liquid by the Einstein (mean-square displacement) and Green-Kubo (velocity autocorrelation) relations; vibrational spectrum."""
import numpy as np
from lammps import lammps

T0, RHO, NC = 0.85, 0.8442, 5                       # 5^3 x 4 = 500 atoms
lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
a = (4 / RHO)**(1 / 3)
lmp.commands_list(["units lj", "atom_style atomic", "boundary p p p", f"lattice fcc {RHO}", f"region box block 0 {NC} 0 {NC} 0 {NC}", "create_box 1 box", "create_atoms 1 box", "mass 1 1.0",
                   "pair_style lj/cut 2.5", "pair_coeff 1 1 1.0 1.0", f"velocity all create {T0 * 2.0} 7777 loop geom", "neighbor 0.3 bin", "timestep 0.004", "thermo 100000",
                   "fix 1 all nvt temp 2.0 2.0 0.5", "run 3000", "unfix 1", f"fix 2 all nvt temp {T0} {T0} 0.5", "run 6000", "unfix 2", "fix 3 all nve", "run 3000"])
N = lmp.get_natoms(); L = lmp.extract_box()[1][0]
NF, SKIP = 12000, 5                                  # production frames, steps between frames
dt_f = 0.004 * SKIP
X = np.empty((NF, N, 3)); V = np.empty((NF, N, 3))
x_prev = np.array(lmp.gather_atoms("x", 1, 3)).reshape(-1, 3).copy(); unwrapped = x_prev.copy()
for f in range(NF):
    lmp.command(f"run {SKIP}")
    x = np.array(lmp.gather_atoms("x", 1, 3)).reshape(-1, 3).copy(); v = np.array(lmp.gather_atoms("v", 1, 3)).reshape(-1, 3).copy()
    dx = x - x_prev; dx -= L * np.round(dx / L); unwrapped = unwrapped + dx; x_prev = x.copy()
    X[f] = unwrapped; V[f] = v
lmp.close()
Tmeas = np.mean(V**2) * N / (N - 1)
print(f"{N} atoms, rho* = {RHO}, <T*> from the velocities = {Tmeas:.4f}, {NF} frames every {dt_f:.3f} time units (total {NF * dt_f:.0f})")

def msd(X, nlag, step=10):
    out = np.zeros(nlag); cnt = 0
    for t0 in range(0, len(X) - nlag, step):
        out += np.mean(np.sum((X[t0:t0 + nlag] - X[t0])**2, axis=2), axis=1); cnt += 1
    return out / cnt
def vacf(V, nlag, step=10):
    out = np.zeros(nlag); cnt = 0
    for t0 in range(0, len(V) - nlag, step):
        out += np.mean(np.sum(V[t0:t0 + nlag] * V[t0], axis=2), axis=1); cnt += 1
    return out / cnt
nlag = 500
t = np.arange(nlag) * dt_f
m = msd(X, nlag); c = vacf(V, nlag)
def D_einstein(m, t, t1=3.0, t2=8.0):
    sel = (t >= t1) & (t <= t2); return np.polyfit(t[sel], m[sel], 1)[0] / 6
def D_gk(c, t, tmax=4.0):
    sel = t <= tmax; return np.trapezoid(c[sel], t[sel]) / 3
print(f"Einstein: slope of the MSD between t = 3 and 8: D* = {D_einstein(m, t):.4f};  MSD(t = 1, 2, 4, 8) = " + ", ".join(f"{m[np.argmin(abs(t - x))]:.3f}" for x in (1, 2, 4, 8)))
print(f"Green-Kubo: integral of <v(0).v(t)>/3 up to t = 4: D* = {D_gk(c, t):.4f};  <v^2> = c(0)/3 = {c[0] / 3:.4f} (expected T* = {Tmeas:.4f});  running integral at t = 1, 2, 3, 4, 5: " + ", ".join(f"{np.trapezoid(c[t <= x], t[t <= x]) / 3:.4f}" for x in (1, 2, 3, 4, 5)))
print("block averages (4 blocks of 3000 frames):  D(Einstein) = " + ", ".join(f"{D_einstein(msd(X[i * 3000:(i + 1) * 3000], 400), t[:400]):.4f}" for i in range(4)) + ";  D(Green-Kubo) = " + ", ".join(f"{D_gk(vacf(V[i * 3000:(i + 1) * 3000], 400), t[:400]):.4f}" for i in range(4)))
cn = c / c[0]
imin = np.argmax(cn < 0); tmin = t[np.argmin(cn[:100])]
print(f"normalised VACF: first zero at t = {t[imin]:.3f}, minimum {cn[:100].min():.3f} at t = {tmin:.3f} (the 'cage effect': the atom rattles against its neighbours and its velocity reverses)")
# vibrational density of states: Fourier transform of the VACF (windowed)
w = np.hanning(2 * nlag)[nlag:]; spec = np.abs(np.fft.rfft(cn * w, n=8192)); freq = np.fft.rfftfreq(8192, dt_f) * 2 * np.pi
print(f"VDOS (Fourier transform of the VACF): zero-frequency value (proportional to D) = {spec[0] / spec.max():.3f} of the maximum, maximum at omega = {freq[np.argmax(spec)]:.2f} (Einstein-like cage frequency)")
