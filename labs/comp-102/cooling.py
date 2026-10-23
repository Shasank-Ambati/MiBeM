"""Newton's law of cooling dT/dt = -k (T - T_a): the explicit Euler method against the exact solution."""
import numpy as np
k, Ta, T0, t_end = 0.1, 20.0, 90.0, 30.0           # 1/min, deg C, deg C, min
exact = lambda t: Ta + (T0 - Ta) * np.exp(-k * t)
print("   dt (min)   steps   T(30 min) Euler   exact     error      error/dt")
for dt in (5.0, 2.0, 1.0, 0.5, 0.1, 0.01):
    n = int(round(t_end / dt)); T = T0
    for _ in range(n): T += dt * (-k * (T - Ta))
    print("   %6.2f    %5d    %9.4f      %8.4f  %9.5f  %8.4f" % (dt, n, T, exact(t_end), T - exact(t_end), (T - exact(t_end)) / dt))
