"""Concentration-dependent diffusion D(c): the profiles collapse onto one curve of x/sqrt(t) (Boltzmann), and D(c) can be recovered from the profile (Boltzmann-Matano)."""
import numpy as np
import fipy as fp

D = lambda c: 1e-12 * (1 + 9 * c)          # diffusivity increases tenfold from c = 0 to c = 1 (m^2/s)
L, nx = 3e-3, 600
profiles = {}
for t_end in (3600.0, 14400.0, 57600.0):    # 1 h, 4 h, 16 h
    mesh = fp.Grid1D(nx=nx, Lx=L)
    c = fp.CellVariable(mesh=mesh, value=0.0, hasOld=True); c.constrain(1.0, mesh.facesLeft)
    eq = fp.TransientTerm() == fp.DiffusionTerm(coeff=D(c.faceValue))
    nsteps = 200
    for _ in range(nsteps):
        c.updateOld(); res = 1e9
        while res > 1e-8: res = eq.sweep(var=c, dt=t_end / nsteps)      # sweeps to converge the nonlinearity D(c)
    profiles[t_end] = (mesh.cellCenters.value[0].copy(), c.value.copy())

print("collapse test: concentration at fixed eta = x/sqrt(t) for three times")
print("  eta (um/sqrt(s))     c(1 h)    c(4 h)    c(16 h)")
for eta in (0.5, 1.0, 2.0, 3.0, 4.0, 5.0):
    row = [np.interp(eta * 1e-6 * np.sqrt(t), x, c) for t, (x, c) in profiles.items()]
    print("      %5.1f           %.4f    %.4f    %.4f" % ((eta,) + tuple(row)))

# Boltzmann-Matano analysis of the 16 h profile
t = 57600.0; x, c = profiles[t]
eta = x / np.sqrt(t)
cc, ee = c[::-1], eta[::-1]                  # increasing concentration for the integration
print("\nrecovered diffusivity (16 h profile)")
print("     c      D from the profile (m^2/s)   true D(c)       error")
for c_star in (0.1, 0.3, 0.5, 0.7, 0.9):
    m = cc <= c_star
    integral = np.trapezoid(ee[m], cc[m])
    deta_dc = np.interp(c_star, cc, np.gradient(ee, cc))
    Drec = -0.5 * deta_dc * integral
    print("   %.1f          %.3e            %.3e     %+.1f %%" % (c_star, Drec, D(c_star), 100 * (Drec / D(c_star) - 1)))
