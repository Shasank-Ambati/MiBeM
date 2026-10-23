"""Harmonic oscillator x'' = -x: explicit Euler, symplectic Euler and velocity Verlet. Exact: x = cos t, E = 1/2."""
import numpy as np

def run(method, dt, t_end=100.0):
    n = int(round(t_end / dt)); x, v = 1.0, 0.0
    E = np.empty(n + 1); E[0] = 0.5
    for i in range(n):
        if method == "euler":
            x, v = x + dt * v, v - dt * x
        elif method == "symplectic":
            v = v - dt * x; x = x + dt * v
        else:                                              # velocity Verlet
            a = -x; x = x + dt * v + 0.5 * dt * dt * a; v = v + 0.5 * dt * (a + (-x))
        E[i + 1] = 0.5 * (v * v + x * x)
    return x, v, E, n * dt

print("   method        dt     steps   x(100)    exact cos(100)   E(100)      max |E - 1/2|")
for method in ("euler", "symplectic", "verlet"):
    for dt in (0.1, 0.01):
        x, v, E, t = run(method, dt)
        print("   %-10s  %5.2f   %5d  %8.4f   %8.4f       %9.5f   %9.5f" % (method, dt, int(round(t / dt)), x, np.cos(t), E[-1], np.max(np.abs(E - 0.5))))
