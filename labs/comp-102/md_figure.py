"""Figure for the MD lecture: energies during the first 5000 steps and the radial distribution function from the production run."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from lj_md import run

d, pos, L = run(T0=1.7, dt=0.004, steps=5000, verbose=False)
r, g = np.load("g_r.npy")
fig, ax = plt.subplots(1, 2, figsize=(8.6, 3.3))
t = d[:, 0] * 0.004
ax[0].plot(t, d[:, 3], label="potential"); ax[0].plot(t, d[:, 2], label="kinetic"); ax[0].plot(t, d[:, 4], "k", label="total")
ax[0].set(xlabel="time (reduced units)", ylabel="energy per atom"); ax[0].legend(fontsize=8)
ax[1].plot(r, g); ax[1].axhline(1, color="grey", lw=0.5, ls=":"); ax[1].set(xlabel=r"$r/\sigma$", ylabel="g(r)", xlim=(0.8, L / 2))
fig.tight_layout(); fig.savefig("md_figure.png", dpi=130)
