"""Kinetic Monte Carlo (residence-time algorithm) of a vacancy on a simple cubic lattice; check against the exact diffusion coefficient D = Gamma a^2 / 6."""
import numpy as np
from numba import njit

kB = 8.617333e-5
@njit
def kmc(nsteps, rate, a, seed):
    np.random.seed(seed)
    pos = np.zeros(3); t = 0.0
    moves = np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], dtype=np.float64)
    out_t = np.empty(nsteps); out_r2 = np.empty(nsteps); tsum = 0.0
    for n in range(nsteps):
        R = 6 * rate
        t += -np.log(np.random.random()) / R
        k = np.random.randint(6); pos += moves[k] * a
        out_t[n] = t; out_r2[n] = pos @ pos
    return out_t, out_r2
nu, Em, T, a = 1e13, 0.70, 300.0, 2.86e-10                       # attempt frequency (1/s), migration barrier (eV), temperature (K), lattice constant (m)
rate = nu * np.exp(-Em / (kB * T))                               # hop rate in one direction
Gamma = 6 * rate
print(f"vacancy hopping on a simple cubic lattice: nu = {nu:.0e} 1/s, E_m = {Em} eV, T = {T} K, a = {a * 1e10:.2f} A")
print(f"rate per direction {rate:.4g} 1/s, total jump rate Gamma = {Gamma:.4g} 1/s, mean waiting time {1 / Gamma * 1e3:.3f} ms; D = Gamma a^2/6 = {Gamma * a**2 / 6:.4e} m^2/s")
import time
print("\nensemble of 2000 independent kinetic Monte Carlo walkers of 2000 jumps each; D = <r^2>/(6 t) from the ensemble averages:")
t0 = time.perf_counter(); R2, TT = [], []
kmc(10, rate, a, 0)                                                     # compile
t0 = time.perf_counter()
for seed in range(2000):
    t, r2 = kmc(2000, rate, a, 1000 + seed); R2.append(r2[-1]); TT.append(t[-1])
cpu = time.perf_counter() - t0
R2 = np.array(R2); TT = np.array(TT)
D_est = R2.mean() / (6 * TT.mean()); D_err = D_est * np.std(R2, ddof=1) / R2.mean() / np.sqrt(len(R2))
print(f"   simulated time per walker {TT.mean():.2f} s, <r^2> = {R2.mean():.3e} m^2 (expected 2000 a^2 = {2000 * a**2:.3e});  D = {D_est:.4e} +- {D_err:.1e} m^2/s;  exact D = {Gamma * a**2 / 6:.4e};  ratio {D_est / (Gamma * a**2 / 6):.3f}")
print(f"   total: {2000 * 2000} jumps in {cpu:.2f} s of CPU time")
# check of the waiting-time distribution: exponential with mean 1/Gamma
t, r2 = kmc(400000, rate, a, 99)
dts = np.diff(np.concatenate([[0.0], t]))
print(f"\nwaiting times: mean {dts.mean() * 1e3:.4f} ms (expected {1 / Gamma * 1e3:.4f}), standard deviation {dts.std() * 1e3:.4f} ms (an exponential distribution has std = mean), fraction longer than 3 mean times {np.mean(dts > 3 / Gamma):.4f} (exp(-3) = {np.exp(-3):.4f})")
print(f"\nthe time that molecular dynamics would need: with the same barrier, one jump takes on average 1/Gamma = {1 / Gamma * 1e3:.2f} ms = {1 / Gamma / 2e-15:.1e} MD time steps of 2 fs")
