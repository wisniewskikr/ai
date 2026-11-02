# S02E01 · Agentic Primitives

This week, we'll dive deeper into agentic logic and its underlying mechanics. This knowledge will give us what we need to either **create a harness from scratch** or **customize a harness at any level**. It's one of the most important parts of the entire MEGA, because everything else we're going to build, both for ourselves and for our clients, builds on it.

## Outline

- Agent Loop: model calls, tool execution, results, state, stopping conditions, runtime responsibilities
- Instructions: purpose, responsibilities, profiles, configuration, behavioral guidance, enforced boundaries
- Context and Memory: messages, metadata, attachments, environmental awareness, persistence, retrieval, context injection, prompt caching
- Tools: available actions, function calling, Bash, browser use, code execution, filesystems, permissions, sandboxing

It's worth noting that today AI can build agentic loops without "any" issues. There are also incredible open-source projects, such as [Pi](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts) (the same Pi as the harness we know) and [Goose](https://github.com/aaif-goose/goose), that implement the loop in an elegant way, and many other projects rely on this exact package. But agents aren't just about the loop. We can roughly visualize it like this:

![An agent harness. A caller label sits at the top. One arrow goes down into Wake, and an arrow marked "answer or stop" goes up from Model back to the caller. A red limits frame holds one row of four equal boxes: Wake, Context, Model and Actions. The arrow from Model to Actions has "tool calls" above it and "approval" below it. A dashed "results" arrow runs along the bottom of the frame from Actions back to Context. White hook dots sit on six arrows. Three full-width bands sit under the frame: History, Memory and Observability. Under them are a one-line hook legend and the caption.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-1/frame.html)

There are many architectures and patterns we can use to build and extend agentic harnesses, and the goal is not to **build all of them** but to know what options we have and where to look, and when. And once you feel comfortable with them, you may want to **break some rules** and look for better patterns and implementations for your own use cases.

![A flow diagram. One part, knowledge of agentic logic, connects to four uses. Two of them are in a frame named Harnesses: build from scratch and customize at any level. The other two are in a frame named Agentic tools: for your own use and as product features.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-4/frame.html)

## Agentic Loop

We already know that agents, at their core, are **loops** that keep working until the LLM decides not to use any tools and instead returns text and finishes the task. Between iterations we can manipulate context, settings and trigger logic we need. Sounds simple because it is.

![A flow diagram of the agent loop. State sends context to the model call. The model either replies with tool calls or returns final text. Tools return results, then hooks update the state before the next iteration. The hooks between iterations are marked.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-2/frame.html)

The components are:

- **State:** holds the thread, context, configuration and loop variables
- **Model:** handles interaction with the LLM provider's API (for example, OpenAI)
- **Tools:** a list of schemas the model uses, and callbacks the loop triggers when a tool is chosen
- **Hooks:** a list of callbacks that handle observability or actions such as compaction or file processing

