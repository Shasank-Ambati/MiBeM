"""Studies with the NumPy MD code: energy conservation against the time step, then a production run with block-averaged errors and g(r)."""
import numpy as np, time
from lj_md import run, forces, fcc_lattice

print("1. energy conservation in NVE (N = 108, rho = 0.8442; the same total time 8.0 for every dt)")
print("   dt        steps   std(E/N)      drift of E/N     mean T")
for dt in (0.002, 0.004, 0.008, 0.016):
    steps = int(round(8.0 / dt))                                    # same total time 8.0 for every dt
    d, pos, L = run(T0=1.7, dt=dt, steps=steps, verbose=False)
    E = d[:, 4]
    print("   %.3f   %6d    %.2e      %+.2e       %.4f" % (dt, steps, E.std(), E[-1] - E[0], d[len(d) // 2:, 1].mean()))

print("\n2. production run: equilibrate 2000 steps, then 20000 steps, dt = 0.004")
t0 = time.time()
n_cells, rho, rc, dt = 3, 0.8442, 2.5, 0.004
d, pos, L = run(T0=1.7, dt=dt, steps=22000, verbose=False)
d = d[2000:]
T, P, PE, E = d[:, 1], d[:, 5], d[:, 3], d[:, 4]
def blocks(x, nb):
    m = len(x) // nb; b = x[: m * nb].reshape(nb, m).mean(1); return b.mean(), b.std(ddof=1) / np.sqrt(nb)
print("   time %.1f s" % (time.time() - t0))
print("   quantity     mean      naive error   block error (blocks of 1000 steps)   block-size scan of the error (blocks of 50, 200, 1000, 4000 steps)")
for name, x in (("T*", T), ("P*", P), ("PE/N", PE)):
    naive = x.std(ddof=1) / np.sqrt(len(x))
    scan = [blocks(x, len(x) // bs)[1] for bs in (50, 200, 1000, 4000)]
    print("   %-6s   %8.4f   %9.5f     %9.5f                       %s" % (name, x.mean(), naive, blocks(x, len(x) // 1000)[1], "  ".join("%.5f" % s for s in scan)))
print("   total energy E/N: mean %.5f, std %.1e (conserved)" % (E.mean(), E.std()))
