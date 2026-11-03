# S02E02 · Building an Agent

When thinking about building agents, we may ask ourselves: **why would we want to build one if Devin, Grok Bot, or Claude are so good** and our app or service can easily integrate with them, thanks to the Model Context Protocol?

## Outline

- Framework: agent configuration, runtimes, execution environments, packages, storage, data structures, reusable artifacts
- Models: model selection, capability and cost tradeoffs, ordinary code versus model decisions
- Tool Design: tools versus APIs, focused responsibilities, descriptions, schemas, validated inputs, useful results, actionable errors, structured responses
- Context and Memory: context assembly, conversation history, working memory, persistent storage, retrieval, memory scope and lifecycle
- Workflows and Controls: steps, branches, graphs, jobs, queues, state transitions, side effects, execution budgets, isolation, approval, pause and recovery

Let's say we have an e-commerce platform where users sell their products. They may want to manage those products with the help of their agents, so they connect their accounts to Claude using MCP. But we want to offer our clients personalized recommendations for optimizing their campaigns, based on generalized insights from our entire platform. We need an agent here and **we can't use the user's harness for that**, so we need to build a custom one. 

![A flow diagram. The seller, a tenant of the app, manages products through Claude, the tenant's harness of choice, which connects to the seller's account in our app through MCP. Inside our app, a custom agent with our own harness uses generalized insights from the whole platform and recommends campaign optimizations to the seller. Two frames separate the tenant's harness from our app.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-1/frame.html)

That's why today we cover what's needed to build our own agent. It is also worth watching Lee Robinson's lecture at Stanford CS146S "[How always-on agents work](https://x.com/leerob/status/2108650243365736855?s=20)". 

## Architecture

Agents can be built from scratch, and with today's coding agents, that's very feasible. We can also use agentic frameworks such as [Mastra](https://mastra.ai/) or [Agents SDK](https://developers.cloudflare.com/ai-search/agent-sdks/agents-sdk/) to make this process easier, since they handle common mechanics we don't need to build ourselves. It's just worth keeping in mind that with AI frameworks, we may lock ourselves out of some "low-level" customization. And finally, as mentioned earlier, we may want to build on top of open-source harnesses such as Pi or Goose.

When designing an agent's architecture, we need to break away from some of the typical patterns we know from building apps and ask ourselves a few questions:

- **Autonomy:** what level of autonomy is needed, and what role do humans play?
- **UI:** do we need a full UI, just [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview), or maybe **generative UI**?
- **Profiles:** do users need their own workspaces, or can this be centralized?
- **Capabilities:** does the agent need its own computer, browser, filesystem, or sandbox?
- **Integrations:** how does the agent handle integrations?
- **Connectivity:** does the agent need to connect with external systems?
- **Memory:** what kind of extraction and retrieval strategy do we want to use?
- **Self-evolve:** do we want the agent to configure itself, and to what degree?
- **Context Management:** what context management patterns do we want to have?
- **Environment:** what does the agent need to know about its environment?
- **Cache:** how do we optimize for a 99% cache hit rate? And **that's critical!**
- **Communication:** how will the agent ask for permissions or report on its work?
- **Security:** how do we ensure data safety and detect potential system abuse?

There are many decisions to make here, so we'll choose the path that's the most challenging but also brings the most value. We're talking about a **self-evolving, primitive-based, durable agent**. Obviously, we won't build the entire system here, but we'll discuss its aspects and the most important mechanics.

![Architecture of a self-evolving, primitive-based, durable agent. The centre shows the agent loop: Think, Act and Observe in a cycle, with Model at its centre. The harness frame ("what we build") goes around the loop and holds four parts: Context, Tools, Permissions and State. Below the harness, a Primitives frame holds six blocks: Integrations, Values, Secrets, Apps, Documents and Packages. On the left, the User gives the harness a task and gets back requests to approve and reports. A red path goes from the agent loop through Permissions to Primitives ("create / edit"), and from Primitives back to Context ("loaded next run"). Only Integrations connects to External systems ("only way out").](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-2/frame.html)

## Core features

Designing agents is different from designing typical apps. As models get better, cheaper and faster, we can give them more freedom and space. That way, instead of building a narrow solution specialized in a single thing, we can let AI figure out how to handle cases we didn't think about. 

For example, if we need to create a design tool for photo editing, it doesn't have to offer a predefined set of filters and options. Instead, it could give an agent a way to generate filters and options personalized for each user. Before AI, we had very limited ways to do things like this. Now, this brings a lot of flexibility to our app, but it also raises new challenges, such as: what happens to projects that used a filter the agent has since modified?

![A user with a need connects to an agent. The agent connects to an interface, outlined in red and marked as the predefined scope, which lists four operations: filters.list, filters.create, filters.update and filters.delete. The interface connects to the user's library of filters. Each filter has a pixel swatch, a name and its options. The new filter, Old film, has the options grain and fade. The other filters are Soft portrait, Night city and Warm sunset. The operation names, filter names and options are examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-3/frame.html)

This example shows **a new way of thinking** about app architecture, but we can push it even further. Instead of generating only filters, the agent could create whole tools, panels and workflows suited to the way each user works. That way, our role changes from designing features to **shaping the environment** in which the agent builds them. In other words, we decide what interface the agent gets, what rules it follows and what limits it can't cross.

![A user asks an agent. The agent works inside a red frame, "Environment we shape", which has four labeled rows. The Interface row lists tools.create, panels.create and workflows.create. Each operation points down to an item that it creates in the user's workspace: the tool "Batch watermark", the panel "Client picks" and the workflow "Wedding delivery". The Rules row lists "Keep the project history" and "Don't break existing projects". The Limits row lists "No access outside the app" and "No deleting user files". The item names and descriptions are examples for a photo-editing app.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-4/frame.html)

Such an environment is shaped through **primitives**: general building blocks that can be combined to achieve reliable, even deterministic, outcomes. Getting this right is hard, but together with AI we can **easily iterate on prototypes and wireframes** to see the architecture from different angles.

Let's say we want an **evolving agent that lives in the background** and helps us learn. It curates our knowledge base and researches what we're curious about, using **only sources we trust**. It has **no interface of its own**. Instead, it works inside the knowledge base and reaches us through channels we already use, such as a short note, a message or a weekly digest. Once configured, it **needs a very little maintenance** and minimal supervision.

It is **proactive**, but not because it follows a schedule set up once at the start. Instead, it **reflects on its own work**. It notices how active we are, what we're focused on now and which of its contributions we used or ignored. Then it adjusts what it does, how often and how loudly: it stays quiet during busy weeks and digs deeper when we're exploring. Every change it makes is **logged in the knowledge base and can be undone**, so running in the background never means losing control.

![On the left is the user, outside a red frame named Primitives. The frame holds six building blocks, each with its operations: Memory (your knowledge base: notes.read, notes.write, notes.link), Events (your activity: events.watch, for example “note edited”, “link saved”, “file added”), Tools (the outside world: web.search, page.read), Messages (the only way to you: message.send), Journal (what it did and what worked: journal.read, journal.write) and Schedule (its own wake-ups, which it changes: schedule.get, schedule.set). The user connects only to Memory, with a line labeled “edits notes”, and to Messages, with a dashed line labeled “weekly digest”. Below the frame, a loop goes around the agent, which has no UI: observe (Events, Memory), reflect (Journal), act (Tools, Memory, Messages) and reschedule (Schedule, Journal). Beside the loop, an activity timeline compares two weeks. In the busy week, the agent wakes up often, and the bar heights show more research. In the quiet week, it wakes up only twice. The positions and heights of the bars are illustrative examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-5/frame.html)

With this vision in mind, we can start thinking about the **primitives** that will shape the agent's environment. Combined, they will give us everything the agent needs to do its job, but also to **adapt** and **manage itself**.

**Event:** a signal about activities that may come from any source and shape documents.
**Schedule:** wake-ups that the agent sets for itself.
**Document:** everything the agent has written both for itself and for us.
**Skill:** repeated work saved in a form the agent can reuse, also deterministically.
**Journal:** everything the agent did. Entries are only added, never edited.
**Channel:** the agent's only way to reach the user.

Now, such primitives can be combined together, so **Event** may trigger a particular **Skill** based on its type, **Schedule** may be associated with a given category of **Documents** and every action leaves an entry in the **Journal**. During reflection, the agent reads its **Journal** to decide when to wake up next, which work is worth saving as a new **Skill** and whether anything deserves our attention through a **Channel**. 

That way, a few general blocks produce behavior we never had to design upfront, yet every step stays within the environment we shaped. And when something goes wrong, the **Journal** shows what happened and why.

![Example for a knowledge-base agent. A red frame labeled "Environment we shape" holds six primitive blocks. Row 1: Skill "summarize article into a note" with an arrow "writes a note" to Document "research topics". Row 2: Event "link saved" with an arrow "triggers" up to Skill, a wide Journal with the entries "09:12 summarized article" and "Mon 08:00 updated 3 research notes", and Schedule "every Monday" with an arrow "updates" up to Document. Thin lines from all three arrows go into the top of the Journal. Row 3: the Agent reflects. An arrow "reads" goes from the Journal to the Agent. The Agent sends an angled arrow "save repeated work as a Skill" left and up into Skill, and an angled arrow "wake up in 2 days" right and up into Schedule. Row 4: the arrow "send a short digest" goes from the Agent to Channel. Only the arrow from Channel crosses the frame, to the User circle outside. Below it, a Trace panel stacks the dimmed entry "Mon 08:00 updated 3 research notes" and the outlined entry "09:12 summarized article". A dotted arrow "made by" leads to the Skill "summarize article into a note", and a dotted arrow "triggered by" leads to the Event "link saved". The caption is to the right of the panel. All names, events and entries are examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-6/frame.html)

At this point, we can see that some **primitives** may live in a filesystem, so the agent can easily interact with them. Schedules, events, scripts, documents and the journal are all files. And to let the agent work with them freely, we need it to be able to write code, which means giving it a sandbox. At the same time, this doesn't mean that **all primitives must live in a filesystem**, because some of them may exist in a database and be accessed through a dedicated interface. It's also up to us to decide whether the agentic core will be based on our framework of choice or on entirely custom logic.

## Providers and configuration

When building agents, we shouldn't really commit to a specific provider, not only because of vendor lock-in but also because we may want to use **multiple models** at once, or models that are specific to a given provider. 

For example, we might use Gemini for image generation, a decision model from TypeSafe, or a mix of Anthropic and OpenAI models to get multiple perspectives or simply to access whichever model is currently the best. The easiest way to have all these is to use platforms such as [OpenRouter](https://openrouter.com/), although it's worth keeping in mind that some native API features of the given provider may not be available there. When building products for B2B customers we may consider [Amazon Bedrock](https://aws.amazon.com/bedrock/model-choice/) or [Microsoft Azure](https://azure.microsoft.com/en-us/products/ai-foundry/models). 

The architecture of our agent should include a gateway and adapters for the providers we want to support. In other words, we need to make sure that all providers speak the same language in our app and that adding or removing a provider won't be an issue. 

![Architecture diagram of an agent that uses three models, as an example. The agent's weekly digest job has three tasks: sorting new notes is an easy task, writing the digest is everything else, and drawing a cover image needs image generation. All three tasks go to one gateway, which is marked in red. The gateway sends each task through its own provider adapter. The OpenAI adapter calls the small model, the Anthropic adapter calls the main model, and the Gemini adapter calls the image model. The tasks and the provider-to-model mapping are example values.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-7/frame.html)

Having access to multiple models lets us think about **model routing**: handling easier tasks with a smaller, faster and cheaper model, or with lower reasoning settings. As a first step, configuring **primary / secondary** models for a given provider may make a noticeable difference in our agent's overall efficiency. There are also more sophisticated routers, such as [Max from Arena AI](https://arena.ai/blog/introducing-max), a model that routes each task to the best model to improve efficiency and accuracy, although this may be overkill for many cases. 

![A flow diagram of simple model routing. A task goes to a routing rule in code. The rule sends a lookup to the secondary model, which is small and fast, and sends planning to the primary model, which is powerful. The routing rule is marked as the focal part. The task types and the rule map are examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-8/frame.html)

As LLMs and their APIs evolve, our apps should avoid layers that make migration to newer versions harder than necessary. For example, if someone built an app with OpenAI's Chat Completions API and has no easy way to migrate to the Responses API, [some models and features may not be available to them.](https://developers.openai.com/api/docs/guides/migrate-to-responses). 

## Designing tools

Agents can easily create tools for themselves, and all they need is documentation and some test requests. But if we look closer, there are some things we may want to consider to improve the efficiency and reliability of tools generated this way.

Agentic tools are mostly about **schemas** and **callbacks**, but the most important questions are **whether a tool is really needed** and **whether the agent will know how to use it**.

One may say that **models are smart enough to use an API directly**, and that's true for many cases, especially if the app or service falls within the model's base knowledge or its documentation is flawless. In practice, however, we will seek reliability, flexibility and efficiency. This isn't obvious as many APIs are poorly designed and agents often get **false positives** and believe an action succeeded when it didn't.

An example of this may be a music service that returns **status 200** for interactions with the player [whether the action succeeded or not](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/false-success-tool).

![Flow graph. The agent asks the music service API to play a track. The API passes the command to the player, and the player fails. The API still returns status 200, which is a false positive. So the agent checks the player state to confirm the action. The requests and responses are examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-9/frame.html)

Some actions also have to be chained in a specific way or simply can’t be performed without following a particular flow. For example, Stripe doesn’t allow you to modify the price of an existing product. The only way to do so is to create a new price with the same settings and deactivate the old one. And here, Stripe is well known for LLMs, but when agents encounter an internal API that is new to them, they will simply fail.

![A flow diagram. An agent must change the price of a Stripe product. A direct change to the existing price is not allowed. The required flow is a chain of two actions: create a new price with the same settings, then deactivate the old price. The agent must know this flow. The agent knows it for Stripe, but not for an internal API that is new to it.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-10/frame.html)

Now, with this in mind, we need to design **native tools** ourselves. And if the agent is going to create tools autonomously, we need to give it some guidance on our preferences, recommendations, and a way to evaluate these tools and test their **names, descriptions, schemas and output format**. 

So our agent may have four native tools:

- **core.exec:** to execute code in a sandbox in the workspace
- **web.search:** to search the web, but limited to the trusted sources
- **web.fetch:** to get the contents of a URL
- **channel.send:** to send a message to the user

Additionally, the harness will use **journal.append** and **events.add**, so the agent can clearly see what's happening, but will be physically prevented from modifying them. 

![The workspace folder holds six entries in two groups. Read-write: documents/, skills/ and schedule.yaml. Read-only: events/ (harness writes), journal.jsonl (harness + journal.append) and config.yaml (user only). The read-only group is marked.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-11/frame.html)

In the case of this agent, tools aren't the only thing we should take care of, because the agent also has to know how to navigate the workspace, shape documents, understand the relationships between them, etc. So we may consider creating an initial **guide** in the form of **Documents** and **Skills** (native primitives). This would give us **augmented tools** that aren't rigid, because the agent would be free to modify them.

![Flow diagram with an example skill. The guide gives the agent a "weekly-digest" skill, which is shown in red. The skill uses three native tools, web.search, core.exec and channel.send, to write a weekly digest report from the user's template. The agent can modify the skill and its template. The skill name, the template and the file paths are examples.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-12/frame.html)

When all this is done well, our agent will be able to **learn and evolve**, as schedules such as **"dreaming"** may ask it to organize its documents and schedules.

Considering this, we should clearly see how we can **balance deterministic and non-deterministic logic** to engineer solutions that are specialized for specific use cases and more useful than general agents. To achieve this, we first need to consider everything we know about language models and AI agents, and then use our experience in software development to come up with the solution we need.

## Context management

Here we're reaching the point where our harness can make a big difference compared to general agents, not because we teach the model what to do, but because we show it **what's available, dynamically**.

We know that **cache hit rate** is one of the most important metrics for agents, and we should keep it in mind whether we're designing an agent from scratch or extending an existing one with hooks or extensions. In our case, the goal is to inform the agent not only about its purpose but also **about the current state of its environment**, including Events, Schedules and other instances that are currently running. This means we can't simply "set our AGENTS.md", because we need to inject context mid-turn!

![A vertical stack of blocks shows the context of a custom agent, top to bottom. A "System prompt" frame holds three fragments: "Role" (personalized), "Capabilities" (personalized) and "Notes" (agent can modify), with a dashed line from "Agent" into "Notes". Then "Tools" (exec · search · fetch), an initial "Developer message" (current state), a "User message" (scheduled by harness), "Tool call" and "Tool result". A bracket marks these blocks as "cached". Below them, the focal mid-turn "Developer message" (what changed) holds "Events", "Schedules" and "Running instances", with an arrow from "Harness" into it. A faded "Tool call" at the bottom shows that the turn continues.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-13/frame.html)

Context management for custom agents has no universal answers, but we can follow a few principles and iteratively get to the point where our system meets our expectations. In our case, we can look at things such as:

- **System Prompt:** it tells the agent its role and capabilities, so it does not spend too much time on exploration. It may also include a note that the agent can maintain for future sessions and improve through self-reflection.
- **Tools:** in code mode, the agent receives only the most important tools as schemas. In our case, that's **exec, search and fetch**, because all other capabilities are controlled from the code the agent writes.
- **Initial Developer Message:** right before the first message, we may add the current state of the system, so the agent immediately knows what's going on and whether anything needs to be considered before starting a task.
- **User Messages:** this agent will run autonomously, so the user message will often be a scheduled message that the harness sends to the agent. The agent has to be informed about this, because **asking questions** won't be possible. The only way to contact the user is through **channel.send** (unless we set it up differently).
- **Mid-turn Developer Message:** the environment changes, so during a turn, the agent has to receive notes only about **what changed**
- **Tool Hooks:** given how important proper organization and self-management will be, the agent may receive **well-generalized, self-steering** messages before and after it triggers a tool.

It's recommended to start simple and build an environment where the agents can reach their best form through self-play. Our role is to supervise this process, because models may lean towards complex logic, while we're looking for the **simplest possible solution**.

In the upcoming lessons, we'll explore how we can make custom evals, so the agents won't blindly make changes without clear feedback on the system's performance.

## Workflows and long-horizon tasks

Building a good ambient agent is a great exercise of building reliable systems that involve non-deterministic logic. An additional challenge is to keep these systems lean by relying on primitives that AI can combine to go beyond the scenarios the agent was designed for.

This is not only about engineering and architecture, but also finding useful use cases that aren't always obvious. In the case of our agent, we can use **Events** to report our activity level and whether we opened its last email or read its message. Based on this information, the system may adjust its behavior or stop some actions.

![A flow from left to right. The harness adds Events to a stream. The example Events are "activity: busy", "email: opened" and "message: read". A red line labeled "search, filter" goes from the stream to the agent. The agent then saves insights in a Document, responds through a Channel or creates a Schedule. A dashed line labeled "wakes up" goes back from the Schedule to the agent.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-15/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-15/frame.html)

Another example could be a schedule that scans our activity on X, Raindrop, or any other app that may provide insight into our recent interests. In that case, we need to figure out how to make an agent **remember its past runs**, so it can actually observe and reflect on its findings. The most natural way here would be to ask the agent to filter out **Journal** entries and to save insights in some structured way. 

![A loop. A Schedule wakes the agent. The agent run scans activity on X and Raindrop. It logs its actions in the Journal and writes insights to Documents. Together, the Journal and Documents are the memory between runs. During reflection, the agent reads that memory and sets its next wake-up on the Schedule.](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s02e02/artifacts/lesson/figure-14/frame.html)

When we play with similar scenarios, we'll learn a lot about how agents work, how models make decisions and where they struggle and where our harness falls short. For example we may struggle with parallel updates that may even lead to data loss, so we need to introduce queues or versioning. Some tasks may require including logic such as one from [pi-durable](https://github.com/earendil-works/pi/tree/main/packages/durable) so the agent can easily recover from nearly any failure or pause the execution for as long as needed or concepts from [pi-until](https://github.com/joelhooks/pi-until) to set up watchers and recurring wake-ups.

## Takeaways

The example from this lesson should clearly present why we may want to build our custom harness or learn how to build extensions for existing ones to make them specialized for specific tasks. 

And even if this leads us to stop working on the agent, or new models or harnesses replace it right away, we'll gain experience that may help us build even more advanced systems with future models.
