"""The correlation factor of vacancy-mediated tracer diffusion, by Monte Carlo of a single vacancy random walk."""
import numpy as np
from numba import njit

def neighbours(kind):
    if kind == "sc":  return np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], np.int64)
    if kind == "bcc": return np.array([[a, b, c] for a in (1, -1) for b in (1, -1) for c in (1, -1)], np.int64)
    if kind == "fcc": return np.array([[a, b, 0] for a in (1, -1) for b in (1, -1)] + [[a, 0, b] for a in (1, -1) for b in (1, -1)] + [[0, a, b] for a in (1, -1) for b in (1, -1)], np.int64)
@njit
def tracer(nb, nsteps, seed):
    """One vacancy random walks on an infinite lattice; whenever it steps onto the tracer's site the tracer jumps into the vacancy. Returns sum of squared tracer displacement and number of tracer jumps."""
    np.random.seed(seed)
    z = nb.shape[0]
    tr = np.zeros(3, np.int64); v = nb[0].copy()               # the vacancy starts next to the tracer
    n = 0
    for _ in range(nsteps):
        d = nb[np.random.randint(z)]
        vn = v + d
        if vn[0] == tr[0] and vn[1] == tr[1] and vn[2] == tr[2]:
            tr = v.copy(); v = vn; n += 1                      # exchange: the tracer moves to the old vacancy position
        else:
            v = vn
        # if the vacancy escapes far away, restart it next to the tracer: a new independent encounter, its tracer displacement is added to the total
        if abs(v[0] - tr[0]) + abs(v[1] - tr[1]) + abs(v[2] - tr[2]) > 60:
            v = tr + nb[np.random.randint(z)]
    return tr, n
@njit
def encounters(nb, nenc, rmax, seed):
    """Average over many independent vacancy encounters: tracer displacement R after the vacancy has left (distance > rmax); returns <R.R> and <n>."""
    np.random.seed(seed); z = nb.shape[0]; sumR2 = 0.0; sumn = 0
    for e in range(nenc):
        tr = np.zeros(3, np.int64); v = nb[np.random.randint(z)].copy(); n = 0
        while True:
            d = nb[np.random.randint(z)]; vn = v + d
            if vn[0] == tr[0] and vn[1] == tr[1] and vn[2] == tr[2]:
                tr = v.copy(); v = vn; n += 1
            else: v = vn
            if abs(v[0]) + abs(v[1]) + abs(v[2]) > rmax: break
        sumR2 += tr[0]**2 + tr[1]**2 + tr[2]**2; sumn += n
    return sumR2, sumn
print("correlation factor f = <R^2> / (n a^2) of the tracer in vacancy diffusion; R is the tracer displacement after n tracer jumps (jump vector length l, here in lattice units)")
print("   lattice    z    jump length^2 l^2    f (Monte Carlo)       f (literature)")
lit = {"sc": 0.65311, "bcc": 0.72722, "fcc": 0.78146}
for kind, l2 in (("sc", 1.0), ("bcc", 3.0), ("fcc", 2.0)):
    nb = neighbours(kind)
    R2, n = encounters(nb, 400000, 40, 7)
    f = R2 / (n * l2)
    print(f"   {kind:5s}   {len(nb):2d}       {l2:4.1f}            {f:8.4f}              {lit[kind]:.5f}")
print("a vacancy that has exchanged with the tracer has a high probability to exchange again (go back): the successive tracer jumps are anti-correlated, and the tracer diffuses more slowly than a random walker with the same number of jumps")
