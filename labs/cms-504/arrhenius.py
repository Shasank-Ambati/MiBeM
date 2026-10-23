"""Arrhenius analysis of diffusion data: fit of ln D against 1/T with uncertainties, extrapolation, and grain-boundary (Harrison) regimes."""
import numpy as np
R = 8.314462618
D0, Q = 2.3e-5, 148e3                                        # C in gamma-Fe (textbook values): the 'true' parameters
rng = np.random.default_rng(4)
T = np.array([1073.0, 1123.0, 1173.0, 1223.0, 1273.0, 1323.0, 1373.0])
Dtrue = D0 * np.exp(-Q / (R * T)); Dm = Dtrue * np.exp(rng.normal(0, 0.10, T.size))          # 10 % scatter (lognormal)
print("synthetic 'measurements' of D (10 % scatter) from D0 = 2.3e-5 m^2/s, Q = 148 kJ/mol")
print("     T (K)    1000/T       D true (m^2/s)    D measured (m^2/s)")
for a, b, c in zip(T, Dtrue, Dm): print(f"   {a:7.1f}   {1000 / a:7.4f}      {b:.3e}         {c:.3e}")
X = 1 / T; Y = np.log(Dm)
A = np.vstack([np.ones_like(X), -X / 1.0]).T                  # ln D = ln D0 - (Q/R) (1/T)
w = 1 / 0.10**2
cov = np.linalg.inv(A.T @ A * w); p = cov @ (A.T @ Y) * w
lnD0, QR = p; sd = np.sqrt(np.diag(cov)); corr = cov[0, 1] / (sd[0] * sd[1])
res = Y - A @ p; chi2 = np.sum(res**2) * w
print(f"\nweighted linear fit: Q = {QR * R / 1e3:.1f} +- {sd[1] * R / 1e3:.1f} kJ/mol (true 148);  D0 = {np.exp(lnD0):.2e} (true {D0:.1e}), ln D0 = {lnD0:.2f} +- {sd[0]:.2f} (true {np.log(D0):.2f});  chi^2 = {chi2:.2f} for {T.size - 2} d.o.f.")
print(f"correlation between ln D0 and Q: {corr:.4f}  (the intercept and the slope of an Arrhenius plot far from 1/T = 0 are almost perfectly correlated)")
print(f"relative uncertainty of D0: factor exp({sd[0]:.2f}) = {np.exp(sd[0]):.1f}; of Q: {sd[1] * R / 1e3 / (QR * R / 1e3) * 100:.1f} %")
print("\nextrapolation of the fit to other temperatures (D with a one-sigma interval; true value for comparison)")
print("     T (K)      D fit (m^2/s)     one-sigma factor    D true (m^2/s)   ratio fit/true")
for TT in (1273.0, 1073.0, 873.0, 673.0, 473.0):
    a = np.array([1.0, -1 / TT]); lnd = a @ p; s = np.sqrt(a @ cov @ a)
    print(f"   {TT:7.1f}    {np.exp(lnd):.3e}          x/ {np.exp(s):5.2f}        {D0 * np.exp(-Q / (R * TT)):.3e}      {np.exp(lnd) / (D0 * np.exp(-Q / (R * TT))):.3f}")
print("\nAsymmetry of the error: a 5 percent error in Q (7.4 kJ/mol) changes D at 673 K by a factor", f"{np.exp(0.05 * Q / (R * 673)):.1f}", " and at 1273 K by", f"{np.exp(0.05 * Q / (R * 1273)):.1f}")

print("\ngrain-boundary diffusion (Harrison regimes) for copper, 1 h anneal, grain size d = 10 um, boundary width delta = 0.5 nm")
print("   (parameters: lattice D0 = 2.5e-5 m^2/s, Q = 200 kJ/mol; boundary D0_gb = 5e-6 m^2/s, Q_gb = 100 kJ/mol; both illustrative)")
print("    T (K)     D_lattice (m^2/s)   D_gb (m^2/s)    sqrt(D t) (um)   regime")
t = 3600.0; d = 10e-6; delta = 0.5e-9
for TT in (500, 600, 700, 800, 900, 1000, 1200):
    Dv = 2.5e-5 * np.exp(-200e3 / (R * TT)); Dg = 5e-6 * np.exp(-100e3 / (R * TT)); L = np.sqrt(Dv * t)
    reg = "C: lattice diffusion negligible, only the boundaries" if L < delta else ("B: boundary diffusion with leakage into the grains" if L < d / 2 else "A: lattice diffusion fills the grains")
    print(f"   {TT:5d}     {Dv:.2e}         {Dg:.2e}        {L * 1e6:10.4f}      {reg}")
