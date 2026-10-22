/* Single source of truth for the topic list.
   Edit this file when a topic is added, then run:  python tools/build.py
   (the build step regenerates cards, pager, header, footer, the facts strip,
   takeaways boxes, the sitemap and the search index from this data).
   `builds` = topics worth reading first; `related` = topics that connect but are not required. */
window.MIBEM_TOPICS = [
  {
    "id": 17,
    "label": "S0",
    "series": "start",
    "slug": "start-here",
    "short": "Start here",
    "part": "Start here",
    "tone": "a",
    "minutes": 8,
    "title": "Start here: what you will learn and how",
    "blurb": "What computational materials science is, a roadmap with time estimates, how to study, and a short quiz that tells you where to begin.",
    "builds": [],
    "related": [],
    "takeaways": [
      "Computational materials science uses computers to predict how materials behave, by describing atoms, energy and heat with rules and calculating what follows.",
      "A model is a simplified description; a simulation is the step-by-step calculation of what the model predicts, and it must be checked against reality.",
      "The site has three levels: Start here (school-level), Background (university-level refresher) and Core topics (the methods).",
      "Learn actively: try every demo, attempt each question before opening the answer, and use the glossary when a word is new.",
      "If a page feels too hard, go one level down instead of pushing on; that is the intended way to use this site."
    ]
  },
  {
    "id": 18,
    "label": "S1",
    "series": "start",
    "slug": "numbers-units-and-graphs",
    "short": "Numbers, units, graphs",
    "part": "Start here",
    "tone": "a",
    "minutes": 13,
    "title": "Numbers, units and graphs",
    "blurb": "Scientific notation, units and conversions, algebra, functions, logarithms and reading graphs: the everyday maths of science.",
    "builds": [
      17
    ],
    "related": [],
    "takeaways": [
      "Scientific notation (such as 6.0 x 10^23) lets you write very large and very small numbers and compare sizes at a glance.",
      "A number without a unit is incomplete; convert by multiplying by factors equal to one, and check that units balance.",
      "A function turns an input into an output; its graph shows how, and the shape (line, curve, exponential) tells you the kind of process.",
      "A logarithm asks 'what power?', and plotting on a log scale turns exponential curves into straight lines.",
      "The slope of a straight line is a rate: how much y changes for each step in x."
    ]
  },
  {
    "id": 19,
    "label": "S2",
    "series": "start",
    "slug": "rates-of-change-calculus",
    "short": "Rates of change",
    "part": "Start here",
    "tone": "b",
    "minutes": 11,
    "title": "Rates of change: calculus from scratch",
    "blurb": "Slopes, derivatives, areas and the idea of an equation that says how fast something changes, built up with pictures instead of proofs.",
    "builds": [
      18
    ],
    "related": [],
    "takeaways": [
      "A derivative is the slope of a curve at a point: the instantaneous rate of change.",
      "Where the slope of an energy curve is zero there is an equilibrium; a positive curvature there means it is stable.",
      "An integral adds up many small pieces and equals the area under a curve.",
      "Many laws say 'the rate of change depends on the amount', and their solutions are exponential decay or growth.",
      "Force is minus the slope of the energy: the arrow that points downhill."
    ]
  },
  {
    "id": 20,
    "label": "S3",
    "series": "start",
    "slug": "atoms-bonds-and-materials",
    "short": "Atoms and materials",
    "part": "Start here",
    "tone": "b",
    "minutes": 10,
    "title": "Atoms, bonds and materials from scratch",
    "blurb": "What materials are made of, why atoms stick together, how crystals and defects arise, and how structure sets properties.",
    "builds": [
      17
    ],
    "related": [],
    "takeaways": [
      "Everything is made of atoms; properties come from which atoms there are and how they are arranged and bonded.",
      "Bonds balance attraction and repulsion, giving a preferred spacing and a stiffness; deeper bonds mean higher melting points.",
      "Crystals are repeating patterns; real crystals contain defects such as vacancies, solute atoms and dislocations.",
      "Defects, not perfect order, explain why metals bend, conduct and can be strengthened by alloying.",
      "We simulate because we cannot see atoms directly and cannot afford to test every composition."
    ]
  },
  {
    "id": 21,
    "label": "S4",
    "series": "start",
    "slug": "forces-energy-and-heat",
    "short": "Forces, energy, heat",
    "part": "Start here",
    "tone": "a",
    "minutes": 10,
    "title": "Forces, energy, heat and motion",
    "blurb": "Newton's laws, kinetic and potential energy, springs, why temperature is atomic jiggling, and stress and strain.",
    "builds": [
      18
    ],
    "related": [
      19
    ],
    "takeaways": [
      "A force changes motion according to F = ma, and forces on atoms come from the slope of an energy curve.",
      "Energy is conserved: it moves between kinetic (motion) and potential (position) forms.",
      "Atoms joined by bonds behave like masses on springs, and they vibrate at around ten trillion times a second.",
      "Temperature measures the average kinetic energy of atoms; heating a solid makes the atoms jiggle more until it melts.",
      "Stress is force per area, strain is relative stretch, and their ratio for a given material is its stiffness."
    ]
  },
  {
    "id": 22,
    "label": "S5",
    "series": "start",
    "slug": "chance-averages-and-error-bars",
    "short": "Chance and averages",
    "part": "Start here",
    "tone": "b",
    "minutes": 8,
    "title": "Chance, averages and error bars",
    "blurb": "Probability, means and spread, why more samples shrink the error, the bell curve, and how to be honest about uncertainty.",
    "builds": [
      18
    ],
    "related": [],
    "takeaways": [
      "Probability measures how likely an outcome is, from 0 (never) to 1 (always); independent chances multiply.",
      "The mean says where data centre; the standard deviation says how spread out they are.",
      "The error of an average falls as one over the square root of the number of samples: four times as many for half the error.",
      "Sums of many small random effects form a bell curve, which is why it appears everywhere.",
      "Always report an uncertainty: a number without an error bar is a guess."
    ]
  },
  {
    "id": 23,
    "label": "S6",
    "series": "start",
    "slug": "your-first-simulation",
    "short": "Your first simulation",
    "part": "Start here",
    "tone": "a",
    "minutes": 12,
    "title": "Your first simulation",
    "blurb": "Build a simulation from three ingredients, watch diffusion emerge from random walkers, and write the same thing in a few lines of Python.",
    "builds": [
      19,
      22
    ],
    "related": [],
    "takeaways": [
      "A simulation needs a description of the state, a rule for how it changes, and a loop that applies the rule step by step.",
      "Smaller time steps give more accurate answers at more cost; always check by changing the step.",
      "Diffusion emerges from random walkers: the spread grows as the square root of time, and D = a squared over 2 tau in one dimension.",
      "Checking against a known answer, changing the random seed and increasing the sample size are the first tests of any simulation.",
      "Everything in the Core topics is this same idea with better rules: atoms, energies, grids and probabilities."
    ]
  },
  {
    "id": 12,
    "label": "B1",
    "series": "background",
    "slug": "mathematics-for-simulation",
    "short": "Mathematics",
    "part": "Background",
    "tone": "a",
    "minutes": 15,
    "title": "Mathematics for simulation",
    "blurb": "Vector calculus, linear algebra, differential equations, Fourier analysis and statistics: the maths every method relies on.",
    "builds": [
      18,
      19
    ],
    "related": [
      8,
      9
    ],
    "takeaways": [
      "Most simulation maths reduces to a few ideas: gradients and divergences, eigenvalue problems, differential equations, Fourier modes and averages over random variables.",
      "Forces are gradients of energy (F = -grad U), fluxes are gradients of potentials (J = -D grad c), and conservation laws are divergence equations.",
      "Many physical quantities are eigenvalues of matrices: principal stresses, vibration frequencies and electronic energies.",
      "A differential equation needs initial and boundary conditions, and its character (diffusive, wave-like, oscillatory) decides the numerical method.",
      "Plane waves and the Fourier transform connect real space and reciprocal space, and the standard error of an average falls as one over the square root of the number of independent samples."
    ]
  },
  {
    "id": 13,
    "label": "B2",
    "series": "background",
    "slug": "physics-for-simulation",
    "short": "Physics",
    "part": "Background",
    "tone": "a",
    "minutes": 13,
    "title": "Physics for simulation",
    "blurb": "Classical mechanics, electrostatics, quantum mechanics essentials, thermodynamics and the units used in atomistic work.",
    "builds": [
      12,
      21
    ],
    "related": [
      3,
      5
    ],
    "takeaways": [
      "A potential energy surface turns forces, equilibrium, stability and vibrations into calculus: forces are slopes, stiffness is curvature, and normal modes are eigenvectors.",
      "Electrostatics is long-ranged, which is why charged systems need special summation methods and why neutral cells matter.",
      "Quantum mechanics enters through the Schroedinger equation, the Pauli principle, the variational principle and Bloch's theorem for periodic solids.",
      "Thermodynamics supplies the quantities that simulations are compared with: free energies, chemical potentials and heat capacities.",
      "Know your units: 1 eV is about 96.5 kJ/mol, kT is about 0.0259 eV at 300 K, and 1 Hartree is about 27.2 eV."
    ]
  },
  {
    "id": 14,
    "label": "B3",
    "series": "background",
    "slug": "materials-science-essentials",
    "short": "Materials essentials",
    "part": "Background",
    "tone": "b",
    "minutes": 13,
    "title": "Materials science essentials",
    "blurb": "Bonding, structure, defects, phase transformations, mechanical behaviour, processing and the experiments simulations are compared with.",
    "builds": [
      20
    ],
    "related": [
      2,
      8
    ],
    "takeaways": [
      "Processing sets structure, structure sets properties, and properties set performance; simulation can enter at every link.",
      "Bonding type (metallic, covalent, ionic, van der Waals) decides which interatomic model or electronic method is appropriate.",
      "Defects control most useful properties: dislocations govern strength, vacancies govern diffusion, and boundaries govern grain-size effects.",
      "Phase diagrams give the equilibrium; transformation kinetics (nucleation, growth, diffusion) decide which microstructure actually forms.",
      "Know what each experiment measures (diffraction, microscopy, tensile tests, calorimetry), because that is what a simulation must be compared with."
    ]
  },
  {
    "id": 15,
    "label": "B4",
    "series": "background",
    "slug": "numerical-methods-essentials",
    "short": "Numerical methods",
    "part": "Background",
    "tone": "a",
    "minutes": 12,
    "title": "Numerical methods essentials",
    "blurb": "Floating point, error and stability, root finding and optimisation, linear algebra, integrators, discretisation and parallel scaling.",
    "builds": [
      12,
      23
    ],
    "related": [
      6,
      9
    ],
    "takeaways": [
      "Computers use finite-precision arithmetic: double precision keeps about 16 digits, and subtracting nearly equal numbers destroys most of them.",
      "Every numerical answer has modelling, discretisation, round-off and iteration error; convergence tests separate them.",
      "Stability and conditioning matter as much as accuracy: an explicit scheme can blow up, and an ill-conditioned problem amplifies small errors.",
      "Newton's method converges quadratically near a root; optimisers find local, not global, minima.",
      "Cost scaling decides what is feasible: dense linear algebra grows as N cubed, and Amdahl's law limits parallel speed-up."
    ]
  },
  {
    "id": 16,
    "label": "B5",
    "series": "background",
    "slug": "programming-and-workflow",
    "short": "Programming and workflow",
    "part": "Background",
    "tone": "b",
    "minutes": 11,
    "title": "Programming and workflow",
    "blurb": "The command line, Python for science, version control, running on clusters, reproducibility and testing your own code.",
    "builds": [
      23
    ],
    "related": [
      11
    ],
    "takeaways": [
      "A scripting language (Python with NumPy, SciPy and Matplotlib) plus the command line covers most day-to-day computational work.",
      "Keep inputs, scripts and notes under version control; keep large outputs elsewhere and record how they were made.",
      "On a cluster, test small, request only the resources you need, use job arrays for parameter sweeps and checkpoint long runs.",
      "Reproducibility means recorded versions, seeds, units and inputs so that someone else, or you in a year, can rerun the work.",
      "Test your own code against analytic solutions and simple limits before trusting it on real problems."
    ]
  },
  {
    "id": 1,
    "slug": "introduction",
    "short": "Introduction",
    "part": "Foundations",
    "tone": "a",
    "minutes": 20,
    "title": "Introduction to computational materials science",
    "blurb": "Scales, method families, multiscale linking, validation, software and data resources.",
    "builds": [
      14
    ],
    "related": [],
    "takeaways": [
      "Methods are specialised by length and time scale; no single model covers every scale, so multiscale linking is the norm.",
      "Start from the question: the smallest feature that matters, the longest time that matters, and whether the answer is an equilibrium or a rate.",
      "A simulation is a prediction to be tested. Verification, validation and uncertainty quantification are three different checks.",
      "The cheapest useful step is often a thermodynamic (CALPHAD) calculation, before heavier modelling is attempted.",
      "Inputs and approximations bound accuracy: trends and rankings are usually more reliable than absolute numbers."
    ],
    "label": "1",
    "series": "core"
  },
  {
    "id": 2,
    "slug": "crystal-structure-and-periodic-cells",
    "short": "Crystals and cells",
    "part": "Foundations",
    "tone": "a",
    "minutes": 12,
    "title": "Crystal structures, supercells and periodic boundaries",
    "blurb": "Lattices, Miller indices, defects, building simulation cells and periodic boundary conditions.",
    "builds": [
      1
    ],
    "related": [],
    "takeaways": [
      "A crystal is a lattice plus a basis. Count atoms and neighbours to sanity-check a structure: fcc has 4 atoms per cubic cell and 12 neighbours, bcc has 2 and 8.",
      "Miller indices label planes and directions; the reciprocal lattice links real-space cells to diffraction and to k-point sampling.",
      "Defects are the subject of most simulations. Supercell size is a convergence parameter, and one vacancy in an N-atom cell is a concentration of 1/N.",
      "Periodic boundaries remove walls but make a defect interact with its own images; every cutoff must be smaller than half the box.",
      "Surfaces use slabs with vacuum; a grain boundary in a fully periodic cell always comes as a pair."
    ],
    "label": "2",
    "series": "core"
  },
  {
    "id": 3,
    "slug": "statistical-mechanics",
    "short": "Statistical mechanics",
    "part": "Foundations",
    "tone": "a",
    "minutes": 12,
    "title": "Statistical mechanics for simulation",
    "blurb": "Microstates, ensembles, the partition function, free energy, ergodicity and error bars.",
    "builds": [
      1,
      13
    ],
    "related": [],
    "takeaways": [
      "The Boltzmann distribution, p proportional to exp(-E/kT), underlies Metropolis Monte Carlo, thermostats and equilibrium defect concentrations.",
      "Pick the ensemble that matches what is held fixed: NVE, NVT, NPT or the grand canonical.",
      "Free energies, not energies, decide stability, and they need dedicated methods: thermodynamic integration, perturbation, umbrella sampling, the quasi-harmonic approximation.",
      "Classical simulation assumes equipartition, so it overestimates heat capacity when quantum modes are frozen out at low temperature.",
      "Quote averages with error bars. The correlation time sets the number of independent samples, and ergodicity is never guaranteed."
    ],
    "label": "3",
    "series": "core"
  },
  {
    "id": 4,
    "slug": "thermodynamics-and-calphad",
    "short": "Thermodynamics and CALPHAD",
    "part": "Thermodynamics",
    "tone": "b",
    "minutes": 12,
    "title": "Thermodynamics and CALPHAD",
    "blurb": "Gibbs energy, the common tangent, solution models, phase diagrams and equilibrium calculation.",
    "builds": [
      3
    ],
    "related": [
      5
    ],
    "takeaways": [
      "Equilibrium means minimum Gibbs energy, equivalently equal chemical potentials. The common tangent gives phase compositions and the lever rule gives amounts.",
      "For a regular solution the miscibility gap closes at Tc = Omega/2R; the spinodal lies inside the binodal.",
      "CALPHAD fits a Gibbs energy model to every phase (Redlich-Kister terms, sublattices, magnetism) and stores the parameters in a database.",
      "It delivers equilibria, solidification paths and driving forces. It does not deliver kinetics or geometry.",
      "Database coverage limits accuracy, and multicomponent extrapolation from binary data needs checking."
    ],
    "label": "4",
    "series": "core"
  },
  {
    "id": 5,
    "slug": "density-functional-theory",
    "short": "Density functional theory",
    "part": "Electrons",
    "tone": "b",
    "minutes": 13,
    "title": "Density functional theory in practice",
    "blurb": "The Kohn-Sham scheme, functionals, the SCF cycle, convergence and what to compute.",
    "builds": [
      2,
      13
    ],
    "related": [
      4
    ],
    "takeaways": [
      "DFT solves for the electron density through the Kohn-Sham equations; only the exchange-correlation energy is approximated.",
      "The functional (LDA, GGA, meta-GGA, hybrid, plus U, van der Waals) sets the typical errors. Relative energies are more reliable than absolute ones.",
      "Converge the cutoff, k-points, smearing and cell size before trusting any number.",
      "Standard outputs are lattice constants, elastic constants, formation and defect energies, barriers by nudged elastic band, and phonons.",
      "Cost grows roughly as N cubed, which limits cells to hundreds or a few thousand atoms, and results are for 0 K unless extended."
    ],
    "label": "5",
    "series": "core"
  },
  {
    "id": 6,
    "slug": "molecular-dynamics",
    "short": "Molecular dynamics",
    "part": "Atoms",
    "tone": "b",
    "minutes": 11,
    "title": "Molecular dynamics",
    "blurb": "Integrators, interatomic potentials, thermostats, workflow and analysis.",
    "builds": [
      2,
      3,
      15
    ],
    "related": [
      5,
      8
    ],
    "takeaways": [
      "MD integrates Newton's equations with velocity-Verlet. Use a time step of about a tenth to a twentieth of the shortest vibrational period and check energy conservation in NVE.",
      "The potential defines the accuracy, so validate it on the property you need.",
      "Use canonical thermostats and proper barostats (Nose-Hoover, stochastic velocity rescaling, Parrinello-Rahman) for production runs.",
      "The workflow is build, minimise, equilibrate, produce and analyse, with error bars from independent runs.",
      "Limits: nanoseconds to microseconds, very high strain rates, classical nuclei and no electrons."
    ],
    "label": "6",
    "series": "core"
  },
  {
    "id": 7,
    "slug": "monte-carlo-methods",
    "short": "Monte Carlo and kMC",
    "part": "Atoms",
    "tone": "b",
    "minutes": 12,
    "title": "Monte Carlo and kinetic Monte Carlo",
    "blurb": "Importance sampling, Metropolis, the Ising model, cluster expansions and rejection-free kinetics.",
    "builds": [
      3,
      15
    ],
    "related": [
      8
    ],
    "takeaways": [
      "Importance sampling with detailed balance produces Boltzmann-distributed samples; the Metropolis rule accepts with probability min(1, exp(-dE/kT)).",
      "Moves need not be physical: swap moves equilibrate chemical order far faster than dynamics can.",
      "Lattice models and cluster expansions carry DFT energetics into alloy thermodynamics at large size.",
      "Kinetic Monte Carlo advances physical time, dt = -ln(u)/R, using rates built from barriers.",
      "kMC is only as good as its event catalogue and barriers."
    ],
    "label": "7",
    "series": "core"
  },
  {
    "id": 8,
    "slug": "diffusion-and-kinetics",
    "short": "Diffusion and kinetics",
    "part": "Kinetics",
    "tone": "a",
    "minutes": 13,
    "title": "Diffusion and kinetics",
    "blurb": "Fick's laws, driving forces, atomistic mechanisms, computing D and solving the equation.",
    "builds": [
      4,
      15
    ],
    "related": [
      6,
      7
    ],
    "takeaways": [
      "Diffusion distance grows as the square root of Dt, so the time needed scales with the square of the length.",
      "The real driving force is the chemical-potential gradient; diffusion can run uphill, and Darken and Kirkendall effects follow from unequal mobilities.",
      "D = D0 exp(-Q/RT). For vacancy diffusion Q is formation plus migration energy; for interstitials it is the migration energy alone.",
      "D can come from MD (fast species), DFT with transition-state theory, or kinetic Monte Carlo, and should be checked against experiment.",
      "An explicit finite-difference scheme is stable only for r = D dt/dx squared of at most one half in one dimension."
    ],
    "label": "8",
    "series": "core"
  },
  {
    "id": 9,
    "slug": "phase-field-modelling",
    "short": "Phase-field",
    "part": "Microstructure",
    "tone": "b",
    "minutes": 12,
    "title": "Phase-field modelling",
    "blurb": "Diffuse interfaces, Allen-Cahn and Cahn-Hilliard, spinodal decomposition and numerics.",
    "builds": [
      4,
      8
    ],
    "related": [
      5,
      6
    ],
    "takeaways": [
      "Interfaces are smooth transitions of an order parameter, so topology changes need no special treatment.",
      "Allen-Cahn (non-conserved) gives curvature-driven motion; Cahn-Hilliard (conserved) gives spinodal decomposition and t to the 1/3 coarsening.",
      "Interface energy and width fix the model parameters: gamma = (2 sqrt 2 / 3) sqrt(kappa A) and width ~ sqrt(2 kappa / A).",
      "Inputs come from CALPHAD (free energy), diffusion databases (mobility) and atomistics (interface energy); results must not depend on the interface width or the grid.",
      "Resolve the interface with about 4 to 8 grid points; explicit steps are tightly limited, so use semi-implicit spectral or adaptive finite elements."
    ],
    "label": "9",
    "series": "core"
  },
  {
    "id": 10,
    "slug": "finite-element-method",
    "short": "Finite elements",
    "part": "Continuum",
    "tone": "a",
    "minutes": 13,
    "title": "The finite element method",
    "blurb": "Weak form, shape functions, meshing, convergence, nonlinear problems and materials applications.",
    "builds": [
      8,
      15
    ],
    "related": [
      9
    ],
    "takeaways": [
      "The weak form with shape functions turns a PDE into a sparse linear system, K u = f, assembled element by element.",
      "A mesh convergence study is mandatory. Displacement error falls as h to the p+1 for smooth solutions, while stress singularities never converge.",
      "Nonlinear problems use Newton-Raphson with load steps; time-dependent ones use explicit or implicit integration.",
      "The constitutive law and boundary conditions (heat transfer, friction) usually dominate the uncertainty.",
      "Verify against analytic cases (the Kirsch plate gives a factor of 3, the patch test) and validate against measurements."
    ],
    "label": "10",
    "series": "core"
  },
  {
    "id": 11,
    "slug": "machine-learning-for-materials",
    "short": "Machine learning",
    "part": "Data",
    "tone": "b",
    "minutes": 15,
    "title": "Machine learning for materials",
    "blurb": "Data, descriptors, models, honest validation, machine-learned potentials and active learning.",
    "builds": [
      5,
      6,
      16
    ],
    "related": [
      7
    ],
    "takeaways": [
      "ML interpolates well and extrapolates badly: trust it inside the training domain and doubt it outside.",
      "Descriptors carry the physics and symmetry; small datasets favour simple models and physics-based features.",
      "Validate with grouped, time-based or extrapolation splits against a baseline, and report uncertainty.",
      "Machine-learned potentials reach near-DFT accuracy at far lower cost; build them with active learning and validate on properties, not only on energies.",
      "Active learning and Bayesian optimisation choose the next calculation or experiment; combine them with physical models."
    ],
    "label": "11",
    "series": "core"
  }
];
