# S04E03 · Orchestrating Autonomous Agent Teams

> **This lesson is extended.** It has two parts. This part has John's video and explains the principles of orchestrating a team of agents. The [Build guide](https://hq.mega.dev/lessons/s04e03/build-guide/) is the written version of what John builds in the video, step by step, with the prompts and the checks for each tool. On this page, the notes that start with "In John's build" link each principle to its build.

Managing teams of autonomous agents [is often associated with management skills](https://threadnavigator.com/thread/2119332146485891501/), or even with roles such as product manager or tech lead. Most of these comparisons are correct. But since agents handle nearly the entire implementation, our job isn't just about managing and making decisions. It's also about **shaping the entire system** and thinking about it from both a broad and a narrow perspective. This requires broad knowledge and the ability to learn new things quickly, regardless of the area.

As with organizational structures, there's no single way to get the best possible outcomes. Too many variables make up the system. But we have knowledge, practices, techniques, and ways of thinking that we can apply to **"increase the chance of getting the results we want"**. Sound familiar?

The second week of MEGA showed us **how to build agents**. That might seem pointless, since some agents already work for us out of the box, so why build our own? Well, many of us will build agents anyway, if only because of what **S04E02** showed about the capability layer. And by now it should also be clear that **S01E04** and the **limen** project need agent-building knowledge too, even though they're only about managing coding agents. To put it plainly: **orchestrating autonomous agents requires knowledge and skills related to building them**, even if we won't build them from scratch. At the same time, we need to remember that models such as Fable 5.2 can build an entire operating system [while managing over 1,000 agents](https://www.anthropic.com/claude-fable-and-mythos-5-2).

And in this lesson I'll show what this means. 

## Outline

- Organization: planner, researcher, builder, reviewer, validator roles with bounded access
- Coordination: shared goals, isolated contexts, task dependencies, bidirectional handoffs
- Parallelism: worktrees, branches, sessions, tiled panes, queues, merge points
- Routing: matching work to agents, tools, and models based on capability, risk, cost, and speed
- Supervision: progress visibility, collision detection, intervention, escalation, final human control

## Organization

Agentic teams, like human ones, often have some kind of structure built around roles, scopes, and responsibilities. But we don't have to stop at concepts borrowed from physical organizations. We can also create **dynamic teams** made of "short-lived agents". This lets us **follow some established rules** for managing organizations while also **pushing much further**, because we can have "any kind of specialist" the moment we need one. So why wouldn't we use that?

For now, we can still think of agents either as chat interfaces or as specialized programs that work within a scope we define. Both are dynamic in some way, but they still depend entirely on their users, and there's nothing wrong with that. But we can make them **adjust entirely on their own to the moment at hand** while they still follow certain paths that keep them aligned with our needs.

![An organization chart above a table. At the top, the example task "Checkout is slow" points to the Parent, which knows the task and its context. A tree connector labeled "spawns" goes from the Parent to three short-lived agents in dashed frames: Log researcher, Checkout builder and Speed reviewer. The table has one row for each of the five slots of an agent. The first row is the role, which is defined once and stays: Researcher (reads and reports), Builder (writes in its scope) and Reviewer (checks the proof). A hairline separates the role from four rows that an accent bracket marks "Set at spawn, by the parent, for this task". Knowledge: query logs, checkout code, the speed target. Behavior: report facts only, smallest change, try to break it. Model: fast and cheap, strongest, a different model. Strategy: three in parallel, one long run, fresh context. Under the table: each agent reports to the parent, then ends. The task and all values in the table are examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-1/frame.html)

Dynamic structures and short-lived agents don't mean we're entirely out of the equation. In fact, we still play an important role. The problem is that right now, we as humans struggle to keep track of what's happening with dozens of agents at once. The good news is that **we don't have to.** But at the same time, we need to find a way to **easily switch between broad and narrow perspectives.** 

Considering our limitations, we may want to focus on **interacting with a single agent only** in an efficient way, such as through **voice**, while still having the option to see the details. Not through walls of text or code, but through a **well-balanced mix of visuals, animations, and text**. Everything else should be managed by agents, with the option to see the details interactively by connecting directly to their sessions (in practice that's rarely needed).

Looking at what we've discussed during the first three weeks of MEGA, we have all the tools we need to make this possible or, if we're already doing it, to take the entire orchestration to the next level. Let's consider a scenario with strictly defined **roles**, such as Manager, Researcher, Reviewer and Engineer, that share some common knowledge about the project. In such a configuration, we speak with the Manager only.

![A free-form graph that reads from left to right. At the far left, a dot labeled "We, one conversation" connects to a dot labelled "Manager, manages the team" about one third from the left. A thick red line labelled "voice" goes from We to the Manager. Under it, a thin dashed gray line labeled "visuals and text" bows down and goes back to We. Three smooth grey curves fan out from the Manager, like a mind map, to three dots one above the other on the right: "Researcher, reads and reports", "Engineer, writes in its scope" and "Reviewer, checks the proof". Each curve has an arrowhead at both ends. The middle curve is labelled "tasks" above and "reports" below. A dotted outline in the shape of a running track holds the Manager and the three roles. Its top lane carries the label "Project knowledge, shared by all four roles". We is outside the outline. A thin dashed curve labelled "direct session, any role, rarely needed" goes from We down and to the right, under the Manager, into the outline at its lower left, and ends at the Reviewer.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-2/frame.html)

There are at least a couple of issues with the structure above. One is that a single manager can only handle so much. That's not because models can't handle it, but because the noise makes it hard to follow all the updates and properly encapsulate projects, permissions, resources, etc. Also, most of the activity between managers and other agents is irrelevant to us.

The second is that **we have predefined roles**, which prevents the manager from getting the team it needs, with entirely custom instructions, resources and **relationships**. Additionally, this is only a two-level-deep structure. And even if every agent can spawn subagents, this isn't what we're looking for, at least not in the form that popular harnesses offer us today. 

So our goal is to **keep things simple** while giving agents as much room to operate as possible. Instead of thinking about strict structures, we can think about **dynamic ones**, where roles such as Manager, Engineer or Researcher may still exist, but they won't be defined upfront, or at least not rigidly. They can be **assembled** using both **templates or their components** and dynamic instructions. The figure below shows how this can be designed. 

![A mind map that grows from left to right. On the far left, "We" is joined by one line, labeled "one conversation", to the first Worker, "our one contact". This Worker has three children, which are example template names: "checkout lead", "search lead" and "release notes". "checkout lead" has three children: "log research", "fix builder" and "speed review". "fix builder" has two children: "database" and "frontend". From "database", a dotted line goes on to a hollow circle with the note "deeper when needed". "search lead" has two children: "ranking research" and "ranking fix". "release notes" has no children, so its branch is one step long. Every node is the same kind of dot, a Worker, and the tree has four levels of Workers. Two dashed lines join Workers sideways. "work together" joins "ranking research" and "ranking fix". "across teams" joins "speed review" and "ranking research", which are in different branches. A red branch goes from the first Worker to "checkout lead". The red note "Worker + template" says that the parent writes the template at spawn, with instructions, resources and relationships, and that each label is a template name.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-3/frame.html)

And from a technical standpoint, we're talking here about the idea of **workers** (separate sessions spawned dynamically) that we discussed in earlier lessons. But in practice, it is not just about creating a new instance, but about a setup that makes that instance efficient. 

**Spawning**
New agent instances receive their own configuration. It can be built from existing templates or their components, **but it can also be modified dynamically**, as far as the spawning agent is allowed to change it. For example, a researcher agent may receive custom web search tools and document access, while its instructions and settings specialize it in **analyzing and searching images**. Another agent may receive **a separate lab and dedicated environment** together with a budget to spend. Spawning like this works mainly through the CLI and hooks in Claude Code, Pi, and OpenCode, which control how new instances are created.

![A graph that reads from left to right. At the far left, a dot labeled "Worker, the parent" sends out three lanes, like the branches of a mind map. Lane 1 has a list above it: template, researcher; components, web search tools and document access; changed at spawn, specialized in images. Lane 1 passes a vertical gate labelled "CLI + hooks: control how new instances are created; Claude Code, Pi, OpenCode" and ends in a dot labelled "image research, new instance". Lane 2 has the list: components, separate lab and dedicated environment; changed at spawn, a budget to spend. It also passes the gate and ends in a dot labelled "lab experiment, new instance". Lane 3 is dashed and has the label "a change that is not allowed stops here". It stops at the gate with an end bar and reaches no instance. The two "changed at spawn" rows are in red. All values are examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-4/frame.html)

**Assembling**
Spawning a worker takes more than a system prompt and basic configuration, especially if we care about proper permission management and data access. Workers also need **enriched handoffs** that broaden their perspective and focus them on what matters most. But that's not all: workers may also receive **personalized hooks** that make them more reliable and better aligned with our needs. For example, a hook can ask workers responsible for reviews to clean up and free resources before their session ends. Or the activity of a given type of worker can emit events that wake up other agents, for example to update the documentation the moment a relevant feature gets delivered.

![A left-to-right timeline of one worker session, with example values. At the far left is the parent, "checkout lead". A solid line with an arrowhead, labeled "enriched handoff", goes to the start of a new session, "speed review". Under the line, the handoff carries three rows: task: review the checkout fix; view: users leave at payment; focus: the speed target. Under the start dot are the usual starting parts: system prompt and basic configuration. The session line runs to an end bar labelled "session ends". Two dotted rails, open at both ends, run above and below the session line. They are labelled "permissions and data access". Between the rails it says "can: read the code, use the test lab". Under the lower rail, outside the rails, it says "cannot: change the code, read production data". On the session line, a dot marks "starts a test lab". Later, a hook dot is labelled "personalized hook, asks before the session ends", and the worker "stops the lab, frees memory". All values are examples. The handoff arrives, the permissions surround the session, and the hook waits for its moment.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-5/frame.html)

**Collaboration**
In **S02E04**, we went through multi-agent architectures. Typically, such architectures are implemented directly in a system. But since models are now great at managing other agents, we may want a **dynamic architecture**. In it, agents themselves pick the architecture that fits the task, based on a set of our primitives, such as **Template, Issue, Channel, Workspace, Claim, Subscription**. 

![A key at the top shows six marks: Template is a filled dot that sets up a Worker, Issue is a hollow square for a unit of work, Channel is a dashed line between two dots for who talks, Workspace is a dotted rounded outline for a shared place, Claim is a solid line from a dot to a square for who took it, and Subscription is a dotted arrow from a square to a dot for what wakes. Below the key, one Worker dot reads our principles and picks per task. Four branches go from it to four small graphs that use only these marks. Subagent is two dots joined by a Channel, and one Issue claimed by the second dot. Hierarchy is a tree of one, two and four dots joined by Channels. Team is three dots in a triangle, each pair joined by a Channel, around one Issue, all inside one Workspace. Swarm has three Issues and four dots and no Channels: two dots claim two Issues, the third Issue wakes a third dot through a Subscription, and the fourth dot is idle. The branch to Team is red. Team is only an example of a picked architecture.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-6/frame.html)

Most of the ideas in the figures above are already implemented in the **limen** project. If you look at [its source code](https://github.com/overment/limen/tree/main), you'll see that, apart from the HTML dashboard (which you can skip), there are just a couple of files that make the whole orchestration easier for agents. AI handles everything else, and as always, the better AI becomes, the better the system gets.

The entire setup gets way more complicated the moment we stop talking about coding agents and start building the whole system from scratch, or with a framework such as Mastra. Regardless, we may still want to keep the same primitives and push toward the flexibility described above.

**In John's build:** both kinds of agent from this section appear. The gatherers are short-lived: each one starts for one question and is gone when its answer is delivered. A Domain Agent is the opposite. It is a folder that owns a set of paths, keeps the memories of that area, and runs read-only on a small, fast model. It advises and reviews, and the main conversation writes the code. See [Seeding a Domain Agent](https://hq.mega.dev/lessons/s04e03/build-guide/#seeding-a-domain-agent).

## Coordination

This may sound weird, but technically, most development can now be done **without a laptop or PC**. Tools such as editors, terminals, or apps like Herdr remain useful, but they can simply work in the background, and we can check on them occasionally, just because we want to. In fact, this is how I've been working for the past 4 months. The reason is **Grok Bot** with its voice mode (or Superwhisper), and files or dashboards built with **HTML / Markdown Components**. But it isn't really about Grok Bot itself, because **its job is simply to coordinate other agents** that can handle most of their work and only need an easy way to reach us when necessary.

The core workflow looks like this:

1. **Grok Bot exposes a single, continuous chat** per project.
2. **Every feature has its own folder** holding its notes, evidence, and everything else related to it.
3. A feature can be **split into multiple folders** if needed, and each folder can be claimed by a single agent. 
4. **Grok Bot manages Pi** and Claude Code instances in Herdr and **exposes a webhook** so that the instances can notify it.
5. Pi instances can take on the role of **coordinator** or **worker**. A coordinator can **spawn other instances**, while a worker **does the job itself** and reports back to Grok Bot.

All of this makes Grok Bot aware of **what's going on in the Herdr panes** assigned to the instances it spawned, and it can also read the other panes when needed. While Pi and Claude manage the actual work themselves, that work can take the form of the dynamic structures we discussed earlier. And because agents write their progress and artifacts down in the folders, other agents can **learn about this work** more easily. They are even free to add their own notes.

![A five-column graph that reads from left to right. The columns are "We" (phone and voice), "Grok Bot" (one chat per project), "Coordinator" (spawns workers), "Workers" (do the work) and "Feature folders" (one agent each). A thick red "voice" line goes from We to Grok Bot. A dashed line goes back to We, labeled "pages and dashboards, when they need us". Grok Bot "manages" a coordinator, which fans out to three workers. Grok Bot also starts a fourth worker directly, and that worker reports back to Grok Bot through a "webhook" (dashed line). The coordinator and the four workers are inside a dotted outline labelled "Herdr: Pi and Claude instances, in the background". Each worker "claims" one feature folder, drawn as a square. A dotted path from We to the outline means "we look only when we want to".](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-7/frame.html)

What we see here is a practical implementation of everything we've learned so far in MEGA, pushed to its limits through **voice interaction** and **visual system diffs**. Almost everything here relies on the models' capabilities and on cloud agents and tools that let them interact freely with each other and with their surrounding environment.

The most important aspect here is **voice interaction**, which also works on mobile. It matters not only because it's useful, but first and foremost because it's **an artificial constraint**. What I mean by this is that it is easy to interact with agents without looking at code. But having them deliver **quality software** without us needing to watch their every move is a sign of a well-designed system. And even if we decide not to use voice interaction every day, trying it may be a useful way to surface many potential issues in our workflow.

A very similar workflow can be achieved with custom multi-agent systems that don't rely on Herdr, Pi, or Grok Bot. All the principles remain the same: agents operate within their **workspaces** and communicate with other agents through them. This is especially important because **the same knowledge** applies not just to coding agents but to agentic systems in general. And while there are some differences in implementation, since production systems must be way stricter and more scalable, we can safely say that **getting better at customizing coding agents teaches us a lot about autonomous systems design.** And that's a really useful skill.

To visualize this, I show the core logic of my personal system in the figure below. It should already look familiar, since we've covered all its mechanics in the lessons so far. And here, as with Grok Bot, interaction can happen through a single, continuous chat, including by voice.

![A swimlane timeline of a custom multi-agent runtime. One lane for us sits above a dotted workspace outline. Inside the workspace are three thread lanes: the main thread and two child threads. The faint guide line of each thread lane is that thread's journal. We send a message to the main thread. The main agent plans and spawns two children. Then the main thread waits and holds no worker. The first child sends a request to the second child and gets a reply. Each child writes its result back to the main thread, and the result wakes it. The main agent replies to us. A dotted arrow shows that a child can spawn deeper, within limits. An accent tick marks the two spawn arrows and the request arrow, because every request passes Grants. The agents and the order of events are examples. A time arrow runs left to right under the workspace.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-8/frame.html)

So, coordinating autonomous systems isn't really about **keeping an eye on everything** but rather about **building a structure that manages itself**, while still giving it a way to reach the right person as efficiently as possible.

**In John's build:** coordination happens before the first edit. For a feature that crosses two areas, the main conversation asks both Domain Agents in parallel and shows their answers side by side. A point where the two disagree, or where the feature forces a product decision, comes to us, and the agents do not pick an answer. After we decide, the decision goes into the memories of each agent as one dated rule with a receipt, so the next agent can read it. See [Crossing Two Domains](https://hq.mega.dev/lessons/s04e03/build-guide/#crossing-two-domains).

## Routing and Parallelism

Autonomous systems should be designed with parallelism in mind, and this one fact creates challenges at nearly every layer. From the very first moment, the system has to decide **how to handle the task** to get the best results in the most efficient way. The problem is that agents won't know everything about the issue and the project upfront, so it is hard for them to decide. But there are many things we can do about it.

Agents need to be aware of the current state of the system, including all sessions that are running, waiting, stuck, failed, or finished. They need this for two reasons. The first is **understanding** what's going on around them, so they can collaborate effectively. The second is **recovery**, so they can catch issues early. It's worth thinking about which information is useful to agents. Some of it may be **injected** into their threads, while the details can be revealed only through additional queries.

Depending on our setup, information about sessions may come from tools such as Herdr or from any other source our system uses. We already know that such dynamic information **must be presented in developer messages**, but it should be done sparingly, to avoid repeating the same details.

![Two frames side by side. The left frame, System, lists six example sessions with their states: invoice export (this thread, dashed border), docs update (finished), search index (waiting), email templates (stuck), image upload (failed) and payments fix (running). The right frame, This thread, shows three steps joined by down arrows: Task "Add an export to invoices"; Developer message, highlighted in red, with "payments fix runs, owns invoice files", "email templates is stuck", "image upload failed"; and Agent decides, with "asks payments fix to edit invoices", "builds the export in its own files", "reports the failed upload". Between the frames: a dotted line "opened" from the invoice export session to the thread; a thick red arrow "injects a summary" from the system to the developer message; a dashed arrow back "asks for details", only when needed; and an arrow "asks for a change" from the decision to the payments fix session. The task, session names and decisions are examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-9/frame.html)

"Awareness" of the sessions is not the only thing that helps an agent decide what to do with a task. Another is knowledge about **what's possible**: whether we have a **cloud environment** or a **lab**, how many resources are available, **what we know about the product**, **the recent changes**, **which models are available**, and more. These questions may be specific to our system, so we should focus more on this one: "What does an agent need to know about the entire system to make good decisions?"

In my projects, there are four types of "awareness" knowledge:

- **Dynamic:** everything about what's going on within a system at a given moment
- **Static:** everything about the capabilities and resources available within a system
- **Project:** everything about what the project is about and where it's heading
- **Work:** everything about what was done and what's planned to be done

**Static, Project, and Work** are available through tools, while **Dynamic** is injected into threads. For example, **agents working in a group** know the details of their peers, but they are only roughly informed about the activities of other agents.

The whole configuration exists to deliver all the knowledge that **agents**, not humans, need. This matters because it lets the system hold much more information and evolve quickly. The agents manage and organize it. My job is mainly to set the direction and occasionally check for things the agents miss, which happens in direct chats with them about the system's condition.

![Diagram. On the left, a frame named Awareness holds four boxes, one under the other. Dynamic: what happens right now, for example sessions, peers and states. Static: what is possible, for example cloud, lab, resources and models. Project: what it is and where it heads, for example product knowledge and direction. Work: what was done and what is planned, for example recent changes and next steps. On the right, a frame named Agent's thread holds three boxes joined by downward arrows: Developer message (peers in its group in detail, other agents only roughly), Tool calls (only when the agent needs them), and Decision (how to handle the task). A thick red arrow labeled "injected" pushes Dynamic knowledge into the developer message. Three dashed arrows go from Tool calls to Static, Project and Work; the first one is labelled "asks through tools". An arrow from Decision goes back to the Awareness frame, labelled "agents keep it up to date". The short lists inside the boxes are examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-10/frame.html)

From a technical perspective, we're talking about a **simple CLI (or MCP server)** that gives us access to all the sessions, plus **a set of folders** (or, alternatively, an API). Lastly, we need either our own harness or a customizable one such as Pi, OpenCode, Claude Code, or DeepSeek. Everything else is up to an agent that is **spawned directly for the given task** and **manages workers** to deliver it. This way, it stays focused on the whole task, and the risk of something distracting it is relatively low. And since it's "short-lived", it can also be steered with dedicated hooks.

We already discussed generalized steering, so it should be clear by now that hooks are not about **strict rules** or **deterministic scripts** that **must be executed**. They are about reminders and context that help the agent. And again, it is not about designing everything upfront, but about giving "slots" that coordinators or managers can use to steer the workers.

![Two frames side by side. The right frame, "Worker session", has six steps from top to bottom joined by down arrows: Turn starts (reads the rules and its task note), Tool call (a forbidden call does not run), Tool result (result plus: check the style rules), Next step (coordinator: skip the old tests), Wants to stop (first closes its open points), Session ends (status shows every step). The left frame, "Hooks", has six hooks, each level with its step: Context (before each turn) adds context; Gate (before a tool call) blocks, drawn as a line that ends in a bar; Reminder (after a tool result) adds a reminder; Steering (while the worker runs) adds a message, the highlighted arrow; Finish check (when it wants to stop) adds a check; Status (the whole session) only watches, drawn as a dashed arrow from the session back to the hook. The hook names and the example lines are generic examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-11/frame.html)

When you work with dozens or even hundreds of agents at the same time, even small issues add up quickly. This shows most clearly in the time the agents need to accomplish a task. Sometimes the cause is resources, queues, hitting limits, or communication problems. And sometimes agents start colliding or struggle to resolve conflicts that come from parallel work. That's why one of the best things we can do is **set schedules for analyzing threads** from the entire team, to find opportunities to optimize the process for the metrics we care about, not just for performance.

Below are real numbers from 7 days of my agents' work on one of my side projects. They reveal bottlenecks not only in the setup, but also in its configuration and available resources. We address most of the issues through experiments, and we compare the results after a couple of days. Some of the insights also lead us to consider increasing resources or switching to tools such as [Depot](https://depot.dev/), [Browserbase](https://www.browserbase.com/), [Browser Use](https://browser-use.com/), or [Boat](https://boat.dev/), but only where it's justified.

![Horizontal bar chart of where the working time of a team of coding agents went, measured on one project. Ten rows, top to bottom: Model thinking and writing 184 h (51%), Rust builds and tests 36 h (10%), Native lab and films 30 h (8%), JavaScript tests and checks 26 h (7%), Reading and searching tools 23 h (6%), Waiting in the start queue 15 h (4%), Asleep on other background runs 14 h (4%), Tool calls that hung 14 h (4%), iPhone and Watch builds 7 h (2%), Everything else 9 h (2%). The first bar is solid red and far longer than any other. The nine gray dithered bars together are about as long as it. Note: working time only; time spent waiting for someone else is not counted.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-12/frame.html)

**In John's build:** routing is by file path. One hook reads the paths that each Domain Agent owns. When the main conversation touches a matching file, the hook wakes that agent and adds its short brief to the conversation. The brief is context, not a rule, which is the same use of hooks as in this section. On parallelism, John takes a different path. His agents run in parallel only to read and to advise, and one conversation writes all the changes. He refers to the essay "Don't Build Multi-Agents" for the reason: each parallel writer makes assumptions that the others cannot see. This lesson manages the collisions between parallel writers. John's build avoids them with a single writer. See [Seeding a Domain Agent](https://hq.mega.dev/lessons/s04e03/build-guide/#seeding-a-domain-agent) and [Crossing Two Domains](https://hq.mega.dev/lessons/s04e03/build-guide/#crossing-two-domains).

## Supervision

If agents handle almost everything in nearly every process we've discussed so far, what can we do about **supervision**, and where should we be involved? In fact, there are still many places where we're needed to keep the whole system improving. 

First of all, even when agents operate in the background, we always need to know what's going on: how many agents are working and what they're working on. The easiest way is to observe this **live** with an observability platform, such as Langfuse, which we discussed earlier. We could also consider [Macroscope](https://macroscope.com/) for even better insight into agents' activity.

Another important factor is that **agent activities** and **task progress** must not live only in the thread context of any agent, including top-level coordinators. The reason is that **any agent** should be able to pick up **any task**, unless we have a policy that limits agents to certain permissions. Even then, all progress needs to be tracked in files or a database, not inside the thread context.

![A swimlane timeline with three rows. Time runs left to right. In the top row, a first agent works on a task. It writes two finished steps, "plan ready" and "export built", down to a task record. Then its session ends and its thread context is gone. The middle row is the task record, kept in files or a database. It is one line that runs across the whole timeline and never stops. In the bottom row, a second agent with a new thread context reads the record. It continues the same task and writes the next step, "tests pass", to the record. The step names are examples.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-13/frame.html)

We already know that agents should produce reports on their work and evidence of the changes they made. Most of these reports will be reviewed by us, but in some cases we may want **aggregated reports** that show the changes made by several agents. Such reports could also help a team share knowledge, not only about the codebase but about the product in general.

![A flow from left to right. On the left, a frame named Workers holds three example worker reports: payments fix, invoice export and docs update, each with the line report and evidence. A thick red arrow labeled "an agent merges" goes to one red-bordered box in the middle: Aggregated report, with the example lines "what changed in the product", "what was proven, and how" and "what needs a decision". A thin gray line leaves this box and splits into two arrows: one to We, labeled "review and decide", and one to Team, labeled "shares the knowledge".](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-14/frame.html)

And lastly, it's useful to have **extra sessions** with agents about concepts, ideas, or simply questions. In some cases, we may even want to **spin up an entire fleet** to create a temporary "lab" where we can explore the aspects of the product that interest us most. This way we can discover issues and things worth our attention, plan refactors, or iterate on ideas for upcoming features.

This may sound weird, but even supervision should be driven by AI. The difference is that our involvement should be much bigger here, because this area benefits the most from external context that agents often still can't reach.

![A comparison table of who does what in the supervision of an autonomous system. It has two columns, Agents and We, and four rows. Live view: agents report every step as they work; we see how many work, and on what. Progress: agents keep it in files or a database; we set who may pick up a task. Reports: agents report, prove and aggregate; we review and decide. Extra sessions: agents explore in a temporary lab; we bring ideas and questions. Agents do the work in every row, and we add something in every row.](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-15/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e03/artifacts/lesson/figure-15/frame.html)

At some point, we can expect platforms such as [Factory](https://factory.com/) to deliver features that help us manage large teams of agents. They may be useful even today, so it's worth trying them out, or at least keeping an eye on how they change. Alternatively, we may rely on tools generated just for us.

**In John's build:** supervision has two places. The first is the decision: a collision between two areas is a product question, and it comes to us in the main conversation. The second is the knowledge of the agents themselves. The `agents/` folder is shared text, so the owners of an area review each change to it, and scenario checks run when its files change. A scenario is never deleted to make a check pass. See [Glossaries and Scenario Checks](https://hq.mega.dev/lessons/s04e03/build-guide/#glossaries-and-scenario-checks).

## Takeaways

As this lesson shows, orchestrating a team of agents is mostly about **leveling up**. We shift our focus from building software to building a system that builds software. Even if the term "software factory" is often overused or used in the wrong context, there is value in looking at the software development lifecycle through the lens of the **dynamic structures** agents use to find the best possible solutions.

If we decide to move toward this level of autonomy, we need to remember to use state-of-the-art models wherever possible, because the entire system depends mostly on their capabilities. At the same time, the responsibility for the software we build still rests with us, and we need to keep that in mind. In some cases, **finding a good balance** between autonomy and human supervision may still be important. But given the pace of progress in AI, it's a good idea to learn as much as we can about moving the entire process to AI. There's still a lot for us to do, even if we can "ask for nearly anything".
