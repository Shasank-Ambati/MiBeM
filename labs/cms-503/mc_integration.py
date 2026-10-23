"""Monte Carlo integration against grid quadrature as the dimension grows (equal number of function evaluations)."""
import numpy as np
from math import erf, pi, sqrt
rng = np.random.default_rng(1)
N = 100000
print(f"integral of exp(-|x|^2) over the unit hypercube [0,1]^d, N = {N} function evaluations each; exact value (sqrt(pi)/2 erf(1))^d")
print("   d     exact        midpoint grid (m^d <= N)    relative error      Monte Carlo      relative error (+- 1/sqrt(N) estimate)")
for d in (1, 2, 3, 4, 6, 8, 10, 12):
    exact = (sqrt(pi) / 2 * erf(1.0))**d
    m = max(1, int(round(N**(1 / d)))); 
    while m**d > N: m -= 1
    pts = (np.arange(m) + 0.5) / m
    # separable integrand: the grid sum factorises exactly, so evaluate it as a product (the cost of the sum over m^d points is what a user would pay)
    one = np.mean(np.exp(-pts**2)); grid = one**d
    x = rng.random((N, d)); f = np.exp(-np.sum(x**2, axis=1)); mc = f.mean(); se = f.std(ddof=1) / np.sqrt(N)
    print(f"  {d:2d}   {exact:10.6f}      {grid:10.6f}  (m = {m:3d})      {abs(grid / exact - 1):9.2e}       {mc:10.6f}      {abs(mc / exact - 1):9.2e} ({se / exact:.1e})")
print("the midpoint rule has error ~ 1/m^2 = N^(-2/d): excellent for d = 1, 2, poor for d >= 6; the Monte Carlo error N^(-1/2) does not depend on d")
