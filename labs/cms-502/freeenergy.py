"""Free-energy methods on a toy problem: a particle in a double well, Langevin dynamics: brute force, umbrella sampling with WHAM, metadynamics."""
import numpy as np
from numba import njit

kT = 1.0; H = 8.0                                   # barrier height 8 kT
def U(x): return H * (x**2 - 1)**2
@njit
def dU(x, H=8.0): return 4 * H * x * (x**2 - 1)
@njit
def langevin(x0, nsteps, dt, gamma, seed, bias_k=0.0, bias_c=0.0, record=1):
    """Underdamped Langevin (BAOAB), unit mass, kT = 1; optional harmonic bias k (x - c)^2 / 2."""
    np.random.seed(seed)
    x = x0; v = 0.0; out = np.empty(nsteps // record)
    c1 = np.exp(-gamma * dt); c2 = np.sqrt(1 - c1 * c1)
    f = -dU(x) - bias_k * (x - bias_c)
    for i in range(nsteps):
        v += 0.5 * dt * f; x += 0.5 * dt * v
        v = c1 * v + c2 * np.random.randn()
        x += 0.5 * dt * v; f = -dU(x) - bias_k * (x - bias_c); v += 0.5 * dt * f
        if i % record == 0: out[i // record] = x
    return out

dt, gamma = 0.01, 2.0
print(f"double well U = {H} (x^2 - 1)^2, barrier {H} kT; Langevin dynamics, dt = {dt}, friction {gamma}")
print("\n1. brute force: number of transitions between the wells in a trajectory")
for n in (10**6, 10**7):
    tr = langevin(-1.0, n, dt, gamma, 1, 0.0, 0.0, 10)
    s = np.sign(tr); cross = np.sum(s[1:] != s[:-1])
    p = np.mean(tr > 0)
    print(f"   {n:9d} steps ({n * dt:8.0f} time units): {cross:4d} crossings of x = 0; fraction of time at x > 0 = {p:.3f} (exact 0.5)")
exact_barrier = U(0.0)
print(f"   the Kramers estimate of the rate is exp(-barrier/kT) = {np.exp(-exact_barrier):.1e} per attempt: events are rare compared with the 1e6 steps needed to resolve the motion")

print("\n2. umbrella sampling: 17 windows c = -1.6 ... 1.6, bias k = 40, 200000 steps each, then WHAM")
cs = np.linspace(-1.6, 1.6, 17); kb = 40.0
samples = [langevin(c, 200000, dt, gamma, 100 + i, kb, c, 5)[2000:] for i, c in enumerate(cs)]
bins = np.linspace(-1.8, 1.8, 91); xm = 0.5 * (bins[1:] + bins[:-1])
hist = np.array([np.histogram(s, bins)[0] for s in samples], float); n_i = hist.sum(1)
bias = 0.5 * kb * (xm[None, :] - cs[:, None])**2
f = np.zeros(len(cs))
for it in range(2000):                              # WHAM self-consistent equations
    denom = np.sum(n_i[:, None] * np.exp((f[:, None] - bias) / kT), axis=0)
    P = hist.sum(0) / denom
    f_new = -kT * np.log(np.sum(P[None, :] * np.exp(-bias / kT), axis=1))
    if np.max(np.abs(f_new - f)) < 1e-10: break
    f = f_new - f_new[0]
F = -kT * np.log(P + 1e-300); F -= F[np.argmin(abs(xm + 1))]
ex = U(xm); ex -= ex[np.argmin(abs(xm + 1))]
sel = (xm > -1.4) & (xm < 1.4)
print(f"   WHAM converged in {it} iterations; barrier at x = 0: F(0) - F(-1) = {F[np.argmin(abs(xm))]:.2f} kT (exact {exact_barrier:.2f}); maximum |F - U| for |x| < 1.4: {np.max(np.abs(F - ex)[sel]):.2f} kT")
print("   x:      " + " ".join(f"{x:6.2f}" for x in xm[::10]))
print("   F(x):   " + " ".join(f"{x:6.2f}" for x in F[::10]))
print("   U(x):   " + " ".join(f"{x:6.2f}" for x in ex[::10]))

print("\n3. metadynamics: Gaussians of height 0.3 kT and width 0.15 deposited every 500 steps")
@njit
def bias_force(x, centers, nc, w, sig):
    f = 0.0
    for j in range(nc): f += w * (x - centers[j]) / sig**2 * np.exp(-(x - centers[j])**2 / (2 * sig**2))
    return f
@njit
def metad(nsteps, dt, gamma, seed, w, sig, stride):
    np.random.seed(seed)
    centers = np.empty(nsteps // stride + 1); nc = 0
    x = -1.0; v = 0.0; c1 = np.exp(-gamma * dt); c2 = np.sqrt(1 - c1 * c1)
    fx = -dU(x); traj = np.empty(nsteps // 100)
    for i in range(nsteps):
        v += 0.5 * dt * fx; x += 0.5 * dt * v; v = c1 * v + c2 * np.random.randn(); x += 0.5 * dt * v
        fx = -dU(x) + bias_force(x, centers, nc, w, sig); v += 0.5 * dt * fx
        if i % stride == 0: centers[nc] = x; nc += 1
        if i % 100 == 0: traj[i // 100] = x
    return centers[:nc], traj
centers, traj = metad(1_500_000, dt, gamma, 3, 0.3, 0.15, 500)
Vb = lambda x, n: sum(0.3 * np.exp(-(x - c)**2 / (2 * 0.15**2)) for c in centers[:n])
xg = np.linspace(-1.4, 1.4, 57)
first_cross = np.argmax(traj > 0) * 100 * dt
print(f"   {len(centers)} Gaussians deposited; the particle first crosses the barrier at t = {first_cross:.0f} (brute force needs ~1e5 or more); crossings in the run: {np.sum(np.sign(traj[1:]) != np.sign(traj[:-1]))}")
for n in (len(centers) // 4, len(centers) // 2, len(centers)):
    Fm = -Vb(xg, n); Fm -= Fm[np.argmin(abs(xg + 1))]
    exg = U(xg); exg -= exg[np.argmin(abs(xg + 1))]
    print(f"   after {n:5d} Gaussians: -V_bias(x) - (-V_bias(-1)) at x = 0 is {Fm[np.argmin(abs(xg))]:.2f} kT (exact barrier {exact_barrier:.2f});  max error for |x| < 1.4: {np.max(np.abs(Fm - exg)):.2f} kT")
