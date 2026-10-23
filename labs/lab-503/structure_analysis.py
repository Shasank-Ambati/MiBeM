"""What happens at the stress peaks?  Run the 300 K tensile test once, dump per-atom CNA and centrosymmetry every 0.005 strain, then count structures per frame."""
import numpy as np
from lammps import lammps

T, rate, n = 300, 0.004, 10
dt, every = 0.002, 1250                       # 1250 steps = 0.005 strain at this rate
lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
for c in ["units metal", "atom_style atomic", "boundary p p p", "lattice fcc 3.6149", f"region box block 0 {n} 0 {n} 0 {n}", "create_box 1 box",
          "create_atoms 1 box", "mass 1 63.546", "pair_style eam", "pair_coeff 1 1 Cu_u3.eam", f"velocity all create {T} 8675309 dist gaussian",
          f"timestep {dt}", f"fix 1 all npt temp {T} {T} 0.2 iso 0.0 0.0 2.0", "run 5000", "unfix 1",
          f"fix 2 all npt temp {T} {T} 0.2 y 0.0 0.0 2.0 z 0.0 0.0 2.0 drag 1.0", f"fix 3 all deform 1 x erate {rate} units box remap x",
          "compute cna all cna/atom 3.08", "compute csp all centro/atom fcc", "thermo_style custom step lx pxx",
          f"dump d all custom {every} struct.dump id c_cna c_csp", "reset_timestep 0"]:
    lmp.command(c)
lx0 = lmp.get_thermo("lx")
lmp.command("run 0")
lmp.command("fix pr all print 1250 \"$(step) $(lx) $(-pxx/10000)\" file stress_frames.dat screen no")
lmp.command("run 36000")
lmp.close()

# parse dump
frames, cur = [], None
lines = open("struct.dump").read().split("\n")
i = 0
while i < len(lines):
    if lines[i].startswith("ITEM: TIMESTEP"):
        step = int(lines[i + 1]); nat = int(lines[i + 3]); i += 9
        arr = np.array([l.split() for l in lines[i:i + nat]], float); i += nat
        frames.append((step, arr))
    else:
        i += 1
sf = {int(float(l.split()[0])): (float(l.split()[1]), float(l.split()[2])) for l in open("stress_frames.dat") if l.strip() and not l.startswith("#")}
print(" strain   stress(GPa)   fcc    hcp    bcc   other   CSP>1")
for step, a in frames:
    code = np.round(a[:, 1]).astype(int); csp = a[:, 2]
    if step in sf:
        eps = sf[step][0] / sf[0][0] - 1 if 0 in sf else float("nan"); s = sf[step][1]
    else:
        eps = step * dt * rate; s = float("nan")
    print(f" {step*dt*rate:6.3f}   {s:8.2f}   {np.sum(code==1):5d}  {np.sum(code==2):5d}  {np.sum(code==3):5d}  {np.sum(code==5):5d}   {np.sum(csp>1):5d}")
