"""Supercells and point defects: vacancy, substitution and interstitial in copper, with the EMT calculator and relaxation."""
from ase.build import bulk
from ase.calculators.emt import EMT
from ase.optimize import BFGS

def relaxed(atoms):
    atoms.calc = EMT()
    BFGS(atoms, logfile=None).run(fmax=0.01)
    return atoms.get_potential_energy()

for n in (2, 3, 4, 5):
    perfect = bulk("Cu", "fcc", a=3.6, cubic=True).repeat((n, n, n))
    perfect.calc = EMT(); E0 = perfect.get_potential_energy(); N = len(perfect)
    vac = perfect.copy(); del vac[0]
    Eu = vac.copy(); Eu.calc = EMT(); Eu = Eu.get_potential_energy()
    Er = relaxed(vac)
    print("%d x %d x %d  N = %3d   E_f unrelaxed = %.4f eV   relaxed = %.4f eV" % (n, n, n, N, Eu - (N - 1) / N * E0, Er - (N - 1) / N * E0))

# substitution: replace one Cu by Ag, energy relative to the pure elements
n = 3
host = bulk("Cu", "fcc", a=3.6, cubic=True).repeat((n, n, n)); N = len(host)
host.calc = EMT(); Ecu = host.get_potential_energy() / N
ag = bulk("Ag", "fcc", a=4.09, cubic=True).repeat((n, n, n)); ag.calc = EMT(); Eag = ag.get_potential_energy() / N
sub = host.copy(); sub[0].symbol = "Ag"
E_sub = relaxed(sub)
print("\nsubstitution Ag in Cu (%d atoms): E = %.4f eV, solution energy = %.4f eV" % (N, E_sub, E_sub - (N - 1) * Ecu - Eag))
