"""Plane-wave expansion for a particle in a periodic potential: bands, band gap, and convergence with the cutoff for potentials of different smoothness."""
import numpy as np

a = 6.0                                     # lattice constant (bohr)
G1 = 2 * np.pi / a

def hamiltonian(k, nG, Vg):
    """Plane waves exp(i (k + G_n) x), G_n = n G1, n = -nG..nG;  Vg(m) = Fourier coefficient of the potential for G = m G1."""
    n = np.arange(-nG, nG + 1)
    H = np.diag(0.5 * (k + n * G1)**2).astype(complex)
    for i, ni in enumerate(n):
        for j, nj in enumerate(n):
            H[i, j] += Vg(ni - nj)
    return H

# three model crystal potentials with the same depth, periodic with period a
w = 0.6                                     # width parameter (bohr)
V0 = 1.0                                    # strength (hartree)
cosine = lambda m: -0.5 * V0 * (abs(m) == 1) if m != 0 else 0.0          # V(x) = -V0 cos(G1 x)
gauss = lambda m: -V0 * np.sqrt(np.pi) * w / a * np.exp(-(m * G1 * w)**2 / 4)   # periodic array of Gaussian wells, V(x) = -V0 exp(-x^2/w^2)
def square(m):                              # periodic square wells of width 2 w and depth V0 (Kronig-Penney)
    return -V0 * 2 * w / a if m == 0 else -V0 * np.sin(m * G1 * w) / (m * np.pi)
def cusp(m):                                # exponential wells V(x) = -V0 exp(-|x|/w): a cusp at the nucleus, like the Coulomb potential
    return -V0 * (2 * w / a) / (1 + (m * G1 * w)**2)

print("1. bands of the cosine potential V = -V0 cos(G x), V0 = 1 Ha, a = 6 bohr: lowest three bands at k = 0, pi/(2a) and pi/a (Hartree)")
for k in (0.0, 0.5 * G1 / 2, 0.5 * G1):
    e = np.linalg.eigvalsh(hamiltonian(k, 12, cosine))[:3]
    print(f"   k = {k:.4f}:  " + "  ".join(f"{x:9.5f}" for x in e))
e0 = np.linalg.eigvalsh(hamiltonian(0.5 * G1, 12, cosine))[:2]
print(f"   gap at the zone boundary (k = pi/a) between band 1 and 2: {e0[1] - e0[0]:.5f} Ha; two-plane-wave estimate 2|V_G| = {2 * 0.5 * V0:.5f}")
print("   (the exact gap exceeds the two-wave estimate by the coupling to the other plane waves)")

print("\n2. convergence of the lowest eigenvalue at k = 0 with the number of plane waves (error against the converged result with 401 plane waves, nG = 200)")
print("   N_PW   energy cutoff (Ha)   cosine      Gaussian wells    square wells    cusp wells")
def e_lowest(V, nG):
    return np.linalg.eigvalsh(hamiltonian(0.0, nG, V))[0]
ref = {name: e_lowest(V, 200) for name, V in (("cos", cosine), ("gauss", gauss), ("square", square), ("cusp", cusp))}
for nG in (1, 2, 3, 5, 8, 12, 20, 40):
    npw = 2 * nG + 1; ecut = 0.5 * (nG * G1)**2
    row = [abs(e_lowest(V, nG) - ref[name]) for name, V in (("cos", cosine), ("gauss", gauss), ("square", square), ("cusp", cusp))]
    print(f"   {npw:4d}      {ecut:9.3f}       " + "      ".join(f"{x:9.2e}" for x in row))
print("   reference energies (Ha):", "  ".join(f"{k} {v:.6f}" for k, v in ref.items()))

print("\n3. the rate of convergence: the number of plane waves needed for an error below 1e-6 Ha")
for name, V in (("cosine", cosine), ("Gaussian wells", gauss), ("square wells", square), ("cusp wells", cusp)):
    r = ref[{"cosine": "cos", "Gaussian wells": "gauss", "square wells": "square", "cusp wells": "cusp"}[name]]
    n = next((nG for nG in range(1, 200) if abs(e_lowest(V, nG) - r) < 1e-6), None)
    print(f"   {name:15s}: nG = {n}  ({2 * n + 1} plane waves)" if n else f"   {name:15s}: more than 200")
