"""Linear elasticity (plane stress) of a plate with a central circular hole under tension: stress concentration factor from the finite-element solution."""
import numpy as np
from skfem import Basis, FacetBasis, ElementTriP1, ElementTriP2, ElementVector, BilinearForm, LinearForm, solve, condense
from skfem.helpers import sym_grad, dot, ddot, eye, trace
from plate_mesh import plate_mesh

E, nu, sigma0 = 200e3, 0.3, 100.0                      # MPa, -, MPa (applied stress on the top edge)
lam, mu = E * nu / (1 - nu**2), E / (2 * (1 + nu))      # plane-stress Lame constants
def stress(u): return 2 * mu * sym_grad(u) + eye(lam * trace(sym_grad(u)), 2)

@BilinearForm
def stiffness(u, v, w): return ddot(stress(u), sym_grad(v))
@LinearForm
def traction(v, w): return sigma0 * v.value[1]

def solve_plate(n, order, R=5.0, W=50.0):
    mesh = plate_mesh(n, R, W)
    el = ElementVector(ElementTriP1() if order == 1 else ElementTriP2())
    basis = Basis(mesh, el)
    fb = FacetBasis(mesh, el, facets=mesh.boundaries["top"])
    K, f = stiffness.assemble(basis), traction.assemble(fb)
    fixed = np.concatenate([basis.get_dofs("left", skip=["u^2"]).all(), basis.get_dofs("bottom", skip=["u^1"]).all()])   # symmetry planes: u_x = 0 on x = 0, u_y = 0 on y = 0
    u = solve(*condense(K, f, D=fixed))
    # recover the stress: L2 projection of sigma_yy onto continuous piecewise-linear functions
    pb = Basis(mesh, ElementTriP1(), quadrature=basis.quadrature)
    syy = pb.project(stress(basis.interpolate(u))[1, 1])
    sxx = pb.project(stress(basis.interpolate(u))[0, 0])
    return mesh, basis, pb, u, sxx, syy

if __name__ == "__main__":
    R, W = 5.0, 50.0
    dW = 2 * R / (2 * W)                                                   # d/W with d = 2R and W = 2 * 50 (full width)
    Kt_net = 3.00 - 3.13 * dW + 3.66 * dW**2 - 1.53 * dW**3               # Peterson, chart 4.1: based on the NET section stress
    s_net = sigma0 / (1 - dW)                                              # nominal stress in the ligament: force sigma0 * W over the area (W - R)
    print("d/W = %.2f ;  gross stress %.1f MPa ;  net-section stress %.1f MPa ;  Kt_net (Peterson) = %.3f\n" % (dW, sigma0, s_net, Kt_net))
    print("element   n   nodes  triangles  dofs    sigma_yy(R,0)   Kt_gross   Kt_net   difference from Peterson")
    for order in (1, 2):
        for n in (5, 10, 20, 40, 80):
            mesh, basis, pb, u, sxx, syy = solve_plate(n, order)
            i = np.argmin(np.hypot(mesh.p[0] - R, mesh.p[1]))                           # node at (R, 0)
            print("   P%d    %3d  %5d  %6d  %7d     %7.2f MPa     %.3f    %.3f    %+.1f %%" % (order, n, mesh.p.shape[1], mesh.t.shape[1], basis.N, syy[i], syy[i] / sigma0, syy[i] / s_net, 100 * (syy[i] / s_net / Kt_net - 1)))
