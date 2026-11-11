# S03E03 · AI-Native Product Development

Agents can handle both "[greenfield](https://en.wikipedia.org/wiki/Greenfield_project)" and "[brownfield](https://en.wikipedia.org/wiki/Brownfield_\(software_development\))" projects almost natively. Without any special setup, they can answer questions and make changes with some degree of accuracy. But in both cases, moving fast with agents while also ensuring quality and alignment with business needs takes additional work. We've already seen many of the reasons for this, so now we'll look in detail at how our system can **heal itself**, **recover from issues** and **get better over time**. 

The lessons so far have shown how agents' capabilities can expand through tools and knowledge, giving them a higher degree of autonomy. This lets them take care of things we normally have to keep in mind and are constantly asked for. The problem with this is that over time, the system gets overloaded - some tools won't be needed anymore and old documents turn into noise and that's an issue as **"no document is better than the wrong one"**.

Another reason we may want **meta-workflows** for maintaining a system is that agents will often face the same problems during their work. When this happens to us, we remember it for next time. Agents need something similar so they can build and adjust their skills or create tools.

Having all this makes the product AI native. In practice however we may want to start small, as building everything takes time but also is simply not defined. 

## Outline

- Exploration: synthetic user flows, interactive maps, historical changes, architecture visualizations
- Planning: scope expansion and contraction, risk mapping, graphs, high-level implementation strategies
- Execution: direct work, handoffs, parallel agents, merge points, delegated work
- Feedback: system logs, visual feedback, human feedback, artifacts

## Exploration

Agents start their work by exploring, because they need to gather the context to understand the task and make changes. Then they repeat this process every time, as if doing it for the first time. Sometimes they even fail, which hurts their work, and yet they **don't leave any trail or take any notes about it** unless we build a workflow for that.

Scenarios like that happen all the time, and they're not limited to the codebase. They also involve navigating external systems: remote repositories, issue trackers, communication channels, and infrastructure. The most straightforward solution is **a map**, which we mentioned in **S02E01**. The problem is, in systems that evolve fast, such a document quickly becomes outdated and adds more confusion than guidance. And that exact issue our workflow needs to address.

The problem is that we don't know the exact state of the map, or which variables we'll need to consider to improve it. But we already know that in such cases we should look for **principles**, **scope**, and the **schedule or trigger**. Everything else should be left for an agent to figure out. The agent should also have access to the history of its actions, so it won't repeat the same mistakes and the system will actually "learn".

And to be clear, we're not talking about a codebase map or anything an agent can easily find. We're talking about context that isn't obvious from the code alone. It's more like **a set of documents** explaining the features, how to interact with them, verify them, what's their role and what's worth keeping in mind about them. 

![On the left, a frame named Feature Map holds three small documents of the same shape: checkout.md, search.md and notifications.md. A dashed line goes from checkout.md to the open checkout.md on the right. The open document has four sections of equal height: Role, How to get there, How to verify, and Keep in mind. Keep in mind is the one red section. Below, a strip has two rows. "Found by reading the code" has faded chips: routes, components, folder layout. "Written in the Feature Map" has solid chips: how to get there, how to verify, and a red chip, what to keep in mind. The feature names and the section text are examples.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-1/frame.html)

Lauren Tan described the **Features Map** concept in relation to her verification skills ([generate](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md), [maintain](https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-verification-skill/SKILL.md)). She uses them with Cursor Cloud Agents that run on a daily schedule. The two skills generate small files that describe the areas of her apps she wants her agents to understand. That's exactly what we need in production systems, where changing the behavior of one feature may have a non-obvious impact on another.

So our role here focuses mainly on crafting and iterating skills, but also on **initializing maps**, because a map's initial shape directly affects its reliability and usefulness, and it shapes the improvements agents make to it later. 

As a result, feature maps improve how agents go through the exploration phase, and not only that. Having this context also makes them better at implementing features and verifying them afterward. The example below shows how it may work in practice: **in a music player app, solving a bug with playlists may affect queues**. That's easy to miss, but thanks to the feature map, the agent takes care of it.

![Diagram: an agent uses a Feature Map to fix a music-player bug. On the left, eight agent steps run from the task "Bug: after editing a playlist, shuffle plays the same track twice" to "Add to queue.md → Keep in mind: shuffle order is cached". Step 5, the reproduction, is red. On the right, the Feature Map holds four documents. player.md and offline.md are faded because the agent does not open them. playlist.md has the highlighted line "Editing a playlist rebuilds the queue." A dashed "rebuilds" arrow joins it to queue.md. In queue.md, step 8 writes a new "Shuffle order is cached" line, marked "added".](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-2/frame.html)

