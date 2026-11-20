# S04E05 · Building Self-Improving Engineering Systems

> **This lesson is extended.** It has two parts. This part has John's video and explains the principles of building self-improving engineering systems. The [Build guide](https://hq.mega.dev/lessons/s04e05/build-guide/) is the written version of what John builds in the video, step by step, with the prompts and the checks for each job. On this page, the notes that start with "In John's build" link each principle to its build.

Generative artificial intelligence can build almost anything we ask for. Agents can also figure out what to build simply by looking at their environment and available resources. This lets them recover from errors, fix bugs, and even improve themselves. And when the system is built the right way, they can modify their own logic, apply the changes and even revert them if something goes wrong. This also means that in a proper setup, agents build not only tools they can use, but also **entire features and modules**.

This concept can be applied in many ways, including a very simple mechanism we can apply to our coding agents, basic cron scripts or simple background services powered by AI. We may say **it is a way of thinking**, but it is also a set of habits and patterns we can follow to change the way we work. Instead of directly focusing on **how to do things**, more often we may think about **how to build things that do things.**

In this last lesson of MEGA, we'll focus on exploring the concept of **self-improving autonomous systems** and how we can apply their elements both to daily work and to developing such systems.

## Outline

- Feedback: traces, failures, corrections, evaluations, review findings, human decisions
- Evaluation: proof ladders, baselines, validators, regression checks, versioned results
- Distillation: turning successful runs into skills, rules, workflows, context, reusable agents
- Optimization: refining profiles, routing, tools, environments, model selection based on observed outcomes
- Governance: proposing, testing, approving, versioning, rolling back system changes

## Feedback

Self-improvement requires us to **close the loop**. A system has to work out, on its own, both **the initial inputs** (what needs to be done) and **the feedback** (how well it did). That sounds obvious, but it isn't easy in practice. Almost nobody works this way. By default, we handle both ourselves. Even in classic automation, the inputs and the feedback are mostly known upfront, while here things are dynamic and hard to predict. This brings us back to the concept of **incremental improvements** to the entire system and its environment, rather than an attempt to build everything upfront. 

The loop below shows how feedback closes the cycle and **can start another iteration**, which is why it matters so much. It's not only about whether feedback is present, but also about **its quality**: **a high signal-to-noise ratio**, **truthfulness**, **completeness**, **timeliness**, and **availability**. And all of this needs to be achieved autonomously and dynamically, keeping human involvement minimal.

![A feedback loop drawn as a rectangle inside a frame named "Autonomous system". Four boxes go clockwise. "Find work" (what needs to be done?) sends "input" to "Act" (make a bounded change). "Act" sends its "result" down to "Check the result" (how well did it work?). Two red arrows close the loop. "Check the result" sends "feedback" left to "Choose the next step" (use the evidence). "Choose the next step" goes up to "Find work" with the label "may start another iteration". In the center, a red heading, "Useful feedback", lists five qualities: high signal-to-noise ratio, truthfulness, completeness, timeliness and availability. A line under the frame reads: "Improve the system and its environment, one small step at a time." No person and no external task are part of the loop.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-1/frame.html)

