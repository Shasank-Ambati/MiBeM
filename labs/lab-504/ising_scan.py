"""Temperature scan for three lattice sizes: magnetisation, energy, specific heat, susceptibility and Binder cumulant."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ising import run

Ts = np.round(np.concatenate([np.arange(1.6, 2.1, 0.2), np.arange(2.1, 2.5, 0.05), np.arange(2.5, 3.6, 0.25)]), 3)
res = {}
for L in (8, 16, 32):
    rows = []
    for T in Ts:
        s, E, M = run(L, T, nequil=3000, nprod=20000, sd=int(T * 100) + L)
        N = L * L
        m2, m4 = np.mean(M**2), np.mean(M**4)
        rows.append((T, np.mean(E), np.mean(M), N * np.var(E) / T**2, N * (m2 - np.mean(M)**2) / T, 1 - m4 / (3 * m2**2)))
    res[L] = np.array(rows)
    print(f"L = {L}")
    print("    T      <e>      <|m|>     C_v      chi     Binder U")
    for r in res[L][::3]: print("  %5.3f  %7.4f  %7.4f  %7.3f  %8.3f  %7.4f" % tuple(r))
fig, ax = plt.subplots(2, 2, figsize=(8, 6))
for L, r in res.items():
    for a, c, lab in zip(ax.flat, (2, 1, 3, 5), (r"$\langle|m|\rangle$", r"$\langle e\rangle$", r"$C_v$", "Binder cumulant $U$")):
        a.plot(r[:, 0], r[:, c], "o-", ms=3, label=f"L={L}"); a.set_ylabel(lab); a.set_xlabel("T (J/k_B)")
for a in ax.flat: a.axvline(2.269, color="grey", ls=":")
ax[0, 0].legend(); fig.tight_layout(); fig.savefig("ising_scan.png", dpi=130)
np.save("ising_scan.npy", np.array([res[L] for L in (8, 16, 32)]))
