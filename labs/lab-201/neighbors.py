"""Coordination number and neighbour shells from the distances, using ASE's neighbour list."""
import numpy as np
from ase.build import bulk
from ase.neighborlist import neighbor_list

for name, atoms in [("fcc Cu", bulk("Cu", "fcc", a=3.615, cubic=True)), ("bcc Fe", bulk("Fe", "bcc", a=2.866, cubic=True)),
                    ("hcp Mg", bulk("Mg", "hcp", a=3.209, c=5.211).repeat((3, 3, 2))), ("diamond Si", bulk("Si", "diamond", a=5.431, cubic=True))]:
    i, d = neighbor_list("id", atoms, cutoff=5.0)
    sel = i == 0                                   # all neighbours of atom 0 within 5 A
    dist = np.round(d[sel], 3)
    shells, counts = np.unique(dist, return_counts=True)
    print(name)
    for k, (s, c) in enumerate(zip(shells[:4], counts[:4]), 1):
        print("   shell %d: r = %.3f A   %2d neighbours" % (k, s, c))
