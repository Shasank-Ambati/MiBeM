"""Magnetic-field version of the Metropolis sweep: start from all spins -1 and apply h = +0.05 at T = 2.0."""
import numpy as np
from numba import njit
from ising import seed

@njit(cache=True)
def sweep_h(s, beta, h):
    L = s.shape[0]
    for _ in range(L * L):
        i = np.random.randint(L); j = np.random.randint(L)
        nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
        dE = 2.0 * s[i, j] * (nb + h)
        if dE <= 0 or np.random.random() < np.exp(-beta * dE):
            s[i, j] = -s[i, j]

for L in (16, 32):
    for sd in (1, 2, 3):
        seed(sd); s = -np.ones((L, L), dtype=np.int64)
        marks, first = [], None
        for sweep in range(1, 20001):
            sweep_h(s, 1 / 2.0, 0.05)
            if first is None and s.mean() > 0: first = sweep          # first sweep with a positive magnetisation
            if sweep in (10, 100, 1000, 5000, 20000): marks.append(s.mean())
        print("L = %d seed %d  m at sweeps 10, 100, 1000, 5000, 20000: %s ;  first sweep with m>0: %s" % (L, sd, " ".join("%+.2f" % m for m in marks), first))
