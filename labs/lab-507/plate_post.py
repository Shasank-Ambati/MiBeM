"""Post-processing of the plate with a hole: stress along the ligament, force balance, comparison with Kirsch, and a stress map."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from plate_hole import solve_plate, sigma0

R, W = 5.0, 50.0
mesh, basis, pb, u, sxx, syy = solve_plate(40, 2)
# nodes on the bottom edge (y = 0), the ligament between the hole and the free edge
on = np.where((np.abs(mesh.p[1]) < 1e-9) & (mesh.p[0] >= R - 1e-9))[0]; on = on[np.argsort(mesh.p[0][on])]
x, s = mesh.p[0][on], syy[on]
force = np.trapezoid(s, x)
print("force balance on the ligament: integral of sigma_yy dx from R to W = %.1f N/mm ; applied sigma0 * W = %.1f N/mm  (difference %.2f %%)" % (force, sigma0 * W, 100 * (force / (sigma0 * W) - 1)))
print("\n   x/R    sigma_yy/sigma0 (FE)   Kirsch (infinite plate)")
kirsch = lambda xx: 1 + R**2 / (2 * xx**2) + 3 * R**4 / (2 * xx**4)
for xr in (1.0, 1.25, 1.5, 2.0, 3.0, 5.0, 8.0):
    xi = xr * R; print("  %4.2f      %6.3f                %6.3f" % (xr, np.interp(xi, x, s) / sigma0, kirsch(xi)))
ux = basis.interpolate(u).value
print("\nmaximum displacement u_y at the top edge: %.4f mm ; mean strain %.3e" % (u[basis.nodal_dofs[1]].max(), u[basis.nodal_dofs[1]].max() / 100))
fig, ax = plt.subplots(1, 2, figsize=(9, 4.2))
cs = ax[0].tricontourf(mesh.p[0], mesh.p[1], mesh.t.T, syy / sigma0, levels=np.linspace(-1.2, 3.2, 23), cmap="viridis")
ax[0].set_xlim(0, 30); ax[0].set_ylim(0, 30); ax[0].set_aspect("equal"); fig.colorbar(cs, ax=ax[0], label=r"$\sigma_{yy}/\sigma_0$"); ax[0].set_title("stress map near the hole"); ax[0].set_xlabel("x (mm)"); ax[0].set_ylabel("y (mm)")
xx = np.linspace(R, W, 300); ax[1].plot(x / R, s / sigma0, "o", ms=3, label="FE (P2, n = 40)"); ax[1].plot(xx / R, kirsch(xx), "-", label="Kirsch, infinite plate")
ax[1].set_xlabel("x / R"); ax[1].set_ylabel(r"$\sigma_{yy}/\sigma_0$ on y = 0"); ax[1].legend(); ax[1].set_xlim(1, 10); ax[1].set_title("stress along the ligament")
fig.tight_layout(); fig.savefig("plate_stress.png", dpi=130)