Schedules or triggers that maintain the maps must look for more than things **to add**. They must also look for things **to modify and remove (archive)**. In fact, most background agents that handle maintenance should focus on cleaning up what's no longer needed. It's also worth considering an easy way for them to communicate with us not only when needed, but **always**, using visual artifacts that let us quickly scan the changes and spot issues.

## Planning

Having a features map along with the principles discussed in **S03E02** makes conversations about changes and bug fixes much easier for us. We no longer need to describe every detail or **keep it all in our heads**. Even if we mention a feature only briefly, the agent connects it with everything that's needed and helps us reason about what to do. In fact, a conversation with an agent that has this knowledge is like a discussion with a teammate who has spent years on the project and knows the answers to nearly all questions.

![A conversation on the left and a Feature Map on the right. The user writes: "Let's add crossfade between tracks. Should work with my downloads too." Thin lines join the underlined phrases to documents: "crossfade" to player.md, "between tracks" to queue.md and "downloads" to offline.md. In the map, queue.md feeds player.md, offline.md has a red "no preload" arrow to queue.md, and a faded playlist.md "rebuilds" queue.md. settings.md is faded. The agent replies that crossfade touches player, queue and offline, and says to start with queue. The user replies "OK, plan it."](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-3/frame.html)

Discussing features is also a perfect moment for subagents or workers, as in our interest is to keep the main thread focused on the most important aspects, but also keep it interactive. In the background agents may focus on the research or updating graphs, visualizations or lab we discussed in **S03E02**. 

But now we can push this **much further**, because agents can translate our intent into high-quality while maintaining quality and, to some extent, a "common sense" that comes from "understanding" the system and the relationships between its components. And the best part is that the longer we work on the system, the better this process becomes, because the available context keeps improving.

In fact, this process can be easily delegated to background agents that can iterate on the shape of features, seeking for edge cases and the best way to addressing them. It does not mean, we're entirely excluded from the process as the final decision is on us **but, this approach let us amplify our own knowledge, skills and judgement** as proposed plan would be hard for us to develop even in direct interaction with AI.

![Three columns: Main thread, Background agents, Plan, for an example: adding crossfade to a music player. The main thread holds five short messages. Message 2 spawns three agents of equal size: Explore, Research and Visualize. Each agent shows its findings as chips. "offline track: no preload" is the one red chip. The agents read and write a Shared notes block, and they send results back to messages 2 and 4. The notes iterate the plan through v1, v2 and v3. The plan is drawn as three stacked versions, with v3 on top. v3 is a short note that says what the feature does, not how to build it. The dependency graph is attached to it. The example note text paraphrases the findings. Message 5, "Approve. Max fade 8 s.", has an accent border and links to the "your decision" chip below the plan.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-4/frame.html)

As we discussed, the plan shouldn't describe **how things should be done**. Instead, it should focus on what needs to be done and how the result will be proven. The document itself should be fairly short, although it can refer to external files. In general, it's in our interest to keep the feedback loops as quick as possible, at least until the system is ready to handle longer tasks without supervision.

Now, if we look at this through the lens of every lesson we've gone through, it should be clear how we can **combine our knowledge with custom tools and setups** to shape a system tailored to our product. And it's up to us to decide which parts we'd like to be involved in. That largely depends on the feature we're working on, but also on **the level of trust** we have in the system.

## Execution

