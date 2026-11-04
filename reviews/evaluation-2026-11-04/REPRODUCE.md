# Reproducing the evaluation of 4 November 2026

Every path and script below either exists in a fresh clone or is created by an earlier step. The results to compare against are in [`README.md`](README.md) and [`evidence/`](evidence/). [`VALIDATION-review-folder.md`](VALIDATION-review-folder.md) is the reviewer's original note, which refers to a private folder layout; it is kept as a record and is not needed here.

The reviewer ran the commands below with P 3.1.0.0 and .NET SDK 8.0.427 on Windows (PowerShell); the same commands run in a POSIX shell. Python 3 is needed for section 2 only. None of these steps builds the Java package, runs JUnit or replays a log in PObserve.

## 1. Clone and check out the evaluated revision

The runs used revision `4e20e5f948efff138a406355fbe6d113d5c9321b`. Check it out in a separate worktree, so that the copy is isolated from your own checkout:

```text
git clone https://github.com/perkusic/P-Language.git
cd P-Language
git worktree add --detach ../P-Language-4e20e5f 4e20e5f948efff138a406355fbe6d113d5c9321b
```

The executable tokens of every `.p` file at this revision are identical to those of the current kit, so running the same commands on the current `Projects/ProjectRobot2026/MobileRobots` is also meaningful; the steps below follow the evaluated revision.

Choose an empty output directory outside both worktrees; it is written `<out>` below.

## 2. Prepare the same-direction probe

The probe is a copy of the fleet project in which robot 2 also travels 0 → 1 → 2 and no `HumanRequester` is created. It does not implement a direction guard. [`prepare_probe.py`](prepare_probe.py) copies the `Projects/ProjectRobot2026` folder of the checkout that contains the script, so copy the script into the worktree of the evaluated revision and run it there. Do this before any compilation in the worktree (section 3), so that no build output is copied into the probe. It stops with an error if the copy already exists, and its assertion checks that the expected route line is present. From the root of your clone:

```text
mkdir ../P-Language-4e20e5f/reviews/evaluation-2026-11-04
cp reviews/evaluation-2026-11-04/prepare_probe.py ../P-Language-4e20e5f/reviews/evaluation-2026-11-04/
python ../P-Language-4e20e5f/reviews/evaluation-2026-11-04/prepare_probe.py
```

(In PowerShell, `Copy-Item` replaces `cp`; `mkdir` also works there.) The script creates `../P-Language-4e20e5f/reviews/evaluation-2026-11-04/validation/same-direction-no-human`.

## 3. Baseline runs

From `../P-Language-4e20e5f/Projects/ProjectRobot2026/MobileRobots`:

```text
p compile
p check -tc tcFleetTwoPhase -s 10000 --seed 2 --timeout 30 --outdir <out>/twophase-output
p check -tc tcFleetNaive -s 10000 --seed 2 --timeout 10 --outdir <out>/naive-output
p check -tc tcFleetSanctionFairness -s 10000 --seed 2 --timeout 10 --outdir <out>/fairness-output
```

From `../P-Language-4e20e5f/Projects/ProjectRobot2026/MobileRobots/pobserve/src/main`:

```text
p compile --mode pobserve
```

This only generates the Java classes.

## 4. Run the same-direction probe

From `../P-Language-4e20e5f/reviews/evaluation-2026-11-04/validation/same-direction-no-human/MobileRobots`:

```text
p compile
p check -tc tcFleetSanctionFairness -s 10000 --seed 2 --timeout 10 --outdir <out>/same-direction-output
```

## 5. Compare

Compare each console output with the matching `evidence/*-run.txt`, `evidence/*-compile.txt` and `evidence/pobserve-generation.txt`, and each `BugFinding` folder with the one under `evidence/`. With the same P version and seed, the failing schedule numbers (1 for naive, 5 for fairness, 17 for the probe) are expected to match; this was not re-checked by a second run. The timeouts are wall-clock, so the number of schedules explored by the two-phase run (2,659 in 30 s) will differ from machine to machine; it is not the 100,000-schedule acceptance run of E1.

To replay a saved counterexample, P provides `p check --replay <file>.schedule`, run in the same copy of the model; see `p check --help` for the exact options of your version. Replay was not run in this evaluation, so this step is not verified.

## 6. Clean up

```text
git worktree remove --force ../P-Language-4e20e5f
```
