/* Single source of truth for the topic list.
   Edit this file when a topic is added, then run:  python tools/build.py
   (the build step regenerates cards, pager, header, footer, the facts strip,
   takeaways boxes, the sitemap and the search index from this data).
   `builds` = topics worth reading first; `related` = topics that connect but are not required. */
window.MIBEM_TOPICS = [
  {
    "id": 36,
    "label": "MATH 100",
    "code": "MATH 100",
    "dept": "MATH",
    "level": 1,
    "slug": "maths-course-overview",
    "short": "Mathematics guide",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 9,
    "title": "Mathematics: course guide and study plan",
    "blurb": "How the twelve-course mathematics sequence is organised, three learning paths, how to study with the problems, a placement check, a notation guide and a one-page revision sheet.",
    "builds": [],
    "related": [],
    "takeaways": [
      "The mathematics sequence has twelve courses, each organised as lectures with proofs and worked examples, interactive figures, a problem set of twelve graded problems with hints and full solutions, and a six-question unit quiz.",
      "Read in order if you can; otherwise follow a goal-based path (electronic structure, atomistic simulation, continuum and phase-field, or data and machine learning).",
      "Learning happens in the problems: attempt each on paper first, then use the hint, and only then read the solution.",
      "Your ticks are stored only in your browser; the table below counts them per course."
    ]
  },
  {
    "id": 24,
    "label": "MATH 101",
    "code": "MATH 101",
    "dept": "MATH",
    "level": 1,
    "slug": "calculus-single-variable",
    "short": "Calculus I",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 30,
    "title": "Calculus I: functions of one variable",
    "blurb": "Limits, derivatives, integrals and Taylor series, taught properly, with the harmonic approximation, Newton's method and Gaussian integrals as applications.",
    "builds": [],
    "related": [
      2,
      15
    ],
    "takeaways": [
      "The derivative is a limit of slopes, and it measures sensitivity: $\\mathrm{d}f \\approx f'(x)\\,\\mathrm{d}x$ is how an error or a small change in an input propagates.",
      "Near a minimum of any smooth energy, the first derivative vanishes and the second derivative gives the stiffness, so the energy is a parabola: the harmonic approximation.",
      "The fundamental theorem links derivatives and integrals; integration by parts and substitution handle most integrals you meet, and the Gaussian integral $\\sqrt{\\pi}$ underlies the Boltzmann distribution.",
      "Taylor's theorem with a remainder tells you not just the approximation but its error, and finite-difference formulas, numerical integration rules and Newton's method are all Taylor series in disguise.",
      "The order of an error ($h$, $h^2$, $h^4$) tells you how fast it shrinks when the step is refined, and is the right way to compare numerical methods."
    ]
  },
  {
    "id": 25,
    "label": "MATH 102",
    "code": "MATH 102",
    "dept": "MATH",
    "level": 1,
    "slug": "multivariable-calculus",
    "short": "Calculus II",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 24,
    "title": "Calculus II: several variables and optimisation",
    "blurb": "Partial derivatives, the chain rule, gradients, Hessians, constrained optimisation with Lagrange multipliers, and multiple integrals.",
    "builds": [
      24
    ],
    "related": [
      4,
      6
    ],
    "takeaways": [
      "A partial derivative holds the other variables fixed; in thermodynamics the subscript says what is held fixed, and it matters, e.g. $(\\partial U/\\partial T)_V \\neq (\\partial U/\\partial T)_P$.",
      "The gradient $\\nabla f$ points uphill, is perpendicular to level curves, and has magnitude equal to the steepest slope; a force is the negative gradient of a potential energy, $\\mathbf{F}=-\\nabla U$.",
      "The Hessian matrix of second derivatives classifies stationary points: all positive eigenvalues is a minimum, all negative a maximum, mixed signs a saddle (a transition state has exactly one negative eigenvalue).",
      "Lagrange multipliers solve constrained optimisation, and maximising entropy under a fixed mean energy gives the Boltzmann distribution $p_i\\propto e^{-\\beta E_i}$.",
      "Changing variables in a multiple integral needs the Jacobian ($r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta$ in the plane, $r^2\\sin\\theta\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\,\\mathrm{d}\\phi$ in space); it turns the Gaussian integral and the Maxwell speed distribution into one-line calculations."
    ]
  },
  {
    "id": 27,
    "label": "MATH 103",
    "code": "MATH 103",
    "dept": "MATH",
    "level": 1,
    "slug": "linear-algebra-foundations",
    "short": "Linear algebra I",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 25,
    "title": "Linear algebra I: vectors, matrices and lattices",
    "blurb": "Vectors, linear systems, matrix algebra, determinants, bases and coordinate changes, with crystal lattices as the running example.",
    "builds": [],
    "related": [
      2
    ],
    "takeaways": [
      "A system $A\\mathbf{x}=\\mathbf{b}$ is solved by Gaussian elimination in $O(n^3)$ operations; it has a unique solution, none, or infinitely many, according to the rank of $A$, and in practice one solves rather than inverts.",
      "A matrix is a linear map and multiplication is composition, so in general $AB\\neq BA$; the determinant is the factor by which the map scales volume, and it vanishes exactly when the map collapses space (the matrix is singular).",
      "Columns of the lattice matrix $A$ are the basis vectors $\\mathbf{a}_i$: Cartesian position is $\\mathbf{r}=A\\mathbf{f}$ for fractional coordinates $\\mathbf{f}$, the cell volume is $|\\det A|$, and distances use the metric $G=A^{T}A$.",
      "The reciprocal lattice matrix is $B=2\\pi A^{-T}$ so that $\\mathbf{a}_i\\cdot\\mathbf{b}_j=2\\pi\\delta_{ij}$; a plane $(hkl)$ has normal $\\mathbf{G}_{hkl}$ and spacing $d=2\\pi/|\\mathbf{G}_{hkl}|$, which with Bragg's law explains diffraction patterns.",
      "Orthogonal matrices ($Q^{T}Q=I$) preserve lengths and angles and represent rotations and reflections; an ill-conditioned matrix (huge ratio of largest to smallest stretch) makes solutions hypersensitive to small errors."
    ]
  },
  {
    "id": 37,
    "label": "PHYS 101",
    "code": "PHYS 101",
    "dept": "PHYS",
    "level": 1,
    "slug": "classical-mechanics",
    "short": "Classical mechanics",
    "part": "Physics",
    "tone": "a",
    "minutes": 34,
    "title": "Classical mechanics",
    "blurb": "Newton's laws, energy, momentum, oscillations, rotation and Lagrangian mechanics: the physics that molecular dynamics integrates.",
    "builds": [
      24
    ],
    "related": [],
    "takeaways": [
      "Newton's second law $m\\ddot{\\mathbf r}=\\mathbf F$ turns a force law into motion: given forces and initial conditions, the trajectory follows, which is exactly what molecular dynamics integrates for every atom.",
      "A force that depends only on position and does no net work around closed paths is conservative and equals minus the gradient of a potential energy, $\\mathbf F=-\\nabla U$; energy conservation $\\tfrac12mv^2+U=E$ then gives speeds directly and stable equilibria are minima of $U$.",
      "Momentum is conserved when no external force acts (Newton's third law), the centre of mass moves as if all mass and external force were concentrated there, and collisions are solved with momentum plus, for elastic cases, energy conservation.",
      "Near a stable equilibrium every potential is a spring, $U\\approx\\tfrac12k x^2$, giving simple harmonic motion with $\\omega=\\sqrt{k/m}$; damping, driving and coupling lead to resonance and normal modes, the classical origin of phonons.",
      "Lagrangian mechanics replaces forces by one scalar, $L=T-U$, and the Euler-Lagrange equations $\\tfrac{d}{dt}\\partial L/\\partial\\dot q=\\partial L/\\partial q$ hold in any coordinates; symmetries of $L$ give conserved quantities, and the Hamiltonian $H=T+U$ is the starting point of statistical and quantum mechanics."
    ],
    "katex": true
  },
  {
    "id": 38,
    "label": "PHYS 102",
    "code": "PHYS 102",
    "dept": "PHYS",
    "level": 1,
    "slug": "thermal-physics",
    "short": "Thermal physics",
    "part": "Physics",
    "tone": "a",
    "minutes": 34,
    "title": "Thermal physics",
    "blurb": "Temperature, heat, entropy and the laws of thermodynamics, with the kinetic theory of gases.",
    "builds": [
      24,
      37
    ],
    "related": [],
    "takeaways": [
      "Temperature measures the mean thermal kinetic energy per degree of freedom: $\\tfrac12k_\\mathrm BT$ each (equipartition), so $pV=Nk_\\mathrm BT$ and the rms speed is $\\sqrt{3k_\\mathrm BT/m}$; the Maxwell speed distribution describes how that energy is spread over atoms.",
      "The first law $\\Delta U=Q+W$ is energy conservation; for an ideal gas $C_p-C_v=R$, an isothermal expansion does work $nRT\\ln(V_2/V_1)$ and a reversible adiabatic one obeys $pV^\\gamma=\\text{const}$.",
      "Entropy $S=k_\\mathrm B\\ln\\Omega$ counts microstates and satisfies $\\mathrm dS=\\delta Q_\\mathrm{rev}/T$; an isolated system's entropy never decreases, which sets the direction of heat flow and gives the Carnot limit $\\eta=1-T_c/T_h$.",
      "At constant temperature and pressure a system evolves to minimum Gibbs free energy $G=H-TS$; phase equilibria follow from equal chemical potentials, and the Clausius-Clapeyron equation $\\mathrm dp/\\mathrm dT=L/(T\\Delta V)$ gives the slope of a phase boundary.",
      "Thermal populations follow the Boltzmann factor $e^{-E/k_\\mathrm BT}$, which gives defect concentrations $e^{-E_f/k_\\mathrm BT}$ and the heat capacity of solids (Dulong-Petit $3R$ at high temperature, falling as $T^3$ at low temperature); heat is transported by conduction ($q=-\\kappa\\nabla T$), convection and radiation."
    ],
    "katex": true
  },
  {
    "id": 39,
    "label": "PHYS 103",
    "code": "PHYS 103",
    "dept": "PHYS",
    "level": 1,
    "slug": "electricity-magnetism-and-waves",
    "short": "Electricity, magnetism, waves",
    "part": "Physics",
    "tone": "a",
    "minutes": 34,
    "title": "Electricity, magnetism and waves",
    "blurb": "Fields, potentials, Maxwell's equations, light and wave phenomena, including diffraction.",
    "builds": [
      25,
      37
    ],
    "related": [],
    "takeaways": [
      "Coulomb's law gives the field $\\mathbf E=\\mathbf F/q$ and the potential $V$ with $\\mathbf E=-\\nabla V$; the energy of two charges is $e^2/4\\pi\\varepsilon_0r=1.44\\ \\mathrm{eV\\,nm}/r$, which sets the scale of ionic and covalent bonding energies.",
      "Gauss's law $\\oint\\mathbf E\\cdot\\mathrm d\\mathbf A=Q/\\varepsilon_0$ yields fields from symmetry; capacitors store energy $\\tfrac12CV^2$ with $C=\\varepsilon_0\\varepsilon_rA/d$, and a dielectric of relative permittivity $\\varepsilon_r$ reduces fields through polarisation of its atoms.",
      "In a conductor $\\mathbf J=\\sigma\\mathbf E$ with $\\sigma=ne^2\\tau/m$ (Drude); drift speeds are tiny (about $0.07$ mm/s at $1$ A in copper) yet the electric signal travels near light speed, and Joule heating $I^2R$ dissipates the energy.",
      "A moving charge feels the Lorentz force $\\mathbf F=q(\\mathbf E+\\mathbf v\\times\\mathbf B)$, which gives cyclotron motion, the Hall effect (carrier density and sign) and, for atomic moments of order the Bohr magneton, the magnetism of materials.",
      "Maxwell's equations combine Gauss, Faraday and Ampere laws with displacement current and predict electromagnetic waves of speed $c=1/\\sqrt{\\mu_0\\varepsilon_0}$; diffraction of waves with $\\lambda\\sim d$ from a periodic structure follows Bragg's law $2d\\sin\\theta=n\\lambda$, the basis of X-ray, neutron and electron diffraction."
    ],
    "katex": true
  },
  {
    "id": 14,
    "label": "MSE 101",
    "code": "MSE 101",
    "dept": "MSE",
    "level": 1,
    "slug": "materials-science-essentials",
    "short": "Materials essentials",
    "part": "Materials science",
    "tone": "b",
    "minutes": 42,
    "title": "Materials science essentials",
    "blurb": "Bonding, structure, defects, phase transformations, mechanical behaviour, processing and the experiments simulations are compared with.",
    "builds": [],
    "related": [
      2,
      8
    ],
    "takeaways": [
      "Materials science links four things: processing, structure, properties and performance; structure exists at every scale from the bond (0.1 nm) through crystals and defects (nm to um) to the microstructure of grains and phases (um to mm), and each scale has its own tools.",
      "The bond energy curve explains stiffness, melting and thermal expansion: for argon the Lennard-Jones potential gives r0 = 0.382 nm and a bond stiffness of 0.82 N/m, so the Young modulus is about k/r0 = 2.1 GPa (measured bulk modulus of solid argon: about 3 GPa); strong covalent bonds (diamond) are 500 times stiffer.",
      "Crystal structures are described by a lattice and a basis: fcc and hcp pack spheres at 74 per cent, bcc at 68 per cent, diamond at 34 per cent, and the density follows from the cell: copper (fcc, a = 0.3615 nm) is 8.93 g/cm3, iron (bcc, a = 0.2866 nm) 7.88 g/cm3.",
      "Defects control most properties: the equilibrium vacancy fraction exp(-E_f/kT) is 1e-5 for copper at 1300 K; dislocations (Burgers vector 0.256 nm in copper) carry plastic flow and raise the strength as sigma = alpha G b sqrt(rho), 37 MPa at 1e14 per m2; grain boundaries add strength by the Hall-Petch relation sigma_y = sigma_0 + k d^(-1/2).",
      "Phase diagrams give equilibrium phases and amounts by the lever rule: a Pb-40 wt% Sn alloy just below 183 C is 73.4 per cent alpha and 26.6 per cent beta, of which 48.7 per cent is eutectic; a 0.4 wt% C steel below 727 C is 48.8 per cent proeutectoid ferrite and 51.2 per cent pearlite."
    ],
    "katex": true
  },
  {
    "id": 16,
    "label": "COMP 101",
    "code": "COMP 101",
    "dept": "COMP",
    "level": 1,
    "slug": "programming-and-workflow",
    "short": "Programming and workflow",
    "part": "Computing",
    "tone": "b",
    "minutes": 43,
    "title": "Programming and workflow",
    "blurb": "The command line, Python for science, version control, running on clusters, reproducibility and testing your own code.",
    "builds": [],
    "related": [
      11
    ],
    "takeaways": [
      "Scientific programming in Python rests on a small stack: the language for control flow and functions, NumPy for arrays (whole-array operations are about 500 times faster than a Python loop: 0.174 s against 0.00034 s for a million-element dot product), SciPy for algorithms and Matplotlib for figures.",
      "Computers represent real numbers with finite precision: 0.1 + 0.2 is 0.30000000000000004, the spacing of double-precision numbers near 1 is 2.2e-16, subtracting nearly equal numbers loses digits ((1 - cos x)/x^2 returns 0 instead of 0.5 at x = 1e-8) and a naive variance of numbers near 1e9 is 384 instead of 1; the cure is a mathematically equivalent but stable formula.",
      "Write code as small functions with clear inputs and outputs, test them against cases with known answers (assert, pytest), and learn the usual bugs: mutable default arguments, views against copies in NumPy, integer overflow in fixed-size integers and shape errors in broadcasting.",
      "Algorithmic complexity decides what is possible: an all-pairs distance calculation grows as N^2 (1.46 s for 4000 particles) while a cell or tree neighbour list grows as N (0.032 s for the same 4000 particles and the same 56 182 pairs), which is the reason molecular-dynamics codes use neighbour lists.",
      "A result is only science if it can be reproduced: keep scripts and inputs under version control, fix random seeds, pin package versions in a virtual environment, and save a run record next to the output (see LAB 101)."
    ],
    "katex": true
  },
  {
    "id": 23,
    "label": "COMP 102",
    "code": "COMP 102",
    "dept": "COMP",
    "level": 1,
    "slug": "your-first-simulation",
    "short": "Your first simulation",
    "part": "Computing",
    "tone": "a",
    "minutes": 46,
    "title": "Your first simulation",
    "blurb": "Build a simulation from three ingredients, watch diffusion emerge from random walkers, and write the same thing in a few lines of Python.",
    "builds": [
      16,
      24
    ],
    "related": [],
    "takeaways": [
      "A simulation is a chain of choices: a physical model, an algorithm that solves it, a program, an analysis of the output, and tests of each link (verification: do we solve the model right? validation: is it the right model?); the first law of the subject is that every number must come with an estimate of its numerical and statistical error.",
      "The explicit Euler method for dT/dt = -k(T - Ta) has a global error proportional to the time step (error/dt = -0.52 at 30 min, in agreement with the analytic -0.5228), and for oscillators it is unstable: with dt = 0.1 the energy of a harmonic oscillator grows from 0.5 to 10 480 in 100 time units, while velocity Verlet keeps it within 0.00125.",
      "Velocity Verlet is the integrator of molecular dynamics because it is second order, needs one force evaluation per step, is time-reversible and symplectic; in a 108-atom Lennard-Jones simulation the standard deviation of the total energy per atom falls as dt squared (4.9e-5, 1.65e-4, 6.5e-4 and 2.7e-3 for dt = 0.002 to 0.016).",
      "A molecular-dynamics code needs only a few ingredients: an initial lattice, Maxwell-distributed velocities with zero total momentum, periodic boundaries with the minimum-image convention, a shifted cutoff, the velocity-Verlet loop, and observables (temperature from the kinetic energy, pressure from the virial, g(r) from a histogram of distances, diffusion from the mean-square displacement).",
      "Metropolis Monte Carlo samples the Boltzmann distribution without dynamics: for a particle in the double well x^4 - 2x^2 at kT = 0.5 the simulation gives <x^2> = 0.854 against the exact 0.852, and the efficiency depends strongly on the step size (acceptance 0.41 to 0.51 gives 55 000 to 67 000 independent samples from 200 000 steps, a step of 0.05 gives only 520)."
    ],
    "katex": true
  },
  {
    "id": 49,
    "label": "LAB 101",
    "code": "LAB 101",
    "dept": "LAB",
    "level": 1,
    "slug": "lab-workstation-setup",
    "short": "Workstation setup",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 21,
    "title": "Lab: Setting up a computational workstation",
    "blurb": "The terminal, Python virtual environments, a first reproducible script with a run record, plotting, git version control, project layout, background jobs and a SLURM template.",
    "builds": [
      16
    ],
    "related": [],
    "takeaways": [
      "A reproducible computational project needs four habits from the first day: work in a terminal, keep each project in its own Python virtual environment with pinned package versions (pip freeze), keep scripts and inputs under version control with git, and let every run write a small record (seed, parameters, package versions, run time) next to its results.",
      "A random walk of 2000 walkers gave a mean-square-displacement slope of 0.9629 with seed 42, 0.9991 with 5000 walkers and 0.9867 with 5000 walkers of 4000 steps; the statistical scatter between seeds is 0.0286 for 2000 walkers, so a single run cannot be quoted with three decimals.",
      "The same script in a new virtual environment built from requirements.txt reproduces the result digit for digit (slope 0.962865...), which is what reproducibility means: same inputs, same seed, same software versions, same answer.",
      "Git records every change as a commit: git add and git commit save a state, git diff shows what changed, git log lists the history, and branches (git checkout -b) allow an experiment to be tried without touching the main line; large generated files and environments belong in .gitignore.",
      "Long simulations run in the background (nohup, tmux) or through a job scheduler such as SLURM on a cluster; whatever the system, the job must be able to be restarted and must record how it was started."
    ],
    "katex": true
  },
  {
    "id": 26,
    "label": "MATH 201",
    "code": "MATH 201",
    "dept": "MATH",
    "level": 2,
    "slug": "vector-calculus",
    "short": "Vector calculus",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 24,
    "title": "Vector calculus: fields, fluxes and conservation laws",
    "blurb": "Gradient, divergence, curl and Laplacian, line and surface integrals, the divergence theorem, and how they produce the continuity and diffusion equations.",
    "builds": [
      25
    ],
    "related": [
      8,
      9
    ],
    "takeaways": [
      "A vector field assigns a vector to every point; the gradient turns a scalar potential into a conservative vector field, and a field is conservative exactly when its curl vanishes (on a simply connected region).",
      "Divergence measures net outflow per unit volume (sources and sinks); curl measures local rotation; the Laplacian $\\nabla^2 f=\\nabla\\cdot\\nabla f$ measures how much $f$ differs from its neighbours' average.",
      "The divergence theorem $\\int_V\\nabla\\cdot\\mathbf{F}\\,\\mathrm{d}V=\\oint_{\\partial V}\\mathbf{F}\\cdot\\mathbf{n}\\,\\mathrm{d}S$ converts a statement about a volume into one about its boundary, and vice versa; Stokes' theorem does the same for circulation.",
      "Conservation of a quantity plus the divergence theorem gives the continuity equation $\\partial_t c+\\nabla\\cdot\\mathbf{J}=0$; with Fick's law $\\mathbf{J}=-D\\nabla c$ this is the diffusion equation $\\partial_t c=\\nabla\\cdot(D\\nabla c)$.",
      "In curvilinear coordinates, operators gain geometric factors, e.g. $\\nabla^2f=\\frac1{r^2}\\partial_r(r^2\\partial_rf)$ for a spherically symmetric function, which gives the $1/r$ steady-state solutions."
    ]
  },
  {
    "id": 28,
    "label": "MATH 202",
    "code": "MATH 202",
    "dept": "MATH",
    "level": 2,
    "slug": "eigenvalues-and-decompositions",
    "short": "Linear algebra II",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 25,
    "title": "Linear algebra II: eigenvalues and decompositions",
    "blurb": "Eigenvalues, diagonalisation, symmetric matrices, quadratic forms, definiteness, the SVD, and why they give vibrations, stability and principal components.",
    "builds": [
      27
    ],
    "related": [
      5,
      11
    ],
    "takeaways": [
      "An eigenvector is a direction a matrix only stretches, by the eigenvalue; eigenvalues are the roots of $\\det(A-\\lambda I)=0$, and the trace and determinant equal their sum and product.",
      "A real symmetric matrix has real eigenvalues and orthogonal eigenvectors, so $A=Q\\Lambda Q^{T}$: in the right axes it is a set of independent stretches. Hamiltonians, Hessians, stress tensors and covariance matrices are all symmetric.",
      "A matrix power or function is easy in the eigenbasis: $A^{n}=Q\\Lambda^{n}Q^{T}$ and $e^{At}=Qe^{\\Lambda t}Q^{T}$, so a linear system of ODEs decouples into independent modes, and the signs of the eigenvalues decide stability.",
      "A quadratic form $\\mathbf{x}^{T}A\\mathbf{x}$ is positive for all $\\mathbf{x}$ (positive definite) exactly when all eigenvalues are positive; this classifies minima, saddles and stable crystals, and a negative Hessian eigenvalue is an imaginary vibrational frequency.",
      "The singular value decomposition $A=U\\Sigma V^{T}$ exists for every matrix; truncating it gives the best low-rank approximation and underlies principal component analysis, the condition number and the pseudoinverse."
    ]
  },
  {
    "id": 30,
    "label": "MATH 203",
    "code": "MATH 203",
    "dept": "MATH",
    "level": 2,
    "slug": "ordinary-differential-equations",
    "short": "ODEs",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 27,
    "title": "Ordinary differential equations",
    "blurb": "First-order and linear second-order equations, oscillators, systems and phase planes, stability, stiffness and time-stepping.",
    "builds": [
      24,
      28
    ],
    "related": [
      6,
      15
    ],
    "takeaways": [
      "An ordinary differential equation relates a function to its derivatives; with an initial condition it usually has a unique solution, and first-order separable and linear equations cover first-order kinetics, relaxation and nucleation-and-growth laws such as the Avrami equation.",
      "For $\\ddot{x}+\\gamma\\dot{x}+\\omega_0^2x=0$ the roots of the characteristic equation decide the behaviour (overdamped, critically damped, oscillating decay), and a driven oscillator resonates near $\\omega_0$ with amplitude amplified by the quality factor $Q=\\omega_0/\\gamma$.",
      "A system $\\dot{\\mathbf{y}}=A\\mathbf{y}$ is solved by eigenvalues, $\\mathbf{y}=\\sum c_ie^{\\lambda_it}\\mathbf{v}_i$; the fixed point is stable if all real parts are negative, and a nonlinear system near a fixed point behaves like its linearisation with $A$ the Jacobian.",
      "Explicit Euler is first order and is unstable for $h>2/|\\lambda|$; implicit methods remove this limit, which matters for stiff problems with widely separated time scales, such as reaction networks with fast radicals.",
      "Velocity Verlet is second order, time-reversible and symplectic, so it conserves energy over millions of molecular-dynamics steps while explicit Euler gains energy at every step; the time step must resolve the fastest vibration, about a tenth of its period."
    ]
  },
  {
    "id": 33,
    "label": "MATH 204",
    "code": "MATH 204",
    "dept": "MATH",
    "level": 2,
    "slug": "probability-for-simulation",
    "short": "Probability",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 28,
    "title": "Probability and distributions",
    "blurb": "Random variables, expectation and variance, the key distributions, the central limit theorem, and the Boltzmann distribution.",
    "builds": [
      24
    ],
    "related": [
      3,
      7
    ],
    "takeaways": [
      "Probability assigns numbers to uncertain outcomes; conditional probability and Bayes' theorem $P(A|B)=P(B|A)P(A)/P(B)$ update beliefs with evidence, and a positive test for a rare condition is far less conclusive than it seems.",
      "A distribution is summarised by its mean $\\langle X\\rangle$ and variance $\\mathrm{Var}X=\\langle X^2\\rangle-\\langle X\\rangle^2$; for independent variables variances add, so the standard deviation of a sum of $N$ terms grows like $\\sqrt{N}$ and that of an average shrinks like $1/\\sqrt{N}$.",
      "The binomial describes counting successes, the Poisson rare events (mean equals variance), the exponential the waiting time between random events (the heart of kinetic Monte Carlo), and the Gaussian sums of many small independent contributions.",
      "The central limit theorem says averages of many independent samples are Gaussian whatever the original distribution, so error bars $\\sigma/\\sqrt{N}$ are meaningful; it fails for heavy-tailed or strongly correlated samples.",
      "The canonical (Boltzmann) distribution $p_i=e^{-E_i/k_\\mathrm{B}T}/Z$ gives all thermodynamics from $\\ln Z$, and fluctuations are tied to response, for instance $\\mathrm{Var}(E)=k_\\mathrm{B}T^2C_V$, with relative fluctuations falling as $1/\\sqrt{N}$.",
      "Random numbers drawn uniformly can be transformed into any distribution (inverse transform, Box-Muller), and a random walk of $N$ steps spreads as $\\sqrt{N}$, which is diffusion with $D=\\Gamma d^2/6$ in three dimensions."
    ]
  },
  {
    "id": 31,
    "label": "MATH 205",
    "code": "MATH 205",
    "dept": "MATH",
    "level": 2,
    "slug": "fourier-analysis",
    "short": "Fourier analysis",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 30,
    "title": "Fourier series and transforms",
    "blurb": "Complex exponentials, Fourier series, the transform, convolution, the discrete transform, and reciprocal space.",
    "builds": [
      24,
      27
    ],
    "related": [
      2,
      5
    ],
    "takeaways": [
      "Euler's formula $e^{i\\theta}=\\cos\\theta+i\\sin\\theta$ turns trigonometry into algebra; $e^{ikx}$ is a plane wave, and sines and cosines are combinations of $e^{\\pm ikx}$.",
      "Any reasonable periodic function is a sum of plane waves, $f(x)=\\sum_nc_ne^{ik_nx}$, because the exponentials are orthogonal; the smoother the function, the faster the coefficients $c_n$ decay, and Parseval's theorem says total power is the same in real and Fourier space.",
      "The Fourier transform extends this to non-periodic functions; differentiation becomes multiplication by $ik$, convolution becomes multiplication, and width in $x$ is inverse to width in $k$ (the uncertainty relation, with Gaussians the minimum).",
      "The diffusion equation decouples in Fourier space, each mode decaying as $e^{-Dk^2t}$, so short wavelengths homogenise fastest and the solution from a point source is a Gaussian of variance $2Dt$.",
      "The discrete Fourier transform computed by the FFT in $O(N\\log N)$ underlies spectral solvers, plane-wave DFT and Ewald summation; sampling at spacing $\\Delta$ resolves wavenumbers only up to $\\pi/\\Delta$, and faster oscillations alias to false lower frequencies.",
      "Diffraction is the Fourier transform of the scattering density: a lattice transforms into a reciprocal lattice, a finite crystal gives peaks of width $\\propto1/L$ (Scherrer), and Bloch's theorem expands electron states in plane waves $e^{i(\\mathbf{k}+\\mathbf{G})\\cdot\\mathbf{r}}$."
    ]
  },
  {
    "id": 40,
    "label": "PHYS 201",
    "code": "PHYS 201",
    "dept": "PHYS",
    "level": 2,
    "slug": "quantum-mechanics",
    "short": "Quantum mechanics",
    "part": "Physics",
    "tone": "a",
    "minutes": 32,
    "title": "Quantum mechanics",
    "blurb": "Wavefunctions, the Schrödinger equation, operators, the hydrogen atom, spin and perturbation theory.",
    "builds": [
      37,
      39,
      28,
      30
    ],
    "related": [],
    "takeaways": [
      "Light and matter show both wave and particle behaviour: photons carry energy $E=hf$, and particles have wavelength $\\lambda=h/p$; the state of a particle is a wavefunction $\\psi$ whose squared modulus $|\\psi|^2$ is the probability density.",
      "The time-independent Schrodinger equation $\\hat H\\psi=E\\psi$ is an eigenvalue problem: boundary conditions force quantised energies, as for a particle in a box, $E_n=n^2h^2/8mL^2$, where confinement raises the energy as $1/L^2$ (the origin of quantum-dot colour and of the stability of atoms).",
      "Observables are Hermitian operators, $\\hat p=-i\\hbar\\,\\mathrm d/\\mathrm dx$; operators that do not commute, such as $\\hat x$ and $\\hat p$ with $[\\hat x,\\hat p]=i\\hbar$, cannot be sharp together, giving $\\Delta x\\,\\Delta p\\ge\\hbar/2$.",
      "A particle can tunnel through a barrier with probability $\\sim e^{-2\\kappa d}$ (the basis of the scanning tunnelling microscope), and a harmonic oscillator has energies $(n+\\tfrac12)\\hbar\\omega$ with a zero-point energy; hydrogen has $E_n=-13.6\\ \\mathrm{eV}/n^2$ and orbitals labelled by $n,l,m$.",
      "Electrons have spin $\\tfrac12$ and obey the Pauli exclusion principle, which builds the shell structure of the periodic table and bonding; when exact solutions are impossible, perturbation theory and the variational principle (energy of any trial function is an upper bound on the ground state) are the working methods of electronic-structure theory."
    ],
    "katex": true
  },
  {
    "id": 2,
    "slug": "crystal-structure-and-periodic-cells",
    "short": "Crystals and cells",
    "part": "Materials science",
    "tone": "a",
    "minutes": 42,
    "title": "Crystal structures, supercells and periodic boundaries",
    "blurb": "Lattices, Miller indices, defects, building simulation cells and periodic boundary conditions.",
    "builds": [
      14,
      27
    ],
    "related": [],
    "takeaways": [
      "A crystal is a lattice (three translation vectors a1, a2, a3, with cell volume V = |a1 . (a2 x a3)|) plus a basis of atoms; 14 Bravais lattices in 7 crystal systems, 32 point groups and 230 space groups classify all crystals, and spglib finds the space group of a structure (Fm-3m 225 for fcc copper and rocksalt, Fd-3m 227 for diamond, P6_3/mmc 194 for hcp, Pm-3m 221 for CsCl and perovskite).",
      "Common ionic structures follow from the radius ratio r(cation)/r(anion): NaCl (0.56, coordination 6), CsCl (0.92, coordination 8), zincblende (about 0.33, coordination 4); density follows from the cell, for example NaCl 2.164 g/cm3 (a = 5.640 angstrom, 4 formula units), CsCl 3.989, SrTiO3 5.117.",
      "Diffraction measures the reciprocal lattice: Bragg's law lambda = 2 d sin(theta) gives for NaCl with Cu K-alpha peaks at 27.4, 31.7, 45.5 and 53.9 degrees for (111), (200), (220) and (311); the structure factor removes the mixed-parity reflections of the fcc lattice and makes the all-odd ones weak (|F|^2 = 576 against 12 544 for all-even, since f(Cl) - f(Na) is small compared with the sum).",
      "The first Brillouin zone is the Wigner-Seitz cell of the reciprocal lattice, with volume (2 pi)^3/V; for fcc it is a truncated octahedron with the high-symmetry points Gamma, X (1,0,0), L (1/2,1/2,1/2), K and W in units of 2 pi/a, the points along which band structures and phonons are plotted.",
      "Simulations use periodic cells: a supercell of n x n x n conventional fcc cells has 4 n^3 atoms (32, 108, 256 and 500 for n = 2 to 5), so one vacancy is 3.1 per cent to 0.2 per cent of the sites; and a k-point mesh of m x m x m for the primitive cell is equivalent to a Gamma-point calculation in an m x m x m supercell."
    ],
    "label": "MSE 201",
    "code": "MSE 201",
    "dept": "MSE",
    "level": 2,
    "katex": true
  },
  {
    "id": 15,
    "label": "COMP 201",
    "code": "COMP 201",
    "dept": "COMP",
    "level": 2,
    "slug": "numerical-methods-essentials",
    "short": "Numerical methods I",
    "part": "Computing",
    "tone": "a",
    "minutes": 65,
    "title": "Numerical methods I: errors, equations and linear algebra",
    "blurb": "Floating point and conditioning, root finding, dense and sparse linear systems, least squares, iterative solvers, interpolation, differentiation and quadrature, with real program output.",
    "builds": [
      16,
      24,
      27
    ],
    "related": [
      6,
      9
    ],
    "takeaways": [
      "Computers store real numbers as floating-point numbers with a relative rounding error of at most 1.1e-16 (machine epsilon 2.2e-16 in double precision); the damage comes from cancellation and from ill-conditioned problems, not from the individual roundings: (1 - cos x)/x^2 gives 0.5000000414 at x = 1e-5 and exactly 0 at x = 1e-8 where the true value is 0.5, and a stable rewriting 2 sin^2(x/2)/x^2 is right to ten digits.",
      "A problem has a condition number kappa and an algorithm loses about log10(kappa) digits; for the function x - 1 near x = 1 the relative condition number is 1/(x - 1), which reaches 1e6 at x = 1.000001, and the same idea applies to linear systems, where the Hilbert matrix of size 12 has condition number 1.6e16 and the solution has an error of 13 percent although the residual is 1e-16.",
      "Root finding: bisection gains one bit per step (40 halvings for 1e-12), Newton doubles the number of correct digits (errors 5.8e-4, 1.9e-7, 2.0e-14 for x^3 - 2x - 5 from x0 = 3) but needs a good start and a derivative, and the secant method has order 1.618; Brent's method combines them and is the default in practice.",
      "Dense linear systems are solved by LU factorisation with partial pivoting at a cost of (2/3)n^3 operations; without pivoting a matrix with a small leading entry gives x = (0, 1) instead of (1, 1), and least-squares problems should be solved by QR or SVD, not by the normal equations, which square the condition number (the degree-12 fit of exp(x) has an error of 1.1e-7 by the normal equations and 8.9e-16 by QR).",
      "Matrices from discretised physics are sparse: a banded or sparse solver needs 0.0003 s for n = 8000 where a dense solver needs 3.9 s; Jacobi and Gauss-Seidel need a number of iterations proportional to n^2 (96 217 and 48 110 for n = 160) whereas conjugate gradients need about n/2 (80), and for the 2D Poisson problem the sparse LU factors have 17.5 million non-zeros for 160 000 unknowns while CG needs 734 iterations.",
      "Interpolating with a single high-degree polynomial on equally spaced points diverges (maximum error 1.0e5 with 41 points for 1/(1 + 25 x^2)); Chebyshev nodes (error 2.9e-4) or piecewise cubic splines (error decreasing 16-fold when the spacing is halved) are stable. Differences lose accuracy by rounding for small h (best central-difference error 4.5e-11 at h = 1e-5), whereas Gauss-Legendre quadrature with 5 points integrates exp(x) on [0,1] to 6.5e-13 and the Debye heat capacity is obtained with scipy.integrate.quad."
    ],
    "katex": true
  },
  {
    "id": 53,
    "label": "COMP 202",
    "code": "COMP 202",
    "dept": "COMP",
    "level": 2,
    "slug": "numerical-methods-differential-equations",
    "short": "Numerical methods II",
    "part": "Computing",
    "tone": "a",
    "minutes": 77,
    "title": "Numerical methods II: differential equations, optimisation and Fourier methods",
    "blurb": "Runge-Kutta and stiff solvers, finite differences for diffusion, Poisson and advection with stability analysis, optimisation, eigenvalue algorithms, the FFT and spectral methods, performance and random streams, with real program output.",
    "builds": [
      15,
      30,
      28
    ],
    "related": [],
    "takeaways": [
      "Runge-Kutta methods of order p have a global error proportional to h^p: for y' = -2y + sin t the errors at t = 5 fall by factors 2.0, 4.1 and 16.4 per halving of h for Euler, midpoint and RK4 (2.6e-3, 3.5e-5 and 1.4e-8 at h = 0.031), and adaptive embedded pairs such as RK45 choose the step to meet a tolerance (9 steps for 1e-3, 241 steps for 1e-11).",
      "A system is stiff when stability, not accuracy, limits the step of an explicit method: for y' = -50 y explicit Euler is stable only for h < 0.04 (h = 0.05 gives 3.3e3 instead of 1.9e-22), while implicit Euler is stable for every h; on Robertson's chemical kinetics RK45 needs 1.7 million steps and 103 s to reach t = 1000 where the implicit Radau method needs 116 steps and 0.08 s.",
      "For the heat equation the explicit scheme is stable only if r = D dt/dx^2 <= 1/2 (max|u| = 0.373 for r <= 0.51 and 4e18 for r = 0.55), backward Euler and Crank-Nicolson are stable for all r with errors proportional to dt (ratio 1.98) and dt^2 (ratio about 4), and the second-order central scheme for Poisson's equation reduces the error by 3.97 per halving of h.",
      "Advection exposes the other errors of a discretisation: with CFL 0.8 the first-order upwind scheme smears a pulse of height 1 to 0.745 (numerical diffusion), Lax-Wendroff keeps 0.988 but produces negative values (dispersion), and the unstable central scheme grows to 3e10.",
      "Optimisation: steepest descent needs a number of iterations proportional to the condition number (81, 922, 10 362 and 115 130 for k = 10 to 10 000) while conjugate gradients solve a two-variable quadratic in 2 steps; on the Rosenbrock function BFGS needs 34 iterations and plain gradient descent 32 076, and random-start BFGS finds the global minimum of a 7-atom Lennard-Jones cluster from 25 percent of 200 starts, of a 13-atom cluster from 5.5 percent and of a 19-atom cluster from 1 start in 200.",
      "Eigenvalues: power iteration converges at the rate (lambda2/lambda1)^2 per step (7932 iterations for a ratio of 0.999), shifted QR with deflation finds all eigenvalues of a 6 x 6 matrix in 17 sweeps against 205 unshifted, Lanczos (eigsh) finds the lowest six eigenvalues of a 14 400-unknown Laplacian in 0.2 s, and the chain and ring tight-binding eigenvalues -2 cos(k pi/(N+1)) and the benzene levels (-2, -1, -1, 1, 1, 2) are reproduced to 1e-15.",
      "The FFT turns an O(N^2) transform into O(N log N) (a speed-up of 33 800 at N = 8192), makes derivatives of smooth periodic functions exponentially accurate (error 2.9e-15 with 32 points against 2.6e-2 for second-order differences), solves diffusion exactly mode by mode, and requires care with aliasing (a 70 Hz signal sampled at 100 Hz appears at 30 Hz) and windowing.",
      "Performance: for a sum over 4.5 million atom pairs compiled loops (Numba) are 80 times faster than pure Python and 34 times faster than a vectorised NumPy version (0.013 s against 1.02 s and 0.44 s), a memory-bound kernel runs at 0.27 GFlop/s while a matrix product reaches 180 GFlop/s on the same machine, Amdahl's law limits a code with 1 percent serial work to a speed-up of 100, and independent random streams for parallel runs must come from SeedSequence.spawn."
    ],
    "katex": true
  },
  {
    "id": 45,
    "label": "LAB 201",
    "code": "LAB 201",
    "dept": "LAB",
    "level": 2,
    "slug": "lab-structures-ase",
    "short": "ASE: structures",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 28,
    "title": "Lab: Crystal structures in Python with ASE",
    "blurb": "Build crystals, supercells, defects and surface slabs with ASE, check neighbours and space groups, compute a lattice constant and defect energies with EMT, write files for LAMMPS, VASP and Quantum ESPRESSO, and index an X-ray pattern.",
    "builds": [
      2,
      27
    ],
    "related": [],
    "takeaways": [
      "ASE represents a structure as an Atoms object: a cell (three vectors), atomic numbers, positions and periodic boundary conditions; bulk(), crystal(), fcc111() and similar builders create standard crystals and surfaces in one line.",
      "Always verify a built structure with numbers: atom count, volume, density (copper 8.93 g/cm3), neighbour shells (12 at 2.556 angstrom for fcc), and the space group with spglib (Fm-3m 225 for fcc, Im-3m 229 for bcc, Fd-3m 227 for diamond).",
      "The symmetry tolerance matters: copper with 0.0005 angstrom of random noise is P1 at symprec 1e-3 but still Fm-3m at 0.1; choose the tolerance to match the noise of your data, not the other way round.",
      "Supercells and slabs are the basis of defect and surface calculations: a vacancy formation energy in EMT copper is 1.234 eV in a 3x3x3 cell, and surface energies of the (111), (100) and (110) faces (1.04, 1.13, 1.23 J/m2) do not change from 3 to 9 layers.",
      "ASE writes the same structure to CIF, XYZ, VASP POSCAR, LAMMPS data and Quantum ESPRESSO input, so it is the glue between the codes in the later labs; and a powder diffraction pattern can be indexed from the sin-squared theta ratios (1:2:3:4 for bcc, 3:4:8:11 for fcc)."
    ],
    "katex": true
  },
  {
    "id": 32,
    "label": "MATH 301",
    "code": "MATH 301",
    "dept": "MATH",
    "level": 3,
    "slug": "partial-differential-equations",
    "short": "PDEs",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 31,
    "title": "Partial differential equations",
    "blurb": "The diffusion, wave and Laplace equations: classification, boundary conditions, separation of variables, similarity solutions and Fourier methods.",
    "builds": [
      26,
      30,
      31
    ],
    "related": [
      8,
      9,
      10
    ],
    "takeaways": [
      "Second-order linear PDEs are elliptic (Laplace, Poisson: steady states, no time), parabolic (diffusion: smoothing, irreversible) or hyperbolic (wave: finite-speed propagation); the type decides which conditions are needed and which numerical method is stable.",
      "A well-posed problem needs boundary conditions of the right kind: Dirichlet (fixed value), Neumann (fixed flux, e.g. insulated), Robin (convective exchange, with the Biot number $hL/\\kappa$ saying which resistance dominates).",
      "Diffusion into a semi-infinite solid has the similarity solution $c=c_s-(c_s-c_0)\\,\\mathrm{erf}\\!\\big(x/2\\sqrt{Dt}\\big)$, so depths scale as $\\sqrt{Dt}$; a finite slab is solved by separation of variables, a Fourier series whose slowest mode has time constant $L^2/\\pi^2D$.",
      "The wave equation has solutions $f(x\\mp ct)$ and standing modes at frequencies $nc/2L$, the basis of ultrasonic measurement of elastic constants; the Laplace equation has no interior maxima, so steady-state fields are smooth and extremes sit on boundaries.",
      "Explicit finite differences for diffusion are stable only if $D\\,\\Delta t/\\Delta x^2\\le\\tfrac12$ (von Neumann analysis); implicit schemes remove the limit at the cost of solving a tridiagonal system.",
      "Linear stability analysis in Fourier space of the Cahn-Hilliard equation, $\\sigma(k)=-Mk^2(f''+\\kappa k^2)$, predicts spinodal decomposition and its characteristic wavelength $2\\pi\\sqrt{2\\kappa/|f''|}$."
    ]
  },
  {
    "id": 29,
    "label": "MATH 302",
    "code": "MATH 302",
    "dept": "MATH",
    "level": 3,
    "slug": "tensors-stress-and-strain",
    "short": "Tensors",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 26,
    "title": "Tensors: stress, strain and anisotropy",
    "blurb": "Index notation, tensor transformation, stress and strain, principal values, von Mises stress, Hooke's law and crystal symmetry.",
    "builds": [
      28,
      26
    ],
    "related": [
      2,
      10
    ],
    "takeaways": [
      "A tensor is defined by how its components transform when the axes rotate, $T'_{ij}=Q_{ik}Q_{jl}T_{kl}$, not merely by being an array of numbers; scalars, vectors, stress and the stiffness tensor are tensors of rank 0, 1, 2 and 4.",
      "In index notation a repeated index is summed (Einstein convention); with the Kronecker delta $\\delta_{ij}$ and the permutation symbol $\\varepsilon_{ijk}$ it expresses dot and cross products, traces and determinants compactly.",
      "Stress $\\sigma_{ij}$ gives the traction on any plane, $t_i=\\sigma_{ij}n_j$; it is symmetric, its eigenvalues are the principal stresses, and failure criteria depend only on invariants such as the von Mises stress $\\sqrt{\\tfrac32 s_{ij}s_{ij}}$ of the deviatoric part.",
      "Small strain is the symmetric part of the displacement gradient, $\\varepsilon_{ij}=\\tfrac12(\\partial_ju_i+\\partial_iu_j)$; the trace is the volume change and the antisymmetric part is a rigid rotation that stores no energy.",
      "Hooke's law $\\sigma_{ij}=C_{ijkl}\\varepsilon_{kl}$ has 81 components but only 21 independent constants in general, 3 for cubic crystals and 2 for isotropic solids; Voigt notation turns it into a $6\\times6$ matrix, which must be positive definite for stability.",
      "Neumann's principle: a crystal property tensor must be invariant under the crystal's point-group operations, which reduces the number of independent components and forces odd-rank tensors such as piezoelectricity to vanish in centrosymmetric crystals."
    ]
  },
  {
    "id": 34,
    "label": "MATH 303",
    "code": "MATH 303",
    "dept": "MATH",
    "level": 3,
    "slug": "statistics-and-data-fitting",
    "short": "Statistics",
    "part": "Mathematics",
    "tone": "a",
    "minutes": 31,
    "title": "Statistics, error analysis and fitting",
    "blurb": "Estimators, error bars and propagation, correlated samples, least squares, regression, regularisation and model comparison.",
    "builds": [
      33,
      28
    ],
    "related": [
      7,
      11
    ],
    "takeaways": [
      "An estimate without an uncertainty is not a result: the standard error of a mean is $s/\\sqrt{N}$ for independent samples, with the Student $t$ factor for small $N$, and independent errors propagate in quadrature with the partial derivatives as weights, $\\sigma_f^2=\\sum(\\partial f/\\partial x_i)^2\\sigma_i^2$.",
      "Consecutive frames from a simulation are correlated; the effective number of independent samples is $N/(2\\tau_\\mathrm{int})$, so the true error bar can be several times larger than the naive one, and blocking analysis finds it.",
      "Least squares minimises $\\|\\mathbf{y}-X\\boldsymbol\\beta\\|^2$ and is solved by the normal equations $X^TX\\boldsymbol\\beta=X^T\\mathbf{y}$ (better by QR or the SVD); the parameter covariance is $s^2(X^TX)^{-1}$, and correlated parameters, such as an Arrhenius slope and intercept, must be reported together.",
      "A good fit has reduced $\\chi^2\\approx1$ when the weights are $1/\\sigma_i^2$; fitting more parameters always lowers the training error, so model choice needs held-out data (cross-validation) or a penalty (ridge regression, information criteria).",
      "Ridge regression damps the poorly determined directions of the SVD and cures ill-conditioning; it is the maximum a posteriori estimate with a Gaussian prior, which links regularisation to the Bayesian view in which prior knowledge and data combine by adding precisions.",
      "The bootstrap estimates uncertainties by resampling the data, and works for any statistic, provided the resampling respects correlations (block bootstrap)."
    ]
  },
  {
    "id": 35,
    "label": "MATH 304",
    "code": "MATH 304",
    "dept": "MATH",
    "level": 3,
    "slug": "calculus-of-variations-and-optimisation",
    "short": "Variational methods",
    "part": "Mathematics",
    "tone": "b",
    "minutes": 34,
    "title": "Calculus of variations and optimisation",
    "blurb": "Functionals, the Euler-Lagrange equation, functional derivatives, weak forms, and gradient-based and Newton-type optimisation.",
    "builds": [
      25,
      30
    ],
    "related": [
      9,
      10,
      5
    ],
    "takeaways": [
      "A functional maps a function to a number (an energy, an action, a free energy); its minimiser satisfies the Euler-Lagrange equation $\\frac{\\mathrm{d}}{\\mathrm{d}x}\\frac{\\partial L}{\\partial y'}=\\frac{\\partial L}{\\partial y}$, obtained by integrating by parts, and the same logic with the functional derivative $\\delta F/\\delta c=f'(c)-\\kappa\\nabla^2c$ gives the chemical potential of phase-field theory.",
      "Minimising the Ginzburg-Landau energy gives a diffuse interface $c=\\tanh(x/w)$ of width $w=\\sqrt{2\\kappa/A}$ and interfacial energy $\\tfrac23Aw$: the width and energy of the interface come from the competition between the double well and the gradient term.",
      "Allen-Cahn and Cahn-Hilliard dynamics are gradient flows of the free energy, $\\partial_tc=-M\\,\\delta F/\\delta c$ (non-conserved) or $\\nabla\\cdot(M\\nabla\\,\\delta F/\\delta c)$ (conserved), so the energy never increases.",
      "The Rayleigh-Ritz principle says any trial wavefunction has energy at or above the ground-state energy, so minimising over a family of trial functions gives an upper bound and, with Lagrange multipliers for normalisation, the Schrödinger eigenproblem; this is the basis of variational electronic-structure methods.",
      "Multiplying a differential equation by a test function and integrating by parts gives the weak form, which is the finite element method's starting point; expanding in local basis functions turns it into a sparse symmetric positive-definite linear system $K\\mathbf{u}=\\mathbf{f}$.",
      "Gradient descent converges at a rate set by the condition number $\\kappa$ of the Hessian, conjugate gradients at a rate set by $\\sqrt{\\kappa}$, and Newton's method quadratically near a minimum at the price of the Hessian; for non-convex landscapes annealing and basin hopping search for the global minimum."
    ]
  },
  {
    "id": 3,
    "slug": "statistical-mechanics",
    "short": "Statistical mechanics",
    "part": "Physics",
    "tone": "a",
    "minutes": 43,
    "title": "Statistical mechanics for simulation",
    "blurb": "Microstates, ensembles, the partition function, free energy, ergodicity and error bars.",
    "builds": [
      38,
      33,
      40
    ],
    "related": [],
    "takeaways": [
      "Statistical mechanics connects the microscopic world to thermodynamics: the entropy S = k_B ln Omega counts the microstates compatible with a macrostate, temperature is defined by 1/T = dS/dU, and the equilibrium state is the overwhelmingly most probable one (two Einstein solids with 300 oscillators each share energy within about 5 quanta of the mean 50).",
      "A system in contact with a heat bath has probability P_i = exp(-E_i/k_B T)/Z; the partition function Z contains all thermodynamics: F = -k_B T ln Z, U = -d ln Z/d beta, S = -dF/dT, and the heat capacity C_V = (U^2 variance)/(k_B T^2).",
      "Simple partition functions give the classic results: the two-level system has a Schottky heat-capacity peak of 0.439 N k_B at k_B T = 0.417 epsilon, the quantum oscillator gives the Einstein heat capacity, and the ideal gas gives the Sackur-Tetrode entropy (154.85 J/mol/K for argon at 298.15 K and 1 bar, against the calorimetric 154.84).",
      "Equilibrium concentrations of defects follow from minimising F: the vacancy fraction is exp(-E_f/k_B T) (for E_f = 1.28 eV it is 3e-22 at 300 K and 1.1e-5 at 1300 K), and the relation C_V = Var(E)/(k_B T^2) means that thermodynamic derivatives can be measured from fluctuations in a simulation.",
      "Quantum statistics explain the heat capacity of solids (Debye T^3 law, with 4.8e-5 J/mol/K^4 T^3 for copper) and of electrons (the Fermi energy of copper is 7.0 eV, so electrons are degenerate up to 81 000 K and contribute only a linear term); mean-field theory of the Ising model gives T_c = zJ/k_B = 4 J/k_B for the square lattice, too high by 76 per cent compared with the exact 2.269, and Monte Carlo corrects it."
    ],
    "label": "PHYS 301",
    "code": "PHYS 301",
    "dept": "PHYS",
    "level": 3,
    "katex": true
  },
  {
    "id": 41,
    "label": "PHYS 302",
    "code": "PHYS 302",
    "dept": "PHYS",
    "level": 3,
    "slug": "solid-state-physics",
    "short": "Solid state physics",
    "part": "Physics",
    "tone": "a",
    "minutes": 31,
    "title": "Solid state physics",
    "blurb": "Lattice vibrations, free electrons, bands and the Bloch theorem: the physics behind density functional theory.",
    "builds": [
      40,
      3,
      2,
      31
    ],
    "related": [],
    "takeaways": [
      "Solids are held together by ionic, covalent, metallic or van der Waals binding; the lattice energy of an ionic crystal is the Madelung sum $-\\alpha e^2/4\\pi\\varepsilon_0r_0(1-1/n)$ (about $-7.9$ eV per NaCl pair), and the curvature of the energy curve gives the bulk modulus.",
      "Atoms in a crystal are coupled oscillators, so lattice vibrations are waves with a dispersion $\\omega(k)$ (for a monatomic chain $\\omega=2\\sqrt{K/m}\\,|\\sin(ka/2)|$); a diatomic crystal has acoustic and optical branches, and quantised vibrations are phonons with occupation $1/(e^{\\hbar\\omega/k_\\mathrm BT}-1)$ that give the Debye heat capacity.",
      "Free electrons in a metal fill states up to the Fermi energy $E_F=\\hbar^2(3\\pi^2n)^{2/3}/2m$ (7.0 eV for copper); only electrons within $k_\\mathrm BT$ of $E_F$ respond to heat or fields, which explains the small linear electronic heat capacity $\\gamma T$.",
      "A periodic potential gives Bloch states $e^{i\\mathbf k\\cdot\\mathbf r}u_\\mathbf k(\\mathbf r)$ and energy bands separated by gaps at Brillouin-zone boundaries; the curvature of a band defines the effective mass $m^*=\\hbar^2/(\\mathrm d^2E/\\mathrm dk^2)$.",
      "Whether a solid is a metal, semiconductor or insulator depends on band filling and the gap; in semiconductors $np=n_i^2$ with $n_i\\propto e^{-E_g/2k_\\mathrm BT}$, doping sets the carrier type, and a p-n junction has a built-in potential $(k_\\mathrm BT/e)\\ln(N_aN_d/n_i^2)$; exchange gives magnetism and electron pairing gives superconductivity."
    ],
    "katex": true
  },
  {
    "id": 4,
    "slug": "thermodynamics-and-calphad",
    "short": "Thermodynamics and CALPHAD",
    "part": "Materials science",
    "tone": "b",
    "minutes": 68,
    "title": "Thermodynamics and CALPHAD",
    "blurb": "Gibbs energy, the common tangent, solution models, phase diagrams and equilibrium calculation.",
    "builds": [
      14,
      3
    ],
    "related": [
      5
    ],
    "takeaways": [
      "Equilibrium at fixed temperature and pressure is the minimum of the Gibbs energy G = H - TS, and the thermodynamic functions of a phase follow from its heat capacity: for solid aluminium (Cp = 20.67 + 0.01238 T) heating from 300 to 700 K raises the enthalpy by 10.7 kJ/mol and the entropy by 22.5 J/(mol K), and G = H - TS and S = -dG/dT are satisfied to the accuracy of the numerical derivative.",
      "The driving force for solidification of a pure metal is dG = G(liquid) - G(solid) = dH_m dT/T_m to a very good approximation (1147 against 1148 J/mol at 100 K undercooling of Al, an error of 0.03 percent, growing to 1.4 percent at 300 K), and the entropy of fusion of Al is 11.47 J/(mol K) = 1.38 R.",
      "A solution has the ideal entropy of mixing -R(x ln x + (1 - x) ln(1 - x)) (R ln 2 = 5.76 J/(mol K) at x = 0.5) and the regular-solution model adds an enthalpy w x (1 - x); the chemical potential of a component is the intercept of the tangent to G(x), obeys the Gibbs-Duhem relation x dmu_B + (1 - x) dmu_A = 0, and determines its activity (gamma_B = exp(w (1 - x)^2/RT) = 3.25 at x = 0.01 for w = 10 kJ/mol, 1000 K).",
      "A regular solution with w > 0 has a miscibility gap below T_c = w/(2R) (1203 K for w = 20 kJ/mol): the binodal (common tangent, x = 0.1448 at T/T_c = 0.8) is where the phases coexist, the spinodal (G'' = 0, x = 0.2764) is the limit of metastability, and near T_c the half-width of the gap is sqrt(3(1 - T/T_c))/2 (0.0863 against 0.0866 at T/T_c = 0.99).",
      "A binary phase diagram is the projection of the common tangents of all phase Gibbs-energy curves as functions of T: for a model eutectic alloy the lower convex hull gives liquidus, solidus, solvus, the eutectic at 799.9 K and x_B = 0.421, and the lever rule gives 36.8 percent primary alpha and 63.2 percent eutectic liquid for the alloy x_B = 0.30 just above the eutectic, in agreement with pycalphad on the same model to 4 digits (chemical potentials -407.84 against -407.83 J/mol).",
      "The CALPHAD method describes each phase by a Gibbs-energy model (polynomial in T for pure elements, Redlich-Kister series for excess energies, sublattice models for compounds) with parameters fitted to all available data; fitting a liquid interaction parameter to nine noisy liquidus points gives -5081 +- 244 J/mol (true value -5000), and the parameter uncertainty translates into a prediction uncertainty of +-2 K on the liquidus at x_B = 0.30.",
      "Nucleation needs a driving force: the critical radius is r* = 2 gamma/dG_v and the barrier 16 pi gamma^3/(3 dG_v^2), which for Al with an illustrative interfacial energy of 0.093 J/m^2 gives r* = 1.6 nm (1074 atoms) and a barrier of 89 kT at 100 K undercooling, and reaches 60 kT, a typical threshold for observable nucleation, at 124 K (0.13 T_m)."
    ],
    "label": "MSE 301",
    "code": "MSE 301",
    "dept": "MSE",
    "level": 3,
    "katex": true
  },
  {
    "id": 42,
    "label": "MSE 302",
    "code": "MSE 302",
    "dept": "MSE",
    "level": 3,
    "slug": "mechanical-behaviour-of-materials",
    "short": "Mechanical behaviour",
    "part": "Materials science",
    "tone": "a",
    "minutes": 31,
    "title": "Mechanical behaviour of materials",
    "blurb": "Elasticity, plasticity, dislocations, fracture and creep, building on stress and strain.",
    "builds": [
      14,
      2,
      29
    ],
    "related": [],
    "takeaways": [
      "The tensile test gives Young's modulus, yield and ultimate strength and ductility; true stress and strain, $\\sigma_t=\\sigma(1+\\varepsilon)$ and $\\varepsilon_t=\\ln(1+\\varepsilon)$, are needed for large strains, and necking starts when $\\mathrm d\\sigma_t/\\mathrm d\\varepsilon_t=\\sigma_t$ (for $\\sigma=K\\varepsilon^n$, at $\\varepsilon_t=n$).",
      "Crystals deform plastically by slip on close-packed planes when the resolved shear stress $\\tau=\\sigma\\cos\\phi\\cos\\lambda$ reaches the critical value (Schmid's law); the ideal strength $\\sim G/2\\pi$ is a hundred times the real yield stress because slip proceeds by dislocation motion.",
      "A dislocation has Burgers vector $\\mathbf b$, line energy $\\approx\\tfrac12Gb^2$ per length and feels a force $\\tau b$ per length; strengthening means obstructing dislocations: by other dislocations (Taylor, $\\tau=\\alpha Gb\\sqrt\\rho$), grain boundaries (Hall-Petch, $\\sigma_y=\\sigma_0+kd^{-1/2}$), solute atoms and precipitates (Orowan, $\\Delta\\tau\\approx Gb/L$).",
      "Brittle fracture occurs when the stress intensity $K_I=Y\\sigma\\sqrt{\\pi a}$ reaches the toughness $K_{IC}$; Griffith's criterion $\\sigma_f=\\sqrt{2E\\gamma/\\pi a}$ explains why flaws, not bonds, set the strength of ceramics and glass.",
      "At high temperature ($T>0.4T_m$) materials creep with a thermally activated rate $\\dot\\varepsilon=A\\sigma^ne^{-Q/RT}$, and under cyclic loading they fatigue, with crack growth $\\mathrm da/\\mathrm dN=C\\,\\Delta K^m$ (Paris law); design uses material indices such as $E^{1/2}/\\rho$ to choose materials."
    ],
    "katex": true
  },
  {
    "id": 48,
    "label": "LAB 301",
    "code": "LAB 301",
    "dept": "LAB",
    "level": 3,
    "slug": "lab-phonons-phonopy",
    "short": "Phonons: phonopy",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 23,
    "title": "Lab: Phonons with phonopy",
    "blurb": "Compute force constants by finite displacements, the phonon bands and density of states of copper, heat capacity and Debye temperature, convergence checks, instability, and thermal expansion from the Grueneisen parameter.",
    "builds": [
      41,
      28,
      45
    ],
    "related": [],
    "takeaways": [
      "Phonons are the quantised lattice vibrations: for each wave vector q a crystal with n atoms per cell has 3n branches whose frequencies are the square roots of the eigenvalues of the dynamical matrix D(q), built from the force constants (the derivatives of forces with respect to displacements).",
      "In the finite-displacement method, a few atoms of a supercell are displaced by 0.01 angstrom, the forces on all atoms are computed (with any calculator), and phonopy turns them into force constants; because of symmetry, fcc copper needs only one displaced supercell of 64 atoms.",
      "For copper with the EMT potential the frequencies at X are 5.53 (two transverse branches) and 8.14 THz (longitudinal), the highest frequency of the DOS is 8.3 THz, and the heat capacity from the phonons is 23.4 J/mol/K at 300 K (0.937 of the Dulong-Petit value 3R) with an effective Debye temperature of 345 K.",
      "Every phonon calculation needs three checks: the supercell must be large enough (the frequency at X changes by less than 0.02 THz from 2x2x2 to 6x6x6 here, but the commensurability with q matters), the structure must be relaxed with the same potential (frequencies at X change from 6.4 to 4.5 THz when a goes from 3.50 to 3.70 angstrom), and the result must have no imaginary frequencies (bcc copper in EMT has -1.14 THz at N, so it is dynamically unstable).",
      "Frequency changes with volume give the Gruneisen parameter (about 2.1 for the TA mode at X) and, together with the heat capacity and bulk modulus, the thermal expansion: alpha = gamma Cv/(3BV) = 16.8e-6 per K, close to the measured 16.5e-6."
    ],
    "katex": true
  },
  {
    "id": 1,
    "slug": "introduction",
    "short": "Introduction",
    "part": "Computational methods",
    "tone": "a",
    "minutes": 20,
    "title": "Introduction to computational materials science",
    "blurb": "Scales, method families, multiscale linking, validation, software and data resources.",
    "builds": [
      14,
      16
    ],
    "related": [],
    "takeaways": [
      "Methods are specialised by length and time scale; no single model covers every scale, so multiscale linking is the norm.",
      "Start from the question: the smallest feature that matters, the longest time that matters, and whether the answer is an equilibrium or a rate.",
      "A simulation is a prediction to be tested. Verification, validation and uncertainty quantification are three different checks.",
      "The cheapest useful step is often a thermodynamic (CALPHAD) calculation, before heavier modelling is attempted.",
      "Inputs and approximations bound accuracy: trends and rankings are usually more reliable than absolute numbers."
    ],
    "label": "CMS 401",
    "code": "CMS 401",
    "dept": "CMS",
    "level": 4
  },
  {
    "id": 5,
    "slug": "density-functional-theory",
    "short": "Density functional theory",
    "part": "Computational methods",
    "tone": "b",
    "minutes": 13,
    "title": "Density functional theory in practice",
    "blurb": "The Kohn-Sham scheme, functionals, the SCF cycle, convergence and what to compute.",
    "builds": [
      1,
      2,
      40,
      28
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
    "label": "CMS 501",
    "code": "CMS 501",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 6,
    "slug": "molecular-dynamics",
    "short": "Molecular dynamics",
    "part": "Computational methods",
    "tone": "b",
    "minutes": 11,
    "title": "Molecular dynamics",
    "blurb": "Integrators, interatomic potentials, thermostats, workflow and analysis.",
    "builds": [
      1,
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
    "label": "CMS 502",
    "code": "CMS 502",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 7,
    "slug": "monte-carlo-methods",
    "short": "Monte Carlo and kMC",
    "part": "Computational methods",
    "tone": "b",
    "minutes": 12,
    "title": "Monte Carlo and kinetic Monte Carlo",
    "blurb": "Importance sampling, Metropolis, the Ising model, cluster expansions and rejection-free kinetics.",
    "builds": [
      3,
      15,
      33
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
    "label": "CMS 503",
    "code": "CMS 503",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 8,
    "slug": "diffusion-and-kinetics",
    "short": "Diffusion and kinetics",
    "part": "Computational methods",
    "tone": "a",
    "minutes": 13,
    "title": "Diffusion and kinetics",
    "blurb": "Fick's laws, driving forces, atomistic mechanisms, computing D and solving the equation.",
    "builds": [
      4,
      15,
      32
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
    "label": "CMS 504",
    "code": "CMS 504",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 9,
    "slug": "phase-field-modelling",
    "short": "Phase-field",
    "part": "Computational methods",
    "tone": "b",
    "minutes": 12,
    "title": "Phase-field modelling",
    "blurb": "Diffuse interfaces, Allen-Cahn and Cahn-Hilliard, spinodal decomposition and numerics.",
    "builds": [
      4,
      8,
      32
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
    "label": "CMS 505",
    "code": "CMS 505",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 10,
    "slug": "finite-element-method",
    "short": "Finite elements",
    "part": "Computational methods",
    "tone": "a",
    "minutes": 14,
    "title": "The finite element method",
    "blurb": "Weak form, shape functions, meshing, convergence, nonlinear problems and materials applications.",
    "builds": [
      8,
      15,
      32
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
    "label": "CMS 506",
    "code": "CMS 506",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 11,
    "slug": "machine-learning-for-materials",
    "short": "Machine learning",
    "part": "Computational methods",
    "tone": "b",
    "minutes": 15,
    "title": "Machine learning for materials",
    "blurb": "Data, descriptors, models, honest validation, machine-learned potentials and active learning.",
    "builds": [
      5,
      6,
      16,
      34
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
    "label": "CMS 507",
    "code": "CMS 507",
    "dept": "CMS",
    "level": 5
  },
  {
    "id": 52,
    "label": "LAB 501",
    "code": "LAB 501",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-dft-pyscf",
    "short": "Hartree-Fock and DFT of H2, water and silicon with PySCF",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 27,
    "title": "Lab: Electronic structure with PySCF",
    "blurb": "Run Hartree-Fock and DFT calculations yourself: H2 dissociation, basis sets and geometries of water, and silicon with k-point convergence, an equation of state and a band gap.",
    "builds": [
      5,
      40,
      2
    ],
    "related": [],
    "takeaways": [
      "PySCF runs Hartree-Fock and DFT from a few lines of Python; energies are in Hartree (1 Ha = 27.2114 eV) and input lengths in Angstrom, so never compare a Hartree number with an eV number or energies from different methods or basis sets.",
      "For H2 the exact (FCI) dissociation energy is 4.70 eV against 4.75 eV in experiment; PBE gives 4.54, LDA 4.90 and restricted Hartree-Fock 3.63 eV, and at 5 Angstrom restricted HF is 6.3 eV too high (-0.7677 Ha instead of -0.9996) while the unrestricted solution is correct.",
      "For water with PBE the energy falls from -75.226 Ha (STO-3G) to -76.383 Ha (cc-pVQZ) and the error of cc-pVTZ is still 10 mHa (6.4 kcal/mol); optimised O-H lengths are 0.9406 (HF), 0.9706 (LDA), 0.9697 (PBE) and 0.9613 Angstrom (B3LYP) against 0.9572 in experiment.",
      "For crystalline silicon (GTH pseudopotential, PBE, gth-dzvp) the energy per atom still changes by 63.6 meV between 4x4x4 and 5x5x5 k-points; a Birch-Murnaghan fit gives a0 = 5.520 Angstrom (+1.6%) and B = 84.8 GPa (-14%), and the band gap is indirect at 0.69 eV against 1.12 eV in experiment (direct gap 2.57 against 3.4 eV).",
      "Semilocal DFT underestimates gaps by 30 to 40 percent, a bulk modulus depends on the fit window, and two real mistakes are documented in this lab (volumes in bohr^3 and a density-fitting error), so always check units and compare with a second method or experiment."
    ],
    "katex": true
  },
  {
    "id": 43,
    "label": "LAB 502",
    "code": "LAB 502",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-md-lammps-argon",
    "short": "LAMMPS: liquid argon",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 35,
    "title": "Lab: Molecular dynamics of liquid argon with LAMMPS",
    "blurb": "Install LAMMPS, write and run an input file for argon, analyse g(r) and diffusion, simulate solid, liquid and gas, test the numerics, add pressure and melting, and fix typical errors.",
    "builds": [
      6,
      16
    ],
    "related": [],
    "takeaways": [
      "A molecular dynamics run needs five things: a box with atoms, a force law (pair_style), initial velocities, an integrator and a thermostat or barostat; in LAMMPS these are the commands lattice/create_atoms, pair_style/pair_coeff, velocity, fix nve and fix nvt/npt.",
      "Lennard-Jones simulations are done in reduced units (sigma, epsilon, mass = 1); for argon, one time unit is 2.16 ps, T*=0.85 is 101.8 K and rho*=0.8442 is 1.42 g/cm3, so one reduced run can be converted to real units afterwards.",
      "Always check the run before analysing it: total energy must be conserved in NVE (here to about 1e-3 over thousands of steps), temperature must fluctuate around its target, and the time step must be small enough (0.004 to 0.012 is safe for the LJ liquid).",
      "Structure and dynamics come from the trajectory: g(r) from compute rdf shows solid, liquid and gas as sharp peaks, a first peak with a broad shoulder, or nearly nothing; the diffusion coefficient D is the slope of the mean-square displacement divided by 6.",
      "Report averages with error bars from several independent runs, and test the cutoff (use a tail correction), the system size and the time step before trusting a number: single 80-time-unit runs gave D within about 10 per cent, but a 108-atom box was 20 per cent off."
    ],
    "katex": true
  },
  {
    "id": 44,
    "label": "LAB 503",
    "code": "LAB 503",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-md-lammps-copper",
    "short": "LAMMPS: copper",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 35,
    "title": "Lab: A metal with LAMMPS: copper with an EAM potential",
    "blurb": "Simulate copper with an embedded-atom potential: lattice constant, thermal expansion, elastic constants, vacancy and surface energies, and a tensile test with structure analysis.",
    "builds": [
      43,
      42,
      41
    ],
    "related": [],
    "takeaways": [
      "A metal is simulated with an embedded-atom-method (EAM) potential, pair_style eam in LAMMPS, in units metal (eV, angstrom, ps, bar); the potential file must be found through the working directory or the LAMMPS_POTENTIALS environment variable.",
      "Properties are computed by small numerical experiments: the lattice constant and bulk modulus from E(a) (3.615 angstrom, 139 GPa), thermal expansion from NPT runs (16.7e-6 per K at 300 K), elastic constants from stresses under small strains (C11=167, C12=124, C44=76.5 GPa), and defect energies from energy differences (vacancy 1.28 eV, surfaces 1.18 to 1.41 J/m2).",
      "A pitfall that costs hours: change_box and other commands interpret lengths in lattice units by default, so a shear of 0.002 became 0.0072 and gave C44 = 276 GPa instead of 76.5 until units box was added.",
      "A tensile test is a deformation run: fix deform stretches the box at a constant strain rate while fix npt keeps the transverse stresses at zero; the stress is minus the pressure component, the strain is the relative box length, and the peak stress marks the nucleation of dislocations in the perfect crystal.",
      "Always compare with experiment and with the limits of the method: EAM reproduces cohesive energy, lattice constant, elastic constants and the vacancy energy of copper because they were fitted, but it underestimates surface energies and cannot describe bonding changes or electronic effects."
    ],
    "katex": true
  },
  {
    "id": 46,
    "label": "LAB 504",
    "code": "LAB 504",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-ising-monte-carlo",
    "short": "Monte Carlo: Ising",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 21,
    "title": "Lab: Monte Carlo of the Ising model",
    "blurb": "Write the Metropolis algorithm, validate it against Onsager's exact solution, find the critical point with the Binder cumulant, and measure autocorrelation times and honest error bars.",
    "builds": [
      7,
      33,
      3
    ],
    "related": [],
    "takeaways": [
      "The Metropolis algorithm for the 2D Ising model proposes to flip one spin and accepts it with probability min(1, exp(-dE/kT)); a sweep is L*L proposals, and the energy change of a flip is dE = 2 s_i (sum of the four neighbours), so it takes only integer arithmetic.",
      "Simulation results are checked against exact ones: Onsager gives Tc = 2/ln(1+sqrt2) = 2.2692 J/kB, and the simulated magnetisation (0.9573, 0.9099, 0.8680 at T = 1.8, 2.0, 2.1) and energy (-1.860, -1.745, -1.661) of a 32x32 lattice agree with the exact values to about 0.002.",
      "Finite systems have no sharp transition: the specific-heat peak grows with L (1.18, 1.54, 1.85 for L = 8, 16, 32) and moves towards Tc, and the Binder cumulant U = 1 - <m4>/(3<m2>^2) goes from 2/3 (ordered) to 0 (disordered) with curves for different L crossing near Tc.",
      "Near Tc the sampling becomes inefficient (critical slowing down): the autocorrelation time of the magnetisation of a 32x32 lattice is 3 sweeps at T = 1.8, 161 sweeps at Tc and 2 sweeps at T = 4, so the number of independent samples in 40 000 sweeps at Tc is only about 120.",
      "Always report an error bar that accounts for correlation (error = sigma*sqrt(2 tau / N)), start from several different initial states, and look at snapshots: a quench from a random state can get stuck in a striped state with two domains that has higher energy than the ground state."
    ],
    "katex": true
  },
  {
    "id": 47,
    "label": "LAB 505",
    "code": "LAB 505",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-calphad-pycalphad",
    "short": "CALPHAD: pycalphad",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 26,
    "title": "Lab: Phase diagrams with CALPHAD and pycalphad",
    "blurb": "Write a thermodynamic database, plot Gibbs-energy curves and the common tangent, compute a phase diagram, test the interaction parameters, and compare equilibrium solidification with the Scheil model.",
    "builds": [
      4,
      38
    ],
    "related": [],
    "takeaways": [
      "A CALPHAD calculation needs a thermodynamic database (a TDB file): for every phase, the Gibbs energy of each element in that phase plus interaction (Redlich-Kister) parameters; the software then minimises the total Gibbs energy at given T, P and composition to find the stable phases, amounts and compositions.",
      "The equilibrium compositions at a temperature are the points of the common tangent to the Gibbs-energy curves; in the teaching A-B system at 700 K and x_B = 0.20 the solid alpha (x = 0.041) and the liquid (x = 0.348) share one tangent, and the lever rule gives the liquid fraction 0.517 from compositions alone.",
      "The phase diagram is the set of these results over T and x: the teaching system has a eutectic near 665 K and x_B = 0.385, with alpha dissolving up to x_B = 0.047 and beta up to 0.964; changing the liquid interaction parameter from 0 to -12000 J/mol moves the eutectic by hundreds of kelvin (table in Step 6).",
      "Equilibrium is not what you get in a casting: for the alloy x_B = 0.10 the lever rule predicts 0.159 of eutectic and the Scheil model (no diffusion in the solid) 0.221, and the Scheil result is converged with respect to the temperature step (0.222 at 4 K, 0.221 at 1 K).",
      "A database for a real alloy must be assessed from experimental data (diagrams, calorimetry, activities); copying a TDB file without checking the validity range, the phase list and the reference states gives plausible but wrong diagrams."
    ],
    "katex": true
  },
  {
    "id": 50,
    "label": "LAB 506",
    "code": "LAB 506",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-diffusion-fipy",
    "short": "FiPy: diffusion, spinodal",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 25,
    "title": "Lab: Diffusion and phase separation with FiPy",
    "blurb": "Solve Fick's law for carburising and compare with the erf solution, test mesh and time-step errors, recover D(c) with the Boltzmann-Matano method, and simulate spinodal decomposition with the Cahn-Hilliard equation.",
    "builds": [
      8,
      9,
      32
    ],
    "related": [],
    "takeaways": [
      "FiPy solves transport equations by the finite-volume method: a mesh, CellVariable objects and equations written as TransientTerm() == DiffusionTerm(coeff=D); boundary conditions are set with constrain, and each solve call advances one implicit time step.",
      "For carburising of steel at 927 C (D = 8.3e-12 m2/s) the simulated profile matches the error-function solution to 1.1e-3 wt% and the case depth to 0.5 wt% carbon after 10 h is 0.685 mm (analytic 0.687 mm); the error is dominated by the time step (first order, halving dt halves the error) once the mesh has more than about 100 cells.",
      "With a concentration-dependent diffusivity D(c) the profiles still collapse as a function of x divided by the square root of time (Boltzmann), and the Boltzmann-Matano formula recovers D(c) from one profile to within 1.5 per cent for c between 0.3 and 0.9 of the surface value.",
      "The Cahn-Hilliard equation dc/dt = div(M grad mu) with mu = f'(c) - kappa laplacian(c) conserves the mean composition (0.500028 at all times) and lowers the free energy (0.0080 to 0.0029); from c0 = 0.5, inside the spinodal, the fastest-growing wavelength is 2 pi/sqrt(0.2) = 14.05 and the simulation gives 13.9 to 14.4.",
      "Phase-separated domains coarsen and finally reach the equilibrium compositions of the double well (minimum 0.300 and maximum 0.700 in the final snapshot); in a small periodic box the late stage is limited by the box (stripes spanning the cell), so coarsening exponents measured in such runs (about 0.25 here) must be quoted with that limitation."
    ],
    "katex": true
  },
  {
    "id": 51,
    "label": "LAB 507",
    "code": "LAB 507",
    "dept": "LAB",
    "level": 5,
    "slug": "lab-fem-scikit-fem",
    "short": "FEM: scikit-fem",
    "part": "Computational labs",
    "tone": "a",
    "minutes": 29,
    "title": "Lab: Finite elements with scikit-fem",
    "blurb": "Build finite-element solutions from a 1D bar to a plate with a hole: convergence rates, linear elasticity, stress recovery, and the stress concentration factor checked against Kirsch and Peterson.",
    "builds": [
      10,
      32,
      29
    ],
    "related": [],
    "takeaways": [
      "A finite-element calculation has a fixed sequence: write the weak form, build a mesh, choose a finite-element basis, assemble the stiffness matrix and load vector, impose the boundary conditions, solve the linear system, and post-process; scikit-fem does each step in a line or two of Python.",
      "Convergence must be measured, not assumed: for -u'' = 1 the error in the gradient halves when the mesh is halved (first order) while the error of the value falls by four (second order), and in 2D the centre value of the torsion problem converges as h^2 for linear and about h^4 for quadratic triangles.",
      "A plate with a circular hole under tension has a stress concentration factor of 2.731 based on the net-section stress for d/W = 0.1 (finite elements, quadratic triangles, 369 nodes), against 2.722 from Peterson's chart: +0.3 per cent; the ratio to the gross stress is 3.03, so always say which nominal stress is used.",
      "Quadratic elements reached 1.4 per cent accuracy on the coarsest mesh (134 nodes) while linear elements needed about 680 nodes for 0.6 per cent, and the stress at the hole edge is obtained by projecting the discontinuous element stress to nodes, which can overshoot on coarse meshes (+17 per cent for linear elements with 170 nodes).",
      "Verification checks that cost nothing: the force transmitted through the ligament equals the applied force (4998.5 against 5000 N/mm), the far-field stress ratio follows Kirsch's solution, and for a traction-loaded plate the stresses do not depend on E or on the Poisson ratio (303.4 MPa for all four material choices) while the displacement scales as 1/E."
    ],
    "katex": true
  }
];
/* Courses that are planned but not yet written. They appear on the curriculum page as "in preparation".
   When one is written, move it into MIBEM_TOPICS (with an id, slug, takeaways and so on) and delete it here. */
window.MIBEM_PLANNED = [];

/* The learning path: one linear order through every course, grouped into sections. Codes not yet written are shown as locked units.
   Every course must come after the courses it builds on. */
window.MIBEM_PATHPLAN = [
  {
    "name": "Section 1: Foundations",
    "sub": "Calculus, linear algebra, mechanics, heat, electromagnetism, materials and programming.",
    "courses": [
      "MATH 100",
      "MATH 101",
      "COMP 101",
      "LAB 101",
      "MATH 103",
      "PHYS 101",
      "MSE 101",
      "MATH 102",
      "COMP 102",
      "PHYS 102",
      "PHYS 103"
    ]
  },
  {
    "name": "Section 2: Core tools",
    "sub": "Vector calculus, differential equations, probability, Fourier analysis, quantum mechanics, crystals and numerical methods.",
    "courses": [
      "MATH 201",
      "MATH 202",
      "MATH 203",
      "MATH 204",
      "MATH 205",
      "PHYS 201",
      "MSE 201",
      "LAB 201",
      "COMP 201",
      "COMP 202"
    ]
  },
  {
    "name": "Section 3: Advanced theory",
    "sub": "Partial differential equations, tensors, statistics, variational methods, statistical mechanics and thermodynamics of materials.",
    "courses": [
      "MATH 301",
      "MATH 302",
      "MSE 302",
      "MATH 303",
      "MATH 304",
      "PHYS 301",
      "PHYS 302",
      "LAB 301",
      "MSE 301",
      "LAB 505"
    ]
  },
  {
    "name": "Section 4: The field",
    "sub": "What computational materials science is, what it can predict and where it fails.",
    "courses": [
      "CMS 401"
    ]
  },
  {
    "name": "Section 5: Simulation methods",
    "sub": "Electrons, atoms, sampling, kinetics, microstructure, components and data.",
    "courses": [
      "CMS 501",
      "LAB 501",
      "CMS 502",
      "LAB 502",
      "LAB 503",
      "CMS 503",
      "LAB 504",
      "CMS 504",
      "CMS 505",
      "LAB 506",
      "CMS 506",
      "LAB 507",
      "CMS 507"
    ]
  }
];
