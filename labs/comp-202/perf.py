"""Performance: loops versus vectorisation versus compiled code; memory-bound versus compute-bound; Amdahl; random streams."""
import numpy as np, time, cProfile, pstats, io
from numba import njit

def timeit(f, *a, rep=3):
    best = 1e99
    for _ in range(rep):
        t0 = time.perf_counter(); r = f(*a); best = min(best, time.perf_counter() - t0)
    return best, r

print("1. the sum of all pair distances of N random points in 3D: the same O(N^2) work written three ways")
def pairs_python(X):
    n = len(X); s = 0.0
    for i in range(n):
        for j in range(i + 1, n):
            dx = X[i][0] - X[j][0]; dy = X[i][1] - X[j][1]; dz = X[i][2] - X[j][2]
            s += (dx * dx + dy * dy + dz * dz) ** 0.5
    return s
def pairs_numpy(X):
    d = X[:, None, :] - X[None, :, :]
    return 0.5 * np.sqrt((d**2).sum(-1)).sum()
@njit(cache=False)
def pairs_numba(X):
    n = X.shape[0]; s = 0.0
    for i in range(n):
        for j in range(i + 1, n):
            dx = X[i, 0] - X[j, 0]; dy = X[i, 1] - X[j, 1]; dz = X[i, 2] - X[j, 2]
            s += (dx * dx + dy * dy + dz * dz) ** 0.5
    return s
rng = np.random.default_rng(1)
pairs_numba(rng.random((10, 3)))          # compile once, outside the timing
print("      N     pure Python     NumPy (N x N x 3 array)     Numba (compiled loops)    results agree")
for N in (200, 1000, 3000):
    X = rng.random((N, 3)); Xl = X.tolist()
    tp, a = timeit(pairs_python, Xl, rep=1)
    tn, b = timeit(pairs_numpy, X) if N <= 3000 else (float("nan"), None)
    tj, c = timeit(pairs_numba, X)
    ok = "yes" if (a is None or abs(a - c) < 1e-6 * c) and abs(b - c) < 1e-6 * c else "NO"
    print(f"   {N:5d}   {tp:10.4f} s   {tn:14.4f} s           {tj:12.5f} s            {ok}")
print("   (the NumPy version builds an N x N x 3 array of 8-byte numbers: 216 MB at N = 3000)")

print("\n2. memory-bound versus compute-bound: y = a x + y (2 flops per 24 bytes moved) and a matrix product (2 n^3 flops on 3 n^2 numbers)")
n = 10**7; x = np.ones(n); y = np.ones(n)
def axpy(): y_ = 2.0 * x + y; return y_
t, _ = timeit(axpy); t_axpy = t; print(f"   axpy, n = 1e7: {t * 1e3:.1f} ms -> {3 * 8 * n / t / 1e9:.1f} GB/s of memory traffic, {2 * n / t / 1e9:.2f} GFlop/s")
A = rng.standard_normal((2000, 2000)); B = rng.standard_normal((2000, 2000))
t, _ = timeit(lambda: A @ B); print(f"   matrix product, n = 2000: {t * 1e3:.1f} ms -> {2 * 2000**3 / t / 1e9:.1f} GFlop/s")
print(f"   the same machine runs the compute-bound kernel {(2 * 2000**3 / t) / (2 * n / t_axpy):.0f} times faster in flops: the first is limited by the memory bus, not by the processor")

print("\n3. Amdahl's law: speed-up of a code in which a fraction s is serial, on p processors: S = 1/(s + (1-s)/p)")
print("   serial fraction s     p = 4     p = 16     p = 64    p = 1024    limit 1/s")
for s in (0.5, 0.1, 0.01, 0.001):
    print(f"      {s:6.3f}         " + "".join(f"{1 / (s + (1 - s) / p):8.1f}   " for p in (4, 16, 64, 1024)) + f"{1 / s:8.0f}")

print("\n4. profiling: where does a program spend its time?")
def slow_force(X):
    n = len(X); F = np.zeros_like(X)
    for i in range(n):
        d = X[i] - X; r2 = (d**2).sum(1); r2[i] = 1.0
        inv6 = 1 / r2**3; coef = 24 * (2 * inv6**2 - inv6) / r2; coef[i] = 0.0
        F[i] = (coef[:, None] * d).sum(0)
    return F
def run():
    X = rng.random((800, 3)) * 8
    for _ in range(5): slow_force(X)
pr = cProfile.Profile(); pr.enable(); run(); pr.disable()
st = io.StringIO(); pstats.Stats(pr, stream=st).strip_dirs().sort_stats("cumulative").print_stats(6)
print("\n".join(l for l in st.getvalue().splitlines() if l.strip())[:1500])

print("\n5. random-number streams: reproducibility and independent streams for parallel runs")
r1 = np.random.default_rng(42).random(3); r2 = np.random.default_rng(42).random(3)
print(f"   default_rng(42) twice: {r1.round(6)} and {r2.round(6)} -> identical: {np.array_equal(r1, r2)}")
ss = np.random.SeedSequence(2024); streams = [np.random.default_rng(s) for s in ss.spawn(4)]
data = np.array([g.standard_normal(100000) for g in streams]); C = np.corrcoef(data)
print(f"   4 child streams of SeedSequence(2024): largest off-diagonal correlation of 1e5 samples = {np.max(np.abs(C - np.eye(4))):.4f} (expected size 1/sqrt(N) = {1 / np.sqrt(1e5):.4f})")
print("   a bad habit: seeding with the clock or with seed + rank gives correlated or repeated streams in some generators; use SeedSequence.spawn")
