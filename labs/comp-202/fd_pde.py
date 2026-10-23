"""Finite differences for the heat equation, Poisson's equation and advection."""
import numpy as np, scipy.sparse as sp, scipy.sparse.linalg as spl, time

D = 1.0
def exact(x, t): return np.exp(-D * np.pi**2 * t) * np.sin(np.pi * x)

def ftcs(N, r, T):
    x = np.linspace(0, 1, N + 1); dx = 1 / N; dt = r * dx**2 / D; n = int(round(T / dt)); u = np.sin(np.pi * x)
    for _ in range(n):
        u[1:-1] += r * (u[2:] - 2 * u[1:-1] + u[:-2])
    return x, u, n * dt

print("1. explicit (FTCS) scheme for u_t = D u_xx on [0,1], u(0) = u(1) = 0, u(x,0) = sin(pi x), N = 50 intervals, to t = 0.1")
print("   r = D dt/dx^2   steps   max|u|        max error vs exact")
for r in (0.25, 0.4, 0.5, 0.51, 0.55):
    x, u, t = ftcs(50, r, 0.1)
    print(f"   {r:6.2f}       {int(round(t / (r / 2500))):6d}   {np.max(np.abs(u)):.3e}   {np.max(np.abs(u - exact(x, t))):.3e}")
print("   the scheme is stable for r <= 1/2: the amplification factor of the grid mode with wavelength 2 dx is 1 - 4r, and |1 - 4r| > 1 for r > 1/2")

print("\n2. accuracy in time at fixed dx = 1/400: error at t = 0.1 versus the time step")
N = 400; dx = 1 / N; x = np.linspace(0, 1, N + 1)
m = N - 1
Lap = sp.diags([1, -2, 1], [-1, 0, 1], shape=(m, m), format="csc", dtype=float) / dx**2
I = sp.identity(m, format="csc", dtype=float)
def theta_scheme(dt, theta, T=0.1):
    n = int(round(T / dt)); u = np.sin(np.pi * x[1:-1])
    lu = spl.splu((I - theta * dt * D * Lap).tocsc()); B = (I + (1 - theta) * dt * D * Lap).tocsc()
    for _ in range(n): u = lu.solve(B @ u)
    return np.max(np.abs(u - exact(x[1:-1], n * dt)))
print("       dt        backward Euler (theta=1)  ratio   Crank-Nicolson (theta=1/2)  ratio")
pb = pc = None
for dt in (0.04, 0.02, 0.01, 0.005, 0.0025):
    eb, ec = theta_scheme(dt, 1.0), theta_scheme(dt, 0.5)
    print(f"   {dt:8.5f}      {eb:10.3e}   {(pb / eb if pb else float('nan')):7.2f}      {ec:10.3e}          {(pc / ec if pc else float('nan')):7.2f}")
    pb, pc = eb, ec
print("   implicit methods are stable for any dt: backward Euler is first order in time, Crank-Nicolson second order")

print("\n3. Poisson's equation  -Laplacian u = 2 pi^2 sin(pi x) sin(pi y)  on the unit square, exact solution sin(pi x) sin(pi y)")
print("      m        unknowns   max error       ratio   solve time (s)")
prev = None
for m in (10, 20, 40, 80, 160, 320):
    h = 1 / (m + 1); xs = np.linspace(h, 1 - h, m); X, Y = np.meshgrid(xs, xs, indexing="ij")
    T1 = sp.diags([-1, 2, -1], [-1, 0, 1], shape=(m, m), dtype=float); Id = sp.identity(m)
    A = ((sp.kron(Id, T1) + sp.kron(T1, Id)) / h**2).tocsc()
    b = (2 * np.pi**2 * np.sin(np.pi * X) * np.sin(np.pi * Y)).ravel()
    t0 = time.perf_counter(); u = spl.spsolve(A, b); ts = time.perf_counter() - t0
    err = np.max(np.abs(u - (np.sin(np.pi * X) * np.sin(np.pi * Y)).ravel()))
    print(f"   {m:4d}   {m * m:9d}   {err:.4e}   {(prev / err if prev else float('nan')):6.2f}   {ts:8.3f}")
    prev = err
print("   halving h divides the error by 4 (second order)")

print("\n4. advection u_t + a u_x = 0, periodic, a Gaussian pulse of height 1 moved once around the domain (N = 200, CFL = a dt/dx = 0.8)")
N = 200; L = 1.0; dx = L / N; a = 1.0; nu = 0.8; dt = nu * dx / a; steps = int(round(L / (a * dt)))
x = np.arange(N) * dx
u0 = np.exp(-((x - 0.5) / 0.05)**2)
def run(scheme):
    u = u0.copy()
    for _ in range(steps):
        up, um = np.roll(u, -1), np.roll(u, 1)
        if scheme == "upwind": u = u - nu * (u - um)
        elif scheme == "lax-wendroff": u = u - 0.5 * nu * (up - um) + 0.5 * nu**2 * (up - 2 * u + um)
        elif scheme == "central (FTCS)": u = u - 0.5 * nu * (up - um)
    return u
print("   scheme            peak after one period   minimum   L2 error")
for sc in ("upwind", "lax-wendroff", "central (FTCS)"):
    u = run(sc)
    print(f"   {sc:15s}   {np.max(u):12.4f}          {np.min(u): .4f}     {np.sqrt(dx * np.sum((u - u0)**2)):.4f}")
print("   upwind is monotone but smears the pulse (numerical diffusion); Lax-Wendroff keeps the height but creates oscillations (negative values); the central scheme is unstable")
