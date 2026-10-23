"""Stress concentration factor against hole size, compared with Peterson's polynomial (net-section nominal stress)."""
import numpy as np
from plate_hole import solve_plate, sigma0

W = 50.0
print("  R (mm)   d/W    sigma_max (MPa)   Kt_net (FE)   Kt_net (Peterson)   difference")
for R in (1.0, 2.5, 5.0, 10.0, 15.0, 20.0):
    mesh, basis, pb, u, sxx, syy = solve_plate(40, 2, R=R, W=W)
    i = np.argmin(np.hypot(mesh.p[0] - R, mesh.p[1])); dW = R / W
    Kt_fe = syy[i] / (sigma0 / (1 - dW)); Kt_p = 3.00 - 3.13 * dW + 3.66 * dW**2 - 1.53 * dW**3
    print("  %5.1f   %.2f     %7.1f          %.3f          %.3f             %+.1f %%" % (R, dW, syy[i], Kt_fe, Kt_p, 100 * (Kt_fe / Kt_p - 1)))
