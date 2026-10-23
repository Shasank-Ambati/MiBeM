# Lab files

Input files, scripts and figures for the hands-on labs of the site (`computational/lab-*.html`). Each folder belongs to one lab:

| Folder | Lab | Software |
| --- | --- | --- |
| `comp-101` | Code of the course COMP 101 (tests, I/O, profiling examples) | Python, numpy, pytest |
| `lab-101` | Setting up a computational workstation | Python, git, numpy, matplotlib |
| `lab-201` | Crystal structures in Python with ASE | ASE, spglib, numpy, matplotlib (no LAMMPS needed) |
| `lab-504` | Monte Carlo of the Ising model | Python, numba, numpy, scipy, matplotlib |
| `lab-505` | Phase diagrams with CALPHAD | pycalphad, numpy, matplotlib (own teaching database `teach.tdb`) |
| `lab-301` | Phonons of copper | phonopy, ASE, scipy, matplotlib (no DFT code needed) |
| `lab-506` | Diffusion and spinodal decomposition | FiPy, scipy, numpy, matplotlib |
| `lab-507` | Finite elements: bar to plate with a hole | scikit-fem, triangle, numpy, scipy, matplotlib |
| `lab-502` | Molecular dynamics of liquid argon | LAMMPS, Python (numpy, matplotlib) |
| `lab-503` | A metal with LAMMPS: copper with an EAM potential | LAMMPS, ASE |

Every number printed in LAB 201 comes from `pip install ase spglib numpy matplotlib` (ASE 3.29, spglib 2.8); `cd labs/lab-201 && python build.py` etc.

Every number printed in the lab pages was produced by running these files with LAMMPS 22 Jul 2025 (Update 4) from the PyPI `lammps` package on Linux. To reproduce them:

```
python -m venv lmpenv && source lmpenv/bin/activate
pip install lammps mpich numpy matplotlib ase
export LD_LIBRARY_PATH="$VIRTUAL_ENV/lib"
export LAMMPS_POTENTIALS="$(python -c 'import lammps, os; print(os.path.join(os.path.dirname(lammps.__file__), "share/lammps/potentials"))')"
cd labs/lab-502 && lmp -in in.lj_liquid
```

Random seeds are fixed in the inputs, so serial runs reproduce the logs; results from parallel runs or other LAMMPS versions agree statistically but not digit for digit.
