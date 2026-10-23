"""Binary phase diagram of the teaching database with pycalphad."""
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pycalphad import Database, binplot, variables as v

db = Database("teach.tdb")
ax = binplot(db, ["A", "B", "VA"], ["LIQUID", "ALPHA", "BETA"], {v.X("B"): (0, 1, 0.01), v.T: (300, 1500, 10), v.P: 101325, v.N: 1})
ax.set_xlabel("mole fraction B"); ax.set_ylabel("T (K)")
ax.figure.set_size_inches(6, 4.5); ax.figure.tight_layout(); ax.figure.savefig("diagram.png", dpi=130)
print("saved diagram.png")
