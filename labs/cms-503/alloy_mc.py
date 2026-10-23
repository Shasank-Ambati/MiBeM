"""Monte Carlo of a binary alloy on a square lattice (the Ising model): coexistence curve compared with mean field (regular solution) and with Onsager's exact result."""
import numpy as np
from numba import njit

@njit
def sweep(s, beta, L):
    for _ in range(L * L):
        i = np.random.randint(L); j = np.random.randint(L)
        nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
        dE = 2.0 * s[i, j] * nb
        if dE <= 0 or np.random.random() < np.exp(-beta * dE): s[i, j] = -s[i, j]
@njit
def run(L, T, nequil, nprod, seed):
    np.random.seed(seed)
    s = np.ones((L, L)); beta = 1.0 / T
    for _ in range(nequil): sweep(s, beta, L)
    m = np.empty(nprod); e = np.empty(nprod)
    for k in range(nprod):
        sweep(s, beta, L); m[k] = abs(s.sum()) / (L * L)
        E = 0.0
        for i in range(L):
            for j in range(L): E -= s[i, j] * (s[(i + 1) % L, j] + s[i, (j + 1) % L])
        e[k] = E / (L * L)
    return m, e
def onsager(T):
    return (1 - np.sinh(2 / T)**-4)**0.125 if T < 2.269185314 else 0.0
def meanfield(T, z=4):
    if T >= z: return 0.0
    from scipy.optimize import brentq
    return brentq(lambda m: m - np.tanh(z * m / T), 1e-9, 1.0)
Tc_ex = 2 / np.log(1 + np.sqrt(2))
print(f"square lattice, nearest-neighbour interaction J = 1 (the alloy has the like-atom attraction J = -epsilon_AB + (epsilon_AA + epsilon_BB)/2 per bond, z = 4)")
print(f"critical temperature: exact (Onsager) Tc = {Tc_ex:.4f};  mean field (regular solution, Tc = z J / k) = 4.0000: too high by {4 / Tc_ex - 1:.0%}")
print("composition of the coexisting phases x = (1 +- m)/2, from the order parameter m (|m| averaged over the run):")
print("     T     T/Tc    m (Monte Carlo L=32)   m (Onsager)   m (mean field)    x_B (MC)    x_B (MF)")
for T in (1.0, 1.5, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 3.0):
    m, e = run(32, T, 5000, 20000, 11)
    mc = m.mean(); n = len(m) // 20; err = m[:n * 20].reshape(20, n).mean(1).std(ddof=1) / np.sqrt(20)
    print(f"   {T:4.2f}   {T / Tc_ex:5.3f}     {mc:6.4f} +- {err:.4f}        {onsager(T):6.4f}       {meanfield(T):6.4f}       {(1 - mc) / 2:6.4f}      {(1 - meanfield(T)) / 2:6.4f}")
print("above Tc the finite-size |m| of the simulation is nonzero (~ 1/L); the exact and mean-field values are zero.")
