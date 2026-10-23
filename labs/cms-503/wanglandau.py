"""Wang-Landau sampling of the density of states of the 2D Ising model; comparison with exact enumeration (4 x 4) and thermodynamics from a single run."""
import numpy as np
from numba import njit

L = 4; N = L * L
# exact density of states by enumeration of all 2^16 states
def enumerate_dos():
    g = {}
    for st in range(2**N):
        s = np.array([(st >> k) & 1 for k in range(N)]).reshape(L, L) * 2 - 1
        E = -int(np.sum(s * np.roll(s, 1, 0) + s * np.roll(s, 1, 1)))
        g[E] = g.get(E, 0) + 1
    return g
exact = enumerate_dos()
Es = sorted(exact)
Emin = -2 * N
levels = np.arange(Emin, 2 * N + 1, 4)
# keep only the energy levels that exist on the 4x4 lattice (E = -32, -24, -20, ..., 32; the levels -28 and 28 do not exist)
exists = np.array([e in exact for e in levels])
print(f"exact enumeration of the 4 x 4 lattice: {2**N} states, {len(exact)} different energies; the ground state has E = {min(exact)} and g = {exact[min(exact)]}")
@njit
def wl2(L, Emin, nE, exists, seed, lnf_final):
    np.random.seed(seed); N = L * L
    s = np.ones((L, L)); E = -2 * N
    lng = np.zeros(nE); H = np.zeros(nE); lnf = 1.0; steps = 0
    while lnf > lnf_final:
        for _ in range(200000):
            i = np.random.randint(L); j = np.random.randint(L)
            nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
            dE = int(2 * s[i, j] * nb)
            a = (E - Emin) // 4; b = (E + dE - Emin) // 4
            if np.random.random() < np.exp(lng[a] - lng[b]):
                s[i, j] = -s[i, j]; E += dE; a = b
            lng[a] += lnf; H[a] += 1
        steps += 200000
        mn = 1e300; mean = 0.0; cnt = 0
        for k in range(nE):
            if exists[k]:
                cnt += 1; mean += H[k]; mn = min(mn, H[k])
        mean /= cnt
        if mn > 0.8 * mean: lnf /= 2; H[:] = 0
    return lng, steps
lng, steps = wl2(L, Emin, len(levels), exists, 5, 1e-6)
lng = lng - lng[0] + np.log(2)                                       # normalise: g(ground state) = 2
print(f"Wang-Landau run finished after {steps:.2e} spin-flip attempts (modification factor ln f reduced from 1 to 1e-6)")
print("   E     g exact    g Wang-Landau   relative error")
for e, ok, lg in zip(levels, exists, lng):
    if ok: print(f"  {e:4d}  {exact[e]:8d}   {np.exp(lg):12.1f}      {np.exp(lg) / exact[e] - 1:+.2e}")
E_arr = np.array([e for e, ok in zip(levels, exists) if ok], float); g_wl = np.array([np.exp(l) for l, ok in zip(lng, exists) if ok]); g_ex = np.array([exact[int(e)] for e in E_arr], float)
def thermo(g, T):
    w = g * np.exp(-(E_arr - E_arr.min()) / T); Z = w.sum(); U = (E_arr * w).sum() / Z; U2 = (E_arr**2 * w).sum() / Z
    return U / N, (U2 - U * U) / (N * T * T)
print("\nenergy per site and specific heat per site from the density of states (all temperatures from one run):")
print("     T     U/N exact   U/N WL     C/N exact   C/N WL")
for T in (1.0, 1.5, 2.0, 2.27, 3.0, 5.0):
    ue, ce = thermo(g_ex, T); uw, cw = thermo(g_wl, T)
    print(f"   {T:4.2f}   {ue:9.5f}  {uw:9.5f}   {ce:9.5f}  {cw:9.5f}")
