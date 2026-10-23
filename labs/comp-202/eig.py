"""Eigenvalue problems: power iteration, QR algorithm, tight-binding chains, sparse eigensolvers."""
import numpy as np, scipy.sparse as sp, scipy.sparse.linalg as spl, scipy.linalg as sla, time

rng = np.random.default_rng(5)
print("1. power iteration: convergence of the Rayleigh quotient for a symmetric matrix with eigenvalues 1, r, r^2, ...")
print("      r = |l2/l1|     iterations to reach error 1e-10     predicted  ln(1e-10/(1-r))/(2 ln r)")
for r in (0.5, 0.9, 0.99, 0.999):
    n = 20; lam = r**np.arange(n); Q, _ = np.linalg.qr(rng.standard_normal((n, n))); A = Q @ np.diag(lam) @ Q.T
    v = rng.standard_normal(n); k = 0
    while True:
        v = A @ v; v /= np.linalg.norm(v); k += 1
        if abs(v @ A @ v - 1.0) < 1e-10 or k > 10**6: break
    print(f"      {r:6.3f}            {k:8d}                         {np.log(1e-10 / (1 - r)) / (2 * np.log(r)):10.1f}")

print("\n2. the QR algorithm for a random symmetric 6 x 6 matrix: sweeps until the off-diagonal part is below 1e-12 ||A||")
n = 6; B = rng.standard_normal((n, n)); A0 = (B + B.T) / 2
def offnorm(A): return np.linalg.norm(A - np.diag(np.diag(A)))
A = A0.copy(); k = 0
while offnorm(A) > 1e-12 * np.linalg.norm(A0) and k < 5000:
    Q, R = np.linalg.qr(A); A = R @ Q; k += 1
print(f"   unshifted QR iterations: {k} sweeps;   eigenvalues {np.sort(np.diag(A)).round(8)}")
A = A0.copy(); total = 0; m = n; eigs = []
while m > 1:
    for it in range(200):
        s = A[m-1, m-1]; Q, R = np.linalg.qr(A[:m, :m] - s * np.eye(m)); A[:m, :m] = R @ Q + s * np.eye(m); total += 1
        if np.linalg.norm(A[m-1, :m-1]) < 1e-12 * np.linalg.norm(A0): break
    eigs.append(A[m-1, m-1]); m -= 1
eigs.append(A[0, 0])
print(f"   shifted QR with deflation: {total} sweeps; eigenvalues {np.sort(eigs).round(8)}")
print(f"   numpy.linalg.eigvalsh      :              eigenvalues {np.linalg.eigvalsh(A0).round(8)}")

print("\n3. tight binding: the electronic levels of a chain of N atoms with hopping -t (t = 1), eigenvalues of -t (adjacency matrix)")
for N in (6, 10, 100):
    H = -(np.diag(np.ones(N - 1), 1) + np.diag(np.ones(N - 1), -1)); E = np.linalg.eigvalsh(H)
    Ex = np.sort(-2 * np.cos(np.arange(1, N + 1) * np.pi / (N + 1)))
    print(f"   open chain N = {N:3d}: lowest level {E[0]:.6f}, highest {E[-1]:.6f}, max |numerical - analytic| = {np.max(np.abs(E - Ex)):.1e}   (band edge -2 and +2 as N grows)")
Hr = -(np.diag(np.ones(5), 1) + np.diag(np.ones(5), -1)); Hr[0, 5] = Hr[5, 0] = -1
print(f"   benzene ring (Hueckel, N = 6 with periodic closure): levels {np.linalg.eigvalsh(Hr).round(6)}   (alpha +- 2 beta, alpha +- beta twice)")
N = 12; H = -(np.diag(np.ones(N - 1), 1) + np.diag(np.ones(N - 1), -1)) + np.diag([0.8] + [0] * (N - 1))
w, v = np.linalg.eigh(H); print(f"   a defect (site energy +0.8 on the first atom of an open chain of 12): lowest level {w[0]:.4f} (clean chain {-2*np.cos(np.pi/13):.4f}), highest {w[-1]:.4f}; the state above the clean chain's top level has weight {v[0, -1]**2:.3f} on the defect atom")

print("\n4. lowest 6 eigenvalues of the 2D Laplacian (Dirichlet) on an m x m grid: dense eigh versus Lanczos (eigsh)")
print("      m       n    dense eigh (s)   eigsh (s)   max relative difference    lowest eigenvalue / exact pi^2 * 2")
for m in (20, 40, 80, 120):
    h = 1 / (m + 1); T = sp.diags([-1, 2, -1], [-1, 0, 1], shape=(m, m), dtype=float); I = sp.identity(m)
    A = ((sp.kron(I, T) + sp.kron(T, I)) / h**2).tocsc()
    t0 = time.perf_counter(); wd = np.linalg.eigvalsh(A.toarray())[:6] if m <= 80 else None; td = time.perf_counter() - t0 if wd is not None else float('nan')
    t0 = time.perf_counter(); ws = np.sort(spl.eigsh(A, k=6, sigma=0, which="LM", return_eigenvectors=False)); ts = time.perf_counter() - t0
    diff = f"{np.max(np.abs(wd - ws) / wd):.1e}" if wd is not None else "   n/a   "
    print(f"   {m:4d}  {m*m:6d}   {td:12.3f}   {ts:9.4f}       {diff}                 {ws[0] / (2 * np.pi**2):.6f}")

print("\n5. sensitivity of eigenvalues: symmetric versus non-symmetric matrices (n = 10, perturbation of size 1e-10 in one entry)")
J = np.diag(np.ones(9), 1) + np.eye(10); J[9, 0] = 1e-10
print(f"   Jordan block (all eigenvalues 1): perturbed eigenvalues deviate by up to {np.max(np.abs(np.linalg.eigvals(J) - 1)):.3f}   (the 10th root of 1e-10 is 0.1)")
S = np.diag(np.arange(1.0, 11)); S[9, 0] = S[0, 9] = 1e-10
print(f"   symmetric matrix diag(1..10): eigenvalues change by up to {np.max(np.abs(np.linalg.eigvalsh(S) - np.arange(1.0, 11))):.1e}")
