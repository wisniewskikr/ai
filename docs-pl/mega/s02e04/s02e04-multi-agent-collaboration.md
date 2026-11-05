# S02E04 · Multi-Agent Collaboration

In **S01E02**, we mentioned subagents and workers (separate instances) as a great way to offload heavy tasks from the main thread, which keeps the model focused on the main objective. Now it's time to take this further and explore how agents can collaborate in teams, communicate with each other, exchange resources, and use each other's capabilities.

Multi-agent systems are useful both for a single user working with a whole team of agents and for entire products and organizations that want to exchange information and use each other's services. Agentic teams can also work together on complex problems, such as advanced product analysis, refactoring, or implementing and testing entire features. Multi-agent systems can also improve results when tasks benefit from specialization or isolated context.

## Outline

- **Multi-agent:** responsibilities, conflict isolation, shared resources, architectural patterns
- **Agent2Agent:** independent agents, connection, boundaries, messages, tasks, discovery
- **Delegation:** context assembly, handoff contracts, ownership, tracking progress, reporting, failures
- **Orchestration:** dependencies, parallel work, conflicts, background work, human-agent workflows

## Multi-agent architectures

The idea of multi-agent systems isn't new. It goes back well before the ChatGPT release, to the 1970s and 1980s and [distributed artificial intelligence](https://en.wikipedia.org/wiki/Distributed_artificial_intelligence), and most of those concepts can be combined with the language models we have today. 

