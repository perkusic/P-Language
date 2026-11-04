# Independent evaluation, 4 November 2026 — robot fleet

Run by the Codex during the joint review of the robot fleet (`reviews/robot-review-2026-11-04`, kept outside the repository). This folder holds the verbatim tool output of those runs, so that the results cited in the fleet's validation record can be checked.

- **Source revision:** `4e20e5f948efff138a406355fbe6d113d5c9321b` (`main`), before the documentation corrections of the review. The corrections changed only comments and documentation: the executable tokens of every `.p` file are identical, so these results apply to the corrected kit as well.
- **Environment:** P 3.1.0.0, .NET SDK 8.0.427, OpenJDK 17.0.20+8 (Microsoft), Python 3.14.4, Windows. Gradle was not on the `PATH`.
- **Strategy:** random, seed 2, default step bounds of P 3.1.0.0. Timeouts are wall-clock, so another run may explore a different number of schedules.

## Results

| Run | Command (from `MobileRobots`) | Result | Evidence |
|---|---|---|---|
| Compile | `p compile` | succeeds, 0 warnings, 0 errors; includes the L3 monitor and the S1, L2 and R2 corrections added after 21 October | `evidence/baseline-compile.txt` |
| Two-phase (E1) | `p check -tc tcFleetTwoPhase -s 10000 --seed 2 --timeout 30` | no bug in 2,659 schedules (30.02 s); not the 100,000-schedule acceptance run of E1 | `evidence/twophase-run.txt`, `evidence/twophase-output/` |
| Naive (E2) | `p check -tc tcFleetNaive -s 10000 --seed 2 --timeout 10` | S2 fails on schedule 1: agent 1 admitted to zone 1, closed by committed norm set v1, guard still on v0 | `evidence/naive-run.txt`, `evidence/naive-output/` |
| Fairness (E3) | `p check -tc tcFleetSanctionFairness -s 10000 --seed 2 --timeout 10` | F1 fails on schedule 5: obligation 0 of robot 1 sanctioned after it was abandoned | `evidence/fairness-run.txt`, `evidence/fairness-output/` |
| Same-direction probe | as above, on a copy where robot 2 also travels 0 → 1 → 2 and no `HumanRequester` is created (`prepare_probe.py`) | F1 fails on schedule 17, with no closure and no head-on conflict | `evidence/same-direction-run.txt`, `evidence/same-direction-output/`, `evidence/probe-compile.txt` |
| PObserve generation | `p compile --mode pobserve` (in `pobserve/src/main`) | Java classes generated; this is not a Java build, JUnit run or PObserve replay | `evidence/pobserve-generation.txt` |

## Not run

Java/Gradle build, JUnit, PObserve replay, the 100,000-schedule acceptance run of E1, the extensions E4–E10, physical tests. Replaying a counterexample requires `p check --replay <file>.schedule` on the same model; the replay was not run.

## Reproducing

[`REPRODUCE.md`](REPRODUCE.md) gives the steps from a fresh clone: an isolated worktree at the evaluated revision, the baseline runs, and the probe built with [`prepare_probe.py`](prepare_probe.py). [`VALIDATION-review-folder.md`](VALIDATION-review-folder.md) is the reviewer's original note; it refers to files of the private review folder that are not in the repository and is kept as a record only.
