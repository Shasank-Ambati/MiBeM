"""Carburising of steel: Fick's second law solved with FiPy and compared with the analytical erf solution."""
import numpy as np
import fipy as fp
from scipy.special import erf

R = 8.314
D0, Q = 2.3e-5, 148e3                       # carbon in austenite (gamma-Fe): D = D0 exp(-Q/RT), m^2/s, J/mol
Cs, C0 = 1.0, 0.2                           # surface and initial carbon content, wt%
def D_of(T_celsius): return D0 * np.exp(-Q / (R * (T_celsius + 273.15)))

def simulate(T_celsius=927.0, hours=10.0, depth=3e-3, nx=300, nsteps=100):
    D = D_of(T_celsius); t_end = hours * 3600
    mesh = fp.Grid1D(nx=nx, Lx=depth)
    c = fp.CellVariable(mesh=mesh, value=C0, name="carbon")
    c.constrain(Cs, mesh.facesLeft)         # fixed surface concentration (carburising atmosphere)
    eq = fp.TransientTerm() == fp.DiffusionTerm(coeff=D)    # the far end has zero flux (default)
    for _ in range(nsteps): eq.solve(var=c, dt=t_end / nsteps)
    return mesh.cellCenters.value[0], c.value.copy(), D, t_end

def analytic(x, D, t): return Cs - (Cs - C0) * erf(x / (2 * np.sqrt(D * t)))

if __name__ == "__main__":
    print("T (C)    D (m^2/s)")
    for T in (800, 900, 927, 1000): print("%5d    %.2e" % (T, D_of(T)))
    x, c, D, t = simulate()
    ca = analytic(x, D, t)
    print("\nT = 927 C, 10 h: sqrt(D t) = %.3f mm" % (1e3 * np.sqrt(D * t)))
    print("  depth (mm)   FiPy (wt% C)   erf solution")
    for xd in (0.25e-3, 0.5e-3, 1.0e-3, 1.5e-3, 2.0e-3):
        i = np.argmin(abs(x - xd)); print("    %.2f        %.4f         %.4f" % (1e3 * x[i], c[i], ca[i]))
    print("  maximum difference over the whole profile: %.2e wt%%" % abs(c - ca).max())
    # case depth: depth at which the carbon content falls to 0.5 wt%
    i = np.where(c < 0.5)[0][0]; xcase = np.interp(0.5, c[::-1], x[::-1])
    from scipy.optimize import brentq
    z = brentq(lambda z: erf(z) - (Cs - 0.5) / (Cs - C0), 0.01, 3)
    print("  case depth (0.5 wt%% C): FiPy %.3f mm ; analytic 2 z sqrt(D t) = %.3f mm (z = %.4f)" % (1e3 * xcase, 2e3 * z * np.sqrt(D * t), z))
