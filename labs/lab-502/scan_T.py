"""Self-diffusion coefficient of the LJ fluid against temperature at fixed density, averaged over independent runs."""
import subprocess, numpy as np
dt, seeds = 0.004, (11, 22, 33, 44)
rows = []
for T in (0.75, 1.0, 1.3, 1.8):
    Ds = []
    for seed in seeds:                              # different random initial velocities = independent runs
        subprocess.run(["python", "run_lammps.py", "in.lj_liquid", "T", str(T), "seed", str(seed)], check=True)
        step, msd = np.loadtxt("msd.dat", skiprows=1, unpack=True)
        t = step * dt; m = t > 0.25 * t[-1]
        Ds.append(np.polyfit(t[m], msd[m], 1)[0] / 6)
    Ds = np.array(Ds)
    rows.append((T, Ds.mean(), Ds.std(ddof=1) / np.sqrt(len(Ds))))
    print(f"T* = {T:4.2f}   D* = {Ds.mean():.4f} +/- {Ds.std(ddof=1) / np.sqrt(len(Ds)):.4f}   (runs: {', '.join(f'{d:.3f}' for d in Ds)})")
T, D, err = np.array(rows).T
slope, icpt = np.polyfit(1 / T, np.log(D), 1)
print(f"Arrhenius fit  ln D = {icpt:.2f} {slope:+.2f}/T*   ->  effective activation energy E_a = {-slope:.2f} epsilon")
