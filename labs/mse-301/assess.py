"""A miniature CALPHAD assessment: fit the interaction parameter of the liquid to (synthetic) liquidus data, with uncertainties."""
import numpy as np
from scipy.optimize import fsolve, least_squares

R = 8.314462618
GAL = lambda T: 12000.0 - 10.0 * T; GBL = lambda T: 15000.0 - 10.0 * T
LA = 15000.0; GBA = 3000.0                       # alpha: interaction parameter and energy of B in the alpha structure

def muL(x, T, L): return (GAL(T) + R * T * np.log(1 - x) + L * x**2, GBL(T) + R * T * np.log(x) + L * (1 - x)**2)
def muA(x, T): return (R * T * np.log(1 - x) + LA * x**2, GBA + R * T * np.log(x) + LA * (1 - x)**2)

def liquidus_T(xl, L, guess=None):
    """Temperature at which a liquid of composition xl is in equilibrium with alpha (two equal chemical potentials).
    Unknowns: the composition of alpha (through u, x_alpha = 1/(1+exp(-u)), which keeps it inside (0,1)) and T."""
    if guess is None: guess = (0.02 + 0.2 * xl, 1200.0 - 700.0 * xl)
    def f(z):
        u, T = z; xa = 1 / (1 + np.exp(-u))
        a, b = muL(xl, T, L); c, d = muA(xa, T)
        return [a - c, b - d]
    sol, info, ier, msg = fsolve(f, [np.log(guess[0] / (1 - guess[0])), guess[1]], full_output=True, xtol=1e-12)
    return sol[1] if ier == 1 else np.nan

print("1. the forward problem: liquidus temperature as a function of the liquid interaction parameter L (liquid of x_B = 0.25 in equilibrium with alpha)")
print("      L (J/mol)    T_liquidus (K)")
for L in (0.0, -2500.0, -5000.0, -7500.0, -10000.0):
    print(f"      {L:8.0f}      {liquidus_T(0.25, L):9.2f}")

rng = np.random.default_rng(7)
xl = np.linspace(0.12, 0.32, 9)
T_true = np.array([liquidus_T(x, -5000.0) for x in xl])
sig = 5.0
T_exp = T_true + rng.normal(0, sig, xl.size)
print("\n2. synthetic experimental liquidus (true L = -5000 J/mol, scatter 5 K)")
print("      x_B     T true (K)   T 'measured' (K)")
for a, b, c in zip(xl, T_true, T_exp): print(f"     {a:.3f}    {b:9.2f}      {c:9.2f}")

def resid1(p): return np.array([(liquidus_T(x, p[0]) - t) / sig for x, t in zip(xl, T_exp)])
fit1 = least_squares(resid1, [-2000.0], x_scale=1000.0)
J = fit1.jac; cov = np.linalg.inv(J.T @ J); chi2 = np.sum(fit1.fun**2)
print(f"\n3. one-parameter fit L = a:  a = {fit1.x[0]:.0f} +- {np.sqrt(cov[0, 0]):.0f} J/mol;  chi^2 = {chi2:.2f} for {xl.size - 1} degrees of freedom (expect about {xl.size - 1})")

def liquidus_T2(xl_, a, b):
    T = liquidus_T(xl_, a)
    for _ in range(30):                           # self-consistent: the interaction parameter depends on the temperature itself, L = a + b (T - 1000)
        T_new = liquidus_T(xl_, a + b * (T - 1000.0)); 
        if abs(T_new - T) < 1e-9: break
        T = T_new
    return T
def resid3(p): return np.array([(liquidus_T2(x, p[0], p[1]) - t) / sig for x, t in zip(xl, T_exp)])
fit2 = least_squares(resid3, [-2000.0, 0.0], x_scale=[1000.0, 5.0])
J = fit2.jac; cov2 = np.linalg.inv(J.T @ J); sd = np.sqrt(np.diag(cov2)); corr = cov2[0, 1] / (sd[0] * sd[1])
print(f"4. two-parameter fit L = a + b (T - 1000 K): a = {fit2.x[0]:.0f} +- {sd[0]:.0f} J/mol, b = {fit2.x[1]:.2f} +- {sd[1]:.2f} J/(mol K) (true b = 0);  chi^2 = {np.sum(fit2.fun**2):.2f} for {xl.size - 2} d.o.f.;  correlation of a and b = {corr:.2f}")

print("\n5. what the uncertainty does to a prediction: liquidus temperature at x_B = 0.30 from 200 parameter sets drawn from the covariance of the one-parameter fit")
draws = rng.normal(fit1.x[0], np.sqrt(cov[0, 0]), 200)
Tl = np.array([liquidus_T(0.30, L) for L in draws])
print(f"   true value {liquidus_T(0.30, -5000.0):.2f} K;  fitted value {liquidus_T(0.30, fit1.x[0]):.2f} K;  spread of the prediction: +- {Tl.std():.2f} K (one standard deviation)")
print("   a parameter that is well determined by data near x = 0.3 predicts well there, but a prediction far from the data (e.g. at the eutectic composition) carries a larger uncertainty:")
Te = np.array([liquidus_T(0.40, L) for L in draws])
print(f"   liquid of x_B = 0.40: fitted {liquidus_T(0.40, fit1.x[0]):.2f} K, spread +- {Te.std():.2f} K")
