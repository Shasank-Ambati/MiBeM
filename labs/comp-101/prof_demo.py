import numpy as np, cProfile, pstats, io

def energy_loop(pos):
    E = 0.0
    for i in range(len(pos)):
        for j in range(i + 1, len(pos)):
            r = np.linalg.norm(pos[i] - pos[j])
            E += 4 * (r**-12 - r**-6)
    return E

g = np.arange(8) * 1.12
pos = np.array(np.meshgrid(g, g, g)).reshape(3, -1).T          # 512 atoms
pr = cProfile.Profile(); pr.enable(); e = energy_loop(pos); pr.disable()
s = io.StringIO(); pstats.Stats(pr, stream=s).sort_stats("cumulative").print_stats(6); print("E =", e)
print("\n".join(l for l in s.getvalue().splitlines() if l.strip()))
