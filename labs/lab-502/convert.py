"""Convert Lennard-Jones reduced units to real units for argon."""
import numpy as np

kB, NA = 1.380649e-23, 6.02214076e23
eps_over_k, sigma, m_amu = 119.8, 3.405e-10, 39.948          # K, m, u
eps = eps_over_k * kB                                         # J
m = m_amu * 1.66053907e-27                                    # kg
tau = sigma * np.sqrt(m / eps)                                # unit of time

T_star, rho_star, D_star, dt_star = 0.85, 0.8442, 0.0376, 0.004
print(f"epsilon = {eps:.4e} J = {eps * NA / 4184:.4f} kcal/mol = {eps / 1.602176634e-19 * 1000:.2f} meV")
print(f"time unit tau = {tau * 1e12:.3f} ps  ->  time step {dt_star}*tau = {dt_star * tau * 1e15:.2f} fs")
print(f"T = {T_star * eps_over_k:.1f} K")
print(f"density = {rho_star * m / sigma**3 / 1000:.3f} g/cm^3 = {rho_star / sigma**3 * 1e-6:.3e} atoms/cm^3")
print(f"D = {D_star * sigma * np.sqrt(eps / m) * 1e4:.2e} cm^2/s")
print(f"pressure unit eps/sigma^3 = {eps / sigma**3 / 1e6:.1f} MPa = {eps / sigma**3 / 101325:.0f} atm")
