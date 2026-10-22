/* Single source of truth for the topic list.
   Edit this file when a topic is added, then run:  python tools/build.py
   (the build step regenerates cards, pager, header, footer, the facts strip,
   takeaways boxes, the sitemap and the search index from this data).
   `builds` = topics worth reading first; `related` = topics that connect but are not required. */
window.MIBEM_TOPICS = [
  {
    "id": 1, "slug": "introduction", "short": "Introduction", "part": "Foundations", "tone": "a", "minutes": 20,
    "title": "Introduction to computational materials science",
    "blurb": "Scales, method families, multiscale linking, validation, software and data resources.",
    "builds": [], "related": [],
    "takeaways": [
      "Methods are specialised by length and time scale; no single model covers every scale, so multiscale linking is the norm.",
      "Start from the question: the smallest feature that matters, the longest time that matters, and whether the answer is an equilibrium or a rate.",
      "A simulation is a prediction to be tested. Verification, validation and uncertainty quantification are three different checks.",
      "The cheapest useful step is often a thermodynamic (CALPHAD) calculation, before heavier modelling is attempted.",
      "Inputs and approximations bound accuracy: trends and rankings are usually more reliable than absolute numbers."
    ]
  },
  {
    "id": 2, "slug": "crystal-structure-and-periodic-cells", "short": "Crystals and cells", "part": "Foundations", "tone": "a", "minutes": 12,
    "title": "Crystal structures, supercells and periodic boundaries",
    "blurb": "Lattices, Miller indices, defects, building simulation cells and periodic boundary conditions.",
    "builds": [1], "related": [],
    "takeaways": [
      "A crystal is a lattice plus a basis. Count atoms and neighbours to sanity-check a structure: fcc has 4 atoms per cubic cell and 12 neighbours, bcc has 2 and 8.",
      "Miller indices label planes and directions; the reciprocal lattice links real-space cells to diffraction and to k-point sampling.",
      "Defects are the subject of most simulations. Supercell size is a convergence parameter, and one vacancy in an N-atom cell is a concentration of 1/N.",
      "Periodic boundaries remove walls but make a defect interact with its own images; every cutoff must be smaller than half the box.",
      "Surfaces use slabs with vacuum; a grain boundary in a fully periodic cell always comes as a pair."
    ]
  },
  {
    "id": 3, "slug": "statistical-mechanics", "short": "Statistical mechanics", "part": "Foundations", "tone": "a", "minutes": 12,
    "title": "Statistical mechanics for simulation",
    "blurb": "Microstates, ensembles, the partition function, free energy, ergodicity and error bars.",
    "builds": [1], "related": [],
    "takeaways": [
      "The Boltzmann distribution, p proportional to exp(-E/kT), underlies Metropolis Monte Carlo, thermostats and equilibrium defect concentrations.",
      "Pick the ensemble that matches what is held fixed: NVE, NVT, NPT or the grand canonical.",
      "Free energies, not energies, decide stability, and they need dedicated methods: thermodynamic integration, perturbation, umbrella sampling, the quasi-harmonic approximation.",
      "Classical simulation assumes equipartition, so it overestimates heat capacity when quantum modes are frozen out at low temperature.",
      "Quote averages with error bars. The correlation time sets the number of independent samples, and ergodicity is never guaranteed."
    ]
  },
  {
    "id": 4, "slug": "thermodynamics-and-calphad", "short": "Thermodynamics and CALPHAD", "part": "Thermodynamics", "tone": "b", "minutes": 12,
    "title": "Thermodynamics and CALPHAD",
    "blurb": "Gibbs energy, the common tangent, solution models, phase diagrams and equilibrium calculation.",
    "builds": [3], "related": [5],
    "takeaways": [
      "Equilibrium means minimum Gibbs energy, equivalently equal chemical potentials. The common tangent gives phase compositions and the lever rule gives amounts.",
      "For a regular solution the miscibility gap closes at Tc = Omega/2R; the spinodal lies inside the binodal.",
      "CALPHAD fits a Gibbs energy model to every phase (Redlich-Kister terms, sublattices, magnetism) and stores the parameters in a database.",
      "It delivers equilibria, solidification paths and driving forces. It does not deliver kinetics or geometry.",
      "Database coverage limits accuracy, and multicomponent extrapolation from binary data needs checking."
    ]
  },
  {
    "id": 5, "slug": "density-functional-theory", "short": "Density functional theory", "part": "Electrons", "tone": "b", "minutes": 13,
    "title": "Density functional theory in practice",
    "blurb": "The Kohn-Sham scheme, functionals, the SCF cycle, convergence and what to compute.",
    "builds": [2], "related": [4],
    "takeaways": [
      "DFT solves for the electron density through the Kohn-Sham equations; only the exchange-correlation energy is approximated.",
      "The functional (LDA, GGA, meta-GGA, hybrid, plus U, van der Waals) sets the typical errors. Relative energies are more reliable than absolute ones.",
      "Converge the cutoff, k-points, smearing and cell size before trusting any number.",
      "Standard outputs are lattice constants, elastic constants, formation and defect energies, barriers by nudged elastic band, and phonons.",
      "Cost grows roughly as N cubed, which limits cells to hundreds or a few thousand atoms, and results are for 0 K unless extended."
    ]
  },
  {
    "id": 6, "slug": "molecular-dynamics", "short": "Molecular dynamics", "part": "Atoms", "tone": "b", "minutes": 11,
    "title": "Molecular dynamics",
    "blurb": "Integrators, interatomic potentials, thermostats, workflow and analysis.",
    "builds": [2, 3], "related": [5, 8],
    "takeaways": [
      "MD integrates Newton's equations with velocity-Verlet. Use a time step of about a tenth to a twentieth of the shortest vibrational period and check energy conservation in NVE.",
      "The potential defines the accuracy, so validate it on the property you need.",
      "Use canonical thermostats and proper barostats (Nose-Hoover, stochastic velocity rescaling, Parrinello-Rahman) for production runs.",
      "The workflow is build, minimise, equilibrate, produce and analyse, with error bars from independent runs.",
      "Limits: nanoseconds to microseconds, very high strain rates, classical nuclei and no electrons."
    ]
  },
  {
    "id": 7, "slug": "monte-carlo-methods", "short": "Monte Carlo and kMC", "part": "Atoms", "tone": "b", "minutes": 12,
    "title": "Monte Carlo and kinetic Monte Carlo",
    "blurb": "Importance sampling, Metropolis, the Ising model, cluster expansions and rejection-free kinetics.",
    "builds": [3], "related": [8],
    "takeaways": [
      "Importance sampling with detailed balance produces Boltzmann-distributed samples; the Metropolis rule accepts with probability min(1, exp(-dE/kT)).",
      "Moves need not be physical: swap moves equilibrate chemical order far faster than dynamics can.",
      "Lattice models and cluster expansions carry DFT energetics into alloy thermodynamics at large size.",
      "Kinetic Monte Carlo advances physical time, dt = -ln(u)/R, using rates built from barriers.",
      "kMC is only as good as its event catalogue and barriers."
    ]
  },
  {
    "id": 8, "slug": "diffusion-and-kinetics", "short": "Diffusion and kinetics", "part": "Kinetics", "tone": "a", "minutes": 13,
    "title": "Diffusion and kinetics",
    "blurb": "Fick's laws, driving forces, atomistic mechanisms, computing D and solving the equation.",
    "builds": [4], "related": [6, 7],
    "takeaways": [
      "Diffusion distance grows as the square root of Dt, so the time needed scales with the square of the length.",
      "The real driving force is the chemical-potential gradient; diffusion can run uphill, and Darken and Kirkendall effects follow from unequal mobilities.",
      "D = D0 exp(-Q/RT). For vacancy diffusion Q is formation plus migration energy; for interstitials it is the migration energy alone.",
      "D can come from MD (fast species), DFT with transition-state theory, or kinetic Monte Carlo, and should be checked against experiment.",
      "An explicit finite-difference scheme is stable only for r = D dt/dx squared of at most one half in one dimension."
    ]
  },
  {
    "id": 9, "slug": "phase-field-modelling", "short": "Phase-field", "part": "Microstructure", "tone": "b", "minutes": 12,
    "title": "Phase-field modelling",
    "blurb": "Diffuse interfaces, Allen-Cahn and Cahn-Hilliard, spinodal decomposition and numerics.",
    "builds": [4, 8], "related": [5, 6],
    "takeaways": [
      "Interfaces are smooth transitions of an order parameter, so topology changes need no special treatment.",
      "Allen-Cahn (non-conserved) gives curvature-driven motion; Cahn-Hilliard (conserved) gives spinodal decomposition and t to the 1/3 coarsening.",
      "Interface energy and width fix the model parameters: gamma = (2 sqrt 2 / 3) sqrt(kappa A) and width ~ sqrt(2 kappa / A).",
      "Inputs come from CALPHAD (free energy), diffusion databases (mobility) and atomistics (interface energy); results must not depend on the interface width or the grid.",
      "Resolve the interface with about 4 to 8 grid points; explicit steps are tightly limited, so use semi-implicit spectral or adaptive finite elements."
    ]
  },
  {
    "id": 10, "slug": "finite-element-method", "short": "Finite elements", "part": "Continuum", "tone": "a", "minutes": 13,
    "title": "The finite element method",
    "blurb": "Weak form, shape functions, meshing, convergence, nonlinear problems and materials applications.",
    "builds": [8], "related": [9],
    "takeaways": [
      "The weak form with shape functions turns a PDE into a sparse linear system, K u = f, assembled element by element.",
      "A mesh convergence study is mandatory. Displacement error falls as h to the p+1 for smooth solutions, while stress singularities never converge.",
      "Nonlinear problems use Newton-Raphson with load steps; time-dependent ones use explicit or implicit integration.",
      "The constitutive law and boundary conditions (heat transfer, friction) usually dominate the uncertainty.",
      "Verify against analytic cases (the Kirsch plate gives a factor of 3, the patch test) and validate against measurements."
    ]
  },
  {
    "id": 11, "slug": "machine-learning-for-materials", "short": "Machine learning", "part": "Data", "tone": "b", "minutes": 15,
    "title": "Machine learning for materials",
    "blurb": "Data, descriptors, models, honest validation, machine-learned potentials and active learning.",
    "builds": [5, 6], "related": [7],
    "takeaways": [
      "ML interpolates well and extrapolates badly: trust it inside the training domain and doubt it outside.",
      "Descriptors carry the physics and symmetry; small datasets favour simple models and physics-based features.",
      "Validate with grouped, time-based or extrapolation splits against a baseline, and report uncertainty.",
      "Machine-learned potentials reach near-DFT accuracy at far lower cost; build them with active learning and validate on properties, not only on energies.",
      "Active learning and Bayesian optimisation choose the next calculation or experiment; combine them with physical models."
    ]
  }
];
