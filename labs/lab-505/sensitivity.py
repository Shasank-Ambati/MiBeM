"""How the interaction parameters shape the diagram: eutectic temperature and composition for four parameter sets."""
import warnings; warnings.filterwarnings("ignore")
import os
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pycalphad import equilibrium, binplot, variables as v
from tools505 import load, PHASES

cases = {
    "A: liquid ideal (L = 0), solids +14000":      {"L(LIQUID,A,B;0) 298.15 -6000": "L(LIQUID,A,B;0) 298.15 0"},
    "B: base case (liquid -6000, solids +14000)":  {},
    "C: liquid -12000, solids +14000":             {"L(LIQUID,A,B;0) 298.15 -6000": "L(LIQUID,A,B;0) 298.15 -12000"},
    "D: liquid -6000, solids 0 (ideal)":           {"L(ALPHA,A,B;0) 298.15 +14000": "L(ALPHA,A,B;0) 298.15 0", "L(BETA,A,B;0)  298.15 +14000": "L(BETA,A,B;0)  298.15 0"},
}
def eutectic(db):
    """Lowest temperature at which the liquid is stable on a grid of composition and temperature, and the composition of the liquid there."""
    xs, Ts = np.arange(0.20, 0.70, 0.01), np.arange(1000, 300, -2.0)
    eq = equilibrium(db, ["A", "B", "VA"], PHASES, {v.X("B"): xs, v.T: Ts, v.P: 101325, v.N: 1})
    ph = eq.Phase.values.squeeze()                      # dimensions: (T, x, vertex)
    xl = eq.X.sel(component="B").values.squeeze()       # composition of each stable phase, same dimensions
    j = np.argwhere((ph == "LIQUID").any(axis=-1))[:, 0].max()          # largest index = lowest T with liquid
    sel = ph[j] == "LIQUID"
    return Ts[j], np.nanmean(xl[j][sel])

print("%-46s %10s %9s" % ("case", "T_eut (K)", "x_B,eut"))
imgs = []
for k, (name, subs) in enumerate(cases.items()):
    db = load(subs=subs)
    Te, xe = eutectic(db)
    print("%-46s %10.0f %9.3f" % (name, Te, xe), flush=True)
    ax = binplot(db, ["A", "B", "VA"], PHASES, {v.X("B"): (0, 1, 0.01), v.T: (300, 1500, 10), v.P: 101325, v.N: 1})
    ax.set_title(name, fontsize=8)
    if ax.get_legend(): ax.get_legend().remove()
    ax.figure.set_size_inches(4, 3.2); ax.figure.tight_layout(); ax.figure.savefig(f"_d{k}.png", dpi=110); plt.close(ax.figure)
    imgs.append(f"_d{k}.png")
fig, axes = plt.subplots(2, 2, figsize=(8, 6.4))
for a, f in zip(axes.flat, imgs): a.imshow(plt.imread(f)); a.axis("off")
fig.tight_layout(); fig.savefig("sensitivity.png", dpi=130)
for f in imgs: os.remove(f)