AI-native product development reduces, and sometimes eliminates, many of the processes we know not only from the pre-AI era but also from the early days of AI, when we worked with agents directly. Activities such as **[writing code, reading it](https://x.com/unclebobmartin/status/2080257779395154409?s=20)**, and even **reviewing it** are getting automated to the point where humans aren't involved at all. And if that doesn't sound crazy enough, agents are starting to manage other agents and make more and more decisions on their own. It feels like there isn't much left.

In practice, however, there are many things we need to take care of.

**Research:**
Before AI, product development mostly depended on our current skills and what we were willing to learn in a reasonable amount of time. For example, if we were fluent in the JavaScript ecosystem, we rarely decided to build something in Rust. The same went for libraries (such as Three.js) or areas (such as Functional Programming) that were simply too demanding to grasp. But now these barriers are either gone or much easier to overcome. 

This way research and exploration became part of our job. And the fact AI can use almost any tool flawlessly, does not mean there is no need for us to understand how does it work. In fact, it's opposite, but instead of learning everything, we need to dig down to the level that is enough and **we need to learn how to recognize this** and build tools and workflows that will help us with it.

![Concentric rings around a person who stands for our competence. A dotted ring just outside it shows our reach without AI. A large dashed ring shows the edge of what we can verify. Between the two rings, the zone explored with AI holds six chips: Product docs, Codebase map, Market, Constraints, Prior decisions and Conventions. Five paths run out from the person, each with a red agent dot. Three paths stop inside the dashed ring. Two paths cross it and go on as dotted lines into the area beyond our judgement. A line joins the dashed ring to four checks: Can I explain it in my own words? Can I name how to check it? Do separate explorations agree? Would I sign off on it? A pill at the bottom states the principle: go as far as we can still verify, not as far as the agent can reach.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-5/frame.html)

**Structure:**
As engineers, part of our job was to manage things like architecture, documentation, external services and infrastructure. AI-native development keeps most of these in place, but agents are the ones doing the actual work. Our job now is to keep it all organized in terms of **processes**, **schedules** and **efficiency**, along with the mechanics behind the system's observability, stability and improvement. And as we saw, this requires working on a sort of "meta-level," because it's not about **telling agents what to do, but making sure they know what to do** and **ensuring they can do it**. There's a great read from Lauren about this in section "*the art of supervising someone smarter than you*" in [The Complete Guide to pstack](https://x.com/poteto/status/2097732320606507506).

![Two columns. On the left, one person has four thick lines that fan out to four red agent dots. Three question bubbles point back up, and the line under them says "Every question comes back to us". On the right, under "Organizing the system", a person organizes processes, schedules and efficiency and keeps the system healthy with observability, stability and improvement. Three arrows go down into a box named "What agents rely on". The box has two halves: "Know what to do" and "Can do it". From that box, arrows go down to a lead agent and five more agents in a chain. The lead agent gets a set of tasks from the person through a dashed "Intent and feedback" line. Two lines go back up from the last agent: "Evidence" goes to Observability, and "New tools and skills" goes to the middle box.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-6/frame.html)

Doing this requires us to apply everything we've learned so far, but also to shift the way we think about and look at our work. That's because before AI, our default solution to a problem was fixing it ourselves. With AI, it's often telling an agent to fix it. But what we're trying to figure out is **how to make an agent aware of the issue and able to respond to it properly.** 

**Ecosystem:**
Let's say we're familiar with [Axiom](https://axiom.co/) but know very little about [Datadog](https://www.datadoghq.com/) and [Better Stack](https://betterstack.com/). If our product needed observability, Axiom would be the obvious choice for us, even if its alternatives offered better features. Before AI, understanding and adapting to an entirely new platform took effort we rarely chose to make.

With agents on our side, we can have a report within an hour that compares our options and clearly explains their features in a way tailored to us, including a map of the architecture and the effort needed to get it done. This can be applied to literally every single service. 

For example, below is the stack we use at mega.dev and MEGA HQ. We chose its components not because of our personal preferences or experience, but because of business opportunities and organizational factors. I'm not saying the stack is perfect, but even if any of its components needed to change, AI would make that effortless, especially thanks to good architectural decisions that keep integrations simple.

![Diagram of the MEGA ecosystem. A dashed box, Lesson content (GitHub · Astro build), feeds MEGA HQ at deploy only. On the left, Student (web browser) reads lessons in MEGA HQ, and Student's AI harness (Claude Code, Cursor) does challenges via MCP. Student also reaches mega.dev for account and assessment. MEGA HQ (hq.mega.dev on Cloudflare: lessons locked by time, challenges, MCP server) shares Student data with mega.dev (Vercel and Next.js: website, accounts, assessment and cards). Services: Airtable and Resend under HQ; OpenRouter, Cloudinary, Stripe, Postmark and Sentry under mega.dev. Principle: pick the best service for each job.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-7/frame.html)

Even though we can generate personalized software today, there's often no point spending time on things we can get out of the box. And since we have agents that can build deeply personalized integrations that make full use of what external services offer, we should definitely use that to our advantage.

**Schedules:**
AI-native product development brings challenges because many agents may work simultaneously. This quickly reveals that the tools we use **weren't built for that**, as agents spawn processes and run tests, compilers, or entire sandboxes and virtual machines. Suddenly, even 128 GB of RAM in a maxed-out MacBook is not enough.

The moment we start noticing that we're running out of resources (CPU, GPU, RAM, or storage), the first thing we can do is **ask agents for an audit** that identifies bottlenecks. Depending on the stack, the audit may find one-off solutions we can implement right away, or issues that need to be handled on a schedule, such as pruning or checking for stale processes and leftovers. In some cases it is worth considering adding queues or throttling for the most demanding processes, such as compilation. 

![Three charts that share one left edge. The first chart shows RAM over one workday from 09:00 to 18:00. Without schedules, compilation spikes sit on a base that rises every hour. From about 15:00, the spikes hit the limit, with the note "Swap, crashes, slow agents". With schedules, the spikes are lower and wider, and a stale-process stop every hour keeps the base flat. A bracket at 18:00 marks the gap between the two bases as leftover processes. The second chart shows disk use over one week. Without schedules, the line climbs like a staircase and reaches the limit on Friday, marked "Full disk". With schedules, a nightly prune makes a sawtooth that drops back to the same low level every night. The third chart shows six compilations in one hour. Without a queue, they all run at once near 0 min. With a queue, 2 at a time, they run one after another across the hour. A pill states the principle: schedule the cleanup and queue the peaks before we buy more hardware. The shapes of the curves are examples, not measured data.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-8/frame.html)

When optimization won't be enough, instead of buying additional hardware, we may consider **cloud agents** ([codex](https://learn.chatgpt.com/docs/cloud), [claude](https://code.claude.com/docs/en/claude-code-on-the-web), etc.). They don't offer as much flexibility as VPS or physical machine, but scale very well. 

Besides optimization, schedules are useful for system monitoring focused on anomalies, user behavior and security issues. These days, such schedules are a **critical part of the system**, as we may expect **constant attacks** that come not from dumb bots we can reliably fight off, but from **dynamic agents** that will look for a way into our system. It's worth considering skills such as **[security-audit](https://github.com/cloudflare/security-audit-skill)** and a proper [Sentry](https://sentry.io/) setup that reports issues directly to agents.

And lastly, we have schedules for managing workflows that handle the actual work on the product: solving issues, fixing bugs, reviewing features, refactoring, etc. These are often set up in the cloud, so they don't depend on anyone's machine.

So overall, schedules are becoming an important area to cover in AI-native development. Getting them right can easily make a real difference and even become a competitive advantage.

## Feedback

Agents need as much access to real-time environment data as possible. This data helps them understand the system, including both its current and historical state. To make that possible, the system itself has to be organized with this in mind. We might consider things like easy access to development and production logs, activity events, an easy way to interact with the app, the ability to take screenshots and record videos, and more.

Such an interactive, data-rich environment rarely exists in software. This means we first need to **decide what information is needed** and then **rebuild or extend the system** to actually deliver it. Not for us, but for agents.

Below is an example architecture of a system that includes a whole set of structures, tools and services **dedicated to agents**. They let agents **interact with the app** in the development environment and also give them easy access to almost anything about the production system. This diagram clearly shows we're not talking about a simple logger. And building this requires making it an actual priority.

![Diagram of where an agent gets feedback. On the left is the Agent. In the sandbox (development), the agent drives the app (click, type, sign in) and observes it (screenshots, logs, recordings), and it attaches proof (before and after, checks passed). The app ships to production (read-only). From production, the agent only reads signals: logs and errors, session replays and user feedback.](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e03/artifacts/lesson/figure-9/frame.html)

Building structures for agents to get valuable feedback is crucial and makes the foundation of the entire system as they play big role in **building trust** and letting agents reliably verify their work. Regardless if we have existing system or build something from scratch, it is hard to tell upfront what exactly do we need, so as always **it's a good idea to start small** and then put **useful schedules** to let agents maintain the tools and improve based on the insights from available logs.

## Takeaways

Going beyond working directly with agents and building a truly AI-native development lifecycle takes a lot of effort. And even though agents handle the actual work on the software and the system itself, our responsibilities still involve a lot of activities, decisions and understanding. And importantly, working this way requires **a new way of thinking** about building software, because we're not simply "moving to the next level of abstraction". We also need to expand our perspective and look way beyond code, into other areas of the entire product.

The last thing to consider after this lesson is that when we look back at what we've discussed today, we may realize that **AI-native products may move much faster while maintaining quality, and products developed through direct work with agents have no chance of keeping up.** And this may lead us to the conclusion that, in some scenarios, it's wiser to build an entire platform from scratch just to gain this advantage.
