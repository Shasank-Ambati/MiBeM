import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

T, rho, pe = np.loadtxt("heating.dat", skiprows=1, unpack=True)
# smooth the noisy instantaneous temperature and density with a running mean of 10 points
k = 10
sm = lambda x: np.convolve(x, np.ones(k) / k, mode="valid")
fig, ax = plt.subplots(1, 2, figsize=(9.5, 3.7))
ax[0].plot(sm(T), sm(rho)); ax[0].set(xlabel=r"$T^*$", ylabel=r"$\rho^*$", title="density at $P^*=1$")
ax[1].plot(sm(T), sm(pe)); ax[1].set(xlabel=r"$T^*$", ylabel="potential energy per atom", title="potential energy")
fig.tight_layout(); fig.savefig("heating.png", dpi=130)
j = np.argmax(np.abs(np.diff(sm(rho))))
print("largest density drop at T* =", round(float(sm(T)[j]), 2), " rho before/after:", round(float(sm(rho)[j-5]), 3), round(float(sm(rho)[j+5]), 3))
