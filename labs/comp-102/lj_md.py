"""A molecular-dynamics simulation of a Lennard-Jones fluid in NumPy: periodic box, minimum image, cutoff, velocity Verlet, NVE."""
import numpy as np, time, sys

def fcc_lattice(n_cells, rho):
    a = (4.0 / rho) ** (1 / 3)                                    # cubic cell with 4 atoms
    basis = np.array([[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]])
    g = np.arange(n_cells)
    cells = np.array(np.meshgrid(g, g, g, indexing="ij")).reshape(3, -1).T
    pos = (cells[:, None, :] + basis[None, :, :]).reshape(-1, 3) * a
    return pos, n_cells * a

def forces(pos, L, rc):
    """Lennard-Jones forces, potential energy and virial with the minimum-image convention; shifted so that the energy is continuous at rc."""
    d = pos[:, None, :] - pos[None, :, :]
    d -= L * np.round(d / L)                                       # minimum image
    r2 = (d ** 2).sum(-1); np.fill_diagonal(r2, 1e30)                                      # no self-interaction
    mask = r2 < rc * rc
    inv6 = np.where(mask, 1.0 / r2 ** 3, 0.0)
    f_over_r = np.where(mask, 24.0 * (2.0 * inv6 * inv6 - inv6) / r2, 0.0)
    f = (f_over_r[:, :, None] * d).sum(1)
    shift = 4.0 * (rc ** -12 - rc ** -6)
    pe = 0.5 * np.sum(np.where(mask, 4.0 * (inv6 * inv6 - inv6) - shift, 0.0))
    virial = 0.5 * np.sum(np.where(mask, f_over_r * r2, 0.0))       # sum over pairs of r . f
    return f, pe, virial

def run(n_cells=3, rho=0.8442, T0=1.7, dt=0.004, steps=5000, rc=2.5, seed=1, every=500, verbose=True, snap_every=0):
    pos, L = fcc_lattice(n_cells, rho); N = len(pos)
    rng = np.random.default_rng(seed)
    v = rng.normal(size=(N, 3)); v -= v.mean(0); v *= np.sqrt(3 * (N - 1) * T0 / (v ** 2).sum())   # exact initial temperature, zero momentum
    f, pe, vir = forces(pos, L, rc)
    upos = pos.copy(); out = []; snaps = []                        # upos: positions without wrapping (for the mean-square displacement)
    for step in range(steps + 1):
        ke = 0.5 * (v ** 2).sum(); T = 2 * ke / (3 * (N - 1)); P = (N * T + vir / 3.0) / L ** 3
        out.append((step, T, ke / N, pe / N, (ke + pe) / N, P))
        if verbose and step % every == 0: print("  %5d   %7.4f   %8.4f  %8.4f  %9.5f  %7.3f" % out[-1])
        if snap_every and step % snap_every == 0: snaps.append((upos.copy(), pos.copy()))
        v += 0.5 * dt * f; pos += dt * v; upos += dt * v; pos %= L
        f, pe, vir = forces(pos, L, rc); v += 0.5 * dt * f
    return (np.array(out), pos, L, snaps) if snap_every else (np.array(out), pos, L)

if __name__ == "__main__":
    t0 = time.time()
    print("   step      T*        KE/N      PE/N      E/N          P*")
    data, pos, L = run()
    E = data[:, 4]
    print("N = %d, box L = %.4f, time %.1f s ; energy drift over the run: %.2e per atom (%.4f %% of |E|), std of E: %.2e" % (len(pos), L, time.time() - t0, E[-1] - E[0], 100 * abs((E[-1] - E[0]) / E[0]), E.std()))
