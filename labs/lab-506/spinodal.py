"""Spinodal decomposition: Cahn-Hilliard equation in 2D with FiPy (mixed form, two coupled equations)."""
import numpy as np, time
import fipy as fp

nx = ny = 64; dx = 1.0
mesh = fp.PeriodicGrid2D(nx=nx, ny=ny, dx=dx, dy=dx)
c_alpha, c_beta, rho, kappa, M = 0.3, 0.7, 5.0, 2.0, 5.0     # equilibrium compositions, barrier, gradient coefficient, mobility
c0 = 0.5
np.random.seed(1)
c = fp.CellVariable(mesh=mesh, name="c", hasOld=True, value=c0 + 0.02 * (np.random.random(nx * ny) - 0.5))
psi = fp.CellVariable(mesh=mesh, name="psi", value=0.0)       # chemical potential

f = rho * (c - c_alpha) ** 2 * (c_beta - c) ** 2             # bulk free-energy density: double well
dfdc = 2 * rho * (c - c_alpha) * (c_beta - c) * (c_alpha + c_beta - 2 * c)
d2fdc2 = 2 * rho * ((c_alpha + c_beta - 2 * c) ** 2 - 2 * (c - c_alpha) * (c_beta - c))
eq1 = fp.TransientTerm(var=c) == fp.DiffusionTerm(coeff=M, var=psi)
eq2 = fp.ImplicitSourceTerm(coeff=1, var=psi) == fp.ImplicitSourceTerm(coeff=d2fdc2, var=c) - d2fdc2 * c + dfdc - fp.DiffusionTerm(coeff=kappa, var=c)
eq = eq1 & eq2
solver = fp.LinearLUSolver(tolerance=1e-10)          # direct solver: much faster than the default iterative solver for this coupled system

def free_energy():
    gx, gy = c.grad.value
    return float(np.mean(f.value + 0.5 * kappa * (gx**2 + gy**2)))
def length_scale():
    """Characteristic wavelength from the first moment of the structure factor."""
    a = c.value.reshape(ny, nx) - c.value.mean()
    S = np.abs(np.fft.fft2(a)) ** 2
    kx, ky = np.meshgrid(2 * np.pi * np.fft.fftfreq(nx, dx), 2 * np.pi * np.fft.fftfreq(ny, dx))
    k = np.hypot(kx, ky); S[0, 0] = 0
    return 2 * np.pi * S.sum() / (k * S).sum()

print("   time      dt      mean c    <c^2>-c0^2   free energy    wavelength   sweeps  wall (s)")
t, dt, tmax, t0 = 0.0, 0.02, 1000.0, time.time()
out = [0.1, 1, 3, 10, 30, 100, 300, 1000]
snaps = {}
while t < tmax:
    c.updateOld(); res, sweeps = 1e10, 0
    while res > 1e-3 and sweeps < 12:
        res = eq.sweep(dt=dt, solver=solver); sweeps += 1
    t += dt
    if out and t >= out[0]:
        print("  %7.1f  %6.3f   %.6f   %.5f     %.5f      %6.2f      %3d     %.1f" % (t, dt, c.value.mean(), (c.value**2).mean() - c0**2, free_energy(), length_scale(), sweeps, time.time() - t0), flush=True); snaps[out.pop(0)] = c.value.reshape(ny, nx).copy()
    dt = min(dt * 1.15, 5.0) if sweeps <= 6 else (dt if sweeps <= 9 else dt * 0.6)
np.savez("snapshots.npz", **{f"t{k}": v for k, v in snaps.items()})
