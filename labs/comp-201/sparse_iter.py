"""Sparse and iterative solvers for the Poisson (steady diffusion) matrix."""
import numpy as np, scipy.sparse as sp, scipy.sparse.linalg as spl, scipy.linalg as sla, time

def lap1d(n):
    return sp.diags([-1, 2, -1], [-1, 0, 1], shape=(n, n), format="csr", dtype=float)
def lap2d(m):
    T = lap1d(m); I = sp.identity(m)
    return (sp.kron(I, T) + sp.kron(T, I)).tocsr()

_ab = np.zeros((2, 5)); _ab[0, 1:] = -1; _ab[1] = 2; sla.solveh_banded(_ab, np.ones(5))     # warm up LAPACK
print("1. one-dimensional problem  -u'' = f : tridiagonal matrix, n unknowns")
print("      n     dense LAPACK   banded (solveh_banded)   sparse (spsolve)   [seconds]")
for n in (500, 2000, 4000, 8000):
    A = lap1d(n); b = np.ones(n)
    Ad = A.toarray()
    t0 = time.perf_counter(); np.linalg.solve(Ad, b); td = time.perf_counter() - t0
    ab = np.zeros((2, n)); ab[0, 1:] = -1; ab[1, :] = 2
    t0 = time.perf_counter(); sla.solveh_banded(ab, b); tb = time.perf_counter() - t0
    t0 = time.perf_counter(); spl.spsolve(A.tocsc(), b); ts = time.perf_counter() - t0
    print(f"   {n:5d}   {td:12.4f}   {tb:18.6f}        {ts:14.6f}")

print("\n2. iterative methods for the 1D problem (tolerance: relative residual 1e-8)")
def jacobi(A, b, tol=1e-8, maxit=200000):
    d = A.diagonal(); R = A - sp.diags(d); x = np.zeros_like(b)
    for k in range(maxit):
        x = (b - R @ x) / d
        if np.linalg.norm(A @ x - b) < tol * np.linalg.norm(b): return x, k + 1
    return x, maxit
def gauss_seidel(A, b, tol=1e-8, maxit=200000):
    L = sp.tril(A, format="csr"); U = sp.triu(A, 1, format="csr"); x = np.zeros_like(b)
    for k in range(maxit):
        x = spl.spsolve_triangular(L, b - U @ x, lower=True)
        if np.linalg.norm(A @ x - b) < tol * np.linalg.norm(b): return x, k + 1
    return x, maxit
def cg_count(A, b, M=None):
    it = [0]
    def cb(xk): it[0] += 1
    x, info = spl.cg(A, b, rtol=1e-8, maxiter=100000, M=M, callback=cb)
    return x, it[0]
print("      n    cond(A)   Jacobi iterations   Gauss-Seidel   conjugate gradients")
for n in (20, 40, 80, 160):
    A = lap1d(n); b = np.ones(n)
    c = np.linalg.cond(A.toarray())
    _, kj = jacobi(A, b); _, kg = gauss_seidel(A, b); _, kc = cg_count(A, b)
    print(f"   {n:4d}   {c:8.0f}   {kj:12d}     {kg:12d}   {kc:12d}")

print("\n3. two-dimensional Poisson problem on an m x m grid (n = m^2 unknowns, 5 non-zeros per row)")
print("      m        n     non-zeros   non-zeros in L+U   spsolve (s)   CG iterations   CG (s)")
for m in (50, 100, 200, 400):
    A = lap2d(m); n = m * m; b = np.ones(n)
    t0 = time.perf_counter(); lu = spl.splu(A.tocsc()); ts = time.perf_counter() - t0
    fill = lu.L.nnz + lu.U.nnz
    t0 = time.perf_counter(); x, k = cg_count(A, b); tc = time.perf_counter() - t0
    print(f"   {m:4d}  {n:7d}   {A.nnz:9d}   {fill:14d}    {ts:9.3f}   {k:10d}   {tc:8.3f}")
