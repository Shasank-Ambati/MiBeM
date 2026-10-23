"""Mode Gruneisen parameters from the change of phonon frequencies with volume, and the thermal expansion they predict."""
import warnings; warnings.filterwarnings("ignore")
import numpy as np
from ase.build import bulk
from phonons_cu import make_phonopy

X = [0.5, 0, 0.5]
a = np.array([3.54, 3.5898, 3.64])
V = a**3 / 4
f = []
for ai in a:
    ph = make_phonopy(bulk("Cu", "fcc", a=ai), 4); ph.run_qpoints([X]); f.append(ph.qpoints.frequencies[0][[0, 2]])   # TA and LA at X
f = np.array(f)
print("   a (A)    V (A^3)    TA(X) (THz)   LA(X) (THz)")
for ai, Vi, fi in zip(a, V, f): print("  %.4f   %7.3f     %7.4f      %7.4f" % (ai, Vi, fi[0], fi[1]))
g = -np.gradient(np.log(f), np.log(V), axis=0)[1]                 # centred difference at the relaxed volume
print("Gruneisen parameter gamma = -dln(omega)/dln(V):  TA(X) %.2f   LA(X) %.2f" % tuple(g))

gamma = 2.0                                                     # a typical average value (the true average needs all modes)
B, Vm, Cv = 133.2e9, 6.02214e23 * (3.5898e-10) ** 3 / 4, 23.37  # EMT bulk modulus (LAB 201), molar volume, C_v at 300 K (phonons_cu.py)
alpha = gamma * Cv / (3 * B * Vm)
print("molar volume %.3f cm^3/mol;  alpha_L = gamma C_v / (3 B V) = %.1f e-6 /K  (gamma = %.1f)" % (Vm * 1e6, alpha * 1e6, gamma))
