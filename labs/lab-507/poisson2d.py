"""Poisson equation -Laplace(u) = 1 on the unit square with u = 0 on the boundary (torsion of a square bar, or steady heat conduction with uniform heating)."""
import numpy as np, time
from skfem import MeshTri, Basis, ElementTriP1, ElementTriP2, BilinearForm, LinearForm, solve, condense
from skfem.helpers import dot, grad

@BilinearForm
def a(u, v, w): return dot(grad(u), grad(v))
@LinearForm
def f(v, w): return 1.0 * v

# exact value at the centre from the double sine series
m = np.arange(1, 400, 2)[:, None]; n = np.arange(1, 400, 2)[None, :]
exact = (16 / np.pi**4 * np.sin(m * np.pi / 2) * np.sin(n * np.pi / 2) / (m * n * (m**2 + n**2))).sum()
print("exact u(1/2,1/2) = %.7f" % exact)
print("\n element   refinement   unknowns    u_centre     error       time (s)")
for name, el in (("P1", ElementTriP1()), ("P2", ElementTriP2())):
    for r in (1, 2, 3, 4, 5, 6):
        t0 = time.time()
        mesh = MeshTri().refined(r)
        basis = Basis(mesh, el)
        u = solve(*condense(a.assemble(basis), f.assemble(basis), D=basis.get_dofs()))
        uc = basis.interpolator(u)(np.array([[0.5], [0.5]]))[0]
        print("   %s        %d        %7d    %.7f   %.2e    %.3f" % (name, r, basis.N, uc, abs(uc - exact), time.time() - t0))
