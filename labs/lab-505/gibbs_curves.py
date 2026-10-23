"""Gibbs energy curves of the three phases and the common tangent construction at three temperatures."""
import warnings; warnings.filterwarnings("ignore")
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pycalphad import calculate
from tools505 import load, state, PHASES

db = load()
fig, axes = plt.subplots(1, 3, figsize=(10, 3.4))
for ax, T in zip(axes, (900, 700, 600)):
    curves = {}
    for ph, c in zip(PHASES, ("tab:red", "tab:blue", "tab:orange")):
        r = calculate(db, ["A", "B", "VA"], ph, T=T, P=101325, N=1, pdens=400)
        x = r.X.sel(component="B").values.squeeze(); G = r.GM.values.squeeze(); o = np.argsort(x)
        curves[ph] = (x[o], G[o]); ax.plot(x[o], G[o], color=c, label=ph)
    xo = 0.2 if T > 650 else 0.5                       # an overall composition inside the two-phase region
    s = state(db, xo, T)
    print("T = %d K, overall x_B = %.2f: %s" % (T, xo, ", ".join("%s x=%.3f" % (p, x) for p, n, x in s)))
    if len(s) == 2:                                    # common tangent through the two equilibrium compositions
        pts = [(x, np.interp(x, *curves[p])) for p, n, x in s]
        ax.plot([pts[0][0], pts[1][0]], [pts[0][1], pts[1][1]], "k--", lw=1); ax.plot(*zip(*pts), "ko", ms=4)
    ax.set_title(f"T = {T} K"); ax.set_xlabel("$x_B$"); ax.set_ylabel("G (J/mol)")
axes[0].legend(); fig.tight_layout(); fig.savefig("gibbs.png", dpi=130)
