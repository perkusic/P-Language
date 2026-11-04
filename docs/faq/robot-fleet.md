# Student FAQ: Mobile robot fleet

Questions and answers for the mobile robot fleet project.

This FAQ explains the starter kit. The specification and assignment define the assessed work; this page adds no new requirements. Expected experimental results remain hypotheses until your team records evidence.

[Open the project specification](../projects/robot-fleet/index.html) · [P tutorial](../index.html) · [Choose a different FAQ](index.html)

## Getting started

### 1. Which document should I read first?

Read the [assignment](https://github.com/perkusic/P-Language/blob/main/Projects/ProjectRobot2026/ASSIGNMENT.md) for the goals and deliverables, then the
[instructions](https://github.com/perkusic/P-Language/blob/main/Projects/ProjectRobot2026/MobileRobots/INSTRUCTIONS.md) for setup and commands. Use `SPECIFICATION.md` or the rendered
specification for the concepts, assumptions and property catalogue. Section 8
of the specification is authoritative when the assignment summary differs.

The instructions are under `MobileRobots/`. Keep a record of the revision you use.

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

No. `Robot` represents a domain agent. `ResourceGuard` represents
an environment controller; `ObligationManager` and `AdaptationCoordinator`
represent organizational services; `Clock` represents infrastructure.
`HumanRequester` abstracts a person's participation. A machine is a modeling
construct, not automatically an autonomous software agent.

### 7. What is centralized and what is distributed?

The fleet has one guard per corridor zone, so admission decisions are distributed across three guards. One adaptation coordinator and one obligation manager make adaptation and sanctioning centralized. The baseline does not model failure of those services.

### 8. What is the difference between regimentation and sanctioning?

Regimentation prevents a prohibited action through the controller: a guard
denies admission when the zone is closed or full. This relies on agents obeying
the access protocol. Sanctioning reacts to an unfulfilled obligation, such as
a delivery not reported by its deadline. A sanction resolves the obligation's
record; it does not complete the delivery.

### 9. Does a monitor stop a robot or block an admission?

No. The guard enforces admission. Monitors observe events and report property
violations. PObserve evaluates logs; a PObserve check of a log does not physically
stop, isolate or move equipment.

### 10. What do prepare, drain and commit mean?

For a requested closure, the affected guard stops granting new reservations,
waits for existing reservations to clear, acknowledges preparation and waits
for the commit. The coordinator commits after collecting acknowledgements.
In the fleet, unaffected guards acknowledge and continue serving requests.
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
must reserve before entry and release only after the whole robot has cleared
the zone. Preparation acknowledgement inherits this assumption: an empty set
of reservations is not an independent sensor measurement.

### 13. What is the difference between safety and liveness?

A safety property rules out a forbidden event or state, such as conflicting
occupancy. A liveness property requires eventual progress, such as resolution
of an obligation. Blocking all admissions can protect an occupancy property
while preventing useful progress. Evaluate both, and state the assumptions
needed for each.

## Mobile robot fleet

### 14. Where do the robots start and where do they go?

Both start outside the corridor. Robot 1 enters through zone 0 and follows
0 → 1 → 2; robot 2 enters through zone 2 and follows 2 → 1 → 0. Stations A and B
provide physical context in Figure 1. Loading, batteries and return trips are
not modeled. Each robot receives one delivery in the P baseline; the Python
simulator can generate repeated jobs.

### 15. Can one robot hold reservations for two zones?

Yes. It obtains the next zone before releasing the previous one. In a physical
realization, both reservations must remain valid throughout the boundary
crossing. The P model abstracts the traversal and sends release on receipt of
the next grant; interpreting that as physical clearance requires the event
contract in Section 6.

### 16. Where does a robot park after three denials?

The baseline assumes a free side bay reachable from its current zone without
entering another corridor zone. Parking is represented only by releasing the
zone; bay capacity, maneuvering and re-entry are not implemented. If the robot
has not entered the corridor, it remains outside. E10 proposes replacing the
bay assumption with explicit finite resources.

### 17. Are three denials the same as waiting three ticks?

No. The robot immediately retries after a denial until its retry limit.
There is no programmed wait between those requests. Scheduling determines
which other events occur between them. Do not infer elapsed physical time
from the number of denials.

### 18. Why can a head-on encounter block a closure?

A robot can hold zone 1 while requesting zone 2, while the other robot holds
zone 2 and requests zone 1. Draining zone 1 then depends on an exit, such as
the assumed side bay. The bounded abandonment policy provides such an exit
in the baseline. E5 removes parking to investigate indefinite waiting.

### 19. Does one travel direction at a time eliminate all traffic problems?

It targets head-on encounters. Robots traveling in the same direction can
still compete for a zone or wait at the entrance, and three immediate denials
can lead to abandonment. E6 must distinguish the traffic cases it eliminates
from those that remain. Broader goals need an additional admission, service
or waiting policy and evidence for that policy.

### 20. What does sanction fairness mean here?

The specification defines sanction fairness as the property that an agent is
sanctioned only for its own non-compliance, not for being blocked by regulation or traffic
([Section 3.9](../projects/robot-fleet/index.html#39-conditions-for-a-fair-sanction)).
This is a property to investigate, not a guarantee provided by the starter
kit. The starter-kit F1 test is expected to fail; its failure flags a candidate
for analysis rather than proving that a sanction was unfair.
The required cause-aware F1 monitor must distinguish regulation-caused from
traffic-caused cases. State how your monitor approximates this definition and
what it cannot observe; a flagged case alone does not establish causal blame.

The project uses *sanction fairness* (Portuguese: **equidade das sanções**).
The literature also uses *justice* for broader normative principles.

### 21. Does an F1 failure prove that a sanction was unfair?

No. The starter-kit F1 monitor flags a sanction observed **after abandonment of
the same obligation following repeated denials**. It does not establish why
access was denied, that the denials caused the missed deadline, or that the
robot could not have complied. It also misses the reverse event order. Treat
the result as a candidate for analysis, record causes and refine the monitor
as required by the assignment. This is separate from scheduler fairness.

## Running experiments and interpreting evidence

### 22. Is a failed baseline test always a mistake in my setup?

No. The naive-policy test is intended to expose a safety or version-consistency violation (S1 or S2);
the fleet's starter-kit sanction-fairness test is intended to expose an F1
violation. A compiler error or missing dependency is a tool or setup failure,
not evidence of the expected property violation. Read the assertion and trace.

### 23. What should I save for each run?

Record the source revision and local changes, exact command, tool versions,
scheduling strategy, seed, requested and completed schedule counts, time/step
limits and output. Save counterexample traces and replay information. Write
your prediction before running, then explain whether the observed result
supports or contradicts it.

### 24. Does “no bug found” prove correctness?

No. It reports no violation in the executions explored under that configuration
and those limits. Report the **completed** count, especially if a timeout
stopped the run. E1 requests 100,000 schedules; a shorter exploratory run does
not meet that acceptance target. Passing that target still does not establish
physical safety or correctness for every possible configuration.

### 25. Why must I test a monitor with a mutant?

A passing monitor may never have observed a relevant event or may fail to
express the intended property. A deliberately faulty model or log provides
a case that should fail. Explain which assertion detects it and report event
coverage for passing runs. Do not weaken an assertion just to make a test pass.

### 26. Can L1 hold even if no delivery succeeds?

Yes. `EveryObligationResolved` accepts fulfillment **or sanction**. The starter
clock emits a final far-future tick that causes every open obligation to be
sanctioned, provided the obligation manager processes it. L1 can therefore
hold without a successful delivery; it is not evidence of task completion
([Section 5.11](../projects/robot-fleet/index.html#511-vacuity-and-sanity-checks)).
R1 checks the deadline bound on logs. Successful delivery counts, waiting times
and sanction counts are separate measures.

### 27. What does R3 establish, and what does S2 establish?

R3 checks that human entry follows a committed closure of that resource; it
does not check emptiness. In the unchanged starter model, the person waits for
`eAdaptationDone`, so R3 holds by construction. Logs can expose procedure
bypass, and a requester that enters without waiting is a useful mutant
([Section 5.11](../projects/robot-fleet/index.html#511-vacuity-and-sanity-checks)). S1 checks conflicting occupancy, using agent reservations and recorded human presence.
S2 checks sequential commits and admission against the last committed closed
set. It does not observe installation at each guard or reject every use of an
older version: an unaffected guard can legitimately serve an open zone under
its previous version.

### 28. How are L2, L3 and R2 different?

L2 requires an adaptation to commit. L3 allows it to terminate by commit or
explicit abort. R2 checks termination within a configured number of logged
ticks and accepts an abort as termination. An abort can therefore satisfy
L3 and R2 without satisfying L2. Abort handling is an experiment to implement,
not an existing recovery feature of the baseline coordinator.

The starter R2 threshold of five ticks is a design choice, not a universal
bound. If you change it or make claims about R2 on your own logs, state the
value and the evidence supporting your claim. This FAQ adds no separate
calibration deliverable to the fleet assignment. Finite logs ending before a bound expires remain inconclusive
about the missing future response.

### 29. Is the Python simulator equivalent to PObserve?

No. `simulate_logs.py --check` generates synthetic events and evaluates a
Python mirror of selected monitors. P checks the P model and specifications;
PObserve checks parsed logs against generated monitors. Report each result
under the tool that actually produced it. Generating Java classes with
`p compile --mode pobserve` is not a Java build, a JUnit run or a PObserve replay.

### 30. What if PObserve reports a violation on a real or simulated log?

Check both the system behavior and the recording: event meanings, required
fields, partition key, completeness and ordering. A premature `LEAVE` can hide
a real conflict; a missing `LEAVE` can create an apparent one. Clock skew can
change the order of events from different sources. Keep the original log and
explain the evidence for a system fault versus a logging defect.

## Scope and submission

### 31. Must I implement every experiment and optional extension?

Follow the requirements and work plan of your chosen specification. Experiment numbers identify the changes in this project. Do not treat the
presence of a proposed extension, such as finite bays, ROS 2 instrumentation
or refinement checking against an abstract centralized regulator, as proof that
it is implemented or automatically compulsory. That regulator comparison is
a stretch goal; implementing the refined, cause-aware F1 monitor is required.
State which extensions you chose and what you verified.

### 32. What makes a convincing report and presentation?

Connect each claim to a norm, a property, a run and its evidence. Explain a
counterexample in event order, identify its root cause and compare the behavior
before and after your change. Distinguish model checking from log monitoring,
sanction resolution from task completion, and declared assumptions from
verified results. Include limitations and each member's contribution, following
the deliverable format and rubric in your specification.

## Where to find the detailed answers

- [Physical scenario and event contract: Section 6](../projects/robot-fleet/index.html#6-the-system-robots-in-a-shared-corridor)
- [Monitors and experiments: Section 7](../projects/robot-fleet/index.html#7-technical-specification)
- [Deliverables and grading: Section 8](../projects/robot-fleet/index.html#8-work-plan-and-deliverables)
