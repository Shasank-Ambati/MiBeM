"""2D Ising model, Metropolis Monte Carlo, with numba for speed.  H = -J sum_<ij> s_i s_j, J = 1, k_B = 1."""
import numpy as np
from numba import njit

@njit(cache=True)
def sweep(s, beta, rng_state=0):
    L = s.shape[0]
    for _ in range(L * L):                                   # one sweep = L*L attempted flips
        i = np.random.randint(L); j = np.random.randint(L)
        nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
        dE = 2.0 * s[i, j] * nb                              # energy change if s[i,j] flips
        if dE <= 0 or np.random.random() < np.exp(-beta * dE):
            s[i, j] = -s[i, j]

@njit(cache=True)
def energy(s):
    L = s.shape[0]; E = 0.0
    for i in range(L):
        for j in range(L):
            E -= s[i, j] * (s[(i + 1) % L, j] + s[i, (j + 1) % L])   # count each bond once
    return E

@njit(cache=True)
def seed(n):
    np.random.seed(n)

def run(L, T, nequil=2000, nprod=10000, sd=1, start="random"):
    seed(sd)
    rng = np.random.default_rng(sd)
    s = rng.choice(np.array([-1, 1], dtype=np.int64), size=(L, L)) if start == "random" else np.ones((L, L), dtype=np.int64)
    for _ in range(nequil): sweep(s, 1.0 / T)
    E = np.empty(nprod); M = np.empty(nprod)
    for k in range(nprod):
        sweep(s, 1.0 / T)
        E[k] = energy(s) / L**2; M[k] = abs(s.sum()) / L**2
    return s, E, M