In one of her [recent presentations](https://youtu.be/O_zcc6Xl12g?t=744), Lauren Tan mentioned a list of **well-known software testing, validation, and observability techniques** that can be used to **increase trust in agents**. Many of them, if not all, can provide high-quality feedback for agents. Some can even **prevent them** from making certain types of errors, while others simply **tell them what's wrong** so they can figure out what to do.

![A map of software testing in four equal columns, read left to right. The first column, under a grey "Pre-production" span, lists twenty checks, from unit tests to performance tests. A red "Testing in production" span covers the other three columns, which are labeled Deploy, Release and Post release. Deploy lists integration tests, tap compare, load tests, shadowing, config tests and soak tests. Release lists canarying, monitoring, traffic shaping, feature flagging and exception tracking. Post release lists eleven practices, from teeing to on-call experience. Verification continues after deploy.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-2/frame.html)

For Lauren’s team, these activities account for roughly 70% of their coding token usage and aim to build trust in agents. This helps her team deliver up to 11,000 PRs a month while not only maintaining quality but even improving it. Addy Osmani shares a similar perspective in his article "[How the Claude Code team thinks about verification](https://x.com/addyosmani/status/2122590683055993308)".

Most of the techniques above focus on **the codebase** and some aspects of a product. At the same time, they reflect a **way of thinking** about non-deterministic systems that can also be applied to self-improving autonomous agents. In these systems, verification and feedback can come directly from the environment at runtime. The system then needs a way to **self-reflect**, implement and **apply** changes, and **continue working**. If anything goes wrong, it needs a way to roll back those changes and recover. 

At this point, we already know all the patterns and tools needed to build a simple system capable of doing such things, as demonstrated by the **[self-change](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/self-change)** agent. After a run, we'll see a visualization in the browser showing the logic the agent uses to handle tasks.

If something goes wrong, the agent modifies itself by **rewriting its routing rule and restarting its own process**. But the new rule is only a proposal: a fixed check outside the agent's control must pass before it becomes active. In the example run, the agent's first rule fails because it leaves ordinary tickets without a queue, so the previous rule stays in use. The agent reads the failure, corrects the rule and restarts again. When the checks pass, it continues the same job with the new logic.

The conversation and the action log survive on disk, and receipts prevent tickets from being routed twice. Both **a planned restart** and **a crash** use the same recovery path, so changing the agent does not mean losing its work.

![A timeline with four rows: Rule in use, Fixed check, Agent and Log on disk. On the Agent row, three process bars follow each other, with a dotted restart gap between them. The restart label sits under each gap. A grey proposal line goes up from the first process and stops at the dashed check line: Rejected, a ticket gets no queue. The rule line stays the current rule. A red proposal line goes up from the second process, crosses the check line (Accepted, every ticket gets a queue) and reaches the rule row, where the red corrected rule starts. One log line runs under all three processes, and the second and third processes each read the log.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-3/frame.html)

Another example of a self-evolving architecture comes from [A Programming Paradigm for Spatiotemporal Composability](https://arxiv.org/pdf/2608.25512), by researchers from Peking University and DeepSeek. Unlike our self-change agent, it does not restart the process. It swaps a single part of the system while the rest keeps running. Every change a part makes to the system is recorded together with a way to undo it, so when the part is removed or replaced, its effects are fully reverted. The paper names one target, agents that rewrite their own harness components, but it tests the idea on plugins, not on agents. It also does not check a new part before it is used. That is exactly the job of the fixed check in our example. Combined, the two ideas give a system that can change parts of itself at runtime, reject bad changes, and cleanly undo the ones it already made.

![A timeline in three rows. Row one, System: one grey bar with no gap, labeled "no restart". Row two, One part: an "Old part" bar ends at the middle, a dotted "swap" gap follows, and a "New part" bar starts. A dashed vertical line in the gap is labeled "Fixed check, from our example". A grey arrow labeled "part removed" goes down from the end of the old part to row three, Record. On the record line, three dots under the old part and three dots under the new part are each labeled "changes recorded". A red arrow under the line points back under the dots of the old part, labeled "its changes are undone".](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-4/frame.html)

Both strategies aim for similar objectives, but they differ in many ways, both in implementation and in what they make possible. At the same time, they're driven by shared principles such as **durability**, **primitive-based architecture**, **self-healing** and **self-reflection**. Lastly, we also have the feedback that both systems need to tell whether the introduced changes improved them or not. 

The idea of self-improving autonomous agentic systems brings new possibilities, but also challenges. On the one hand, a feature you need can be built on the fly. On the other, how do you make it reliable, secure and scalable? For some parts of that question, the answers come down to strict types, well-thought-out primitives and observability. For others, there are no clear answers yet. But we won't always need them right away, because self-evolution may apply to small background services that work within a limited scope. We can easily control those services while still giving them space to adjust themselves dynamically.

**In John's build:** every visit to the front desk leaves a receipt: how long it took, what it cost, how much came from the cache, and whether the reply matched the saved record. A request the desk can't do becomes one line on a list for a person, written by code. Then the visits become checks that can run again, with a Saved line that reads the app's own records instead of the desk's words. A desk broken on purpose, polite but saving nothing, fails them. See [Open a Front Desk for Visiting Agents](https://hq.mega.dev/lessons/s04e05/build-guide/#open-a-front-desk-for-visiting-agents).

## Evaluation

In **S02E05** we discussed observability and evals, and even though agents handled them to some extent, we still had to be involved at many stages. But now we're aiming to push this further toward autonomy. That doesn't necessarily mean we're out of the picture entirely, but our role shifts to wherever we're needed, whether that's tiny details or high-level direction. 

One of the principles we may want to consider is **to separate** the evaluator from the system. There are at least a few reasons for this: 

- **Scope:** an evaluator may look at more than one system, to see how well they work within a broader structure the system itself may not be aware of.
- **Permissions:** evaluation may require access to context, tools or services the system itself can't get access to. 
- **Independence:** a system cannot change the checks to make them pass, and the risk of other types of cheating is lower.
- **Control:** a separate evaluator can run on its own schedule, budget and configuration.

![An example support ticket follows one path with four points: ticket arrives, routed to billing, answer sent, and, after a dotted gap marked "days later", ticket reopened in red. Above the path, two short spans show what each system sees. The ticket router covers the first part and the reply drafter covers the second part. Each one reports "done". No span reaches the last point. Under a dashed boundary that the systems cannot reach or change, one long red span for the evaluator runs under all four points. It sees the whole path and gives the verdict "not solved". The ticket and all labels are an example.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-5/frame.html)

The evaluator (or "Judge") can use deterministic logic to verify certain aspects of our system against strict rules. The evaluator can also be another agent that specializes in observing and evaluating, and even in **generating** datasets and evals. We can define and curate some of the checks upfront, so that the agent cannot modify them.

Now, if we go back to the **Specter** agent from **S04E01**, we can place a Judge right next to it: a separate agent that runs every night. The Judge reads Specter's log and notes and turns them into datasets. For example: which actions woke the agent up and whether that was the right call, which notes were written and from which sources, and which emails were sent and what we did with them.

On top of that, there are things we define ourselves and keep fixed, such as **checks in code** (allowed paths, trusted sources, one email per send key) and datasets for crashes and prompt injection.

![Two frames side by side, Specter on the left and Judge on the right, with four rows that line up. Four horizontal arrows between the frames change direction from row to row. Row one: Specter "Runs" sends "log and notes" to the Judge, which "Builds datasets". Row two: the Judge "Scores the runs" and sends a "finding" back to Specter, "Gets a finding". Row three: Specter "Proposes a change" and sends a "proposal" to the Judge, which "Runs a trial" by replaying the saved actions. Row four: the Judge "Decides" and sends the red "verdict", keep or roll back, to Specter, "Rule in use". Under the Judge frame is a dashed box, "Fixed by us": checks, crash set, injection set. A short arrow goes from this box up to the Judge. A note beside the box says "no agent can change this part". The finding (woke up for small edits) and the change (a new wake instruction) are examples.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-6/frame.html)

With all this in place, the loop can close without us. The Judge may find, for example, that Specter woke up many times for small edits and that its actions were inefficient. Specter can then read these findings and propose a change to the instruction that decides when it wakes up. Then the Judge replays the saved actions against the new version. The change becomes active only if the score improves and no fixed check fails. Otherwise, the previous version stays in use.

The Judge may soon grow into a separate system that manages the rest of our infrastructure, our agents, and how they cooperate. At the same time, we want to avoid overcomplicating it, and we already have an answer for that: **good primitives**, such as:

- **Revision:** one exact, hashed state of a system: its instructions, skills, hooks and settings. Every change creates a new Revision, and only one is active. 
- **Case:** one recorded situation that can be replayed, such as a user action together with the context from that moment. A Case comes from the system's own journal or is delivered by us.
- **Check:** one question about a result, with one way to answer it: a rule in code, a model, or a real outcome observed later. 
- **Trial:** one bounded run that replays a set of Cases against a Revision  and applies the Checks.
- **Verdict:** the Judge's decision about a Revision compared with the active one, always with evidence: keep, roll back, or ask a person.

Together they read almost like a sentence: a **Trial** replays **Cases** against a **Revision**, **Checks** score the result, and a **Verdict** decides. For another system, only the Cases and the Revision change. And the architecture looks as follows: 

![Architecture of a Judge built from five primitives, using the Specter agent as an example. On the left, a frame named Specter holds three example boxes: Active revision (wake rule in use), Journal (actions, notes, emails) and Proposal (a new wake rule, dashed). On the right, a frame named Judge holds Checks (code or a model), Cases (saved situations) and Revision (an exact version). Each of the three has an arrow into one tall Trial box (bounded run), and Trial has an arrow to Verdict (keep or roll back). An arrow labeled replayed goes from the Specter frame to the Judge frame at the height of Journal and Cases. An arrow labelled tested goes from the Specter frame to the Judge frame at the height of Proposal and Revision. One red path labelled verdict leaves the top of Verdict and goes back to the top of the Specter frame. Under the Judge, a dashed box We (fix some checks and cases) has an arrow up into the Judge. Under Specter a note says: another system: only this side changes. The texts in the Specter frame are examples. Conclusion: A Judge needs five things: checks, cases, a revision, a trial and a verdict. For another system, only the cases and the revision change.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-7/frame.html)

In practice, we may want to have **more than one Judge**. And since Judges are just agents, we can follow the same multi-agent patterns we discussed in **S02E04**, such as using multiple models for verification and idea generation.

**In John's build:** the evaluator is kept apart from the agent it judges. A few sealed cases live in a folder outside the project, and the agent making changes is started so that the computer refuses it that folder. Results come back as one bare line per case. A Git hook runs an agent's everyday checks and sealed cases after every commit or merge that touches it, and says so out loud if the sealed cases could not run. See [Seal the Cases and Run Them Unasked](https://hq.mega.dev/lessons/s04e05/build-guide/#seal-the-cases-and-run-them-unasked).

## Distillation

Autonomous background agents that work with minimal human supervision in dynamic environments can perform activities that could be optimized or even handled by deterministic logic. In some cases, it's even wise to create a new agent that specializes in tasks the original agent struggled with. The problem is that a human may never discover any of this, and agents may never act on it, unless we explicitly ask for it and prepare the environment for it.

In AI, distillation usually means using one model, often a smarter one, to train another that is smaller, more efficient, and more specialized. The same idea works for autonomous systems too: we can distill their activities to optimize the systems in many respects. 

Here again, we should immediately see how many topics from MEGA come into play. For example: **memory** (**S02E01**) and facts extracted from interactions; **skills** (**S02E02** / **S02E03**) that can help with repetitive work, not only through instructions but also through scripts and packages, and primitives such as **Journal** (Specter's log), which records agents' activities and lets us reflect on them. 

Again, a good example is our **Specter** agent and the log of its activities, where many entries repeat over time. Some of them relate to a specific category of sources or documents, and through distillation the agent can "learn" how to handle them better. But it isn't only about extracting a skill or a script. Distillation can be an ongoing process that covers not only **extracting** new capabilities but also **reshaping** the ones that already exist. This way, the system may notice **repetitive patterns** across its own skills and turn them into **a template** or **a component** that is reused across a range of Specter's activities. And once such a template exists, a single change to it can reach everything built on it, which is why a change to it needs a stricter review than one new skill does.

![A vertical timeline of Specter's job (the user saves a source, Specter writes a note) at four stations: at first, weeks later, months later, later still. At each station a grid shows who does each of four steps (fetch, extract, file, connect) for papers, repositories and articles: a red dot means the model does it, a hollow grey circle means a script does it. At first, the model does all steps. Weeks later, a skill and a script take over fetch, extract and file for papers, and a thin frame marks that one row as a reusable piece. Months later, one template takes over those steps for all three types, and the frame holds all three rows. Later still, the template changes, and a new row, old notes, gets a script for the file step outside the frame. Connect stays with the model at every station. Specter decides after a trial, then the Judge decides, then a person decides. The source types and steps are examples.](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e05/artifacts/lesson/figure-8/frame.html)

The core idea is to use observability for more than reacting to issues or making simple tweaks. It should drive advanced optimization that can even lead to the growth of the entire system.

**In John's build:** at the end, `/lab suggest` reads the conversation, the agents' reports and the project's records for the same friction again and again, and proposes a few agents the project doesn't have yet, each pointing at where it saw the problem. It builds nothing: a suggestion becomes an agent only when a person picks it and writes its expectations. See [Find Your Next Agent](https://hq.mega.dev/lessons/s04e05/build-guide/#find-your-next-agent).

## Optimization and Governance

Almost since the beginning of MEGA, I've stressed that agents should have access to their own configuration and be able to modify their own runtime and lifecycle methods. The same goes for their capabilities, resource management, and more. Now that we also know about self-improvement, it's clear how autonomous these systems can become, even if they operate within the boundaries we set for them.

When we step back and look at this, it becomes clear that at some point **it is not about building agents**, but about **"training" them** to get better at navigating **their environment**, which we can also shape and adjust. One example is [Self-Improving Memory](https://facebookresearch.github.io/RAM/blogs/self_improving_memory/), which shows how a system can improve on its own once the right environment and mechanics are in place.

This perspective should completely change how we approach software development, but it also has to be grounded in the reality we live in. And while some apps and services can be put into "yolo mode," most of them cannot. 

Let's take a scenario where our Specter agent gets access to our email and receives a message that looks as if we sent it, asking for a report on our recent research and activities. If the system isn't properly **secured** by clear, **deterministic** permission management, there's a chance the agent will send this information. In some cases, it may even include potentially dangerous details that could give an attacker control over our system.

But even without any adversarial activity, the system can simply receive a poor-quality voice command and misunderstand it. It can also receive a command without proper context. Either way, it may take an action we don't really want. Potential damage may also come from a misconfiguration, a buggy patch, or a generated tool that, instead of helping, brings chaos to our knowledge base, system configuration, or external systems.

The good news is that agents make it much easier to take care of things like **sandboxing**, **networking**, **versioning**, **backups**, **audit logs** and **system management**. Setting all this up used to take a lot of time and specialized knowledge, so it was often skipped or postponed. Now an agent can configure most of it for us, explain the trade-offs, and even test whether the boundaries really hold. 

Nearly all of these topics were discussed or referenced in previous lessons. And even if there is a lot of knowledge that can be difficult to grasp, now we have the tools that can help us get the most from MEGA: not only "know about things" but also implement them directly. 

The lesson from this is that **to build autonomous systems, we need AI to make our own process more capable**.

**In John's build:** a Trainer with no tools drafts a better glossary for the Booking agent, inside caps on rounds and spend, and sees only the everyday checks and their pass counts. Its best draft gets one run on the sealed cases. A draft goes live only with two keys, the checks passed and a person approved, both for exactly that version, and the old version is saved first so it can be put back. See [Let a Trainer Climb, Behind Two Keys](https://hq.mega.dev/lessons/s04e05/build-guide/#let-a-trainer-climb-behind-two-keys).

## Takeaways

Over the past four weeks, we have gone through a cross-section of generative AI. At this point, it's up to us to decide what to do with this knowledge. But if I had to point to the single most important thing each of us can do, it would be to **pick one idea**, especially one we've always wanted to make real, and use AI together with the knowledge from MEGA to simply deliver it. This practice will give us real knowledge, skills, and confidence, but it will also reveal an entirely new range of challenges to address.

If there's one thing we should at least try to shift in our mindset to make navigating AI easier, it is this: **drop all labels**, especially those tied to our specialization, tooling, or area of expertise. That doesn't mean dropping those things entirely, only the invisible barriers in our heads. They were real back in the day, but thanks to AI they're now just illusions.

This one change, together with the practice that comes from building things with AI, has a great chance of moving us toward becoming **MEGA developers**: people who are afraid of almost no challenge, are open to working with any type of technology or tool, and use their knowledge to improve not only the software they work on but also themselves, by **empowering themselves with a personalized system** or at least a set of tools they can use in everyday life. 

In moments like this, I like to recall a quote from Lou Gerstner that I believe still holds up. It inspires me to build things and to see a bright future for all of humanity:

> Technology has limitations on what it can accomplish. You do not.

And I'll leave you with it.

## Thank you

I'd like to thank you for trusting us and staying with MEGA to the end. If I may ask one thing of you, it would be to share your thoughts about MEGA on social media or leave a note on our [Wall of Love](https://app.easy.tools/review-ask/megadev?lang=en). You can also use a photo or avatar created at https://mega.dev/thanks.

I'd also like to give special thanks to:

- **Theo Browne, Angie Jones, Kent C. Dodds and John Lindquist** for their work on the idea and content of the first edition of MEGA, and for everything they contributed to shaping the MEGA community
- **Greg Rog, Joel Hooks and Bart Rycharski** for making this project a reality and seeing it through to the end
- **Martyna Ruta and Wojtek Holysz** for helping with organization and taking care of the smallest operational details
- **Michal Jablonski and Olaf Sulich** for helping create the MEGA.dev content and the task system
- **Greg Cwiklinski, Remigiusz Pelica, Pawel Dulak, Ralph Majewski** for their great support in ensuring the quality of the content and tasks, and for helping solve problems and answer questions
- **Vojta Holik and Matt Wierzbicki** for developing the MEGA brand, both visually and in its communication
- **Kate Cwiklinska, Anna Nowak and Anna Golebiewska** for their support in operations, sales, and customer service

See you next time,\
Adam
