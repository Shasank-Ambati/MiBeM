"""Phonons of fcc copper with phonopy, using ASE's EMT potential for the forces (finite-displacement method)."""
import warnings; warnings.filterwarnings("ignore")
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ase import Atoms
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.optimize import BFGS
from ase.filters import FrechetCellFilter
from phonopy import Phonopy
from phonopy.structure.atoms import PhonopyAtoms

def make_phonopy(atoms, n, distance=0.01):
    """Displace atoms in an n x n x n supercell, compute the forces with EMT, and build the force constants."""
    cell = PhonopyAtoms(symbols=atoms.get_chemical_symbols(), cell=atoms.cell.array, scaled_positions=atoms.get_scaled_positions())
    ph = Phonopy(cell, supercell_matrix=np.diag([n, n, n]))
    ph.generate_displacements(distance=distance)
    forces = []
    for sc in ph.supercells_with_displacements:
        at = Atoms(sc.symbols, cell=sc.cell, scaled_positions=sc.scaled_positions, pbc=True); at.calc = EMT()
        forces.append(at.get_forces())
    ph.forces = forces
    ph.produce_force_constants()
    return ph

if __name__ == "__main__":
    # 1. relax the primitive cell (positions and cell) with the same potential: phonons need zero force and zero stress
    cu = bulk("Cu", "fcc", a=3.6); cu.calc = EMT()
    BFGS(FrechetCellFilter(cu), logfile=None).run(fmax=1e-4)
    print("relaxed lattice constant a = %.4f A" % (2 * cu.cell[0, 1]))

    ph = make_phonopy(cu, 4)
    print("number of displaced supercells: %d, atoms per supercell: %d" % (len(ph.supercells_with_displacements), len(ph.supercells_with_displacements[0].symbols)))

    # 2. frequencies (THz) at high-symmetry points
    pts = {"Gamma": [0, 0, 0], "X": [0.5, 0, 0.5], "L": [0.5, 0.5, 0.5], "K": [0.375, 0.375, 0.75]}
    print("\nfrequencies (THz) of the three branches")
    for name, q in pts.items():
        ph.run_qpoints([q]); f = ph.qpoints.frequencies[0]
        print("  %-6s %s" % (name, "  ".join("%6.3f" % x for x in f)))

    # 3. band structure and density of states
    G, X, W, K, L = [0, 0, 0], [0.5, 0, 0.5], [0.5, 0.25, 0.75], [0.375, 0.375, 0.75], [0.5, 0.5, 0.5]
    path = [[G, X, W, K, G, L]]
    qpoints = [np.linspace(a, b, 60) for a, b in zip(path[0][:-1], path[0][1:])]
    ph.run_band_structure(qpoints, labels=["Γ", "X", "W", "K", "Γ", "L"])
    ph.run_mesh([24, 24, 24]); ph.run_total_dos(sigma=0.1)
    fig, ax = plt.subplots(1, 2, figsize=(8, 3.6), gridspec_kw={"width_ratios": [3, 1]}, sharey=True)
    bs = ph.band_structure
    for d, f in zip(bs.distances, bs.frequencies): ax[0].plot(d, f, "k", lw=1)
    ticks = [d[0] for d in bs.distances] + [bs.distances[-1][-1]]
    ax[0].set_xticks(ticks); ax[0].set_xticklabels(["Γ", "X", "W", "K", "Γ", "L"]); ax[0].set_ylabel("frequency (THz)")
    for t in ticks: ax[0].axvline(t, color="grey", lw=0.5)
    ax[1].plot(ph.total_dos.dos, ph.total_dos.frequency_points, "k"); ax[1].set_xlabel("DOS")
    fig.tight_layout(); fig.savefig("cu_phonons.png", dpi=130)
    fmax = ph.total_dos.frequency_points[np.where(ph.total_dos.dos > 1e-3)[0][-1]]
    print("\nhighest frequency in the DOS: about %.2f THz = %.1f meV = %.0f cm^-1" % (fmax, fmax * 4.13567, fmax * 33.3564))

    # 4. thermodynamics from the harmonic phonons
    ph.run_mesh([30, 30, 30]); ph.run_thermal_properties(t_min=10, t_max=1000, t_step=10)
    tp = ph.thermal_properties
    T, F, S, Cv = tp.temperatures, tp.free_energy, tp.entropy, tp.heat_capacity   # kJ/mol, J/K/mol, J/K/mol
    print("\n   T (K)   F_vib (kJ/mol)   S (J/K/mol)   C_v (J/K/mol)   C_v/3R")
    R = 8.314462618
    for t in (50, 100, 200, 300, 500, 1000):
        i = list(T).index(t); print("  %5d    %9.3f      %8.2f      %8.2f        %.3f" % (t, F[i], S[i], Cv[i], Cv[i] / (3 * R)))
    np.save("cu_cv.npy", np.array([T, Cv]))

    # 5. Debye temperature that reproduces C_v at each temperature
    from scipy.integrate import quad
    from scipy.optimize import brentq
    def cv_debye(T, theta):
        f = lambda x: x**4 * np.exp(x) / (np.exp(x) - 1) ** 2
        return 9 * R * (T / theta) ** 3 * quad(f, 0, theta / T)[0]
    print("\nT (K)   theta_D that reproduces C_v (K)")
    for t in (50, 100, 200, 300):
        i = list(T).index(t); print("  %4d    %5.0f" % (t, brentq(lambda th: cv_debye(t, th) - Cv[i], 100, 1000)))
