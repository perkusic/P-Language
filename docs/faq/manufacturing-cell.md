# Student FAQ: Manufacturing cell

Questions and answers for the manufacturing cell project.

This FAQ explains the starter kit. The specification and assignment define the assessed work; this page adds no new requirements. Expected experimental results remain hypotheses until your team records evidence.

[Open the project specification](../projects/manufacturing-cell/index.html) · [P tutorial](../index.html) · [Choose a different FAQ](index.html)

## Getting started

### 1. Which document should I read first?

Read the [assignment](https://github.com/perkusic/P-Language/blob/main/Projects/ProjectManufacturingCell2026/ASSIGNMENT.md) for the goals and deliverables, then the
[instructions](https://github.com/perkusic/P-Language/blob/main/Projects/ProjectManufacturingCell2026/ManufacturingCell/INSTRUCTIONS.md) for setup and commands. Use `SPECIFICATION.md` or the rendered
specification for the concepts, assumptions and property catalogue. Section 8
of the specification is authoritative when the assignment summary differs.

The instructions are under `ManufacturingCell/`. Keep a record of the revision you use.

### 2. Do I need a GitHub account?

No account is needed to read or download the public repository. A local Git
repository supports commits and checkpoint tags without a GitHub account.
Follow your instructor's submission instructions; forking and proposing a
change on GitHub require an account.

### 3. Am I building a real robot controller?

The core task is to model and verify the **regulation layer** and check recorded
executions. Motion planning, robot hardware and physical safeguarding are
outside the starter models. A simulation or deployment platform may provide
logs for the run-time part, but it does not turn the P model into a physical
controller or a safety certification.

### 4. Must I implement Jason, Moise, CArtAgO or a BDI interpreter?

The P starter kits do not run those platforms or implement a BDI interpreter.
They use state machines to abstract externally visible behavior. Study the
platforms to understand the agent, environment and organization concepts;
implement a platform-based extension only when it is part of your chosen work.

## Agents, norms and adaptation

### 5. Why is this a multiagent system if a coordinator is centralized?

The domain agents pursue their tasks and interact through resource requests
and obligations. A multiagent system can have shared centralized services.
Autonomy concerns the choices an agent makes; it does not require every
component to be decentralized.

### 6. Is every P machine an agent?

No. `CellAgent` represents the AGV or the robot arm. `ResourceGuard` represents
an environment controller; `ObligationManager` and `AdaptationCoordinator`
represent organizational services; `Clock` represents infrastructure.
`HumanRequester` abstracts a person's participation. A machine is a modeling
construct, not automatically an autonomous software agent.

### 7. What is centralized and what is distributed?

The cell has one resource guard, one adaptation coordinator and one obligation manager. Admission, adaptation and sanctioning are centralized. The baseline does not model failure of those services.

### 8. What is the difference between regimentation and sanctioning?

Regimentation prevents a prohibited action through the controller: a guard
denies admission when the zone is closed or full. This relies on agents obeying
the access protocol. Sanctioning reacts to an unfulfilled obligation, such as
a job not reported by its deadline. A sanction resolves the obligation's
record; it does not complete the job.

### 9. Does a monitor stop a robot or block an admission?

No. The guard enforces admission. Monitors observe events and report property
violations. PObserve evaluates logs; a PObserve check of a log does not physically
stop, isolate or move equipment.

### 10. What do prepare, drain and commit mean?

For a requested closure, the affected guard stops granting new reservations,
waits for existing reservations to clear, acknowledges preparation and waits
for the commit. The coordinator commits after collecting acknowledgements.
The cell baseline has one guard, which blocks new requests while preparing a closure.
The protocol is a prepare–drain–commit barrier, not a full database two-phase
commit implementation with all its failure and recovery mechanisms.

### 11. Does commit mean that every guard has installed the new rules?

No. The coordinator announces the decision, sends commit messages and notifies
the requester. Different recipients can process these messages in different
orders. Under the two-phase policy, during a closure the affected guard denies requests in `AwaitCommit`,
so it remains blocked even if the person processes the notification before
that guard installs the new norm set. The person reacts to `eAdaptationDone`,
not to the monitor announcement. Under the naive policy (`twoPhase = false`),
there is no prepare phase: the guard can still admit agents under the old
version after notification. This is the failure E2 asks you to explain.

### 12. Does ENTER mean that a robot has physically crossed a boundary?

In the starter model, `eResourceEntered` records a reservation before the grant
is delivered. It is not a sensor-confirmed crossing. A physical realization
must reserve before entry. It releases resource 0 only after the AGV has fully
left it, or after all of the arm's moving parts have retracted outside it. The
fixed base never enters resource 0. A stopped pose inside is not a release.
See the [Section 6 event contract](../projects/manufacturing-cell/index.html#6-the-system-a-regulated-manufacturing-cell). Preparation acknowledgement inherits this assumption: an empty set
of reservations is not an independent sensor measurement.

### 13. What is the difference between safety and liveness?

A safety property rules out a forbidden event or state, such as conflicting
occupancy. A liveness property requires eventual progress, such as resolution
of an obligation. Blocking all admissions can protect an occupancy property
while preventing useful progress. Evaluate both, and state the assumptions
needed for each.

## Manufacturing cell

### 14. What exactly is resource 0?

It is the **shared transfer zone** around the material stand, with capacity 1
for agent reservations. It is not the whole cell or the arm's complete reachable
workspace. The fixed robot base and all retracted moving parts stay outside
that boundary. The stand and a stationary part are not counted as agents.
See Figures 1 and 14 and Section 6 of the cell specification.

### 15. How can the AGV and the arm exchange material if capacity is 1?

They use the zone in turn. The proposed physical interpretation is that the
AGV deposits material on a fixed stand and leaves completely before the arm
uses the zone. The baseline does not model direct loading onto an AGV that
remains inside, pallet handling or production precedence. Its two jobs are
abstract resource-use jobs.

### 16. Where does the AGV wait, and where is it charged?

It approaches from an external logistics route and waits outside resource 0.
The figure identifies that holding point. Battery charging, travel outside
the cell and detailed return routes are outside the model; the starter kit
does not choose or simulate a charging station.

### 17. Is the technician maintaining the robot arm?

The chosen scenario is intervention at the transfer stand or a misplaced part
inside resource 0. Maintenance of the robot itself is excluded. Adopting arm
maintenance would require reconsidering occupancy and intervention conditions,
rather than simply reusing the current exclusion property.

### 18. Is logical closure a physical lock-out/tag-out procedure?

No. The inherited lock-out names in the code refer to logical admission
closure. The model does not implement energy isolation, personal locks,
stored-energy control or verification of isolation. A physical stop also does
not prove that the transfer zone is empty or complete the drain.

### 19. Why do two technicians need an additional protocol?

Serializing changes does not record who still needs the zone closed. Without
additional state, one technician's reopening request can reopen it while the
other remains inside. E4 asks teams to analyze this and add S4 and a correction.
S4 concerns reopening with a person present; S1 additionally requires conflicting
agent reservation or human entry. Reopening alone is not an S1 event.

## Running experiments and interpreting evidence

### 20. Is a failed baseline test always a mistake in my setup?

No. The naive-policy test is intended to expose a safety or version-consistency violation (S1 or S2).
A compiler error or missing dependency is a tool or setup failure,
not evidence of the expected property violation. Read the assertion and trace.

### 21. What should I save for each run?

Record the source revision and local changes, exact command, tool versions,
scheduling strategy, seed, requested and completed schedule counts, time/step
limits and output. Save counterexample traces and replay information. Write
your prediction before running, then explain whether the observed result
supports or contradicts it.

### 22. Does “no bug found” prove correctness?

No. It reports no violation in the executions explored under that configuration
and those limits. Report the **completed** count, especially if a timeout
stopped the run. E1 requests 100,000 schedules; a shorter exploratory run does
not meet that acceptance target. Passing that target still does not establish
physical safety or correctness for every possible configuration.

### 23. Why must I test a monitor with a mutant?

A passing monitor may never have observed a relevant event or may fail to
express the intended property. A deliberately faulty model or log provides
a case that should fail. Explain which assertion detects it and report event
coverage for passing runs. Do not weaken an assertion just to make a test pass.

### 24. Can L1 hold even if no job succeeds?

Yes. `EveryObligationResolved` accepts fulfillment **or sanction**. The starter
clock emits a final far-future tick that causes every open obligation to be
sanctioned, provided the obligation manager processes it. L1 can therefore
hold without a successful job; it is not evidence of task completion
([Section 5.11](../projects/manufacturing-cell/index.html#511-sanity-and-vacuity-checks)).
R1 checks the deadline bound on logs. Successful job counts, waiting times
and sanction counts are separate measures.

### 25. What does R3 establish, and what does S2 establish?

R3 checks that human entry follows a committed closure of that resource; it
does not check emptiness. In the unchanged starter model, the person waits for
`eAdaptationDone`, so R3 holds by construction. Logs can expose procedure
bypass, and a requester that enters without waiting is a useful mutant
([Section 5.11](../projects/manufacturing-cell/index.html#511-sanity-and-vacuity-checks)). S1 checks conflicting occupancy, using agent reservations and recorded human presence.
S2 checks sequential commits and admission against the last committed closed
set. It does not observe installation at each guard or reject every use of an
older version as a general rule. This baseline has a single guard: closing or
reopening resource 0 affects that guard. No other guard keeps serving an open
zone under an older version.

### 26. How are L2, L3 and R2 different?

L2 requires an adaptation to commit. L3 allows it to terminate by commit or
explicit abort. R2 checks termination within a configured number of logged
ticks and accepts an abort as termination. An abort can therefore satisfy
L3 and R2 without satisfying L2. Abort handling is an experiment to implement,
not an existing recovery feature of the baseline coordinator.

The cell assignment requires calibration of R2 over the whole start-to-commit
interval, including protocol delay; with an abort extension, also account for
start-to-abort time. Explain why an observed maximum is not a universal bound. Finite logs ending before a bound expires remain inconclusive
about the missing future response.

### 27. Is the Python simulator equivalent to PObserve?

No. `simulate_logs.py --check` generates synthetic events and evaluates a
Python mirror of selected monitors. P checks the P model and specifications;
PObserve checks parsed logs against generated monitors. Report each result
under the tool that actually produced it. Generating Java classes with
`p compile --mode pobserve` is not a Java build, a JUnit run or a PObserve replay.

### 28. What if PObserve reports a violation on a real or simulated log?

Check both the system behavior and the recording: event meanings, required
fields, partition key, completeness and ordering. A premature `LEAVE` can hide
a real conflict; a missing `LEAVE` can create an apparent one. Clock skew can
change the order of events from different sources. Keep the original log and
explain the evidence for a system fault versus a logging defect.

## Scope and submission

### 29. Must I implement every experiment and optional extension?

Follow the requirements and work plan of your chosen specification. Experiment numbers identify the changes in this project. Do not treat the
presence of a proposed extension, such as JaCaMo instrumentation
or separating grants from confirmed crossings and exits, as proof that it is implemented or automatically compulsory.
State which extensions you chose and what you verified.

### 30. What makes a convincing report and presentation?

Connect each claim to a norm, a property, a run and its evidence. Explain a
counterexample in event order, identify its root cause and compare the behavior
before and after your change. Distinguish model checking from log monitoring,
sanction resolution from task completion, and declared assumptions from
verified results. Include limitations and each member's contribution, following
the deliverable format and rubric in your specification.

## Where to find the detailed answers

- [Physical scenario and event contract: Section 6](../projects/manufacturing-cell/index.html#6-the-system-a-regulated-manufacturing-cell)
- [Monitors and experiments: Section 7](../projects/manufacturing-cell/index.html#7-technical-specification)
- [Deliverables and grading: Section 8](../projects/manufacturing-cell/index.html#8-work-plan-and-deliverables)
