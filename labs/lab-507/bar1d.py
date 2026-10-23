"""The simplest finite-element problem: -u'' = 1 on (0,1), u(0)=u(1)=0, exact solution u = x(1-x)/2."""
import numpy as np
from skfem import MeshLine, Basis, ElementLineP1, ElementLineP2, BilinearForm, LinearForm, solve, condense
from skfem.helpers import dot, grad

@BilinearForm
def a(u, v, w): return dot(grad(u), grad(v))
@LinearForm
def f(v, w): return 1.0 * v

exact = lambda x: x * (1 - x) / 2
print("elements   h        max nodal error   max error (fine grid)   L2 error     H1 error")
prev = None
for n in (4, 8, 16, 32, 64, 128):
    m = MeshLine(np.linspace(0, 1, n + 1))
    basis = Basis(m, ElementLineP1())
    A, b = a.assemble(basis), f.assemble(basis)
    u = solve(*condense(A, b, D=basis.get_dofs()))
    nodal = np.abs(u - exact(m.p[0])).max()
    # L2 and H1 error of the piecewise-linear solution, integrated with Gauss points
    xq = basis.global_coordinates().value
    uq = basis.interpolate(u).value
    duq = basis.interpolate(u).grad[0]
    dx = basis.dx
    L2 = np.sqrt(np.sum((uq - exact(xq))**2 * dx)); H1 = np.sqrt(np.sum((duq - (0.5 - xq))**2 * dx))
    xf = np.linspace(0, 1, 2001); fine = np.abs(np.interp(xf, m.p[0], u) - exact(xf)).max()
    print("  %4d   %.5f    %.2e            %.2e          %.3e   %.3e" % (n, 1 / n, nodal, fine, L2, H1))
