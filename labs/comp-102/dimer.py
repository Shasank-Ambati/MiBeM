"""Verification test: two Lennard-Jones atoms oscillating about the minimum must have the harmonic period 2 pi / sqrt(k / mu)."""
import numpy as np
r0 = 2 ** (1 / 6); k = 57.146                          # position of the minimum; stiffness d2U/dr2 there (reduced units); reduced mass mu = 1/2
f = lambda r: 24 * (2 * r ** -13 - r ** -7)             # force along the bond

def run(dt, amp, T=3.5):
    r, v = r0 + amp, 0.0; a = 2 * f(r); ts, rs = [0.0], [r]          # relative coordinate: r'' = F / mu = 2 F
    for i in range(int(T / dt)):
        r += dt * v + 0.5 * dt * dt * a; a_new = 2 * f(r); v += 0.5 * dt * (a + a_new); a = a_new
        ts.append((i + 1) * dt); rs.append(r)
    return np.array(ts), np.array(rs)

print("predicted period 2 pi / sqrt(k/mu) = %.5f" % (2 * np.pi / np.sqrt(k / 0.5)))
for amp, dt in ((0.01, 0.01), (0.01, 0.002), (0.001, 0.01), (0.001, 0.002), (0.0001, 0.002)):
    t, r = run(dt, amp)
    up = np.where((r[:-1] - r0 < 0) & (r[1:] - r0 >= 0))[0]            # upward zero crossings of r - r0, with linear interpolation
    tc = [t[i] - (r[i] - r0) * (t[i + 1] - t[i]) / (r[i + 1] - r[i]) for i in up]
    print("amplitude %.4f, dt = %.3f: measured period %.5f" % (amp, dt, np.mean(np.diff(tc))))
