"""Metropolis Monte Carlo for one particle in the potential U(x) = x^4 - 2 x^2 (a double well) at temperature kT = 0.5."""
import numpy as np
from scipy.integrate import quad

kT = 0.5
U = lambda x: x**4 - 2 * x**2
Z = quad(lambda x: np.exp(-U(x) / kT), -5, 5)[0]
exact_x2 = quad(lambda x: x**2 * np.exp(-U(x) / kT), -5, 5)[0] / Z
exact_U = quad(lambda x: U(x) * np.exp(-U(x) / kT), -5, 5)[0] / Z
print("exact: <x^2> = %.4f, <U> = %.4f, P(x>0) = 0.5" % (exact_x2, exact_U))

def sample(step, n, seed=0, x0=1.0):
    rng = np.random.default_rng(seed); x = x0; xs = np.empty(n); acc = 0
    u = rng.random(n); dx = rng.uniform(-step, step, n)
    for i in range(n):
        xn = x + dx[i]
        if u[i] < np.exp(-(U(xn) - U(x)) / kT):                    # accept with min(1, exp(-dU/kT))
            x = xn; acc += 1
        xs[i] = x
    return xs, acc / n

def tau_int(a):
    a = a - a.mean(); n = len(a); f = np.fft.rfft(a, 2 * n); ac = np.fft.irfft(f * np.conj(f))[:n]; ac /= ac[0]
    tau = 0.5
    for t in range(1, n):
        tau += ac[t]
        if t > 6 * tau: break
    return tau

print("\n step size  acceptance  <x^2>    <U>      tau_int(x^2)  independent samples of 200000   fraction of time at x>0")
for step in (0.05, 0.3, 1.0, 2.0, 5.0, 20.0):
    xs, a = sample(step, 200000, seed=1)
    tau = tau_int(xs**2)
    print("  %6.2f     %5.3f     %.4f  %.4f    %7.1f          %7.0f                      %.3f" % (step, a, np.mean(xs**2), np.mean(U(xs)), tau, 200000 / (2 * tau), np.mean(xs > 0)))
