"""Autocorrelation times of the Metropolis and Wolff (cluster) algorithms for the 2D Ising model (L = 32) at several temperatures."""
import numpy as np
from numba import njit

@njit
def metropolis_sweep(s, beta, L):
    for _ in range(L * L):
        i = np.random.randint(L); j = np.random.randint(L)
        nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
        dE = 2.0 * s[i, j] * nb
        if dE <= 0 or np.random.random() < np.exp(-beta * dE): s[i, j] = -s[i, j]
@njit
def wolff_step(s, p, L, stack):
    i0 = np.random.randint(L); j0 = np.random.randint(L); sp = s[i0, j0]
    s[i0, j0] = -sp; n = 0; stack[0, 0] = i0; stack[0, 1] = j0; ns = 1; size = 1
    while ns > 0:
        ns -= 1; i = stack[ns, 0]; j = stack[ns, 1]
        for k in range(4):
            ii = (i + (1 if k == 0 else -1 if k == 1 else 0)) % L; jj = (j + (1 if k == 2 else -1 if k == 3 else 0)) % L
            if s[ii, jj] == sp and np.random.random() < p:
                s[ii, jj] = -sp; stack[ns, 0] = ii; stack[ns, 1] = jj; ns += 1; size += 1
    return size
@njit
def run_metropolis(L, T, nequil, nprod, seed):
    np.random.seed(seed); s = np.ones((L, L)); beta = 1 / T
    for _ in range(nequil): metropolis_sweep(s, beta, L)
    m = np.empty(nprod)
    for k in range(nprod): metropolis_sweep(s, beta, L); m[k] = abs(s.sum()) / (L * L)
    return m
@njit
def run_wolff(L, T, nequil, nprod, seed):
    np.random.seed(seed); s = np.ones((L, L)); p = 1 - np.exp(-2 / T); stack = np.empty((L * L, 2), np.int64)
    for _ in range(nequil): wolff_step(s, p, L, stack)
    m = np.empty(nprod); touched = 0
    for k in range(nprod):
        # one 'sweep' of cluster updates: flip clusters until about L*L spins have been touched
        t = 0
        while t < L * L: t += wolff_step(s, p, L, stack)
        m[k] = abs(s.sum()) / (L * L)
    return m
def tau_int(x):
    x = x - x.mean(); n = len(x); f = np.fft.rfft(x, 2 * n); acf = np.fft.irfft(f * np.conj(f))[:n]; acf /= acf[0]
    tau = 0.5
    for t in range(1, n):
        tau += acf[t]
        if t > 6 * tau: break
    return tau
L = 32; Tc = 2 / np.log(1 + np.sqrt(2))
print(f"2D Ising model, L = {L}: integrated autocorrelation time of |m| (in sweeps; a Wolff sweep = clusters flipped until L^2 spins have been touched)")
print("     T      T/Tc    Metropolis   Wolff     N_eff/N (Metropolis) = 1/(2 tau)")
for T in (1.8, 2.1, 2.269, 2.5, 3.5):
    mm = run_metropolis(L, T, 2000, 100000, 1); mw = run_wolff(L, T, 500, 20000, 2)
    tm, tw = tau_int(mm), tau_int(mw)
    print(f"   {T:5.3f}   {T / Tc:5.3f}     {tm:7.1f}    {tw:6.2f}        {1 / (2 * tm):.4f}")
print("\neffect on the error bar: naive standard error of the mean (assuming independent samples) against the correct one, Metropolis at T = Tc, 100000 sweeps")
mm = run_metropolis(L, 2.269, 2000, 100000, 1)
naive = mm.std(ddof=1) / np.sqrt(len(mm)); tau = tau_int(mm); right = mm.std(ddof=1) * np.sqrt(2 * tau / len(mm))
nb = 20; n = len(mm) // nb; blk = mm[:n * nb].reshape(nb, n).mean(1).std(ddof=1) / np.sqrt(nb)
print(f"   <|m|> = {mm.mean():.4f}; naive error {naive:.5f}; error with the autocorrelation time {right:.5f} (factor {right / naive:.1f} larger); block-average error (20 blocks) {blk:.5f}")
