"""Surface energies of the (100), (110) and (111) surfaces of copper (EAM, relaxed at 0 K).
The slabs are built with ASE (see the structures lab), written as LAMMPS data files and read back by LAMMPS."""
from ase.build import fcc100, fcc110, fcc111
from ase.io import write
from lammps import lammps

a0, ecoh, J = 3.6149, -3.54, 16.02176634            # J = conversion eV/A^2 -> J/m^2
builders = {"(100)": fcc100, "(110)": fcc110, "(111)": fcc111}

def slab_energy(name, layers):
    atoms = builders[name]("Cu", size=(4, 4, layers), a=a0, vacuum=10.0, orthogonal=True)
    atoms.pbc = True                                 # periodic in z too: the 20 A of vacuum separates the images
    write("slab.data", atoms, format="lammps-data", specorder=["Cu"], masses=True)
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    for c in ["units metal", "atom_style atomic", "boundary p p p", "read_data slab.data", "pair_style eam", "pair_coeff 1 1 Cu_u3.eam",
              "minimize 1.0e-12 1.0e-12 5000 50000", "run 0"]:
        lmp.command(c)
    E, N = lmp.get_thermo("pe"), int(lmp.get_natoms())
    A = atoms.cell[0, 0] * atoms.cell[1, 1]
    lmp.close()
    return N, A, E, (E - N * ecoh) / (2 * A) * J

print("surface   layers  atoms  area (A^2)  E_slab (eV)  gamma (J/m^2)")
for name in builders:
    for layers in (6, 8, 10):
        N, A, E, g = slab_energy(name, layers)
        print(f"{name:8s}  {layers:4d}   {N:5d}  {A:9.1f}  {E:11.3f}  {g:8.3f}")
