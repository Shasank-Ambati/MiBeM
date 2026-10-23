"""Analysis of an NVE run of the LJ fluid (N = 108): temperature, pressure with block errors, radial distribution function and diffusion coefficient."""
import numpy as np
from lj_md import run

n_cells, rho, dt = 3, 0.8442, 0.004
d, pos, L, snaps = run(T0=1.7, dt=dt, steps=22000, verbose=False, snap_every=20)
d = d[2000:]; snaps = snaps[100:]                                    # discard the first 2000 steps (equilibration)
N = len(pos); T, P = d[:, 1], d[:, 5]

def block_err(x, size):
    m = len(x) // size; b = x[: m * size].reshape(m, size).mean(1); return b.std(ddof=1) / np.sqrt(m)
print("T* = %.4f +- %.4f   P* = %.3f +- %.3f   (block errors, blocks of 2000 steps)" % (T.mean(), block_err(T, 2000), P.mean(), block_err(P, 2000)))
print("equipartition check: <KE>/N = %.4f, (3/2)(N-1)/N T* = %.4f" % (d[:, 2].mean(), 1.5 * (len(pos) - 1) / len(pos) * T.mean()))

# radial distribution function
edges = np.linspace(0, L / 2, 101); r = 0.5 * (edges[1:] + edges[:-1]); hist = np.zeros(100)
for _, p in snaps:
    dv = p[:, None, :] - p[None, :, :]; dv -= L * np.round(dv / L)
    dist = np.sqrt((dv ** 2).sum(-1))[np.triu_indices(N, 1)]
    hist += np.histogram(dist, bins=edges)[0]
shell = 4 * np.pi / 3 * (edges[1:] ** 3 - edges[:-1] ** 3)
g = 2 * hist / (len(snaps) * N * rho * shell)
w = (r > 1.3) & (r < 2.0)
i = g.argmax(); print("g(r): first maximum %.2f at r = %.3f; first minimum %.2f at r = %.3f; g(L/2) = %.2f" % (g[i], r[i], g[w].min(), r[w][g[w].argmin()], g[-1]))
print("coordination number up to r = 1.55: %.1f" % (np.sum(g[r < 1.55] * 4 * np.pi * r[r < 1.55] ** 2) * (r[1] - r[0]) * rho))

# mean-square displacement and the Einstein relation
u = np.array([s[0] for s in snaps]); dt_snap = 20 * dt
lags = np.arange(2, 400, 2)
msd = np.array([np.mean(np.sum((u[l:] - u[:-l]) ** 2, axis=2)) for l in lags]); t = lags * dt_snap
sel = (t > 1.0) & (t < 2.4)
slope = np.polyfit(t[sel], msd[sel], 1)[0]
print("MSD at t = 1, 2, 3 : %s ;  D* = slope/6 = %.4f (fit between t = 1 and 2.4)" % (", ".join("%.3f" % np.interp(x, t, msd) for x in (1, 2, 3)), slope / 6))
np.save("g_r.npy", np.array([r, g]))
