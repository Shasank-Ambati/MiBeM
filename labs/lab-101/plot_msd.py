"""Plot the mean-square displacement of the random walk and fit the diffusion coefficient."""
import numpy as np, matplotlib
matplotlib.use("Agg")                    # no display needed: write the figure to a file
import matplotlib.pyplot as plt

step, msd = np.loadtxt("output/msd.csv", delimiter=",", skiprows=1, unpack=True)
slope, intercept = np.polyfit(step, msd, 1)
D = slope / 2                            # in 1D, <x^2> = 2 D t with one step per unit time
fig, ax = plt.subplots(figsize=(5, 3.4))
ax.plot(step, msd, lw=1, label="simulation"); ax.plot(step, slope * step + intercept, "k--", lw=1, label=f"fit: slope {slope:.3f}")
ax.set(xlabel="number of steps", ylabel=r"$\langle x^2\rangle$"); ax.legend(); fig.tight_layout(); fig.savefig("output/msd.png", dpi=130)
print("D = %.4f (steps^2 per step); exact value 0.5" % D)
