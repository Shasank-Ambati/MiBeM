"""Analyse the output of in.lj_liquid: g(r), coordination number and the self-diffusion coefficient."""
import numpy as np

dt = 0.004                       # reduced time step used in the input file

# ---- radial distribution function: columns are  index, r, g(r), cumulative coordination number
# rdf.dat holds one block of 100 rows per averaging interval, each preceded by a "step nrows" line
rows = [ln.split() for ln in open("rdf.dat") if not ln.startswith("#") and len(ln.split()) == 4]
blocks = np.array(rows, dtype=float).reshape(-1, 100, 4)
rdf = blocks.mean(axis=0)                            # average over all blocks
r, g, cn = rdf[:, 1], rdf[:, 2], rdf[:, 3]
i1 = np.argmax(g)                                    # first (highest) peak
imin = i1 + np.argmin(g[i1:i1 + 30])                 # first minimum after it
print(f"first peak : r = {r[i1]:.3f} sigma, g = {g[i1]:.2f}")
print(f"first min  : r = {r[imin]:.3f} sigma, g = {g[imin]:.2f}")
print(f"coordination number up to the first minimum = {cn[imin]:.1f}")

# ---- mean-square displacement and the Einstein relation  MSD = 6 D t
step, msd = np.loadtxt("msd.dat", skiprows=1, unpack=True)
t = step * dt
mask = t > 0.25 * t[-1]                              # skip the ballistic regime at short times
slope, intercept = np.polyfit(t[mask], msd[mask], 1)
print(f"D* = slope/6 = {slope / 6:.4f}  (reduced units sigma*sqrt(epsilon/m))")
