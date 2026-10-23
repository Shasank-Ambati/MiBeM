"""Does the stress concentration depend on the material?  Change E and the Poisson ratio and compare sigma_max and the displacement."""
import numpy as np
import plate_hole as ph

R = 5.0
print("  E (GPa)    nu     sigma_max (MPa)   Kt_net     u_y at top (mm)")
for E, nu in ((200e3, 0.3), (70e3, 0.3), (200e3, 0.0), (200e3, 0.45)):
    ph.lam, ph.mu = E * nu / (1 - nu**2), E / (2 * (1 + nu))
    mesh, basis, pb, u, sxx, syy = ph.solve_plate(40, 2, R=R)
    i = np.argmin(np.hypot(mesh.p[0] - R, mesh.p[1]))
    print("  %6.0f    %.2f     %7.1f          %.3f      %.4f" % (E / 1e3, nu, syy[i], syy[i] / (ph.sigma0 / 0.9), u[basis.nodal_dofs[1]].max()))
