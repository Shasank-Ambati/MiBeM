"""Estimate pi by throwing random points into the unit square: the error falls as 1/sqrt(N)."""
import numpy as np
rng = np.random.default_rng(7)
print("        N      pi estimate    error    expected error  sqrt(pi(4-pi)/N)")
for n in (10**2, 10**3, 10**4, 10**5, 10**6, 10**7):
    p = rng.random((n, 2)); est = 4.0 * np.mean((p**2).sum(1) < 1.0)
    print("  %9d    %.5f   %+.5f    %.5f" % (n, est, est - np.pi, np.sqrt(np.pi * (4 - np.pi) / n)))
# scatter over seeds at N = 10^4
s = [4.0 * np.mean((np.random.default_rng(k).random((10**4, 2))**2).sum(1) < 1.0) for k in range(200)]
print("N = 10^4, 200 seeds: mean %.4f  std %.4f  (theory %.4f)" % (np.mean(s), np.std(s, ddof=1), np.sqrt(np.pi * (4 - np.pi) / 1e4)))
