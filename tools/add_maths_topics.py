#!/usr/bin/env python3
"""One-off helper: registers the twelve Maths course modules (M1-M12) in assets/topics.js.
Safe to re-run: existing entries with the same id are replaced, not duplicated."""
import json
from pathlib import Path

TOPICS_JS = Path(__file__).resolve().parent.parent / "assets" / "topics.js"
text = TOPICS_JS.read_text(encoding="utf-8")
head_end = text.index("window.MIBEM_TOPICS = ")
header = text[:head_end]
body = text[head_end + len("window.MIBEM_TOPICS = "):]
topics = json.loads(body[: body.rindex("];") + 1])

M = [
    (36, "M0", "maths-course-overview", "Course overview", "Maths course: overview and study plan",
     "How the twelve-module maths course is organised, three learning paths, how to study with the problems, a placement check, a notation guide and a one-page revision sheet.",
     [18], [12]),
    (24, "M1", "calculus-single-variable", "Calculus I", "Calculus I: functions of one variable",
     "Limits, derivatives, integrals and Taylor series, taught properly, with the harmonic approximation, Newton's method and Gaussian integrals as applications.",
     [19], [2, 15]),
    (25, "M2", "multivariable-calculus", "Calculus II", "Calculus II: several variables and optimisation",
     "Partial derivatives, the chain rule, gradients, Hessians, constrained optimisation with Lagrange multipliers, and multiple integrals.",
     [24], [4, 6]),
    (26, "M3", "vector-calculus", "Vector calculus", "Vector calculus: fields, fluxes and conservation laws",
     "Gradient, divergence, curl and Laplacian, line and surface integrals, the divergence theorem, and how they produce the continuity and diffusion equations.",
     [25], [8, 9]),
    (27, "M4", "linear-algebra-foundations", "Linear algebra I", "Linear algebra I: vectors, matrices and lattices",
     "Vectors, linear systems, matrix algebra, determinants, bases and coordinate changes, with crystal lattices as the running example.",
     [18], [2]),
    (28, "M5", "eigenvalues-and-decompositions", "Linear algebra II", "Linear algebra II: eigenvalues and decompositions",
     "Eigenvalues, diagonalisation, symmetric matrices, quadratic forms, definiteness, the SVD, and why they give vibrations, stability and principal components.",
     [27], [5, 11]),
    (29, "M6", "tensors-stress-and-strain", "Tensors", "Tensors: stress, strain and anisotropy",
     "Index notation, tensor transformation, stress and strain, principal values, von Mises stress, Hooke's law and crystal symmetry.",
     [28, 26], [2, 10]),
    (30, "M7", "ordinary-differential-equations", "ODEs", "Ordinary differential equations",
     "First-order and linear second-order equations, oscillators, systems and phase planes, stability, stiffness and time-stepping.",
     [24, 28], [6, 15]),
    (31, "M8", "fourier-analysis", "Fourier analysis", "Fourier series and transforms",
     "Complex exponentials, Fourier series, the transform, convolution, the discrete transform, and reciprocal space.",
     [24, 27], [2, 5]),
    (32, "M9", "partial-differential-equations", "PDEs", "Partial differential equations",
     "The diffusion, wave and Laplace equations: classification, boundary conditions, separation of variables, similarity solutions and Fourier methods.",
     [26, 30, 31], [8, 9, 10]),
    (33, "M10", "probability-for-simulation", "Probability", "Probability and distributions",
     "Random variables, expectation and variance, the key distributions, the central limit theorem, and the Boltzmann distribution.",
     [24], [3, 7]),
    (34, "M11", "statistics-and-data-fitting", "Statistics", "Statistics, error analysis and fitting",
     "Estimators, error bars and propagation, correlated samples, least squares, regression, regularisation and model comparison.",
     [33, 28], [7, 11]),
    (35, "M12", "calculus-of-variations-and-optimisation", "Variational methods", "Calculus of variations and optimisation",
     "Functionals, the Euler-Lagrange equation, functional derivatives, weak forms, and gradient-based and Newton-type optimisation.",
     [25, 30], [9, 10, 5]),
]

new = []
for id_, label, slug, short, title, blurb, builds, related in M:
    old = next((t for t in topics if t["id"] == id_), {})
    new.append({
        "id": id_, "label": label, "series": "maths", "slug": slug, "short": short,
        "part": "Maths course", "tone": "b" if int(label[1:]) % 2 == 0 else "a",
        "minutes": old.get("minutes", 30), "title": title, "blurb": blurb,
        "builds": builds, "related": related, "takeaways": old.get("takeaways", ["(to be written)"]),
    })

topics = [t for t in topics if t["id"] not in {n["id"] for n in new}]
at = max(i for i, t in enumerate(topics) if t["series"] == "start") + 1
topics[at:at] = new
TOPICS_JS.write_text(header + "window.MIBEM_TOPICS = " + json.dumps(topics, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
print(len(topics), "topics")
