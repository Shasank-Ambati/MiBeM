"""Long-range electrostatics: the Madelung constant of rock salt by direct summation and by the Ewald method."""
import numpy as np
from itertools import product

M_exact = 1.7475645946331822
print(f"literature value of the Madelung constant of NaCl: M = {M_exact:.10f}  (energy per ion pair = -M e^2/(4 pi eps0 r0))")

print("\n1. direct summation of sum (-1)^(i+j+k) / sqrt(i^2+j^2+k^2) over the points of the lattice inside a growing region around one ion")
print("      n     cube-shaped region    sphere-shaped region")
for n in (2, 4, 8, 16, 32, 64):
    # M = - sum_{j != 0} (-1)^(i+j+k)/r_j : the field of the lattice at the central ion (+1) is -sum q_j/r_j with q_j = -(-1)^(i+j+k)
    r = np.arange(-n, n + 1); i, j, k = np.meshgrid(r, r, r, indexing="ij")
    d2 = i**2 + j**2 + k**2; s = (-1.0)**(i + j + k)
    out = []
    for shape in ("cube", "sphere"):
        m = d2 > 0
        if shape == "sphere": m &= d2 <= n * n
        out.append(-np.sum(s[m] / np.sqrt(d2[m])))
    print(f"   {n:4d}      {out[0]:12.6f}        {out[1]:12.6f}")
print("   the sums depend on the shape of the region (conditionally convergent): the cube is close to the right value, the sphere is not")

print("\n2. Ewald summation: total electrostatic energy per ion of the 8-ion cubic cell of rock salt (r0 = 1, cell side 2), charges +-1")
L = 2.0
cat = np.array([[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]], float); an = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]], float)
pos = np.vstack([cat, an]); q = np.array([1.0] * 4 + [-1.0] * 4); N = len(q)
def ewald(alpha, nreal, kmax):
    # real space
    Er = 0.0
    rng = range(-nreal, nreal + 1)
    for n in product(rng, rng, rng):
        shift = np.array(n) * L
        for i in range(N):
            for j in range(N):
                if i == j and n == (0, 0, 0): continue
                r = np.linalg.norm(pos[i] - pos[j] + shift)
                from math import erfc
                Er += 0.5 * q[i] * q[j] * erfc(alpha * r) / r
    # reciprocal space
    Ek = 0.0
    V = L**3
    for h in product(range(-kmax, kmax + 1), repeat=3):
        if h == (0, 0, 0): continue
        kv = 2 * np.pi * np.array(h) / L; k2 = kv @ kv
        S = np.sum(q * np.exp(1j * pos @ kv))
        Ek += 2 * np.pi / V * np.exp(-k2 / (4 * alpha**2)) / k2 * abs(S)**2
    Es = -alpha / np.sqrt(np.pi) * np.sum(q**2)
    return Er + Ek + Es, Er, Ek, Es
print("   alpha   real-space cells   k_max      E_real        E_recip       E_self       E_total/N    -2 E/N (= M)")
for alpha, nreal, kmax in ((1.0, 3, 6), (1.5, 2, 6), (2.0, 1, 8), (2.5, 1, 10), (3.0, 1, 12)):
    E, Er, Ek, Es = ewald(alpha, nreal, kmax)
    print(f"   {alpha:4.1f}       {nreal:2d}            {kmax:3d}    {Er:11.6f}   {Ek:11.6f}   {Es:11.6f}   {E / N:10.6f}    {-2 * E / N:10.6f}")
print("   the split between real and reciprocal space changes with alpha, the sum does not: -2E/N reproduces M")
print("\n3. convergence at alpha = 2 (cutoffs):")
for nreal, kmax in ((0, 4), (1, 4), (1, 6), (1, 8), (2, 8)):
    E = ewald(2.0, nreal, kmax)[0]
    print(f"   real-space cells +-{nreal}, k_max = {kmax}:  M = {-2 * E / N:.8f}   error = {-2 * E / N - M_exact:+.2e}")
