"""Dense linear systems: LU with pivoting, conditioning, residual vs error, least squares."""
import numpy as np, scipy.linalg as sla, time

def lu_nopivot(A):
    A = A.astype(float).copy(); n = len(A)
    for k in range(n - 1):
        A[k+1:, k] /= A[k, k]
        A[k+1:, k+1:] -= np.outer(A[k+1:, k], A[k, k+1:])
    return A                            # L (unit lower) and U packed together

def solve_packed(LU, b):
    n = len(b); y = b.astype(float).copy()
    for i in range(n): y[i] -= LU[i, :i] @ y[:i]
    for i in range(n - 1, -1, -1): y[i] = (y[i] - LU[i, i+1:] @ y[i+1:]) / LU[i, i]
    return y

print("1. the need for pivoting: A = [[eps, 1], [1, 1]], b = [1, 2], exact solution ~ (1, 1)")
for eps in (1e-3, 1e-12, 1e-17):
    A = np.array([[eps, 1.0], [1.0, 1.0]]); b = np.array([1.0, 2.0])
    x_np = solve_packed(lu_nopivot(A), b)
    x_pv = np.linalg.solve(A, b)
    print(f"   eps={eps:7.0e}   no pivoting x = ({x_np[0]:.6f}, {x_np[1]:.6f})   with pivoting x = ({x_pv[0]:.6f}, {x_pv[1]:.6f})")

print("\n2. random matrices: our LU against numpy, n = 200")
rng = np.random.default_rng(0)
A = rng.standard_normal((200, 200)); xt = rng.standard_normal(200); b = A @ xt
x1 = solve_packed(lu_nopivot(A), b); x2 = np.linalg.solve(A, b)
print(f"   cond(A) = {np.linalg.cond(A):.1f}   rel. error without pivoting {np.linalg.norm(x1-xt)/np.linalg.norm(xt):.2e}   LAPACK {np.linalg.norm(x2-xt)/np.linalg.norm(xt):.2e}")

print("\n3. the Hilbert matrix H_ij = 1/(i+j-1): error vs condition number")
print("     n        cond(H)       relative error     residual ||Hx-b||/||b||")
for n in (4, 8, 10, 12, 14):
    H = sla.hilbert(n); xt = np.ones(n); b = H @ xt
    x = np.linalg.solve(H, b)
    print(f"   {n:3d}   {np.linalg.cond(H):12.3e}   {np.linalg.norm(x-xt)/np.linalg.norm(xt):12.3e}      {np.linalg.norm(H@x-b)/np.linalg.norm(b):10.2e}")

print("\n4. cost: solve dense A x = b for growing n (seconds, one core)")
print("      n      time (s)     time/n^3 (ns)")
for n in (250, 500, 1000, 2000, 4000):
    A = rng.standard_normal((n, n)); b = rng.standard_normal(n)
    t0 = time.perf_counter(); np.linalg.solve(A, b); t = time.perf_counter() - t0
    print(f"   {n:5d}   {t:9.4f}     {t / n**3 * 1e9:8.3f}")

print("\n5. least squares: fit a degree-d polynomial to 200 points of exp(x) on [0,1]")
x = np.linspace(0, 1, 200); y = np.exp(x)
print("   d    cond(V)      normal equations   QR (lstsq)      SVD(pinv)       [max |fit - exp|]")
for d in (4, 8, 12, 16):
    V = np.vander(x, d + 1, increasing=True)
    c1 = np.linalg.solve(V.T @ V, V.T @ y)
    c2, *_ = np.linalg.lstsq(V, y, rcond=None)
    Q, R = np.linalg.qr(V); c3 = sla.solve_triangular(R, Q.T @ y)
    e = lambda c: np.max(np.abs(V @ c - y))
    print(f"   {d:2d}  {np.linalg.cond(V):10.2e}   {e(c1):14.2e}   {e(c3):14.2e}   {e(c2):14.2e}")
