"""Triangular mesh of one quarter of a plate with a central circular hole, with the Python interface of Triangle (pip install triangle).
The element size grows with the distance from the hole because concentric arcs of radius R, 2R, 4R carry fewer points."""
import numpy as np, triangle as tr
from skfem import MeshTri

def plate_mesh(n=20, R=5.0, W=50.0, H=100.0, max_area=40):
    """Quarter model: x from 0 to W (half-width), y from 0 to H (half-length). n = number of points on the quarter arc of the hole."""
    pts, segs, mark = [], [], []
    def add(p): pts.append(p); return len(pts) - 1
    def arc(r, m, tag):                           # m segments on the quarter arc of radius r, from (r,0) to (0,r); returns indices
        ids = [add((r * np.cos(t), r * np.sin(t))) for t in np.linspace(0, np.pi / 2, m + 1)]
        for a, b in zip(ids[:-1], ids[1:]): segs.append((a, b)); mark.append(tag)
        return ids
    # markers: 1 bottom (y=0), 2 right, 3 top, 4 left (x=0), 5 hole, 0 interior
    hole = arc(R, n, 5)
    guides = [arc(r, max(int(n * R / r), 2), 0) for r in (2 * R, 4 * R) if r < 0.95 * W]      # guide arcs: fewer points on the larger ones -> larger elements
    br = add((W, 0.0)); tr_ = add((W, H)); tl = add((0.0, H))
    for chain, tag in (([hole[0]] + [g[0] for g in guides] + [br], 1), ([hole[-1]] + [g[-1] for g in guides] + [tl], 4)):
        for a, b in zip(chain[:-1], chain[1:]): segs.append((a, b)); mark.append(tag)
    segs += [(br, tr_), (tr_, tl)]; mark += [2, 3]
    o = add((0.0, 0.0))                           # corner of the hole region; the quarter disc inside the hole is removed with a "hole" point
    segs += [(o, hole[0]), (o, hole[-1])]; mark += [0, 0]
    pslg = dict(vertices=np.array(pts), segments=np.array(segs), segment_markers=np.array(mark), holes=np.array([[0.3 * R, 0.3 * R]]))
    t = tr.triangulate(pslg, "pq30a%d" % max_area)
    used = np.unique(t["triangles"])                               # drop the vertices that belong only to the removed hole region
    remap = -np.ones(len(t["vertices"]), dtype=int); remap[used] = np.arange(len(used))
    p, tri = t["vertices"][used].T, remap[t["triangles"]].T
    mesh = MeshTri(np.ascontiguousarray(p), np.ascontiguousarray(tri))
    # boundary sets from geometry (robust and easy to read)
    mesh = mesh.with_boundaries({
        "bottom": lambda x: np.abs(x[1]) < 1e-9, "left": lambda x: np.abs(x[0]) < 1e-9, "top": lambda x: np.abs(x[1] - H) < 1e-9,
        "right": lambda x: np.abs(x[0] - W) < 1e-9, "hole": lambda x: np.hypot(x[0], x[1]) < R * 1.001})
    return mesh

if __name__ == "__main__":
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    for n in (5, 10, 20, 40):
        m = plate_mesh(n); print("n = %2d: %6d nodes, %6d triangles" % (n, m.p.shape[1], m.t.shape[1]))
    fig, ax = plt.subplots(1, 2, figsize=(8, 5))
    m = plate_mesh(20)
    for a, (xl, yl) in zip(ax, (((0, 50), (0, 100)), ((0, 25), (0, 25)))):
        a.triplot(m.p[0], m.p[1], m.t.T, lw=0.3, color="k"); a.set_xlim(*xl); a.set_ylim(*yl); a.set_aspect("equal"); a.set_xlabel("x"); a.set_ylabel("y")
    ax[0].set_title("quarter plate"); ax[1].set_title("zoom near the hole")
    fig.tight_layout(); fig.savefig("plate_mesh.png", dpi=130)
