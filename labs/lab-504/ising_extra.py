"""Snapshots, comparison with Onsager's exact results, Binder-cumulant crossing and critical slowing down."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ising import run

Tc = 2 / np.log(1 + np.sqrt(2))
print("exact Tc = 2/ln(1+sqrt2) = %.4f" % Tc)

# 1. snapshots
fig, ax = plt.subplots(1, 3, figsize=(8.5, 3))
for a, T in zip(ax, (1.8, 2.27, 3.5)):
    s, E, M = run(64, T, nequil=3000, nprod=10, sd=3)
    a.imshow(s, cmap="gray", interpolation="nearest"); a.set_title(f"T = {T}"); a.axis("off")
fig.tight_layout(); fig.savefig("ising_snap.png", dpi=130)

# 2. magnetisation and energy against Onsager
print("\n   T    <|m|> L=32   exact m(T)    <e> L=32   exact e(T)")
from scipy.special import ellipk
def e_exact(T):
    b = 1 / T; k = 2 * np.sinh(2 * b) / np.cosh(2 * b)**2
    return -(1 / np.tanh(2 * b)) * (1 + 2 / np.pi * (2 * np.tanh(2 * b)**2 - 1) * ellipk(k**2))
for T in (1.8, 2.0, 2.1, 2.2):
    s, E, M = run(32, T, nequil=3000, nprod=20000, sd=int(T * 100))
    m_ex = (1 - np.sinh(2 / T)**-4)**0.125
    print("  %.2f    %.4f       %.4f      %7.4f    %7.4f" % (T, M.mean(), m_ex, E.mean(), e_exact(T)))

# 3. Binder crossing
Ts = np.arange(2.15, 2.401, 0.025)
print("\nBinder cumulant U(T, L)")
print("   T     " + "".join(f"  L={L:<3d}" for L in (8, 16, 32, 64)))
U = {}
for L in (8, 16, 32, 64):
    u = []
    for T in Ts:
        s, E, M = run(L, T, nequil=3000, nprod=30000 if L < 64 else 20000, sd=int(T * 1000) + L)
        m2, m4 = np.mean(M**2), np.mean(M**4); u.append(1 - m4 / (3 * m2**2))
    U[L] = np.array(u)
for k, T in enumerate(Ts): print("  %.3f  " % T + "".join(f"  {U[L][k]:.3f}" for L in (8, 16, 32, 64)))
def cross(a, b):
    d = U[a] - U[b]; i = np.where(np.sign(d[:-1]) != np.sign(d[1:]))[0][0]
    return Ts[i] - d[i] * (Ts[i + 1] - Ts[i]) / (d[i + 1] - d[i])
print("crossing L=16/32: T = %.3f ;  L=32/64: T = %.3f ;  exact %.3f" % (cross(16, 32), cross(32, 64), Tc))

# 4. critical slowing down: integrated autocorrelation time of |m|
def tau_int(x):
    x = x - x.mean(); n = len(x); f = np.fft.rfft(x, 2 * n); ac = np.fft.irfft(f * np.conj(f))[:n]; ac /= ac[0]
    tau = 0.5
    for t in range(1, n):
        tau += ac[t]
        if t > 6 * tau: break
    return tau
print("\nautocorrelation time of |m| (sweeps), L = 32")
for T in (1.8, 2.0, 2.2, 2.269, 2.4, 3.0, 4.0):
    s, E, M = run(32, T, nequil=3000, nprod=40000, sd=int(T * 1000))
    print("  T = %.3f   tau = %6.1f" % (T, tau_int(M)))
