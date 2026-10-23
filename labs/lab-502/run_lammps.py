"""Run a LAMMPS input file from Python (the same as `lmp -in <file>`).

    python run_lammps.py in.lj_liquid                 # default state point
    python run_lammps.py in.lj_liquid T 0.5 rho 1.05  # override index variables
"""
import sys
from lammps import lammps

infile, extra = sys.argv[1], sys.argv[2:]
args = ["-log", "log." + infile.replace("in.", ""), "-screen", "none"]
for k, v in zip(extra[::2], extra[1::2]):
    args += ["-var", k, v]
lmp = lammps(cmdargs=args)
lmp.file(infile)
lmp.close()
