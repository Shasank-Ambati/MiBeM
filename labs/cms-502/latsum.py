"""Fit a Lennard-Jones and a Morse potential to the lattice constant, cohesive energy and bulk modulus of copper by lattice sums (numpy)."""
import numpy as np
from scipy.optimize import brentq

a0, Ecoh, B_target = 3.615, 3.54, 140.0                       # Angstrom, eV/atom, GPa  (copper: EAM/experiment values)
GPa = 160.21766                                               # eV/A^3 -> GPa
def fcc_neighbour_distances(a, rmax=14.0):
    """Distances from one atom of an fcc crystal with lattice constant a to all other atoms within rmax."""
    n = int(rmax / a) + 2
    basis = np.array([[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]])
    pts = np.array([[i, j, k] for i in range(-n, n + 1) for j in range(-n, n + 1) for k in range(-n, n + 1)])
    pos = (pts[:, None, :] + basis[None, :, :]).reshape(-1, 3) * a
    d = np.linalg.norm(pos, axis=1); d = d[(d > 1e-9) & (d < rmax)]
    return np.sort(d)
def energy_per_atom(phi, a, rmax=14.0):
    return 0.5 * phi(fcc_neighbour_distances(a, rmax)).sum()
def bulk_modulus(phi, a, rmax=14.0, h=1e-3):
    V = lambda aa: aa**3 / 4
    e = [energy_per_atom(phi, a * (1 + s), rmax) for s in (-h, 0, h)]
    # B = V d2E/dV2, with V = a^3/4 per atom
    d2 = (e[0] - 2 * e[1] + e[2]) / (a * h)**2                  # d2E/da2
    dE = (e[2] - e[0]) / (2 * a * h)                            # dE/da (zero at the minimum)
    dVda = 3 * a**2 / 4; d2Vda2 = 6 * a / 4
    d2EdV2 = (d2 - dE * d2Vda2 / dVda) / dVda**2
    return V(a) * d2EdV2 * GPa

rnn = a0 / np.sqrt(2)
# Lennard-Jones: phi = 4 eps [(sigma/r)^12 - (sigma/r)^6]; only two parameters, so a0 and E_coh are fitted and B is a result
d = fcc_neighbour_distances(a0, 40.0)
A12 = ((rnn / d)**12).sum(); A6 = ((rnn / d)**6).sum()
x6 = A6 / (2 * A12); sigma = rnn * (x6)**(1 / 6) if False else rnn / (2 * A12 / A6)**(1 / 6)
eps = Ecoh / (A6**2 / (2 * A12))
phi_lj = lambda r: 4 * eps * ((sigma / r)**12 - (sigma / r)**6)
print(f"Lennard-Jones: lattice sums A12 = {A12:.4f}, A6 = {A6:.4f};  sigma = {sigma:.4f} A, epsilon = {eps:.4f} eV")
print(f"   check: E(a0) = {-energy_per_atom(phi_lj, a0, 40.0):.4f} eV coh,  dE/da at a0 = {(energy_per_atom(phi_lj, a0*1.0005, 40.0) - energy_per_atom(phi_lj, a0*0.9995, 40.0)) / (0.001 * a0):.2e} eV/A,  B = {bulk_modulus(phi_lj, a0, 40.0):.1f} GPa")

# Morse: phi = D [exp(-2 alpha (r - r0)) - 2 exp(-alpha (r - r0))] with r0 = rnn (so the minimum of the pair at a0 is not the minimum of the crystal: fit r0 as well)
def morse(D, alpha, r0): return lambda r: D * (np.exp(-2 * alpha * (r - r0)) - 2 * np.exp(-alpha * (r - r0)))
from scipy.optimize import fsolve
def conditions(p):
    D, alpha, r0 = p
    ph = morse(D, alpha, r0)
    e = energy_per_atom(ph, a0, 10.0)
    de = (energy_per_atom(ph, a0 * 1.0005, 10.0) - energy_per_atom(ph, a0 * 0.9995, 10.0)) / (0.001 * a0)
    return [e + Ecoh, de * 10.0, (bulk_modulus(ph, a0, 10.0) - B_target) / 100.0]
D, alpha, r0 = fsolve(conditions, [0.34, 1.36, 2.87])
phi_m = morse(D, alpha, r0)
print(f"Morse: D = {D:.4f} eV, alpha = {alpha:.4f} 1/A, r0 = {r0:.4f} A  (fitted to a0 = {a0}, E_coh = {Ecoh} eV, B = {B_target} GPa)")
print(f"   check: E(a0) = {energy_per_atom(phi_m, a0, 10.0):.4f} eV, B = {bulk_modulus(phi_m, a0, 10.0):.1f} GPa")
np.savetxt("pair_params.txt", [sigma, eps, D, alpha, r0])
