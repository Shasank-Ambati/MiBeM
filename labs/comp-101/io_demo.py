import numpy as np, csv, json, os
r = np.linspace(0.95, 3.0, 8)
from lj import pair_energy
E = pair_energy(r)
# CSV by hand and with numpy
with open("lj.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["r", "E"]); w.writerows(zip(r, E))
print(open("lj.csv").read())
data = np.loadtxt("lj.csv", delimiter=",", skiprows=1)
print(data.shape, data[0], np.allclose(data[:, 1], E))
# JSON for parameters and results
meta = {"model": "lennard-jones", "epsilon": 1.0, "sigma": 1.0, "cutoff": 2.5, "n_points": len(r), "E_min": float(E.min())}
json.dump(meta, open("meta.json", "w"), indent=2); print(open("meta.json").read())
# binary NumPy file
np.save("lj.npy", data); print(os.path.getsize("lj.csv"), "bytes (csv)", os.path.getsize("lj.npy"), "bytes (npy)", np.load("lj.npy").dtype)
# a structure file (extended xyz written by hand)
pos = np.array([[0, 0, 0], [0, 0, 1.12], [0, 1.12, 0]])
with open("trimer.xyz", "w") as f:
    f.write("%d\n" % len(pos)); f.write('Lattice="10 0 0 0 10 0 0 0 10" Properties=species:S:1:pos:R:3 pbc="F F F"\n')
    for p in pos: f.write("Ar %.4f %.4f %.4f\n" % tuple(p))
print(open("trimer.xyz").read())
