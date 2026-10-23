"""A random walk in one dimension: the mean-square displacement grows linearly with the number of steps (diffusion)."""
import json, platform, sys, time
import numpy as np

def run(n_walkers=2000, n_steps=1000, seed=42):
    rng = np.random.default_rng(seed)                       # a recorded seed makes the run reproducible
    steps = rng.choice([-1, 1], size=(n_walkers, n_steps))
    x = np.cumsum(steps, axis=1)
    msd = (x.astype(float) ** 2).mean(axis=0)               # mean-square displacement after each step
    return msd

if __name__ == "__main__":
    t0 = time.time()
    n_walkers, n_steps, seed = 2000, 1000, 42
    msd = run(n_walkers, n_steps, seed)
    slope = np.polyfit(np.arange(1, n_steps + 1), msd, 1)[0]    # for a simple random walk the exact slope is 1
    np.savetxt("output/msd.csv", np.column_stack([np.arange(1, n_steps + 1), msd]), delimiter=",", header="step,msd", comments="")
    meta = {"script": "scripts/random_walk.py", "n_walkers": n_walkers, "n_steps": n_steps, "seed": seed, "slope": float(slope),
            "python": sys.version.split()[0], "numpy": np.__version__, "platform": platform.platform(), "seconds": round(time.time() - t0, 2)}
    json.dump(meta, open("output/run.json", "w"), indent=2)
    print("MSD slope = %.4f (exact value 1)" % slope)
