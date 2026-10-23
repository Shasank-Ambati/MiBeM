"""Small helpers around pycalphad used by the scripts of this lab."""
import warnings; warnings.filterwarnings("ignore")
import numpy as np
from pycalphad import Database, equilibrium, variables as v

PHASES = ["LIQUID", "ALPHA", "BETA"]

def load(path="teach.tdb", subs=None):
    text = open(path).read()
    for old, new in (subs or {}).items():
        assert old in text, old
        text = text.replace(old, new)
    return Database(text)

def state(db, xB, T):
    """Stable phases at (x_B, T): list of (phase, amount, x_B in that phase)."""
    eq = equilibrium(db, ["A", "B", "VA"], PHASES, {v.X("B"): xB, v.T: T, v.P: 101325, v.N: 1})
    ph = eq.Phase.values.squeeze(); np_ = eq.NP.values.squeeze(); xs = eq.X.sel(component="B").values.squeeze()
    out = []
    for p, n, x in zip(np.atleast_1d(ph), np.atleast_1d(np_), np.atleast_1d(xs)):
        if p != "" and not np.isnan(n) and n > 1e-6: out.append((str(p), float(n), float(x)))
    return out
