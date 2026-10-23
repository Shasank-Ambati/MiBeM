"""Numerical errors of the diffusion calculation: mesh size and time step (implicit Euler)."""
import numpy as np
from carburising import simulate, analytic

print("mesh refinement (400 time steps)")
print("   cells   dx (um)   max error (wt%)")
for nx in (25, 50, 100, 200, 400, 800):
    x, c, D, t = simulate(nx=nx, nsteps=400); print("  %5d   %7.2f    %.2e" % (nx, 3e3 / nx, abs(c - analytic(x, D, t)).max()))
print("\ntime step (800 cells)")
print("   steps   dt (s)   max error (wt%)")
for ns in (5, 10, 20, 40, 80, 160, 320):
    x, c, D, t = simulate(nx=800, nsteps=ns); print("  %5d   %7.0f    %.2e" % (ns, 36000 / ns, abs(c - analytic(x, D, t)).max()))
