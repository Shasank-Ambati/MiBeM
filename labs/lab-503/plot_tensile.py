"""Stress-strain curves of the copper single crystal at several temperatures and the peak (yield) stress."""
import glob, re, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(6.2, 4))
print("T (K)   peak stress (GPa)   strain at peak   Young's modulus from 0-2% (GPa)")
for fn in sorted(glob.glob("tensile_*K.dat"), key=lambda f: float(re.findall(r"tensile_(\d+)K", f)[0])):
    T = float(re.findall(r"tensile_(\d+)K", fn)[0])
    d = np.loadtxt(fn, skiprows=1)
    strain, stress = d[:, 0], d[:, 1]
    k = 5                                                     # running mean of 5 points removes the thermal noise
    s = np.convolve(stress, np.ones(k) / k, mode="valid"); e = strain[k // 2: len(strain) - k // 2]
    i = np.argmax(s)
    m = (e > 0.005) & (e < 0.025)
    E = np.polyfit(e[m], s[m], 1)[0]
    print(f"{T:5.0f}   {s[i]:10.2f}          {e[i]:8.3f}        {E:8.1f}")
    ax.plot(e, s, label=f"{T:.0f} K")
ax.set(xlabel="engineering strain", ylabel="stress (GPa)"); ax.legend(); fig.tight_layout(); fig.savefig("cu_tensile.png", dpi=130)
