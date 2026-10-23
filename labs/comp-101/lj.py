"""Lennard-Jones energy of a set of atoms (reduced units by default)."""
import numpy as np

def pair_energy(r, epsilon=1.0, sigma=1.0):
    """Energy of one pair at distance r."""
    x = (sigma / r) ** 6
    return 4.0 * epsilon * (x * x - x)

def total_energy(positions, epsilon=1.0, sigma=1.0, cutoff=None):
    """Sum of pair energies over all distinct pairs (open boundaries). Pairs beyond cutoff are ignored."""
    positions = np.asarray(positions, dtype=float)
    d = np.linalg.norm(positions[:, None, :] - positions[None, :, :], axis=-1)
    i, j = np.triu_indices(len(positions), 1)               # each pair once
    r = d[i, j]
    if cutoff is not None:
        r = r[r < cutoff]
    return float(np.sum(pair_energy(r, epsilon, sigma)))
