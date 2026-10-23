"""Metropolis Monte Carlo of the Lennard-Jones fluid (256 atoms, T* = 0.85, rho* = 0.8442), against molecular dynamics (LAMMPS, NVT) at the same state point."""
import numpy as np
from numba import njit

@njit
def energy_virial(x, L, rc2):
    n = x.shape[0]; e = 0.0; w = 0.0
    for i in range(n - 1):
        for j in range(i + 1, n):
            d = x[i] - x[j]; d -= L * np.round(d / L); r2 = d @ d
            if r2 < rc2:
                ir6 = (1.0 / r2)**3; e += 4 * (ir6 * ir6 - ir6); w += 24 * (2 * ir6 * ir6 - ir6)
    return e, w
@njit
def one_atom_energy(x, i, xi, L, rc2):
    e = 0.0
    for j in range(x.shape[0]):
        if j != i:
            d = xi - x[j]; d -= L * np.round(d / L); r2 = d @ d
            if r2 < rc2:
                ir6 = (1.0 / r2)**3; e += 4 * (ir6 * ir6 - ir6)
    return e
@njit
def mc(x, L, T, delta, nsweeps, nsample, rc2, seed):
    np.random.seed(seed); n = x.shape[0]; acc = 0; tot = 0
    es = np.empty(nsweeps // nsample); ps = np.empty(nsweeps // nsample); k = 0
    for sw in range(nsweeps):
        for _ in range(n):
            i = np.random.randint(n); xn = x[i] + delta * (np.random.random(3) - 0.5)
            dE = one_atom_energy(x, i, xn, L, rc2) - one_atom_energy(x, i, x[i], L, rc2)
            tot += 1
            if dE <= 0 or np.random.random() < np.exp(-dE / T): x[i] = xn; acc += 1
        if sw % nsample == 0 and sw >= 0:
            e, w = energy_virial(x, L, rc2); es[k] = e; ps[k] = w; k += 1
    return es, ps, acc / tot
N, rho, T, rc = 256, 0.8442, 0.85, 2.5
nc = 4; L = (N / rho)**(1 / 3); a = L / nc
cells = np.array([[i, j, k] for i in range(nc) for j in range(nc) for k in range(nc)], float)
basis = np.array([[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]])
x = ((cells[:, None, :] + basis[None, :, :]).reshape(-1, 3) * a).copy()
rc2 = rc * rc
# tail corrections for the energy and the pressure (cut at rc, no shift)
etail = (8 / 3) * np.pi * rho * ((1 / 3) * rc**-9 - rc**-3)
ptail = (16 / 3) * np.pi * rho**2 * ((2 / 3) * rc**-9 - rc**-3)
print(f"N = {N}, rho* = {rho}, T* = {T}, cutoff {rc}; tail corrections: energy per atom {etail:.4f}, pressure {ptail:.4f}")
for delta in (0.1, 0.2, 0.25, 0.3, 0.45, 0.7):
    es, ps, acc = mc(x.copy(), L, T, delta, 300, 300, rc2, 1)
    print(f"   step {delta:4.2f}: acceptance {acc:.3f}")
delta = 0.25
mc(x, L, T, delta, 2000, 2000, rc2, 2)                       # equilibration
es, ps, acc = mc(x, L, T, delta, 12000, 10, rc2, 3)
nb = 20; n = len(es) // nb
def blk(v): return v[:n * nb].reshape(nb, n).mean(1).std(ddof=1) / np.sqrt(nb)
e_mc = es / N + etail; p_mc = rho * T + ps / (3 * L**3) + ptail
print(f"MC (step {delta}, acceptance {acc:.3f}, 12000 sweeps): <U>/N = {e_mc.mean():.4f} +- {blk(e_mc):.4f};  P = {p_mc.mean():.4f} +- {blk(p_mc):.4f}")
np.savetxt("lj_mc_result.txt", [e_mc.mean(), blk(e_mc), p_mc.mean(), blk(p_mc)])
