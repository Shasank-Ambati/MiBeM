"""Ideal and regular solutions: Gibbs energy of mixing, chemical potentials, Gibbs-Duhem, spinodal and binodal."""
import numpy as np
from scipy.optimize import brentq
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

R = 8.314462618
def gmix(x, w, T):                      # J/mol, regular solution, Omega = w
    return R * T * (x * np.log(x) + (1 - x) * np.log(1 - x)) + w * x * (1 - x)
def mu_B(x, w, T):                      # chemical potential of B relative to pure B
    return R * T * np.log(x) + w * (1 - x)**2
def mu_A(x, w, T):
    return R * T * np.log(1 - x) + w * x**2

print("1. ideal solution at 1000 K, x = 0.5: Gibbs energy of mixing and chemical potentials")
T = 1000.0; x = 0.5
print(f"   dG_mix = {gmix(x, 0.0, T):.1f} J/mol = -T dS_mix with dS_mix = {-R * (x * np.log(x) + (1 - x) * np.log(1 - x)):.4f} J/(mol K) = R ln 2 = {R * np.log(2):.4f}")
print(f"   mu_A - mu_A(pure) = {mu_A(x, 0.0, T):.1f} J/mol = RT ln x_A;  activity a_A = exp(mu/RT) = {np.exp(mu_A(x, 0.0, T) / (R * T)):.3f}")

print("\n2. Gibbs-Duhem check for a regular solution (w = 10 kJ/mol, T = 1000 K): (1-x) dmu_A/dx + x dmu_B/dx = 0")
w = 10000.0
for x in (0.1, 0.3, 0.5, 0.8):
    h = 1e-6
    dA = (mu_A(x + h, w, T) - mu_A(x - h, w, T)) / (2 * h); dB = (mu_B(x + h, w, T) - mu_B(x - h, w, T)) / (2 * h)
    # tangent-intercept construction: mu_B - mu_A = dG/dx, G = (1-x) mu_A + x mu_B
    G = gmix(x, w, T); dG = (gmix(x + h, w, T) - gmix(x - h, w, T)) / (2 * h)
    print(f"   x = {x:.1f}:  (1-x)dmuA/dx + x dmuB/dx = {(1 - x) * dA + x * dB: .2e} J/mol;   G - [(1-x)muA + x muB] = {G - ((1 - x) * mu_A(x, w, T) + x * mu_B(x, w, T)): .2e};   muB - muA - dG/dx = {mu_B(x, w, T) - mu_A(x, w, T) - dG: .2e}")

print("\n3. activity coefficients of the regular solution: gamma_B = exp(w (1-x)^2/RT)  (w = 10 kJ/mol, T = 1000 K)")
for x in (0.01, 0.1, 0.5, 0.9, 1.0 - 1e-9):
    print(f"   x_B = {x:9.6f}   gamma_B = {np.exp(w * (1 - x)**2 / (R * T)):.4f}   activity a_B = {x * np.exp(w * (1 - x)**2 / (R * T)):.5f}")
print(f"   at infinite dilution gamma_B^infinity = exp(w/RT) = {np.exp(w / (R * T)):.4f} (Henry's law constant relative to Raoult's)")

print("\n4. stability: second derivative of G_mix and the miscibility gap (symmetric regular solution, Tc = w/(2R))")
w = 20000.0; Tc = w / (2 * R)
print(f"   w = 20 kJ/mol  ->  critical temperature Tc = {Tc:.1f} K")
def spinodal(T):
    r = 2 * R * T / w
    return 0.5 * (1 - np.sqrt(1 - r)) if r < 1 else np.nan
def binodal(T):
    f = lambda x: R * T * np.log(x / (1 - x)) + w * (1 - 2 * x)
    return brentq(f, 1e-12, 0.5 - 1e-9) if T < Tc else np.nan
print("      T (K)    T/Tc    binodal x   spinodal x   G''(0.5)/RT   (G''<0 inside the spinodal)")
rows = []
for r in (0.5, 0.7, 0.8, 0.9, 0.95, 0.99):
    T = r * Tc; xb = binodal(T); xs = spinodal(T)
    g2 = R * T / 0.25 - 2 * w
    rows.append((T, xb, xs))
    print(f"   {T:7.1f}   {r:5.2f}   {xb:9.5f}   {xs:9.5f}     {g2 / (R * T):8.3f}")
print("   check of the binodal at T/Tc = 0.8: common-tangent condition mu_A(x1) = mu_A(x2), mu_B(x1) = mu_B(x2):")
T = 0.8 * Tc; x1 = binodal(T); x2 = 1 - x1
print(f"   x1 = {x1:.6f}, x2 = {x2:.6f}:  mu_A difference = {mu_A(x1, w, T) - mu_A(x2, w, T): .2e} J/mol,  mu_B difference = {mu_B(x1, w, T) - mu_B(x2, w, T): .2e} J/mol")
print(f"   critical exponent: near Tc the binodal width scales as sqrt(1 - T/Tc): at T/Tc = 0.99 the half-width 0.5 - x = {0.5 - binodal(0.99 * Tc):.4f}, mean-field prediction sqrt(3(1-T/Tc)) / 2 = {np.sqrt(3 * 0.01) / 2:.4f}")

fig, ax = plt.subplots(1, 2, figsize=(9, 3.6))
xx = np.linspace(1e-4, 1 - 1e-4, 800)
for r, c in ((1.2, "#4c78a8"), (1.0, "#54a24b"), (0.8, "#e45756"), (0.6, "#b279a2")):
    ax[0].plot(xx, gmix(xx, w, r * Tc) / 1000, color=c, label=f"T/Tc = {r}")
ax[0].set_xlabel("x$_B$"); ax[0].set_ylabel("$\\Delta G_{mix}$ (kJ/mol)"); ax[0].legend(fontsize=8); ax[0].set_title("Gibbs energy of mixing")
Ts = np.linspace(0.3 * Tc, 0.999 * Tc, 200)
xb = np.array([binodal(t) for t in Ts]); xs = np.array([spinodal(t) for t in Ts])
ax[1].plot(xb, Ts / Tc, "k", label="binodal"); ax[1].plot(1 - xb, Ts / Tc, "k"); ax[1].plot(xs, Ts / Tc, "r--", label="spinodal"); ax[1].plot(1 - xs, Ts / Tc, "r--")
ax[1].set_xlabel("x$_B$"); ax[1].set_ylabel("T / T$_c$"); ax[1].legend(fontsize=8); ax[1].set_title("Miscibility gap")
fig.tight_layout(); fig.savefig("solutions.png", dpi=130)
print("\nsaved solutions.png")
