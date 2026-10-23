import numpy as np
from lj import pair_energy, total_energy

def test_minimum_depth():
    assert abs(pair_energy(2 ** (1 / 6)) + 1.0) < 1e-12           # the well depth is epsilon

def test_zero_crossing():
    assert abs(pair_energy(1.0)) < 1e-12                           # E(sigma) = 0

def test_two_atoms_equals_pair():
    pos = [[0, 0, 0], [1.3, 0, 0]]
    assert abs(total_energy(pos) - pair_energy(1.3)) < 1e-12

def test_translation_and_rotation_invariance():
    rng = np.random.default_rng(0)
    pos = rng.random((10, 3)) * 3
    shifted = pos + np.array([5.0, -2.0, 1.0])
    rotated = pos @ np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]]).T
    e0 = total_energy(pos)
    assert abs(total_energy(shifted) - e0) < 1e-9 * abs(e0)
    assert abs(total_energy(rotated) - e0) < 1e-9 * abs(e0)

def test_permutation_invariance():
    rng = np.random.default_rng(1)
    pos = rng.random((8, 3)) * 3
    assert abs(total_energy(pos) - total_energy(pos[::-1])) < 1e-9 * abs(total_energy(pos))

def test_cutoff_reduces_to_full_for_large_cutoff():
    pos = [[0, 0, 0], [1.1, 0, 0], [0, 1.2, 0]]
    assert abs(total_energy(pos, cutoff=100.0) - total_energy(pos)) < 1e-12
