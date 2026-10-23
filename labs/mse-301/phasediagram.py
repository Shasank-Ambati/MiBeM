"""A binary eutectic phase diagram from Gibbs-energy curves: lower convex hull (common tangent) at each temperature."""
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

R = 8.314462618
PHASES = ("alpha", "liquid", "beta")
def G(phase, x, T):
    """Gibbs energy per mole of atoms, J/mol.  Reference: stable pure solids (alpha for A, beta for B)."""
    mix = R * T * (x * np.log(x) + (1 - x) * np.log(1 - x))
    if phase == "alpha":  return x * 3000.0 + mix + 15000.0 * x * (1 - x)
    if phase == "beta":   return (1 - x) * 4000.0 + mix + 15000.0 * x * (1 - x)
    if phase == "liquid": return (1 - x) * (12000.0 - 10.0 * T) + x * (15000.0 - 10.0 * T) + mix - 5000.0 * x * (1 - x)

xg = np.linspace(1e-5, 1 - 1e-5, 4001)

def hull(T):
    """Lower convex hull of the union of the three G(x) curves; returns the vertices (x, G, phase index)."""
    pts = []
    for ip, ph in enumerate(PHASES):
        g = G(ph, xg, T)
        pts += list(zip(xg, g, [ip] * len(xg)))
    pts.sort(key=lambda p: (p[0], p[1]))
    # keep, for every x, the lowest curve, then run the monotone-chain lower hull
    lowest = {}
    for x, g, ip in pts:
        if x not in lowest or g < lowest[x][0]: lowest[x] = (g, ip)
    P = [(x, v[0], v[1]) for x, v in sorted(lowest.items())]
    H = []
    for p in P:
        while len(H) >= 2 and (H[-1][0] - H[-2][0]) * (p[1] - H[-2][1]) - (H[-1][1] - H[-2][1]) * (p[0] - H[-2][0]) <= 0:
            H.pop()
        H.append(p)
    return H

def two_phase_intervals(T):
    """Intervals (x1, x2, phase1, phase2) of the hull whose end points belong to different phases (tie lines), longer than one grid step."""
    H = hull(T); out = []
    for a, b in zip(H[:-1], H[1:]):
        if a[2] != b[2] and b[0] - a[0] > 3 * (xg[1] - xg[0]):
            out.append((a[0], b[0], PHASES[a[2]], PHASES[b[2]]))
    return out

def liquid_present(T):
    return any(p[2] == 1 for p in hull(T))

print("1. the Gibbs-energy curves at three temperatures and the common tangents (tie lines)")
for T in (1100.0, 900.0, 700.0):
    print(f"   T = {T:.0f} K:")
    for (x1, x2, p1, p2) in two_phase_intervals(T):
        print(f"      two-phase region {p1:7s} + {p2:7s}: x_B from {x1:.4f} to {x2:.4f}")

print("\n2. the eutectic: highest temperature at which the three-phase equilibrium alpha + liquid + beta exists")
lo, hi = 400.0, 1100.0                      # liquid absent at lo, present at hi
assert not liquid_present(lo) and liquid_present(hi)
while hi - lo > 0.01:
    mid = 0.5 * (lo + hi)
    if liquid_present(mid): hi = mid
    else: lo = mid
Te = 0.5 * (lo + hi)
H = hull(hi + 0.05)
xl = [p[0] for p in H if p[2] == 1]
iv = two_phase_intervals(Te - 1.0)
print(f"   eutectic temperature T_E = {Te:.2f} K;  just above it the liquid exists only near x_B = {np.mean(xl):.3f} (range {min(xl):.3f}-{max(xl):.3f})")
print("   below it the tie line joins:", ", ".join(f"{p1} x = {x1:.4f} / {p2} x = {x2:.4f}" for (x1, x2, p1, p2) in iv))
xa = iv[0][0] if iv[0][2] == "alpha" else None
Tin = Te - 1.0
alpha_x = iv[0][0]; beta_x = iv[0][1]

print("\n3. the lever rule for an alloy x0 = 0.30 B at several temperatures")
x0 = 0.30
for T in (1250.0, 1150.0, 1000.0, 900.0, Te + 1.0, Te - 5.0, 600.0):
    ivs = two_phase_intervals(T)
    hit = [(a, b, p, q) for (a, b, p, q) in ivs if a <= x0 <= b]
    if not hit:
        print(f"   T = {T:7.1f} K: single phase")
    else:
        a, b, p, q = hit[0]; f2 = (x0 - a) / (b - a)
        print(f"   T = {T:7.1f} K: {p} (x = {a:.4f}) fraction {1 - f2:.3f}  +  {q} (x = {b:.4f}) fraction {f2:.3f}")

print("\n4. solidification path of the x0 = 0.30 alloy on cooling (equilibrium): liquidus, start of solidification")
T = 1500.0
while T > 800 and not any(a <= x0 <= b for (a, b, p, q) in two_phase_intervals(T)): T -= 1.0
liq = T + 0.5
print(f"   liquidus temperature near {liq:.1f} K; first solid has composition", end=" ")
a, b, p, q = [t for t in two_phase_intervals(T) if t[0] <= x0 <= t[1]][0]
print(f"{q if p == 'liquid' else p} x_B = {(b if p == 'liquid' else a):.4f} (the liquid is {p if p == 'liquid' else q} at x_B = {(a if p == 'liquid' else b):.4f})")

fig, ax = plt.subplots(1, 2, figsize=(10, 4.2))
for T, c in ((1100.0, "#4c78a8"), (900.0, "#e45756")):
    for ph, ls in zip(PHASES, ("-", "--", ":")):
        ax[0].plot(xg, np.array(G(ph, xg, T)) / 1000, ls, color=c, lw=1.2, label=f"{ph}, {T:.0f} K" if True else None)
    for (x1, x2, p1, p2) in two_phase_intervals(T):
        y1 = G(p1, np.array([x1]), T)[0] / 1000; y2 = G(p2, np.array([x2]), T)[0] / 1000
        ax[0].plot([x1, x2], [y1, y2], "k-", lw=2.2)
ax[0].set_ylim(-6, 4); ax[0].set_xlabel("x$_B$"); ax[0].set_ylabel("G (kJ/mol)"); ax[0].legend(fontsize=6.5, ncol=2); ax[0].set_title("Gibbs energy curves and tie lines")
mark = {"alpha": "#4c78a8", "liquid": "#e45756", "beta": "#54a24b"}
for T in np.arange(400.0, 1560.0, 5.0):
    for (x1, x2, p1, p2) in two_phase_intervals(T):
        ax[1].plot([x1, x2], [T, T], ".", ms=1.5, color="k", alpha=0.12)
        ax[1].plot([x1], [T], ".", ms=3, color=mark[p1]); ax[1].plot([x2], [T], ".", ms=3, color=mark[p2])
ax[1].axhline(Te, color="gray", lw=0.6); ax[1].set_xlabel("x$_B$"); ax[1].set_ylabel("T (K)"); ax[1].set_title("Phase diagram (ends of the tie lines)"); [ax[1].plot([], [], ".", color=c, label=n) for n, c in mark.items()]; ax[1].legend(fontsize=8, loc="upper center")
fig.tight_layout(); fig.savefig("diagram.png", dpi=130)
print("\nsaved diagram.png")
