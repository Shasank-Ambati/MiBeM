"""Why pseudopotentials: the plane-wave content of a valence orbital with and without the oscillating core region (hydrogenic 3s model)."""
import numpy as np
from scipy.integrate import trapezoid

Z = 4.0                                              # a hydrogenic 3s orbital of nuclear charge Z (model of a valence s state)
r = np.linspace(1e-6, 40.0, 400001)
x = Z * r
R3s = 2 * (Z / 3)**1.5 * (1 - 2 * x / 3 + 2 * x**2 / 27) * np.exp(-x / 3)
nodes = r[:-1][np.sign(R3s[:-1]) != np.sign(R3s[1:])]
print(f"hydrogenic 3s orbital, Z = {Z}: radial nodes at r = " + ", ".join(f"{n:.3f}" for n in nodes) + " bohr;  norm = " + f"{trapezoid(R3s**2 * r**2, r):.6f}")

def pseudo(rc):
    """Replace the orbital inside rc (beyond the outermost node) by an even polynomial a + b r^2 + c r^4 matching value, slope and curvature at rc."""
    f = lambda rr: np.interp(rr, r, R3s)
    h = 1e-3
    f0 = f(rc); f1 = (f(rc + h) - f(rc - h)) / (2 * h); f2 = (f(rc + h) - 2 * f(rc) + f(rc - h)) / h**2
    A = np.array([[1, rc**2, rc**4], [0, 2 * rc, 4 * rc**3], [0, 2, 12 * rc**2]]); a, b, c = np.linalg.solve(A, [f0, f1, f2])
    out = R3s.copy(); m = r < rc; out[m] = a + b * r[m]**2 + c * r[m]**4
    return out
def pw_content(R, qs):
    """|psi(q)|^2 for a spherical function: psi(q) = 4 pi int R(r) j0(qr) r^2 dr (j0 = sin(qr)/(qr))."""
    return np.array([(4 * np.pi * trapezoid(R * np.sinc(q * r / np.pi) * r**2, r))**2 for q in qs])
qs = np.linspace(0.0, 60.0, 601)
print("\nFourier content of the orbitals: wave vector q_c below which a given fraction of the weight  sum |psi(q)|^2 q^2 dq  lies")
print("   orbital               q_c for 99%   q_c for 99.9%   q_c for 99.99%   cutoff energy q_c^2/2 for 99.99% (Ha)   number of plane waves relative to the all-electron orbital (q_c^3)")
res = {}
for name, R in (("all-electron 3s", R3s), ("pseudo, r_c = 2.0", pseudo(2.0)), ("pseudo, r_c = 3.0", pseudo(3.0))):
    w = pw_content(R, qs) * qs**2; cum = np.cumsum(w) / np.sum(w)
    qc = [qs[np.searchsorted(cum, f)] for f in (0.99, 0.999, 0.9999)]
    res[name] = qc
    print(f"   {name:20s}   {qc[0]:6.2f}        {qc[1]:6.2f}          {qc[2]:6.2f}            {0.5 * qc[2]**2:10.1f}                          {(qc[2] / res['all-electron 3s'][2])**3:8.3f}")
