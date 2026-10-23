"""Lattice constant of Cu against temperature (EAM, NPT) and the linear thermal-expansion coefficient."""
import re, subprocess, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

T, A = [], []
for temp in (100, 300, 500, 700, 900, 1100):
    out = subprocess.run(["lmp", "-in", "in.cu_thermal", "-var", "T", str(temp), "-log", "none"], capture_output=True, text=True).stdout
    m = re.search(r"RESULT T = (\S+) K  a = (\S+) Angstrom  P = (\S+) bar", out)
    t, a, p = map(float, m.groups()); T.append(t); A.append(a)
    print(f"T = {t:7.1f} K   a = {a:.5f} A   <P> = {p:7.1f} bar")
T, A = np.array(T), np.array(A)
c = np.polyfit(T, A, 2)
a300 = np.polyval(c, 300)
alpha = np.polyval(np.polyder(c), 300) / a300
print(f"alpha(300 K) = {alpha * 1e6:.1f} x 1e-6 /K   (experiment: 16.5e-6 /K)")
a_avg = np.polyfit(T, A, 1)[0] / A.mean()
print(f"mean alpha 100-1100 K = {a_avg * 1e6:.1f} x 1e-6 /K")
plt.figure(figsize=(5.2, 3.6)); plt.plot(T, A, "o"); tt = np.linspace(0, 1200, 100); plt.plot(tt, np.polyval(c, tt), "-")
plt.xlabel("temperature (K)"); plt.ylabel("lattice constant (Å)"); plt.tight_layout(); plt.savefig("cu_thermal.png", dpi=130)
