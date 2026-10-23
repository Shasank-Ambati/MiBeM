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
    "minutes": 13,
    "title": "Materials science essentials",
    "blurb": "Bonding, structure, defects, phase transformations, mechanical behaviour, processing and the experiments simulations are compared with.",
    "builds": [],
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
    "id": 16,
    "label": "COMP 101",
    "code": "COMP 101",
    "dept": "COMP",
    "level": 1,
    "slug": "programming-and-workflow",
    "short": "Programming and workflow",
    "part": "Computing",
    "tone": "b",
    "minutes": 11,
    "title": "Programming and workflow",
    "blurb": "The command line, Python for science, version control, running on clusters, reproducibility and testing your own code.",
    "builds": [],
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
    "id": 23,
    "label": "COMP 102",
    "code": "COMP 102",
    "dept": "COMP",
    "level": 1,
    "slug": "your-first-simulation",
    "short": "Your first simulation",
    "part": "Computing",
    "tone": "a",
    "minutes": 12,
    "title": "Your first simulation",
    "blurb": "Build a simulation from three ingredients, watch diffusion emerge from random walkers, and write the same thing in a few lines of Python.",
    "builds": [
      16,
      24
    ],
    "related": [],
    "takeaways": [
      "A simulation needs a description of the state, a rule for how it changes, and a loop that applies the rule step by step.",
      "Smaller time steps give more accurate answers at more cost; always check by changing the step.",
      "Diffusion emerges from random walkers: the spread grows as the square root of time, and D = a squared over 2 tau in one dimension.",
      "Checking against a known answer, changing the random seed and increasing the sample size are the first tests of any simulation.",
      "Everything in the computational methods courses is this same idea with better rules: atoms, energies, grids and probabilities."
    ]
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
    "minutes": 12,
    "title": "Crystal structures, supercells and periodic boundaries",
    "blurb": "Lattices, Miller indices, defects, building simulation cells and periodic boundary conditions.",
    "builds": [
      14,
      27
    ],
    "related": [],
    "takeaways": [
      "A crystal is a lattice plus a basis. Count atoms and neighbours to sanity-check a structure: fcc has 4 atoms per cubic cell and 12 neighbours, bcc has 2 and 8.",
      "Miller indices label planes and directions; the reciprocal lattice links real-space cells to diffraction and to k-point sampling.",
      "Defects are the subject of most simulations. Supercell size is a convergence parameter, and one vacancy in an N-atom cell is a concentration of 1/N.",
      "Periodic boundaries remove walls but make a defect interact with its own images; every cutoff must be smaller than half the box.",
      "Surfaces use slabs with vacuum; a grain boundary in a fully periodic cell always comes as a pair."
    ],
    "label": "MSE 201",
    "code": "MSE 201",
    "dept": "MSE",
    "level": 2
  },
  {
    "id": 15,
    "label": "COMP 201",
    "code": "COMP 201",
    "dept": "COMP",
    "level": 2,
    "slug": "numerical-methods-essentials",
    "short": "Numerical methods",
    "part": "Computing",
    "tone": "a",
    "minutes": 12,
    "title": "Numerical methods essentials",
    "blurb": "Floating point, error and stability, root finding and optimisation, linear algebra, integrators, discretisation and parallel scaling.",
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
      "Computers use finite-precision arithmetic: double precision keeps about 16 digits, and subtracting nearly equal numbers destroys most of them.",
      "Every numerical answer has modelling, discretisation, round-off and iteration error; convergence tests separate them.",
      "Stability and conditioning matter as much as accuracy: an explicit scheme can blow up, and an ill-conditioned problem amplifies small errors.",
      "Newton's method converges quadratically near a root; optimisers find local, not global, minima.",
      "Cost scaling decides what is feasible: dense linear algebra grows as N cubed, and Amdahl's law limits parallel speed-up."
    ]
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
    "minutes": 12,
    "title": "Statistical mechanics for simulation",
    "blurb": "Microstates, ensembles, the partition function, free energy, ergodicity and error bars.",
    "builds": [
      38,
      33,
      40
    ],
    "related": [],
    "takeaways": [
      "The Boltzmann distribution, p proportional to exp(-E/kT), underlies Metropolis Monte Carlo, thermostats and equilibrium defect concentrations.",
      "Pick the ensemble that matches what is held fixed: NVE, NVT, NPT or the grand canonical.",
      "Free energies, not energies, decide stability, and they need dedicated methods: thermodynamic integration, perturbation, umbrella sampling, the quasi-harmonic approximation.",
      "Classical simulation assumes equipartition, so it overestimates heat capacity when quantum modes are frozen out at low temperature.",
      "Quote averages with error bars. The correlation time sets the number of independent samples, and ergodicity is never guaranteed."
    ],
    "label": "PHYS 301",
    "code": "PHYS 301",
    "dept": "PHYS",
    "level": 3
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
    "minutes": 12,
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
      "Equilibrium means minimum Gibbs energy, equivalently equal chemical potentials. The common tangent gives phase compositions and the lever rule gives amounts.",
      "For a regular solution the miscibility gap closes at Tc = Omega/2R; the spinodal lies inside the binodal.",
      "CALPHAD fits a Gibbs energy model to every phase (Redlich-Kister terms, sublattices, magnetism) and stores the parameters in a database.",
      "It delivers equilibria, solidification paths and driving forces. It does not deliver kinetics or geometry.",
      "Database coverage limits accuracy, and multicomponent extrapolation from binary data needs checking."
    ],
    "label": "MSE 301",
    "code": "MSE 301",
    "dept": "MSE",
    "level": 3
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
      "COMP 201"
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
      "CMS 502",
      "LAB 502",
      "LAB 503",
      "CMS 503",
      "LAB 504",
      "CMS 504",
      "CMS 505",
      "CMS 506",
      "CMS 507"
    ]
  }
];
