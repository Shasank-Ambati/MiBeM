"""Copper with three kinds of interatomic potential in LAMMPS: Lennard-Jones, Morse (pair potentials fitted to a0 and E_coh) and EAM (many-body)."""
import numpy as np
from lammps import lammps

sigma, eps, D, alpha, r0 = np.loadtxt("pair_params.txt")
GPa = 160.21766                                  # eV/A^3 -> GPa
STYLES = {
    "LJ (pair)":    ["pair_style lj/cut 12.0", f"pair_coeff 1 1 {eps} {sigma}", "pair_modify shift no"],
    "Morse (pair)": ["pair_style morse 12.0", f"pair_coeff 1 1 {D} {alpha} {r0}", "pair_modify shift no"],
    "EAM (many-body)": ["pair_style eam", "pair_coeff 1 1 Cu_u3.eam"],
}
def new(style, a, n=7, vacuum=0.0):
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units metal", "atom_style atomic", "boundary p p p", f"lattice fcc {a}",
                       f"region box block 0 {n} 0 {n} 0 {n}", "create_box 1 box", "create_atoms 1 box", "mass 1 63.546"] + STYLES[style]
                      + ["neighbor 1.0 bin", "thermo_style custom step pe press pxx pyy pzz pxy", "thermo 1000"])
    return lmp
def extract(lmp, name): return lmp.get_thermo(name)

print("property                 LJ (pair)    Morse (pair)   EAM          experiment")
rows = {}
for style in STYLES:
    res = {}
    # 1. energy against the lattice constant -> a0, E_coh, B
    aa = np.linspace(3.55, 3.68, 14); EE = []
    for a in aa:
        lmp = new(style, a); lmp.command("run 0"); EE.append(extract(lmp, "pe") / lmp.get_natoms()); lmp.close()
    c = np.polyfit(aa, EE, 4); ar = np.linspace(aa[0], aa[-1], 20001); er = np.polyval(c, ar); i = er.argmin(); a0 = ar[i]
    h = 1e-3; d2 = (np.polyval(c, a0 + h) - 2 * np.polyval(c, a0) + np.polyval(c, a0 - h)) / h**2
    B = (a0**3 / 4) * (d2 - 0) / (3 * a0**2 / 4)**2 * GPa     # at the minimum dE/da = 0: B = V d2E/dV2 = (a^3/4) (d2E/da2)/(dV/da)^2
    res["a0 (A)"] = a0; res["E_coh (eV)"] = -er[i]; res["B (GPa)"] = B
    # 2. elastic constants at a0 by finite strains
    def stress_at(kind, d):
        lmp = new(style, a0, n=7)
        if kind == "xx": lmp.command(f"change_box all x scale {1 + d} remap")
        if kind == "xy": lmp.command("change_box all triclinic"); lmp.command(f"change_box all xy delta {d * 7 * a0} remap units box")
        lmp.command("run 0")
        p = {k: extract(lmp, k) / 1e4 for k in ("pxx", "pyy", "pzz", "pxy")}                 # bar -> GPa
        lmp.close(); return p
    dd = 1e-3
    pp, pm = stress_at("xx", dd), stress_at("xx", -dd)
    res["C11 (GPa)"] = -(pp["pxx"] - pm["pxx"]) / (2 * dd); res["C12 (GPa)"] = -(pp["pyy"] - pm["pyy"]) / (2 * dd)
    sp, sm = stress_at("xy", dd), stress_at("xy", -dd)
    res["C44 (GPa)"] = -(sp["pxy"] - sm["pxy"]) / (2 * dd)
    res["C12 - C44 (GPa)"] = res["C12 (GPa)"] - res["C44 (GPa)"]
    # 3. vacancy formation energy, unrelaxed and relaxed (n = 5: 500 atoms)
    lmp = new(style, a0, n=5); lmp.command("run 0"); N = lmp.get_natoms(); E0 = extract(lmp, "pe")
    lmp.command("group first id 1"); lmp.command("delete_atoms group first"); lmp.command("run 0"); Eu = extract(lmp, "pe")
    lmp.command("fix 1 all box/relax iso 0.0"); lmp.command("min_style cg"); lmp.command("minimize 1e-12 1e-12 5000 10000"); Er = extract(lmp, "pe"); lmp.close()
    res["E_vac unrelaxed (eV)"] = Eu - (N - 1) / N * E0; res["E_vac relaxed (eV)"] = Er - (N - 1) / N * E0
    # 4. (100) surface energy: periodic slab, vacuum along z, relaxed atoms
    lmp = lammps(cmdargs=["-log", "none", "-screen", "none"])
    lmp.commands_list(["units metal", "atom_style atomic", "boundary p p p", f"lattice fcc {a0}", "region box block 0 5 0 5 0 16", "create_box 1 box",
                       "region slab block 0 5 0 5 0 8", "create_atoms 1 region slab", "mass 1 63.546"] + STYLES[style] + ["neighbor 1.0 bin", "thermo_style custom step pe", "thermo 1000", "run 0"])
    ns = lmp.get_natoms(); Es0 = extract(lmp, "pe")
    lmp.commands_list(["min_style cg", "minimize 1e-12 1e-12 5000 10000"]); Es = extract(lmp, "pe"); lmp.close()
    A = (5 * a0)**2; Ebulk = -res["E_coh (eV)"]
    res["gamma(100) unrelaxed (J/m2)"] = (Es0 - ns * Ebulk) / (2 * A) * 16.02177; res["gamma(100) relaxed (J/m2)"] = (Es - ns * Ebulk) / (2 * A) * 16.02177
    rows[style] = res
exp = {"a0 (A)": 3.615, "E_coh (eV)": 3.54, "B (GPa)": 140, "C11 (GPa)": 168.4, "C12 (GPa)": 121.4, "C44 (GPa)": 75.4, "C12 - C44 (GPa)": 46.0, "E_vac unrelaxed (eV)": None, "E_vac relaxed (eV)": 1.28, "gamma(100) unrelaxed (J/m2)": None, "gamma(100) relaxed (J/m2)": 1.8}
for k in rows["LJ (pair)"]:
    ex = exp[k]
    print(f"{k:28s} " + " ".join(f"{rows[s][k]:12.3f}" for s in STYLES) + f"   {ex if ex is not None else '':>8}")
