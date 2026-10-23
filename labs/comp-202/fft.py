"""The fast Fourier transform: cost, spectral differentiation, spectral diffusion, aliasing, windowing."""
import numpy as np, time

def dft_matrix(x):
    n = len(x); k = np.arange(n); W = np.exp(-2j * np.pi * np.outer(k, k) / n); return W @ x

print("1. cost: the direct DFT (matrix-vector product, N^2) against the FFT (N log N); times in seconds")
print("        N      direct DFT        FFT      ratio     max |difference|")
rng = np.random.default_rng(0)
np.fft.fft(rng.standard_normal(64)); dft_matrix(rng.standard_normal(64))       # warm-up calls, so that start-up costs are not timed
for N in (256, 1024, 4096, 8192):
    x = rng.standard_normal(N)
    t0 = time.perf_counter(); a = dft_matrix(x); td = time.perf_counter() - t0
    t0 = time.perf_counter(); b = np.fft.fft(x); tf = time.perf_counter() - t0
    print(f"   {N:6d}   {td:12.5f}   {tf:10.6f}   {td / tf:7.0f}     {np.max(np.abs(a - b)):.1e}")
for N in (2**20, 2**20 + 1, 1048583):
    x = rng.standard_normal(N)
    t0 = time.perf_counter(); np.fft.fft(x); t = time.perf_counter() - t0
    print(f"   N = {N:8d}: FFT time {t:.4f} s" + ("   (a power of two)" if N == 2**20 else "   (17 x 61681)" if N == 2**20 + 1 else "   (a prime number)"))

print("\n2. spectral differentiation of a periodic function f = exp(sin x) on [0, 2 pi): error of f' against exact; finite differences for comparison")
print("      N     central difference (2nd order)   4th-order difference      FFT (spectral)")
for N in (8, 16, 32, 64):
    x = 2 * np.pi * np.arange(N) / N; f = np.exp(np.sin(x)); ex = np.cos(x) * f; h = 2 * np.pi / N
    d2 = (np.roll(f, -1) - np.roll(f, 1)) / (2 * h)
    d4 = (-np.roll(f, -2) + 8 * np.roll(f, -1) - 8 * np.roll(f, 1) + np.roll(f, 2)) / (12 * h)
    k = np.fft.fftfreq(N, 1 / N); ds = np.real(np.fft.ifft(1j * k * np.fft.fft(f)))
    print(f"   {N:4d}         {np.max(np.abs(d2 - ex)):12.3e}                {np.max(np.abs(d4 - ex)):12.3e}          {np.max(np.abs(ds - ex)):12.3e}")

print("\n3. spectral solution of the heat equation u_t = D u_xx with periodic conditions: each Fourier mode decays as exp(-D k^2 t)")
N = 128; L = 1.0; x = L * np.arange(N) / N; D = 0.01; t = 0.5
u0 = np.exp(-((x - 0.5) / 0.05)**2) + 0.3 * np.sin(2 * np.pi * 5 * x)
k = 2 * np.pi * np.fft.fftfreq(N, L / N)
u = np.real(np.fft.ifft(np.exp(-D * k**2 * t) * np.fft.fft(u0)))
# reference by a very fine explicit scheme
M = 128; dt = 0.2 * (L / M)**2 / D; ur = u0.copy(); steps = int(round(t / dt))
for _ in range(steps): ur = ur + D * dt / (L / M)**2 * (np.roll(ur, -1) - 2 * ur + np.roll(ur, 1))
print(f"   spectral (one step, any t) vs explicit finite differences with {steps} steps: max difference {np.max(np.abs(u - ur)):.2e}; mass conserved: {u.sum() * L / N:.6f} vs {u0.sum() * L / N:.6f}")

print("\n4. aliasing: a signal sin(2 pi f t) with f = 70 Hz sampled at 100 Hz (Nyquist frequency 50 Hz)")
fs = 100; t = np.arange(0, 2, 1 / fs); sig = np.sin(2 * np.pi * 70 * t)
F = np.abs(np.fft.rfft(sig)) / len(t) * 2; fr = np.fft.rfftfreq(len(t), 1 / fs)
print(f"   the largest peak appears at {fr[np.argmax(F)]:.1f} Hz (= |70 - 100|), amplitude {F.max():.3f}")
sig2 = np.sin(2 * np.pi * 30 * t); F2 = np.abs(np.fft.rfft(sig2)) / len(t) * 2
print(f"   a true 30 Hz signal sampled the same way gives a peak at {fr[np.argmax(F2)]:.1f} Hz: the two cannot be distinguished from the samples")

print("\n5. leakage and windows: a sine of frequency 10.5 cycles per record (not an integer) sampled over N = 256 points")
N = 256; n = np.arange(N); sig = np.sin(2 * np.pi * 10.5 * n / N)
for name, w in (("rectangular", np.ones(N)), ("Hann", np.hanning(N))):
    F = np.abs(np.fft.rfft(sig * w)); F /= F.max()
    far = F[40:]; print(f"   {name:11s} window: spectrum 30 bins from the peak is {far.max():.2e} of the peak, main-lobe width (bins above 0.1 of peak): {np.sum(F > 0.1)}")
sigi = np.sin(2 * np.pi * 10 * n / N); F = np.abs(np.fft.rfft(sigi)); F /= F.max()
print(f"   for an integer 10 cycles per record the spectrum is a single line: other bins are below {np.max(np.delete(F, 10)):.1e}")