What's curious is that even last year we could still argue about the efficiency of multi-agent systems, especially for the most complex tasks. But around mid-2026, LLMs became great at interagent communication and handoffs. That opens up new possibilities and new challenges: handling the context of a single agent isn't easy, and now we need to figure out how to manage many of them. We may also expect that harnesses will evolve towards this, and we have early examples such as [Claude Managed Agents](https://platform.claude.com/workspaces/default/agent-quickstart). 

Below is an example of **research** performed by multiple agents. Each agent tackles the problem from a different perspective, and they **collaborate** to compare results and learn from each other. The whole fleet is set up **dynamically**, and in this case the lead agent controls the entire workflow - including spawning and closing each worker. 

![Example multi-agent research in two waves, from top to bottom. A lead agent sends one question to wave 1, where a tech agent, a cost agent and a risk agent research it and compare results with each other. Wave 2, with the cost agent and the tech agent, researches deeper and compares again. The results come back as a report. The agent roles are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-1/frame.html)

Agents in the graph above each have their own context, and we already know the mechanics behind it. But from our perspective, we also need to manage the broader context of the entire workflow, through which the agents communicate and the lead agent manages the rest. Besides context, in multi-agent systems we need to define the **scope, capabilities, and permissions** of each agent. That's why we need to decide which architecture we want to build for our use case.

**Single Agents:**
This may be counterintuitive, but a system built around one agent can still be multi-agent when several instances of that agent run that share the same resources and capabilities. This brings the opportunities and challenges typical of multi-agent systems. 

![A timeline of one agent on a schedule, from 06:00 to 08:00. Instance 1 does the daily research from 06:00 to 07:30. Instance 2 starts the daily brief at 07:00. A red line shows that the brief reads the shared files at 07:00, while they still hold the old research. The new research lands at 07:30. The times are an example.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-2/frame.html)

**Subagents:**
Technically, a subagent is a mechanism, not an architecture pattern. It is present in most harnesses, although it can be implemented in many ways. The core concept is **handoff**: you pass a specific task to a separate, short-lived agent, which comes back with the results. Depending on implementation it may also allow **waiting and resuming**, so [the subagent may ask for additional context](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/subagent-asks-back) or permission and finish their task once it has everything it needs.

![Exchange between a parent agent and a subagent, as two lifelines with four straight labeled arrows. The parent agent delegates a task: {"task": "Draft a reply about the project delay"}. The subagent asks for context and waits: {"status": "waiting", "question": "What is the new date?"}. The parent agent sends the answer: {"answer": "24 October"}. The subagent resumes and returns: {"status": "done", "result": "Dear client, … 24 October."}. The task and the values are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-3/frame.html)

Subagents may also be implemented as **workers**: separate, interactive instances that live on their own, **emit events** to the parent instance to communicate with it, and are controlled by it.

**Hierarchy:**
Subagents are a delegation mechanism, but we can give them a structure that improves organization and context management. The result is a hierarchy that can be deeply nested and can include predefined workers and coordinators who manage them and collaborate with each other. Leaders and/or coordinators can assemble this hierarchy **dynamically**.

![A vertical hierarchy, two levels deep. A leader at the top connects to three coordinators. Each coordinator is in its own frame, its scope, and manages two workers. Red lines join neighboring coordinators, which collaborate with each other. The numbers of coordinators and workers are an example.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-4/frame.html)

**Team:** 
Hierarchical structure implies connections between coordinators and leaders. But we may want a **team of agents** with specific roles, working toward a goal through a **shared workspace**. Every worker can communicate with the others, so there is no need for coordinators or leaders, although they may exist as well.

![A shared workspace at the top holds the goal of the team. Three agents, A, B and C, each with an own role, sit below it. Each agent reads from and writes to the shared workspace. Lines join every agent with the other two agents, so they exchange messages directly, with no coordinator or leader.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-5/frame.html)

**Swarm:**
A group of agents can decide for itself which agent or agents should take part in a given activity to accomplish a task. We may define roles, rules, and permissions, along with the scope and the main objective. But within these limits, the agents decide who does the work, and no lead agent controls the flow. This is a so-called swarm, an architecture that is not yet common in production. But as models get better, it may become more useful and popular.

![A swarm of five agents inside one frame. The frame name lists roles, rules, permissions, scope and objective. The agents are joined to each other, and no lead agent is above them. Two agents, chosen by the group, connect to the task in red.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-7/frame.html)

In general, multi-agent architectures are about addressing the limitations of current models in areas such as context windows or instruction following. This may suggest that as models get better, the value of these architectures will drop. But we can also think about them in terms of **increasing efficiency** through parallelism, which unlocks both speed and diversity of exploration. All this, together with environments that let agents empirically verify the results of their work, opens up incredible possibilities. 

![A top-to-bottom flow. An open-ended problem goes to three agents in parallel. The agents share results with each other and send results to the environment. The environment verifies them and calls external services. A failed result goes to the error step, and a red dashed line goes back to the agent so that it recovers and tries again. Verified results become the best answer.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-6/frame.html)

Also, agents may collaborate not only within our environment, but also with agents created by others, and this is one of the most important aspects to keep in mind when thinking about agents. In such scenarios, we may want to **expose some capabilities** to others while securing the rest. 

Thanks to multi-agent architectures, we can work with hundreds or even thousands of agents at the same time. As we know from experience, working with just a few agents can be tricky. So we need to figure out how to cooperate with entire fleets, especially in terms of reliability, cost control, and speed.

It's worth keeping in mind that **errors can propagate across agents**. We need to pay special attention to the quality of the system, including error handling and reporting, and provide recovery paths.

![A timeline graph of four example agents: a lead agent and agents A, B and C. Time runs from left to right. Agent A makes an error at one step. Every later step that uses its output is affected: the next steps of agent A, the steps of agent B that take its handoff, and the final result of the lead agent. Agent C also gets the bad output, but it recovers, so its later steps are not affected.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-8/frame.html)

## Agent2Agent

Agents have to work together freely, but in most cases we don't want them to share their internals. The reason may be context management, specialization, our internal policies or **the fact that the second agent does not belong to us**. At the same time they need to be able to discover each other and understand what may be expected from the given agent.

Let's say I have a personal agent that has access to my services, devices and resources. At the same time, I want you to be able to ask it for something without it revealing my personal details or giving you access to the apps I use. 

We have two agents below trying to schedule a meeting. The problem is one of them revealed personal details about the calendar entries. And that's not the only issue, as with this configuration the first agent may ask the second agent to remove the calendar entries, and the second agent will comply.

![Example: two agents talk to book a meeting on Friday. On the left, inside “Your side”, your agent has the task and its resources, Calendar and Mail. On the right, inside “My side”, my agent has no description of itself and has the resources Mail, Files, Smart lock and Calendar. Your agent asks “What can you do?”, and my agent lists all its resources. Your agent asks “Can your user meet on Friday?”. My agent calls calendar.list("Friday") and replies, in red, with private details: “Dentist at 09:00, job interview at Acme at 14:00. Free after 16:00.” Your agent replies “Then Friday at 16:00.”](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-9/frame.html)

One of the best approaches to solving the problem of both discovery and communication is the [Agent2Agent Protocol](https://github.com/a2aproject/A2A), or A2A. So far, it isn't as popular as the Model Context Protocol (MCP), and it's hard to tell if it ever will be. At the same time, the two protocols don't compete, because MCP extends what a single agent can do, while A2A connects agents to each other.

Below is an example of two agents, where one discovers the other. In this scenario, the first agent becomes a **client** and the second becomes a **server**. Depending on the configuration, this may work both ways, with each agent acting as both a client and a server.

![Two frames, Your side and My side. In each frame, an agent connects down to its own calendar, an MCP server: your agent through "MCP: add event", my agent through "MCP: read events". A red line labeled A2A goes from your agent to my agent. The meeting is an example.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-10/frame.html)

The A2A protocol is based on the idea that every agent introduces itself with a **card** containing its name, description, version, available skills and connection details, as well as some metadata such as provider information or capability flags. Cards are available through the well-known URI convention (RFC 8615). It is also worth knowing that [the card can be restricted to authorized users](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/agent-card-boundary) when needed.

![An example Agent Card shown as JSON, published at /.well-known/agent-card.json. It holds the name, description, version, supported interfaces, capabilities, input and output modes, and skills of an example Scheduling Agent. A short note beside each section says what it tells a client. A line under the card says that internal tools, memory and implementation details are not in it. All values are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-12/frame.html)

Agents share only the most important information, so they don't share **threads**. That means the communication has to include **everything that's needed**, including the necessary context. And that context may be more than just text: it can also be structured data, such as file references. 

The communication happens over HTTP(S) requests and often follows the JSON-RPC format, so messages contain properties such as **jsonrpc, id, method and params**. An example envelope is shown below.

![A card with a JSON-RPC request that has the method SendMessage. Its params hold one A2A message. The message has a messageId, a role and three parts: text, structured data and a file reference. It also has the optional fields contextId, taskId, metadata and extensions. A short note beside each field tells what the field does. The parts array is red. All values are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-13/frame.html)

An interaction can be handled in a few ways: polling, server-sent events, or push notifications. The pattern we choose here depends mostly on our needs for responsiveness and persistence.

Let's say we have a research agent that needs some information from a second agent. The interaction goes like this:

1. Agent A discovers Agent B's card and learns about its capabilities.
   2. Agent A sends Agent B a message containing all the information it has.
   3. Agent B needs one more detail. It pauses the task in the input-required state and asks a question.
   4. Agent A sends the answer with the same task ID.
   5. Agent B completes the task and returns the results.

And below we have a possible representation of that exchange. It is also worth cloning [this repository](https://github.com/a2aproject/a2a-samples/tree/main/samples) and chat about included samples with our agent, to explore available patterns. 

![A2A exchange between Agent A (Research Agent) and Agent B (Weather Agent). Discovery: Agent A sends HTTP GET to https://weather.example.com/.well-known/agent-card.json, and Agent B returns the Agent Card with the rain-forecast skill and a JSON-RPC endpoint (the /a2a URL is an example). Then four JSON-RPC 2.0 messages: SendMessage with role ROLE\_USER and "Will it rain in Wrocław on Saturday?"; a result.task task-abc123 in context ctx-1 with state TASK\_STATE\_INPUT\_REQUIRED and the agent question "Which hours do you need?", without an artifact; a second SendMessage with taskId task-abc123, contextId ctx-1 and "14:00 to 18:00."; and result.task task-abc123 in state TASK\_STATE\_COMPLETED with the artifact rain-forecast: "Saturday 14:00–18:00 in Wrocław: 20% chance of rain, no rain expected." Red marks the TASK\_STATE\_INPUT\_REQUIRED state and the taskId in the second request: they continue the same task.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-14/frame.html)

Regardless of whether A2A becomes part of our system, it is still worth exploring its concepts as they may be valuable for building custom multi-agentic systems. One of them is concurrency. While A2A does not solve this completely, it comes with ideas such as: 

- **Multitasking:** the agent can handle multiple independent tasks at once, each with its own ID and state.
- **Multiple Streams:** allows multiple clients to subscribe to the results of the same task. Events are broadcast to all active streams in the same order. Closing one stream does not affect the others.
- **Task ID management:** IDs are generated by the server, not the client to avoid collisions.

But in practice, there are many more challenges and issues, so let's explore some of them. 

## Multi-agentic collaboration

The latest models are getting really good at [long-horizon tasks](https://metr.org/time-horizons/), but all it takes is trying to work with agents within a team to see how difficult it is to manage work that can happen so fast. Even the simplest activities easily overlap and conflict with each other. And people aren't the only ones who have a hard time keeping up. Agents quickly get confused too.

Although I don't have answers to all the questions we're facing in our work, it's worth keeping the following in mind:

**Structure:** 
Agents can easily navigate complex structures, but it's still worth keeping things **as simple as possible** and **agentic-first**. It's also worth deciding whether humans will ever read the documents in their original form, because even today most people interact with content through their agents. The structure has to natively address any requirements related to security and permission management as those aspects need to be handled by deterministic logic, and not agents alone.

![A horizontal diagram. A solid arrow goes from the pill "People" to the pill "Agents". A solid arrow goes from "Agents" into the Permissions gate. A dashed line labeled "rarely" goes from "People" over "Agents" and down into the top of the same gate. The gate is the left wall of a frame named "Structure". It shows a red lock, the label "Permissions" and the word "code". One arrow goes from the gate to the tree workspace/ with documents/, knowledge/ and skills/. Nothing else enters the frame.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-11/frame.html)

**Contracts:** 
Following A2A, we may want unified contracts for documents, folders, communication, reports and activity logs. This structure opens the way to **deterministic lookups**, validators and health checks. In some cases, we may want to consider **graph databases**.

![Three example contracts side by side. A message is a JSON envelope. A folder is a fixed tree. A document has frontmatter. All three use the example task ID t-42. Lines go from each contract to one red part: deterministic lookups and validators. The field values are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-15/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-15/frame.html)

**Management:** 
Manager roles in multi-agent systems are crucial and worth the effort to get right. Once managers properly understand both the broad and the narrow context of the project, they can make useful decisions for other agents. So instead of all the agents accessing resources directly, they contact the agents responsible for managing those resources.

![Diagram of a multi-agent harness. Agent A and Agent B have two-way arrows to the Manager of resources. Agent C has a two-way arrow to the Manager of tools. Both managers sit in a red group named Managers. Each manager has a queue of agent chips, an empty slot and a list of rules. A two-way arrow labelled resolve conflicts joins the two managers. Global context of the project points down into Managers. Each manager has a one-way arrow to its asset: Resources or Tools. A dashed two-way line joins a Human, when needed, to Managers. Workers never reach resources or tools directly.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-16/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-16/frame.html)

**Self-healing:** 
The entire system has to be built so that it can observe its own behavior, access nearly every type of log and activity data, and, in some cases, modify its own logic. Self-healing activities are crucial and may account for as much as 40-60% of all the work the system does. In practice, this means that most of our focus needs to be on shaping the mechanics that agents need for nearly autonomous development we can trust.

![A bar shows that self-healing activities take 40–60% of all system activities, and other activities take the rest. Below the bar, a loop shows how self-healing works: the system logic leads to "Observe own behavior", then "Read logs and activities", then "Access nearly all resources". In some cases, this leads to "Modify own logic", which goes back to the system logic.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-17/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-17/frame.html)

**Activity tracking:** 
Track everything that happens within the system with platforms such as [Axiom](https://axiom.co) and/or [PostHog](https://posthog.com/). In fact, observability is **critical** because we're dealing with non-deterministic logic whose behavior cannot be clearly explained or 'debugged' from the code alone. Observability logic has to be wired natively into the system, so we don't just log standalone events but keep all of them contextual. That way, it's possible to track the entire interaction between all the agents involved.

![Two panels side by side. Left, in grey, a frame named Standalone holds five log lines in mixed order with no links: 12:01:04 tool\_call, 12:01:02 llm\_response, 12:01:07 error, 12:01:03 tool\_call, 12:01:05 llm\_response. Right, a red frame named Contextual holds a trace waterfall. A tree on the left reads: trace 7f3a, then Agent A with tool\_call and Agent B, Agent B with llm\_response and Agent C, and Agent C with error. Each row has a timeline bar on the right. Each child bar sits inside its parent's span, and thin red lines join each parent to its children. Only the error bar is filled red. The bar positions are example values. An arrow goes down from the Contextual frame to a dashed box named Axiom / PostHog.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-18/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-18/frame.html)

**Heartbeat:**
When working, agents may encounter various errors or dead ends, or simply get stuck for some reason. The problem is that in long-horizon tasks, it's not obvious whether an agent is stuck, still working or waiting for something, and we need to catch that properly and respond. The good news is that there are well-known mechanisms for this, and one of them is **a heartbeat** that lets us periodically check agents' activity.

![Timeline diagram. Three agents, A, B and C, each have one timeline. Time runs left to right. Agent A has activity ticks across the full width. Agent B has ticks for the first half, then a hollow circle, then a dashed quiet line. Agent C has ticks for the first half, then a red tick, then a solid quiet line. The two quiet ends look almost the same. Dashed red heartbeat lines cross all three timelines at equal intervals, and the last line is solid. Past the last line, the status chips are "working" for A, "waiting" for B and "stuck" for C, in red. An arrow goes only from "stuck" to a box "respond". The tick spacing and the number of heartbeat lines are examples.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-19/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-19/frame.html)

At this point, it should be clear that building multi-agent systems is demanding, especially because it isn't just about the technology, but also about business processes, decisions and needs. On the other hand, some of these mechanics can be built quite easily on top of existing harnesses by extending their capabilities through MCP servers or customization. We just need to make sure our setup isn't built around issues that will soon be solved. The best way to check this is to keep asking: **what will happen to your system when models / harnesses get better?**

## Orchestration

Working directly with agents makes us responsible for managing their work, helping them figure out issues, and steering their actions toward a bigger goal. For agents to operate on their own, most of these activities need to be translated into the system features we've discussed so far. But in the real world, the outcomes need to be **reliable** enough to be predictable (which may be achieved in many ways).

Let's say we want agents to handle the publication process for YouTube videos. Such a process may consist of many steps, such as: 

- editing raw recordings, cleaning up and mastering the audio, 
- generating captions and translated subtitles, 
- getting a title, a description, tags and chapter markers, 
- designing a couple of thumbnails to iterate on, 
- checking copyright, music licenses and sponsorship disclosures, 
- setting up end screens, cards and playlists, cutting Shorts and clips, 
- drafting social media posts, a community post and a newsletter, 
- scheduling the release, writing a pinned comment, 
- and, after release, tracking comments and analytics to adjust the title and thumbnail.

That's a lot! And regardless of the LLMs' native capabilities, the chance of getting everything right **every time we publish a video** is low, as most of those steps depend on **our own strategy, preferences and procedures**. Additionally, nearly every step may present an edge case that has to be resolved by either a well-trained agent or a human. 

The entire process not only has to be reliable, but also consistent and continuously improved, so lessons from the past must affect the system's current behavior. 

But based on what we've learned so far, it should be clear that the goal isn't to **create a system for video publication** but to **build primitives (generalized building blocks)** that let the system adjust to the current situation. That includes modifying the process or even **handling a different process** that may share similar primitives.

![A vertical pipeline diagram. At the top are five chips: YouTube, Podcast, Article, Newsletter and Print. The first four arrows join into one arrow that goes into a red frame named "Publication agents". The arrow enters through a Capabilities strip with the chips video, audio, image, text, accounts and analytics. The dashed grey Print chip has a short arrow that stops at the strip with a red ×. In the frame, six stage cards are in a row: produce, package, verify, distribute, release and learn. Each card has a red dot for the agent that owns it. Below the stages is a Playbook card with the chips strategy, preferences and procedures. A grey bracket goes up from the Playbook to the row of stages. A red arrow goes from learn down into the Playbook. On the right, outside the frame, a dashed line labeled "edge cases" connects a Human pill to the frame.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-20/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-20/frame.html)

The difference from classic systems or automation workflows should be clearly visible here, because with AI, we gain **flexibility** at the cost of **control**. The problem is that control is often crucial in business processes. For example, we may not want to let the agent post public comments under our name. 

The first lesson here is that **when we need 100% certainty, we can't rely on LLMs** (although [a million-step task has been solved with zero errors](https://arxiv.org/pdf/2511.09030)). 

The second lesson is that **not every action in a business process requires certainty**, which means all we need to do is find the right balance between agentic logic and deterministic code. In our example we may think of this as follows: 

- video editing can be done with [DaVinci MCP](https://x.com/The_Alex/status/2097847043796725924?s=20) and an agent
- thumbnails can be generated through [Replicate](http://replicate.com/) or with a custom AI image-generation tool
- title, description etc. may be iterated by an agent and only accepted by a human
- tracking activities and stats may be done autonomously and humans may be notified only when needed

The level of autonomy here depends on the business, but we can clearly see that some steps can be done entirely or partially by agents. Also, some steps depend on each other while others don't, and these dependencies may often come from business decisions, including the need to **physically block an agent from certain actions**. And lastly, some actions have to be performed entirely in the background, without direct supervision.

![Swimlane map of video publication. It has three lanes: Human, Agent and Background. It has four columns: produce, package, release and learn. In the Agent lane, edit (DaVinci MCP) goes to captions, then to title. Title goes up to the human step accept. Accept passes through a lock chip into a join bar, which thumbnails (Replicate) also goes into. The join bar goes to release. From release, one arrow stops at a locked code wall with a red ×, below the human step comment. Another arrow goes down to stats in the Background lane. A red arrow goes from stats back to thumbnails. A dashed line labelled 'when needed' goes from stats up to the Human lane.](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-21/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e04/artifacts/lesson/figure-21/frame.html)

## Takeaways

Now, putting this all together with what we've learned so far:

- **Agents:** even though a single agent could potentially handle the entire process, splitting responsibilities between agents gives us control over **their context, capabilities and permissions**, as well as over **concurrency, conflicts and structure**.
- **Primitives:** well-chosen, generalized building blocks unlock flexibility both in code and at runtime. With primitives, it's possible to easily extend the capabilities of the entire system with minimal code changes.
- **Code Mode:** agents may automate part of their work through code, as some actions are repeatable and don't require AI unless their logic needs to change.
- **Context:** when agents are spawned, they may receive both dynamic context from their parent and predefined instructions that depend on their role **or the current state of the system**.
- **Dependencies:** agents or code can control the process by defining which steps can run in parallel and which depend on each other. Also, some actions may be **blocked** until certain conditions are met. For example, publishing a comment can be blocked until a human approves it, but once that happens, the comment cannot be edited without additional approval. One way to achieve this kind of logic is a directed acyclic graph (DAG).
- **Durability:** and lastly, since we're dealing with a long-horizon process that is partially handled in the background, using pi-durable or relying on agents that can recover from a crash is a must.

The list above reflects how our MEGA journey is increasingly moving us towards agentic systems. We can look at them from the perspective of **software development** and through the logic of **multi-agent systems** capable of managing or autonomously handling entire business processes.
