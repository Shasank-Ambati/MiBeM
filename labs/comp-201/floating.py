"""Floating-point arithmetic and error: machine epsilon, cancellation, stable formulas, summation."""
import numpy as np, math

print("machine epsilon (float64):", np.finfo(float).eps, "  float32:", np.finfo(np.float32).eps)
print("0.1 + 0.2 =", repr(0.1 + 0.2), "  == 0.3 ?", 0.1 + 0.2 == 0.3)
print("largest float64:", np.finfo(float).max, "  smallest normal:", np.finfo(float).tiny)

print("\n1. cancellation: f(x) = (1 - cos x)/x^2  (exact limit 1/2 as x -> 0)")
print("      x          naive             stable (2 sin^2(x/2)/x^2)")
for x in [1e-1, 1e-3, 1e-5, 1e-7, 1e-8, 1e-9]:
    naive = (1 - math.cos(x)) / x**2
    stable = 2 * math.sin(x / 2)**2 / x**2
    print(f"   {x:8.0e}   {naive:.10f}     {stable:.10f}")

print("\n2. quadratic x^2 - 2bx + c = 0 with b = 1e8, c = 1: the small root is c/(2b) ~ 5e-9")
b, c = 1e8, 1.0
d = math.sqrt(b * b - c)
naive = b - d
stable = c / (b + d)
print(f"   naive  b - sqrt(b^2-c) = {naive:.6e}")
print(f"   stable c/(b + sqrt(b^2-c)) = {stable:.6e}")
print(f"   relative error of the naive root = {abs(naive - stable) / stable:.2e}")

print("\n3. summation of 10^7 terms 0.1: exact sum 1 000 000")
x = np.full(10**7, 0.1)
s_loop = 0.0
for v in x[:10**6]:
    s_loop += v
print(f"   plain loop over the first 10^6 terms: {s_loop:.10f}   (exact 100000)")
print(f"   np.sum (pairwise)           : {np.sum(x):.10f}")
print(f"   math.fsum (exact rounding)  : {math.fsum(x):.10f}")
x32 = np.full(10**7, 0.1, dtype=np.float32)
acc = np.float32(0)
for v in x32[:10**6]:
    acc += v
print(f"   float32 loop, first 10^6 terms: {acc:.4f}   (exact 100000)")

print("\n4. condition number of a function: f(x) = x - 1 near x = 1  (relative condition |x f'/f|)")
for x in [2.0, 1.1, 1.001, 1.000001]:
    print(f"   x = {x:<9}  kappa = {abs(x * 1 / (x - 1)):.3e}")
