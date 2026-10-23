"""Write one structure in the formats used by the common codes, and read it back."""
from ase.build import bulk
from ase.io import read, write

cu = bulk("Cu", "fcc", a=3.615, cubic=True)
write("cu.cif", cu)
write("cu.xyz", cu)
write("POSCAR", cu, format="vasp")                                   # VASP
write("cu.lammps-data", cu, format="lammps-data", masses=True)      # LAMMPS read_data
write("cu.pw.in", cu, format="espresso-in",                         # Quantum ESPRESSO (structure part only)
      pseudopotentials={"Cu": "Cu.pbe-dn-kjpaw_psl.1.0.0.UPF"}, input_data={"calculation": "scf", "ecutwfc": 45}, kpts=(8, 8, 8))
for fn in ("cu.cif", "POSCAR", "cu.lammps-data", "cu.xyz"):
    print("=" * 20, fn); print(open(fn).read())
back = read("cu.cif")
print("read back from CIF:", back, " same cell:", abs(back.cell.array - cu.cell.array).max() < 1e-8)