A naive implementation of this is shown below. [Pi agent](https://github.com/earendil-works/pi/tree/main/packages/agent/src) fully implements the same mechanics and shows how powerful this logic is: we can use Pi for coding, but we can also connect it to any tools and **get a general-purpose agent** or at least its initial version. 

![An example JavaScript code snippet of a naive agentic loop. A tools object maps tool names to functions. A hooks object holds beforeModel, beforeTool and afterTool. A while loop calls the hooks, calls the model with the messages and the tool schemas, and runs each tool call. The stop condition is highlighted: when the model returns no tool calls, the loop returns the text. The tool and hook names are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-3/frame.html)

The logic above is extremely flexible, especially if the agent gets **a tool to write and execute code** and **a filesystem**. In practice, many things prevent the agent from working reliably, especially on long-horizon tasks. Even a single API issue may break such an agent. And in practice, there are many more traps related to **memory**, **long context handling**, **authorized actions**, or **internal and external bugs, timeouts, etc.** We face many of these issues every day when working with coding agents: we see them get stuck, fail to do something, or drift because of missing information, and so on. 

![A vertical flow. An example multi-step query starts the agent loop. Model call 1 returns a tool call, and the tool returns a result. Model call 2 gets an API error, shown in red. The loop has no path for the error, so the task stops mid turn. The query, the tool call and the error text are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-5/frame.html)

Harnesses such as Claude Code or Codex aim to address as many of these issues as possible, so [the agents can **recover** from most errors](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/loop-error-recovery) on their own. And those are not the only responsibilities they need to handle.

**Connection:**
Agents need to connect to LLMs, often from more than one provider. This requires adapters and interaction mapping because providers’ APIs may differ. There are many libraries that support many providers out of the box (for example: [AI SDK](https://vercel.com/ai-sdk)), but it's often recommended to use **official SDKs** to avoid unnecessary abstractions.

![A flow diagram. On the left, the agent loop. It connects to two adapters in a frame named Adapters: one for OpenAI and one for Anthropic. Each adapter connects through the official SDK to the API of its provider. The two providers and the tool-call payloads are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-6/frame.html)

**Threads and sessions:**
Interactions with an agent are recorded in a thread that can span multiple sessions and involve more than one agent (`subagents`). Such history is often stored in text files agents can easily read using **bash** or any other tool allowing them to interact with the filesystem. It's important to note that **not every harness** supports subagents and easy access to threads. 

![A frame named Main Thread holds two session frames. In Session 1 the user asks and the agent answers. In Session 2 the user comes back to the same main thread, and the agent asks a subagent. The subagent is in a separate frame named Subagent Thread, and it answers the agent. Red lines show this connection.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-7/frame.html)

**Persistence:** 
Threads aren't the only thing a harness needs to store. There are also attachments, generated artifacts, scripts, skills, permissions, connections, integrations, custom tools and more. From a programmer's perspective, there's nothing interesting about that until we consider that **agents need a way to manage all of this**. 

For example, generated images or artifacts should be available to the agent so it can handle follow up tasks about them. Or if a given integration requires additional permission, the agent should be able to show us the settings where we can grant it permission.

![Flow diagram of persistence in an agent harness. The agent connects to three stored items in a frame named Harness storage: threads, artifacts and permissions. The red line from the agent to the artifacts shows the agent finding an earlier generated image for a follow-up task. A line from permissions to the user shows the settings that the user must grant. The image and the integration are example values.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-10/frame.html)

There's a catch with all this, and it's about **going beyond the context of a single user**. We've gotten used to agents freely interacting with the filesystem on our Mac or PC. But once we go beyond that, so agents can work for our team or for users in production, things get much harder without sandboxes and proper permission management.

![An agent on the left connects to three frames of persistent items. The frames show three access levels. "Agent reads" holds threads and attachments. "Agent creates and edits" holds artifacts, scripts, skills and custom tools, and this frame is red. "Agent asks, user grants" holds permissions, connections and integrations. The grouping of the items into levels is an example.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-8/frame.html)

**Configuration:**
Harnesses such as Claude Code can **configure themselves**. All AI-native apps are starting to follow the same pattern and push it further, so any settings and even **UI** elements can be managed at runtime. Examples include [OpenCode](https://anoma.ly/notes/opencode-reloaded/) and [DeepSeek Harness](https://arxiv.org/pdf/2608.25512). The latter follows the path of **self-evolving software** and the "everything is a plugin" idea.

![Flow diagram. Inside a frame named Harness, the agent configures its own settings and changes its own UI elements at runtime. The changed settings return to the agent, and the user sees the changed UI. The tool calls in the details are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-9/frame.html)

**Context:**
Harnesses take care of the context window in many ways. This includes a clear explanation of the current environment and how to navigate it. The tricky part is managing the **[prefix-based context cache](https://developers.openai.com/api/docs/guides/prompt-caching)**, which reduces costs and latency, but only [if the existing context stays the same](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/prompt-cache-prefix). Also, a harness can't load everything upfront, so the agent has to discover anything that isn't critical when it needs it. At the same time, the context has to be **compressed** to avoid overflowing the window.

![Three columns show the context window at session start, after tool discovery and after compaction. A red frame holds the cached prefix, which is the same in each column: system prompt, AGENTS.md, profile and core tools. Below the prefix, the thread grows with messages and a tool schema that is loaded when needed. Then compaction shrinks the thread to a summary of older messages and the recent messages, kept as they are.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-11/frame.html)

**Tools:** 
Last week we learned that tools can be used by the model either through Function Calling or Code Mode. The first one requires **a schema** to be loaded into the context and calls are separate (but can be performed in parallel). Their results are appended to the thread, so the model can decide about the next step. This works for simple interactions but is very inefficient for complex workflows. That's why modern agents **write code** that can **chain tools** and can keep results in variables rather than adding every result to the context. 

![Flow diagram of code mode. The model writes one script that calls three tools in a chain: calendar.list, mail.search and files.write. Each result stays in a variable, events, mails and file. Only the final result goes into the thread, and the model reads it in the next call. The tool names, code and values are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-12/frame.html)

Sometimes a task executed in **code mode** may return a large chunk of data, such as an entire report. Instead of adding its contents to the context (which may exceed the limit), the results may be dropped into a file and the model may receive a reference to it, so the agent may read its fragment, display it to the user or pass to another tool.

![Flow diagram. Code mode writes a big report to a file. The model gets only a reference to the file, then reads a fragment, displays the file to the user, or passes it to another tool that sends an email. The file path and the email call are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-13/frame.html)

And lastly, the harness is responsible for getting **approvals** from the user before executing actions that are irreversible or require permission for other reasons. Waiting for the user may even take days, and this [has to be handled properly](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/resumable-run).

![Sequence diagram of tool approval in an agentic loop, with an example email tool. The model asks for mail.send. The harness does not run it, but asks the user for approval. The user may answer days later. After approval, the harness runs the tool and sends the result back to the model. The tool name, address and text are example values.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-14/frame.html)

All these components can be considered the core of the harness logic. Together, they give a good picture of why **an agent is not just a loop**: it needs many mechanisms that make interaction with the environment possible.

If this knowledge feels redundant for someone who won't build their own agent, let's consider this: 

- we can't have an extremely long AGENTS.md, because the model will ignore most of it, and latency and cost will increase until it gets cached.
- skills also need to be short and sometimes needs to be **reactivated** many times due to context compaction
- if possible, we should pay attention to keeping the thread **as short as possible** or at least keeping the agent **specialized** in certain tasks
- we can expect that an agent will find what's needed to perform a task, but we should make it easier for them and we need to keep in mind this information may be lost due to compression or simply ignored by the model.

Those are just examples of conclusions that come directly from the mechanics of the harness and the agents themselves. And as we soon find out, in practice there are more elements such as **routines, schedules, events, webhooks** and more.

## Personality and Environmental Awareness

Models are getting more intelligent, and this may lead us to conclude that agents don't need our guidance. To some extent, that's true. We can see it every day when we work with agents as users, because the simplest messages are often enough to get the results we want. We can also read that [Claude Code had 80% of its system prompt removed for the latest models](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/) and start to believe that writing clear instructions is not only becoming irrelevant but can even degrade model performance.

The perspective changes here when we start thinking about having our agents **work without us**: in automations, background workflows and the custom agentic logic we'll need in our apps. In these cases, we look for **reliability, autonomy and high efficiency** and to achieve this we need clear instructions that will tell the agent what's available to them, and let it figure out what needs to be done to finish the task.

![A comparison of two ways to use an agent. In direct work, the user is in the session and short messages guide the agent. When the agent works without us, in automations, background workflows and app logic, nobody guides it. Its instructions must tell it what is available in its environment, so that it can find the steps itself.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-15/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-15/frame.html)

To learn more about the value of good instructions, we may want to explore the system prompts of popular harnesses, which are available on [Pliny the Liberator's GitHub](https://github.com/elder-plinius/CL4R1T4S/tree/main). Examples include [the prompt for GPT-6 Sol](https://github.com/elder-plinius/CL4R1T4S/blob/main/OPENAI/Codex_Desktop/GPT-6-Sol_Prompts.txt) and [Claude Opus 5.5](https://github.com/elder-plinius/CL4R1T4S/blob/main/ANTHROPIC/CLAUDE-OPUS-5.5.md) (this one includes more than just the system prompt). There are also official guides from Anthropic and OpenAI, for example [Prompting Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) or [Rethinking skills and prompts for GPT-6](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).

Below is **the structure** of Claude's [system prompt for Haiku 5.5](https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-5-5), and at first glance it's clear that **harnesses set a solid system prompt so users can speak with agents more naturally**. And the moment we start creating our own agentic tools and automations, we become the ones who need to craft that prompt.

![An outline tree of the sections of Claude's claude\_behavior system prompt, in prompt order. Ten sections sit under the root. tone\_and\_formatting holds lists\_and\_bullets, and user\_wellbeing holds provide\_crisis\_resources. Each section has a short description. The descriptions are summaries of the section names, not quotations from the prompt.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-16/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-16/frame.html)

The good news is that there's no need to write the prompt by hand. The prompts we're going to use will often be much simpler than the ones in Claude or ChatGPT, unless we create general-purpose agents. That said, we still need to know what to expect from the prompt and what the most important principles of Prompt Engineering are. 

**Personality:** that's the basic information about the agent’s role and whom it interacts with, as such context affects the model's behavior. 
**Environment:** essential information about the agent's purpose and the environment, such as the fact that the agent is operating without easy access to a human.
**Context:** a map of available resources, or at least information about where to find them, has to be presented to the agent; otherwise it will fail to finish the task or mistakenly claim it can't do things it was supposed to do.
**Discovery:** similar to context, the agent needs to know how to explore harness capabilities to use them properly. For example, the agent may perform some process and skip part of its steps because of poor organization of the documents that describe it. 
**Boundaries:** the agent has to know its own limitations and things it is not allowed to do. At this point we know this is only a **recommendation** because technically the model may ignore these instructions. 

![A frame named System prompt holds five blocks, top to bottom: Personality, Environment, Context, Discovery and Boundaries, each with a short description. The Personality block is red.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-18/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-18/frame.html)

To begin crafting a good system prompt, we can **start simple**: write minimal instructions, or describe the prompt's general purpose and let the model shape the first version, since LLMs have gotten really good at prompt engineering. The chances of getting it **working** on the first try are high, but [our goal is to make this **right**](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/prompt-eval-loop). This means the instruction is **clean, well generalized** and contains things that are really needed. And to achieve this we need an iterative approach with a clear way to verify the results or at least score them using evals.

![A flow diagram of how a system prompt is shaped. You start simple, and the model shapes a version of the prompt. You verify the results or score them with evals. A focal step-back line goes from verification to refining with the model, which makes a new version. This loop repeats until the prompt is right: clean, well generalized and holding only what is needed.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-17/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-17/frame.html)

Probably the single **best piece of advice** about prompting comes from the **[Latent Space Activation](https://github.com/daveshap/latent_space_activation)** repository. It's nearly 4 years old, but it's still relevant. It says that prompting is roughly about **getting the model to recall relevant knowledge and problem-solving methods and bring them into the conversation before it answers**. And that is something we need to always keep in mind, even despite the fact reasoning in Large Reasoning Models aims to address this exact thing.

## Context and Memory

Given all the context management issues we discussed last week, it should be obvious that managing context well is a critical part of any harness. Last week, we learned how language models handle context and how we can build a knowledge base. Now, let's take a closer look at how agents can **memorize things**.

Agentic memory can be boiled down to four things:

- **structure:** this can be a table, tree or graph that contains documents and the relationships between them. Documents may include metadata that describes them and connects them to external sources.
- **extraction:** these are actions related to saving new information, either from interactions with the agent or from data coming from external systems.
- **retrieval:** this is often agentic search that uses LLMs, pattern matching, embedding models, full-text search, graph search and decision models.
- **context:** this is about how memory is presented to the agent and the set of tools that let it read, write, modify and delete memory.

![A vertical diagram of agentic memory. A frame named Agentic memory holds four parts, from top to bottom: Extraction, Structure, Retrieval and Context. Each part has its details on the right. Extraction saves new information from interactions with the agent and from external systems. Structure holds documents and their relationships in a table, tree or graph, and metadata describes a document and connects it to external sources. Retrieval is often agentic search with LLMs, pattern matching, embedding models, full-text search, graph search and decision models. Context, marked in red, presents memory to the agent, with tools to read, write, modify and delete memory. A line goes down from Context to the Agent below the frame.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-19/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-19/frame.html)

Memory is one of the most requested features by users, but there are no established standards or patterns for implementing it. And if we dig down into the details, we may notice that most harnesses handle memory in a naive way, only to make an impression that the agent remembers something, but there are exceptions.

Memorizing comes down to extracting data from the ongoing thread, either through an additional LLM request that runs in the background or through explicit tool calls. Memories are often extracted as **user / client profile updates**, where facts fight for attention, or as separate documents that are categorized and connected to existing memories. 

![Flow figure with two frames. On the left, a Thread between a client and an agent: the client says "I prefer short answers.", the agent gives a short answer, the client asks for a summary by email every Friday, then says "Actually, give me detailed answers from now on.", and the agent confirms. On the right, a Client profile in Memory holds three fields: answer length, summary and source. A background LLM request extracts the first message and sets answer length to short. The memory.update tool call sets summary to email, every Friday, and later changes answer length to detailed. The answer length field is red: the later preference replaces the earlier value, and no separate document is created. All messages and values are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-20/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-20/frame.html)

The challenge here is **connecting existing memories** when some of them may contradict or override others. It's also quite tricky to properly connect ambiguous information, such as facts about two different people with the same name, because [the agent may struggle to tell which person we're talking about](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/memory-extraction). That's why people experiment with **confidence scores** or temporary notes until the ambiguity is resolved. Storing memories also comes with other problems: **duplication**, but also **updating** and keeping track of **what has changed over time**. 

![One example preference from a thread, "Give me detailed answers from now on.", points to a Client profile in Memory that has three problem rows. Contradicts (red): the profile already holds "answer length: short", and the new preference must override it. Duplicated: "summary: email, every Friday" is in the profile, and the same preference sits next to it in a separate note, "Friday summary by email". Ambiguous: "Adam: reports: weekly" is in the profile, and lines go from it to two clients who are both named Adam. Conclusion: storing a preference is easy. The hard part is to keep one current, single and clearly owned value over time. All messages and values are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-21/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-21/frame.html)

Most of these problems aren't solved yet, partly because of the cost of background processing, but also because the whole process is so complex. And that's just one side of the coin, because the agent also needs to somehow recall existing memories, which is even more complicated. 

Recalling done right is hard, because it has to be **fast**, **contextual** and **efficient**. A harness [has to consider the ongoing thread](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/contextual-recall) and quickly match documents the model will use to generate a personalized answer. This often cannot be done based on messages alone, so we need a global context in the form of a **user profile / client** or some kind of a map.

![A vertical diagram of contextual recall for an account manager and their agent. At the top, a red frame holds the full thread: a system prompt with an injected client profile (Acme Logistics, plan: Enterprise, answer length: detailed, next meeting: Thursday), the user message "Acme wants to expand to Germany next quarter.", a short agent reply, and the latest user message "Prepare the proposal for the meeting." The latest message alone does not name the client, the proposal or the meeting. An arrow goes from the red frame to a quick lookup in memory, then to a re-rank that keeps the top 2 documents. acme/contract.md and acme/expansion-notes.md load into the thread. The agent then answers with a detailed proposal draft for Acme Logistics: expansion to Germany, based on the current Enterprise contract, ready for Thursday's meeting. All names, messages, file names and values are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-23/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-23/frame.html)

Things get more complicated when we consider everything we learned so far about agentic loops and language models. There are plenty of projects that aim to address agentic memory, such as [mem0](https://mem0.ai/), [supermemory](https://supermemory.ai/) [hindsight](https://hindsight.vectorize.io/). Most of these projects are open source, so we can use them to learn a lot by chatting with agents about their source code.

Below is a brief overview of the retrieval mechanics used by Hindsight, which we can connect to our harness. We may also build our own tools. Good sources of inspiration for that are Joel Hooks' write-up [How I Built an Observation Pipeline So My AI Remembers Yesterday](https://joelclaw.com/observation-pipeline-persistent-ai-memory) and John's [lamarck](https://github.com/johnlindquist/lamarck).

![The Hindsight memory flow in four zones, from left to right. Your AI Agent sends retain(), recall() and reflect() to the Hindsight API. Retain writes to Sources, and an extract step turns sources into facts. Recall searches Memories. Reflect uses Synthesized. The Hindsight Worker consolidates facts into observations, and then Refresh rewrites knowledge pages.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-22/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-22/frame.html)

Eventually, we may expect leading AI tools to figure out agentic memory that's much more accurate than what we have today. But there may still be scenarios where memory fully personalized for our use case is necessary.

## Tools

Letting an agent interact with the outside world can be implemented in many ways. In general, we know the agent needs to be **aware of its capabilities** and able to **use them together** to accomplish the task in as few steps as possible, while maintaining its context so it doesn’t get sidetracked from the job it’s doing. There are a few challenges with this:

**Awareness:** the agent has to be aware of its capabilities, [without having them all loaded into a context](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/tool-search). But some capabilities may need to be available to the agent right away and we need to decide which.

![Flow diagram. An agent reads its system prompt. The prompt holds three parts: a list of capabilities, guidance on how to load their details, and native tools. The agent calls the native tools right away. It follows the guidance to load capability details, which stay outside the context until needed. The capability names, the search call and the tool schemas are examples.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-24/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-24/frame.html)

**Management:** an agent may have a predefined set of tools, but it may also be able to **integrate** with new ones through the Model Context Protocol, which we’ll cover this week, or by writing **its own custom integrations**, which can be saved and reused once tested. In both cases, we may want to design things so the agent can **manage** its own integrations.

![A flow diagram. On the left is the agent, which has a predefined set of tools. It connects to an MCP server. It also writes a custom integration, which it saves and reuses once tested. A red frame holds the MCP server, the custom integration and the saved integration. The frame marks the integrations that the agent manages.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-25/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-25/frame.html)

- **Discovery:** tools may be available as built-in catalog agent can explore using dedicated **search tool** we give them, or tools may have a form of **files** the agent explores using Bash. The first option gives us much more control while the second is extremely flexible as the agent can natively manage its capabilities (which can be good and bad). But if we need to get tools at scale, we need to figure out a gateway such as one [Uber made to manage 8000+ tools](https://www.uber.com/pl/en/blog/designing-mcp-gateway/), their authorization and permissions. Another example is [an open-sourced Treg](https://github.com/superdesigndev/treg). 

![A diagram of Uber's MCP Gateway. In the control plane, a crawler finds tools and adds them to the registry, where new tools are off. The registry sends config down to the proxy in the data plane. Agents speak MCP to a tool search front door: search server, list tools, get schema. The front door sends the call to the proxy, which authorizes, redacts and trims the reply. From the proxy, a red line translates calls to existing APIs (HTTP, gRPC, TChannel). Other lines proxy calls to native MCP servers and pass the token to third-party servers (Jira, Google).](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-26/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-26/frame.html)

- **Reusability:** we know that skills may contain scripts the agent can **reuse** to avoid repeating the same task manually. The same applies to tools if we let the agent manage them. But it's not only about making an agent **create tools**, but also connect this with its other capabilities, such as **available integrations**, **value stores** or **other packages**. 

![A vertical diagram. The agent at the top creates a package. The package holds logic. Lines go down from the logic to three capabilities: integrations, value stores and other packages. The import lines in the logic are an example.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-27/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-27/frame.html)

- **Environment:** in production, agents that can manage their own settings need access to **clearly separated** user workspaces. We need to be aware of the fact that agents can **easily** find a way to get around boundaries, which may lead them to access other users’ data

![Flow diagram. User A and User B each send tasks to their own agent on the server. Each agent runs code only in its own workspace, which holds a runtime and a filesystem. Workspace A, Workspace B and the server are separate frames. The workspace paths are example values.](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-28/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e01/artifacts/lesson/figure-28/frame.html)

All this in practice may be **limited** or **extended** to the degree we need to either **control the agent** or let them operate more freely and self-configure to learn new things and have a way to solve novel issues without the need for us to develop new features for them.  

## Takeaways

We work with agents every day, sometimes even without realizing how much happens under the hood. After this lesson, whether we build our own agents or keep using existing ones, we have a better understanding of **what we may expect from them** and what makes them fail, for example when we ask for something they should recall but they claim they don't have it. 

The last lesson here is to understand that building even a simple agent to learn how it works can make us much better at working with Claude, Pi or any other harness.
