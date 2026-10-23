"""Snapshots of the spinodal decomposition run (saved by spinodal.py) and the equilibrium compositions reached."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

d = np.load("snapshots.npz")
times = [10.0, 30.0, 100.0, 300.0, 1000.0]
keys = {t: [k for k in d.files if abs(float(k[1:]) - t) / t < 0.05][0] for t in times}
fig, ax = plt.subplots(1, 5, figsize=(11, 2.5))
for a, t in zip(ax, times):
    im = a.imshow(d[keys[t]], cmap="coolwarm", vmin=0.25, vmax=0.75, origin="lower"); a.set_title(f"t = {t:g}"); a.axis("off")
fig.colorbar(im, ax=ax, shrink=0.8, label="c"); fig.savefig("spinodal.png", dpi=130, bbox_inches="tight")
c = d[keys[1000.0]]
print("final snapshot: fraction of cells with c < 0.5 = %.3f ; mean of c in the low-c phase = %.3f ; in the high-c phase = %.3f" % ((c < 0.5).mean(), c[c < 0.5].mean(), c[c >= 0.5].mean()))
print("5th and 95th percentile of c in the final snapshot: %.3f and %.3f ; minimum %.3f, maximum %.3f" % (np.percentile(c, 5), np.percentile(c, 95), c.min(), c.max()))
print("equilibrium compositions of the double well: 0.300 and 0.700; lever rule for c0 = 0.5: equal fractions")
