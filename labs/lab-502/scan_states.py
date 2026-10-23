"""Run in.lj_liquid at three state points (solid, liquid, gas), keep g(r) and D, and plot them."""
import subprocess, shutil, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

states = {"solid  (T*=0.5, rho*=1.05)": (0.5, 1.05), "liquid (T*=0.85, rho*=0.8442)": (0.85, 0.8442), "gas    (T*=1.5, rho*=0.1)": (1.5, 0.1)}
dt, fig, ax = 0.004, *plt.subplots(1, 2, figsize=(10, 3.8))
for name, (T, rho) in states.items():
    subprocess.run(["python", "run_lammps.py", "in.lj_liquid", "T", str(T), "rho", str(rho)], check=True)
    rows = [ln.split() for ln in open("rdf.dat") if not ln.startswith("#") and len(ln.split()) == 4]
    rdf = np.array(rows, float).reshape(-1, 100, 4).mean(axis=0)
    step, msd = np.loadtxt("msd.dat", skiprows=1, unpack=True)
    t = step * dt
    m = t > 0.25 * t[-1]
    D = np.polyfit(t[m], msd[m], 1)[0] / 6
    thermo = [ln.split() for ln in open("log.lj_liquid") if ln.strip() and ln.split()[0].isdigit() and len(ln.split()) == 6]
    press = np.mean([float(x[5]) for x in thermo[-20:]])
    g = rdf[:, 2]
    i1 = np.argmax(g)
    print(f"{name}:  D* = {D:.4f}   <P*> = {press:.2f}   g_max = {g.max():.2f} at r = {rdf[i1, 1]:.3f}   MSD(end) = {msd[-1]:.2f}")
    ax[0].plot(rdf[:, 1], g, label=name.split("(")[0].strip())
    ax[1].plot(t[1:], msd[1:], label=name.split("(")[0].strip())
ax[0].set(xlabel=r"$r/\sigma$", ylabel="g(r)", title="Radial distribution function"); ax[0].legend()
ax[1].set(xlabel=r"$t$ (reduced units)", ylabel=r"$\langle\Delta r^2\rangle/\sigma^2$", title="Mean-square displacement", xscale="log", yscale="log"); ax[1].legend()
fig.tight_layout(); fig.savefig("states.png", dpi=130)
