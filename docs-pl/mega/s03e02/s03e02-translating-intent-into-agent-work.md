# S03E02 · Translating Intent into Agent Work

Agents can move really fast, but they need to know where they're heading, without us having to answer their every question or watch their every move, and without sacrificing quality or the proper shape of the product. Getting all of this without even having to read the code sounds like wishful thinking. But is it really?

Despite their technical limitations, generative models possess capabilities that exceed much of what we can do, and this single fact is **the core concept we need to grasp**. But instead of worrying that we will become obsolete, it's better to focus on figuring out how we can use it. And there's lots of things to explore.

Just think for a second: if we have an agent more capable than us, instead of telling how to do things, we need to tell them **what do we need, what principles (not rules) to follow and how to prove the result is aligned with them.**

But how can we do this, exactly?

## Outline

- Intent: definition of done, user impact, existing behavior, desired outcome
- Context: product knowledge, market knowledge, codebase maps, constraints, conventions, prior decisions
- Requirements and decomposition: assumptions, ambiguities, contradictions, missing information, focused questions, structured briefs, negative examples, boundaries, simplification, dependencies, checkpoints, rules, assignments, open-endedness
- Evaluation: expectations, acceptance criteria, quality bars, evidence requirements, tests

## Describing intent

Based on [two months of my interactions with agents](https://cloud.overment.com/overment-agents-1792502457.html), my messages contained about 7 words, and dictated ones were about 150 words long. And for my 4.5k messages, agents wrote me back around 13.5k replies and they send twice as much between each other, without interaction with me, working from 3 to nearly 40 hours long.

![Two charts side by side, centered and aligned. On the left, a pie chart of messages in two months: 4.5k from me (10%), about 13.5k agent replies (30%), and about 27k between agents (60%). The value of about 27k is twice the 13.5k replies, as the passage says. On the right, square grids of words in one message: about 7 for a typed message and about 150 for a dictated one, one square for each word.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-1/frame.html)

Most of what I do comes down to **describing intent** and **giving feedback**. Agents rarely receive exact instructions telling them what to do. In fact, they follow **principles**, not rules, because it gives them more space to make decision that would be hard to predict, for example: 

- **Rule:** Keep answers under 100 words.
- **Principle:** Respect the reader's attention. Every sentence should earn its place.

- **Rule:** Never delete files.
- **Principle:** Match your caution to the cost of being wrong.

- **Rule:** Use bullet points.
- **Principle:** Let the content decide its form.

Both rules and principles aim at the same direction, but the rule may be too strict or to narrow to be useful in dynamic environment the agent will be. And models we have today are smart enough to find the best option that remains within boundaries defined by our principles.

![Three panels in one row. Each panel has a white dot on the left and a bullseye in the upper right. Under "Rule", panel 1 has a grey path along a lane of two parallel lines. The path ends with a check mark below the target. In panel 2, a grey path turns up toward the target and stops at the top lane line, marked with an X. Under "Principle", panel 3 has a dashed rounded boundary around the dot and the target. A red path curves from the dot into the red center of the target.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-2/frame.html)

Along with principles, it's worth considering telling the agent about **the reason** behind the intent. This brings an additional layer of valuable context that lets the agent see the bigger picture of what we want to achieve, while still leaving it enough room to steer itself toward the best possible solution. At the same time it may **understand dynamic boundaries** that may affect agent behavior. 

Let's imagine we have an agent with access to context about the people on our team. We want it to communicate openly in direct messages, but not reveal unnecessary details on team channels. We have then: 

- **Principle:** Share information only with the people it concerns.
- **Reason:** People share things with the agent only if they trust it to keep them in the right place.

In this configuration, we can expect the agent to implement the feature so that direct messages reveal all the details, but the team channel keeps them hidden. And if the agent notices that some channels may have **guests** from outside the organization, it will adjust accordingly.

![A block at the top holds the principle "Share information only with the people it concerns" and its reason "People share things with the agent only when they trust it to keep them in the right place." A line runs down to a dashed pill, "Variable: who can read the channel", and splits into three panels. Direct message: one person; the agent says "You have a doctor's appointment at 14:00, so I moved the review to 16:00." (Full context). Team channel: four people; the agent says "Adam is unavailable from 14:00 to 15:00. The review moves to 16:00." (The fact, without the reason). Channel with guests: four people and two dashed guest figures; the agent says "The review moves to 16:00." (Only what guests need). The bubbles get smaller from left to right.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-3/frame.html)

And that's just an example, but the main point is that **principles and reasons** let us shape intents that rely more on models' native capabilities. So the outcome we get may not only match our original requirements but also address aspects we didn't foresee, especially if the agent explores the knowledge base and other available sources.

## Product context

Coding agents natively know how to explore a codebase, but they know very little about anything that cannot be read from the code: external services, platforms, tools and internal knowledge bases. What's more, from code alone they can only learn about the **current state** of a product. They have little idea of its direction, what the team is already working on, or whether there are any strategic business decisions to consider.

Our goal is to make the agent "learn" how to explore context beyond code and how to make decisions that are aligned with product vision and business objectives. The question is - how we can achieve this? 

In [Kent's repository](https://github.com/kody-hq/kody/tree/main/docs/contributing/decisions) there's literally a folder named **decisions** that holds a very simple documents that follows the same format - ADR - and contain information about the decision Kent made, what was the context and the reason behind it. All those files are entirely managed by agents, but their contents comes from interactions with him. 

![Two aligned columns. Left: a decisions/ folder of identically formatted record files, then one record card with five rows: Number · Title · Status · Date, Context, Decision, Consequences, and a dashed Exit criterion row tagged "added, dated". Right: for each left item, a thin grey line leads to a red agent dot and the question the agent no longer has to ask, with what it does instead. Bottom: a loop of four nodes – owner explains a choice, agent writes the record, next agent reads it before coding, change fits or a new record replaces the old one – and back to the start.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-4/frame.html)

A similar approach comes from our friend Matt Pocock, who says that [ADRs work great with /grill-with-docs](https://x.com/mattpocockuk/status/2107560148243812772?s=20), a skill that helps with making decisions not only when we work solo on a project, but also within a team. According to him, ADRs help agents better understand changes made earlier and avoid disrupting the work of others. Without ADRs, agents often modify or even remove features that were implemented with a specific intent that can't be inferred from the code alone.

On the other hand, Lauren Tan claims that [ADRs don't really work for her](https://x.com/poteto/status/2098214871943033209?s=20) because they tend to distract her agents too much. Given the scale of her work (2,500+ PRs a month), it's reasonable that she might have a different perspective. But even though it's worth exploring [her approach](https://x.com/poteto/status/2094457600259842065) and its very good breakdown available [here](https://barnabyrobson.org/on-pstack/). From this we'll learn that her approach is strongly oriented on **principles** she turns into **durable guidance** through skills, types, environment design and self-verification. She avoids feeding agents with a growing archive of past decisions.

And one more example comes from Joel Hooks, who claims that [Effect](https://effect.website/) Schemas + heavy Domain Driven Design (DDD) is the way the codebase itself describes the shape of the product. In his project he relies on "CAFE" stack - Cloudflare, Alchemy, Foldkit and Effect, suggesting it has many traits that makes it 'agentic-first'.

All those examples, while different, reveal similar patterns focused on **increasing agents' autonomy**, which makes them not only ask fewer questions but also make **better decisions**.

## Requirements and decomposition

Agents can do a lot of things autonomously, but most of the requirements still come from the business and clients. It's our job to translate those inputs into the scope of work the agents will take care of, because responsibility is something we can't delegate to AI.

By default, when we think about delegating technical tasks to someone, a detailed specification feels to be the most natural. But this is not what we're looking for in work with AI agents. A better choice would be to reach **an agreement** defining **scope, outcome, boundaries and proof** and with all this AI can help us too!

To shape an agreement, we first need to gather as many resources as possible. Not because we want to read them all, but because we want our agents to have more context. This way, we can use not only knowledge that comes from our experience, but also knowledge that goes beyond our current competence. And this process doesn't have to rely on conversation alone. We can also use various "one-off" interactive documents and even mini-apps to make it easier for us to understand **what we have, what we want, and whether our agreement reflects this**.

**Visuals:** 
Since Opus 5.5, models have shown an outstanding ability to represent context visually. One of the best examples is the [Anatomy](https://skills.wheresryan.sh/anatomy) skill, which may not be that useful for our work but perfectly shows what these models are capable of. Another example we may want to try is the [**/show-me** skill from HumanLayer](https://x.com/dexhorthy/status/2087569590268391897?s=20), which was created specifically for **visual conversations** instead of walls of text.

![Diagram: one coding topic, adding a "Run skill" button to a session page, shown two ways. Left, "Wall of text": a tall message bubble with an accent agent dot and 14 grey lines, with an arrow to the right. Right, "Visual conversation": six tiles in three columns. "What we have" holds a file tree and a call tree. "What we want" holds pseudocode and a UI sketch with an accent "Run skill" button and "Skill result" card. "Does the agreement match?" holds a diff with two accent "+" lines and a flow of four boxes. A dashed pill reads "Principle: pick the smallest view that makes the point clear."](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-5/frame.html)

**Comparisons:**
The way to tell whether the change we want to make covers everything we need is to present it as a **side-by-side comparison**. The comparison may take the form of synthetic visuals of the back-end logic, **screenshots** of the app, or even actual components generated from the design system or storybooks. One of the examples from my projects [shows one of the iterations](https://cloud.overment.com/settings-1792679861.html) of its settings and it was created based on **design system**, so the components are **interactive**. 

![A three-by-three comparison of one change to a settings screen: the app now handles an API key that the provider refuses. The left column names three forms: back-end logic, a screenshot and design-system components. Each form has its question. The two columns on the right compare "Now" and "Proposed". Back-end logic: the proposed handler has four new red lines. They check the key with the provider and, if the provider refuses it, show the problem, keep the field open and return. Screenshot: the same greyscale Settings window, with OpenAI, Anthropic and Gemini rows. In the proposed window the OpenAI row has a red dot, the text "OpenAI didn't accept the key." and a red-outlined field, "Paste a new key". Design-system components: a 2×2 grid of state cards. These are REST, NO KEY and NOT ANSWERING, plus an empty dashed slot. In the proposed grid, the empty slot holds a red dashed "KEY REFUSED" card. A cursor points at its field.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-6/frame.html)

**Graphs and diagrams:**
Reasoning over many documents covering wide range of topics is easier when we can easily switch between high level concepts and low level details. This can be achieved with layered graphs or their variants, built by agents in HTML that holds state agent can read and quickly understand our current focus. Structures like this may be **designed** the best by a fleet of agents that will collaboratively work on matching **the framework** with the type of data we have. It's worth to iterate the framework couple times to get the shape good enough we can reuse it more than once. 

![Example figure. Left: a codebase graph named Alice, shown in three panels of increasing zoom. The Plant panel shows 14 modules, with "Desktop host" marked. The Module panel lists the 14 places of Desktop host, with "Caller factory" marked. The Place panel shows Caller factory as a round node with 7 connections and 1 journey step. Each panel has dashed copies behind it for the other lenses (Places 88, Work 457, Journeys 4, Days 27). Callout lines run from each marked element to the next panel. An arrow under the panels goes from high-level concepts to low-level details. Right: a page-state card with the focus (lens Places, zoom place, path Plant / Desktop host / Caller factory). A line connects the card to the node. An agent dot reads the card and answers "What touches this?" with "Caller factory: 7 connections, 1 journey, 26 work items." All names and numbers are example values.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-7/frame.html)

**Lab:**
And lastly, there's the concept of **a lab**, which can be a single HTML file, a standalone app, or a separate module of the app. A lab is different from the previous forms because it lets us literally experience the results while keeping iterations extremely fast. A lab may also have **embedded agents** to handle runtime logic and interactions. Labs can be built with an **agents-first** approach in mind, so agents can get quick feedback from them: a lab may generate artifacts and be a source of useful context.

![A diagram of a lab. Left: a lab can be a single HTML file (lab.html), a standalone app, or a module of the app (/lab). Center: an example lab window, "Channel privacy lab". The Scenario pane has the event "Adam: doctor's appointment, 14:00–15:00", an audience control with "Channel with guests" selected, and a cursor on the Run button. The Result pane shows four team members and two guests, the embedded agent's reply "The review moves to 16:00.", two passed checks, and "Run 14 · 1.4 s". A Runs list shows run 12 failed ("Mentioned the appointment") and runs 13 and 14 passed. Right: lines go from the lab to three artifact files (runs/0014.json, transcript.md, screenshot.png), then to a card with the run 14 results, which the coding agent reads. Bottom: a loop. The coding agent changes the prompt, the lab reruns in seconds, we try the result, and the coding agent reads the artifacts. The scenario, the reply, the run numbers and the times are examples.](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s03e02/artifacts/lesson/figure-8/frame.html)

Regardless of which tool we use, the goal is to discover blind spots, possible edge cases, second-order effects (knock-on effects of the change) and hidden opportunities. This moves us towards systems thinking: **instead of looking at a feature or issue in isolation, we want to understand how it connects to the rest of the product.** The tools above make the system visible, so that we and our agents can see which parts a change touches, and what it sets in motion, before the work starts.

A tool alone isn't enough to work out a proper agreement, especially because we're not talking about a single, comprehensive plan here, but about **a set of tasks.** The agent will receive them and manage the work of other agents to deliver the results. 

We may also use techniques related to **generalized steering**, mentioned in **S01E01**, such as **self-querying, meta-questions**, and various forms of **tree of thoughts**. In other words, we should focus on finding ways to steer the agent so that it both loads the model's base knowledge and explores the available context. For example:

- **Obvious questions:** ask the agent about things we already know to load them into the thread. Then ask it to list modules / features / concepts, and then **spin up subagents** that will go deeper into them or perform any other transformation useful for the task.
- **Rephrasing:** turn on the microphone and say everything we know about what we want to achieve. Then ask the agent to **rephrase what we just said** and enrich its answer with the available context.
- **Splitting & merging:** when exploring context, don't go straight to the end result. Instead, steer toward **broad exploration**, then **unify the relevant results**, and repeat this a couple of times. This is a form of 'tree of thoughts', which we can modify however we like.
- **Using mental models:** while exploring context, ask the agent to use mental models such as Occam's Razor, First-Principles Thinking, Second-Order Thinking or Inversion. This often improves the quality of the end result.

In simple terms - we need to stay curious and play with the agent to get the results we're happy about. And when we feel comfortable with the process and extract some principles along the road, we may want to make agents to self-play. 

## Evaluation

Reaching agreement on scope, desired outcome, and boundaries is not everything. In fact, it's irrelevant if the result can't be proven without cheating and without us having to go through every single change. So, we need to build trust, by **defining how the result will be proven** and ensuring the agent has all the tools and the knowledge to prove it.

When defining how the agent's work will be proven, we need to consider:

- **Models Capabilities:** models are great at writing code, using tools and finding patterns in multimodal data. They can also combine these capabilities to test the functionalities in dynamic scenarios and gather evidences of their work in form of logs, measurements, screenshots and videos.
- **Models Limitations:** models struggle with details, keeping track of many variables and instructions, staying consistent and 'aware' of anything that is not currently within their context. 
- **Resources:** running models costs money, time and require hardware if evaluation needs to manage processes, compilation, sandboxes or emulation. Not in our interest then is to verify everything, but only what's really matters.
- **Tools we do have:** we may have linters, type checkers, compilers, unit tests, development environment, test accounts and even dedicated machines agents can use to run the tests.
- **Tools we do need:** if anything prevents agent from actions that may lead to verify its own work, first we need to design and generate tools for them to use. This may include configuring test environments or even machines using platforms such as [agentcomputer](https://www.agentcomputer.ai/) or [browserbase](http://browserbase.com/).
- **Metrics:** evaluation needs metrics and evidence that accurately reflect reality. For example, when testing a UI, having an LLM analyze screenshots isn't enough because it struggles to see the details, so measurements need to be taken in code. Also, if the feature affects the database, the records' mutation history may reveal potential issues.
- **Definition of success:** the agent must know what success means to us, because without it, it may push too far or not far enough. Good examples are feature flags, backfills, or security features that agents often build by default because they aren't aware that these features are irrelevant in the broader context of the product.
- **Definition of failure:** agent must know when gathered evidences, despite their good quality, should be considered as fail. The fact this often depends on a context makes it hard to guess. 

Doing all this is difficult and takes a lot of resources, not only to build but also to repeat. That's why part of this process has to be dedicated to **extracting generalized tools and skills** that can be reused. Even more importantly, **anything that can be verified deterministically** should be handled through code, unless we have a solid reason to do otherwise.

## Takeaways

Today, translating intent into agent work isn't about telling the agent exactly what to do, but about **expanding its tool stack and its "understanding," and adjusting its environment**, while also **using the model's knowledge** and native agentic capabilities to do this. 

Doing all this is hard because agents are limited in many ways, their contact with the environment is constrained, and many factors beyond code need to be considered to get the right work done, and done right. Moreover, we need to manage pace, quality, scale, progress and our own energy.

Looking at this, we can clearly see that programming as we knew it isn't here anymore. But at the same time, many of these "new challenges" are ones we engineers have known for years. And looking at the possibilities AI opens up for us, it becomes clear that there's a lot of work to be done, many challenges to take on and barriers to overcome, and that's where the joy and satisfaction we've known for years come from.
