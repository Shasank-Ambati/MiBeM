"""Symmetry-reduced k-point meshes with spglib: how many k points does a calculation really need?"""
import numpy as np, spglib
from ase.build import bulk

def n_irreducible(atoms, mesh, shift=(0, 0, 0)):
    cell = (atoms.cell[:], atoms.get_scaled_positions(), atoms.numbers)
    mapping, grid = spglib.get_ir_reciprocal_mesh(mesh, cell, is_shift=shift)
    return len(np.unique(mapping)), int(np.prod(mesh))
systems = {
    "fcc Al (1 atom, primitive)": bulk("Al", "fcc", a=4.05),
    "diamond Si (2 atoms, primitive)": bulk("Si", "diamond", a=5.43),
    "bcc Fe (1 atom, primitive)": bulk("Fe", "bcc", a=2.87),
    "hcp Mg (2 atoms)": bulk("Mg", "hcp", a=3.21, c=5.21),
    "fcc Al, 2x2x2 conventional supercell (32 atoms)": bulk("Al", "fcc", a=4.05, cubic=True).repeat((2, 2, 2)),
}
print("number of irreducible k points / total mesh points (Gamma-centred meshes)")
print("system                                              4x4x4        8x8x8       12x12x12")
for name, at in systems.items():
    row = []
    for m in (4, 8, 12):
        mesh = (m // 2,) * 3 if len(at) == 32 else (m,) * 3
        ni, nt = n_irreducible(at, mesh)
        row.append(f"{ni:4d}/{nt:5d}" + ("*" if len(at) == 32 else " "))
    print(f"{name:48s}  " + "    ".join(row))
print("* for the 32-atom supercell (twice as long in each direction) the mesh is halved: 2x2x2, 4x4x4 and 6x6x6, which samples the same density of k points")
print("\nan irreducible k point carries a weight: the weights of the irreducible points of a 4x4x4 Gamma-centred mesh of fcc Al")
at = bulk("Al", "fcc", a=4.05); cell = (at.cell[:], at.get_scaled_positions(), at.numbers)
mapping, grid = spglib.get_ir_reciprocal_mesh((4, 4, 4), cell, is_shift=(0, 0, 0))
u, c = np.unique(mapping, return_counts=True)
print("   " + ", ".join(f"{x / 64:.4f}" for x in c) + f"   (sum = {c.sum() / 64:.0f}; {len(u)} points)")
