# S01E05 · Building Workflows, Not Tool Stacks

We can now build things in a fraction of the time and with a fraction of the effort required just a few months ago. Yet shipping to production is still as slow and demanding as ever. You might conclude that AI is best suited to greenfield projects and small, single-user tools. But even those quickly become hard to manage, AI or not. Something doesn't add up, so the real question is: **why?** 

## Outline

- Complexity: faster shipping, faster debt, people and processes, using AI to keep up
 - Workflows: executable markdown, limits of agent-only workflows, single-purpose skills, reusable scripts, generalized tools, synthetic evaluation
 - Quality: self-verification, the agent's environment, principles, primitives, maintaining the system
 - Remote agents: remote machine, schedules and triggers, mobile access, secrets
 - Background workflows: daily briefs, nightly checks, reviews, docs sync, monitoring, product insights, self-improvement
 - Security: prompt injection, jailbreaks, layered defenses, irreversible actions
 - Business: deterministic vs. non-deterministic logic, human direction, simplification, earned trust

## Speed of complexity growth

The simple answer to the question is that **we move faster now**, and that applies both to how quickly we ship features and to how quickly technical debt grows. And even if AI workflows take care of incremental improvements and maintenance, the app will have more components that need to be modified, documented and tested. In some cases, testing alone will take more time than the agents' work. Most of these issues can be addressed, at least to some degree.

![A conceptual line chart with no values. Two smooth curves start together at the bottom left and overlap for about the first 30% of the time axis. The red curve, "What we build", then accelerates steeply to the top right. The gray curve, "What we can keep up with", rises steadily, flattens slightly and ends at about one third of the height. A light red shade fills the area between them. The label "the gap" sits to the right of the widest part of the shade, with a thin leader line. The x axis is labeled "Time".](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-1/frame.html)

There's one more thing that slows the process down: everything related to people, and also business processes. It's getting harder to keep up with the changes, and they arrive so quickly that businesses don't have enough time to see how they affect users and figure out what to do next.

And in a personal context, when complexity grows fast, it gets hard to keep track of everything related to the tools we've built. On top of that, agents keep asking us about things they can't do without us, and they break here and there, which takes even more of our attention and energy. 

![Diagram. On the left is a box labeled You. On the right, a small box labeled Your work sits above a large frame labeled Your system. The frame holds two tool boxes, Scripts and Integrations, and three agent boxes: Inbox agent, Notes agent and Sync agent. A thin arrow labeled "less time" goes from You to Your work. A thick red arrow labeled "most of your time" goes from You to Your system. Below it, thin arrows go back to You from Inbox agent, labeled "stuck", and from Notes agent, labeled "waits for you". Sync agent has a dashed outline and the note "fails silently". No arrow comes from Sync agent.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-2/frame.html)

The problems we're seeing here aren't new, and we already have some answers to them. What's different is the pace, and the new possibilities we're discovering, which weren't as accessible before as they are today. In other words: **we need to use AI to keep up with AI**.

## Executable Markdown vs Code

Skills may be seen as **executable markdown** files. When we consider what agents can do with even a simple set of instructions, it's fair to say that **many products may be a single .md file**.

Now, given what we know about language models and their **non-deterministic** behavior, it's hard to imagine business processes built this way. But it's already happening, as non-technical people use skills in their daily work and some of them have built automated workflows this way. 

For example, an agent connected to the internet that can write code can easily: 

- send us a personalized daily newsletter
- use a text-to-speech API to make a spoken daily brief
- research a given topic and send us a PDF with a full report
- triage our emails and prepare draft notes to make it easier for us to reply
- ...and many more

To make it work, all we need is an agent with CLI / MCP tools, which is what makes this approach so powerful.

![A small document box named skill.md, with three gray lines for plain text, sends instructions to an Agent through a thick red arrow. Four tool boxes, Browser, Files, Email and Code, sit above and below the Agent and connect to it with thin two-way lines. A medium arrow goes from the Agent to a large frame named What it does. The frame holds three outcomes: Researches the topic, Writes the report, Sends it to the team. The frame is about three times the size of skill.md.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-3/frame.html)

And yet, as programmers, we can see many problems with this approach:

- **reliability:** each run can produce different results, including misleading claims or actions that shouldn't have been taken
- **cost:** the agent **does everything from scratch** on every run, and if we put this logic into routines that run multiple times a day for many users, the costs can outweigh the value we get from it
- **speed:** LLMs are getting faster, but they're still slow compared to running scripts. API reliability also varies, so the task may never even finish
- **debugging:** if something goes wrong, it's hard to tell what exactly failed, why, and how to fix it
- **maintenance:** changes to a workflow are hard to test and manage, and we can't reliably tell which modification improved or degraded the outcome

But despite all this, **it works** for many use cases... and for others, it won't. So instead of ignoring it or making fun of it, we can think about how to push it further and learn to tell when skills and an agent are all we need.

![A markdown skill runs through an agent. skill.md goes to the Agent. The Agent sends every step to the Model API and gets a reply, and each run produces a result. There are four example runs, and run 3 is wrong. Under each element, its problems are in red: skill.md has development (changes are hard to test). Agent has cost (it starts from scratch on every run) and debugging (no clear trace of what failed). Model API has speed (slow, and may never finish). Results has reliability (each run gives a different result).](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-4/frame.html)

Let's **forget about all the limitations** for a moment and focus on what's actually good: how we can use it and extend it with the knowledge we have and with what models can do today. Namely:

- **Flexibility:** skills can be easily **combined** not only with other skills, but also with tools and one-off scripts that agents write. But to be easy to combine, a skill has to have a single responsibility.
- **Code Mode:** the latest models have no issues writing code, especially if we're talking about small apps with limited scope that can run easily, but also be [saved and **reused more than once!**](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/skill-vs-saved-script) The script can be saved as a skill dependency or be deployed to Cloudflare so it can be triggered from anywhere (if authorized) by external events, schedules or other agents
- **Capabilities:** agents may have dedicated tools for specific tasks, but we may also **generalize them**, so [the agent can tackle problems it was not prepared for](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/primitives-vs-bespoke-tools). Generalized tools can then be used for **personalization**. In other words: instead of having a tool for "creating Facebook ads", we have a tool called **generate_creation** that can be specialized for Facebook ads.
- **Evaluation:** while we can't reliably tell how changes to a skill will affect the outcome, we can ask AI to generate [**synthetic scenarios**](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/synthetic-skill-eval) and use tools such as [Promptfoo](https://www.promptfoo.dev/) to spot trends and general changes in behavior.

![Flow diagram with an example daily brief. A skill file, daily-brief.md, holds flexible text instructions and sends them to the agent. The agent reuses a saved script and specializes the generalized tool generate\_creation. Both are in a frame for reliable code. Synthetic scenarios test changes to the skill. The file name and the brief are example values.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-5/frame.html)

The good news is, designing abstractions and generalized logic is something we **already know from programming**. Now there's just one more important component: an agent, which takes care of many things we used to build by hand.

The best way to practice this would be to create **a set of capabilities** and **skills** that help us with daily life and work. They should be available to us **all the time**, but also work for us in the background. But instead of **building each tool by hand**, we would **create a system** that will let the agents generate and manage the tools for us. And this is where the game begins.

![A diagram in three columns. On the left is "You". In the middle is "Agents". On the right is a frame named "Your tools" that holds Daily briefing, Inbox triage and Deploy monitor. Below them is a frame named "Your system" with four boxes: Knowledge base (your notes and facts), Global context (goals, rules, preferences), Primitives (reusable building blocks) and Work framework (keeps agents on track). A red arrow labelled "build and refine" goes from You to Your system. Unlabelled arrows go from each system box to Agents. Arrows go from Agents to each tool, and one of them is labelled "create and maintain". An arrow labelled "use" goes above Agents, from You to Your tools.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-6/frame.html)

## Quality

When we think about systems **created and maintained by agents** at a scale that's impossible for humans to review, what can we do to ensure the quality of the product, while also staying on top of what's going on so we can make good decisions about its overall shape?

The answer is: "**letting the agent verify its own outcomes**" ~ [Lauren](https://x.com/poteto/status/2094457600259842065)

Agents should verify their outcomes not only by running unit tests or even e2e tests, which **agents can easily game**, but also by using tools to interact with the app as a human would, with the context a human would have. And lastly, agents need a space to actually make use of all this. Not just time, because in many cases they'd need their own computer to do it. That's why we're seeing tools like Devin, Cursor, or Grok Bot doing exactly this.

![On the left is "You". On the right is a frame labelled "Agent's own computer". It holds "Agent" and "App" in the top row and a "Checks" frame below them. The Checks frame holds four boxes, from machine checks to human checks: Unit tests, E2E tests, Uses the app like a person, Knows what users expect. The Agent builds and changes the App and runs the Checks. The Checks test the App. A red arrow carries the results from the Checks back to the Agent. The Agent sends a report to You, and You send decisions to the Agent.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-7/frame.html)

Considering what we've learned so far, we need to keep iterating on **the environment** in which agents can navigate freely while respecting **our principles**. These principles set general requirements and boundaries, and they set the direction we're heading in. We also need to define high-level **primitives**: **generalized building blocks** that agents can combine and reuse in many ways without changing them. The UNIX philosophy is a useful model here: small tools that each do one thing well and connect through a shared interface.

![A red frame labelled "Principles" holds the area labelled "Environment". Inside it, one row of four equal boxes reads Search, Read, Transform, Write. Agent A, a circle at the top left, takes a solid route: down into Search, across to Read, then in an arc over Transform into Write. Agent B, a circle at the bottom left, takes a dashed route: up into Read from below, then to Transform, then to Write. Both routes use the same four boxes and stay inside the frame. The routes are examples.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-8/frame.html)

Now, **the principles** aren't about a single file that defines what we want, but about **everything** that makes the agent behave the way we want without us having to repeat similar actions again and again. This requires work upfront, but also the habit of **maintaining the system as we work**. If the first part is done well, the second is much easier.

So far we have discussed components such as: 

- **Global & local context** available both on our machine and remotely, so it can be easily shared with a team
- **Skills & generators** that are created and managed thanks to the **habits we develop**, but also to **routines** that [scan the history](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/session-mining) and various sources, such as issue trackers, CI/CD logs etc., to suggest new skills and optimize existing ones, including archiving those that aren't needed anymore
- **Knowledge base** that is available **remotely** and easily accessible to all agents, but, as we discussed, only dedicated agents can manage its contents
- **Issue tracking** in any form - feature specs, issue descriptions, ADRs or anything that lets the agent know **what we build, what was built and what we're about to build**
- **Tool stack** that the system itself develops as its own **MCP / CLI** tools, following the same principles and using the shared primitives and knowledge base

Now we need to put all this together, and the last missing piece is to **set up a remote machine, like a VPS or a PC/Mac**, or at least make agents available on a GitHub Actions runner or through Claude/Devin routines. 

![A local desktop box connects down to a large frame named Remote machine: VPS or PC/Mac. Inside it are two frames. The red frame, You shape, holds Primitives, Principles and Environment and is marked "few things, kept in mind". A line labeled guides goes from it to the frame The agent builds. That frame holds Tools, Manage, Do the work and Verify and is marked "high trust, kept off your mind".](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-9/frame.html)

## Getting remote

**NOTE:** the next section covers setting up a VPS with Tailscale, Pi and Herdr. It's **entirely optional**, and you can skip it because Cursor and Devin already offer remote agents out of the box. Whichever option you choose, what you need is **remote agents that can run on a schedule or be triggered by an external event**.

The guide is available here: https://github.com/overment/limen/blob/main/docs/seat/agent-setup.md

**[Limen](https://github.com/overment/limen)**, which we discussed in the previous lessons, includes a guide to setting up a VPS so that **Pi and Herdr** are available on our server. Our AI agents can follow it to set up the machine **together with us**. It also describes how to set up **GitHub Apps**, which make the agents available in Issues and Pull Requests on selected repositories. 

The setup process roughly looks like this:

- Buying a VPS
- Going through the guide together with an agent
- Doing the things the agent asks us to do, such as Tailscale authorization, Pi logins, (optional) Moshi pairing and GitHub Apps configuration

This gives us a **Pi agent that works on a GitHub repository** and a way for agents living on our desktop to control **remote agents**. With the AI we have today, the setup should be straightforward even for someone with no VPS experience, although it involves a few steps and can take an hour or two to get right.

![Flow diagram with three frames. The Local desktop frame holds the desktop agents and a synced copy of the knowledge base. The Remote: VPS frame holds the remote agents, a schedule and the shared knowledge base. The Remote: outside the VPS frame holds GitHub issues and PRs, and incoming events. Desktop agents, GitHub, the schedule and events all start jobs for the remote agents. The remote agents read the shared knowledge base, which syncs with the desktop.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-10/frame.html)

**WARNING NOTE:** this guide may not cover every step your project's requirements and your company's policies call for, so make sure to account for them. For a personal setup, though, it should be more than enough.

To make everything clear, let's take a close look at what we need:

- **Desktop:** with agents available, [Tailscale](https://tailscale.com/), preferably [Pi](https://pi.dev/) & [Herdr](https://herdr.dev/)
- **Mobile:** with [Grok Bot](https://x.ai/bot) or [Moshi](https://getmoshi.app/) installed for remote access
- **VPS:** Ubuntu LTS · x86_64 or arm64 · **≥8 GB RAM** · **≥150 GB disk** · **≥2 vCPU** · public IPv4. You can get one on [DigitalOcean](https://digitalocean.com/) or [Hetzner](https://www.hetzner.com/)

And here are the steps you'll go through **with the agents:**

- **You:** Install Tailscale, Herdr, and Limen on your desktop.
- **You:** Create three SSH keys: admin (root over Tailscale), break-glass (root over the public IP), and worker (no-sudo over Tailscale).
- **You:** Install Moshi (or ntfy) on your phone.
- **You:** Create an Ubuntu VPS. Put the break-glass key on it. Note the public IP. Set up SSH config. Identify the seat by IP, not by the provider hostname alone.
- **AI:** Harden SSH and the firewall (public port 22 only). Install Limen, Node, Herdr, Tailscale, GitHub CLI, acl, and related packages. Install pi as the worker user (not as root).
- **You:** Approve Tailscale when the AI gives the link. From the laptop, SSH into the seat and log in to GitHub CLI (`gh`) and pi. Do not run these logins from another VPS.
- **AI:** Clone your project with HTTPS and run `limen init`.
- **You:** Decide what to commit. This step depends on the project you want to work on.
- **You + AI:** Open Herdr remote to the seat. The AI starts the coordinator and a small smoke job. Close the laptop lid briefly, then confirm the job finished and the Herdr tab is still there.
- **You + AI:** Pair Moshi Hooks on the seat (Settings → Hooks, not Easy Pair), or set up ntfy, so the phone can notify you when the agent needs you. Grok Bot webhooks are not the default here.
- **AI:** Enable the daily prune timer. This timer runs `limen prune` once a day and deletes finished job worktrees so the VPS disk does not fill up. It is not the GitHub doorbell timer.
- AI (optional): Test Tailscale Serve with a short local preview.
- **You:** If Tailscale asks, enable Serve once in the browser. Confirm the URL works on the tailnet only, then reset Serve.
- **You:** Create a GitHub App. Install it on the project repository. Pass the App ID and PEM; the AI places the PEM as a root-only file on the server.
- **You + AI:** Run the doorbell installer. Connect the App (`limen github connect`). Enable the poller when the doctor check is clean. Test with `@limen` on a PR Conversation tab. Note: a green doctor result does not prove the App is installed on the repo.

And again, **even if this list above feels like dark magic, the agents will guide you through every step**. The final setup looks like this: 

![A frame named "Tailnet (private)" with a red outline holds Desktop (agents, Herdr), Phone (Moshi or ntfy) and a VPS container (Ubuntu LTS) with Pi agents, Limen and Herdr. Desktop controls agents on the VPS. The phone has remote access to the VPS, and the VPS asks for you on the phone. Only one arrow leaves the frame: Pi agents picks jobs and opens PRs on the GitHub repo (Issues, Pull requests).](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-11/frame.html)

We can interact with this system simply by chatting with Pi on our local machine. We can also log in to the VPS and chat with the agents there from our desktop or phone. It works fine, although we might also consider choosing Grok Bot - bots can be asked to join our Tailscale network and manage remote agents for us. 

![A Tailscale network frame holds two frames. On the left, "Desktop or phone" holds You and Grok Bot, joined by a "chat" line. On the right, "VPS" holds one Pi agent. A line labeled "manages" goes from Grok Bot, marked red, to the Pi agent.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-12/frame.html)

This setup is super powerful because we can have a team of bots connected to more than one VPS. But before we push it that far, we need to get the fundamentals right, or autonomy won’t be reliable.

Now that this setup is in place, we can set up the **knowledge base** discussed in **S01E03** and sync it with our desktop. This way, we've initialized **our system**, which is ready to grow with us in terms of what it knows, what skills it has, and what tools it can access. Depending on our needs, we may also consider setting up [1Password CLI](https://www.1password.dev/environments/mcp-server) or [Bitwarden](https://bitwarden.com/blog/introducing-agent-access-sdk/) to give agents access to the keys and everything that has to be stored securely, so [agents can use those secrets without adding them to the context](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/secret-references).

With this in place, we can connect the harness to MCP and CLI tools to extend what agents can do, and start designing the workflows we need, such as:

- **Daily brief:** each morning, an agent connected to repositories, inboxes, messaging apps or tools such as [Firecrawl](https://www.firecrawl.dev/) prepares a dashboard of what needs our attention: project updates, relevant news and a report on what agents did overnight.
- **Nightly check:** at night, agents review, test, catch bugs, clean up and improve the work done during the day.
- **Self-improvement:** agents scan their interactions with us and with each other, then suggest or build improvements and document what they changed and why.
- **Docs sync:** each merge triggers an agent that updates the documentation and the knowledge base.
- **PR pulse:** agents review every new pull request before a human does.
- **Deploy monitor:** agents watch deployments, fix failures and optimize the pipeline.
- **Heartbeat:** agents monitor logs, user activity and the database for unexpected events, emerging issues and new opportunities.
- **UX testing:** agents maintain a set of user scenarios, run them regularly and score the results against the product's key UX metrics (KPIs).
- **Performance audits:** agents use the app's most important areas the way a user would, looking for bottlenecks and possible optimizations.
- **Dependency review:** each lockfile change triggers an agent that checks new packages, install scripts and known vulnerabilities before anything reaches production.
- **Product insights:** every week, agents query the database and analytics, compare the results with the previous period, explain anomalies and suggest inputs for the roadmap.
- **Support triage:** agents group user feedback from email, chat and support tickets, link it to existing issues or open new ones with steps to reproduce.
- **Research report:** on request, agents research a topic across the web and our knowledge base and deliver a sourced report.
- **Release notes:** each new tag triggers an agent that turns merged pull requests into user-facing notes and an internal changelog.
- **Competitor watch:** every week, agents check competitors' changelogs, pricing and docs, and report only what changed.
- **Meeting notes:** when a transcript arrives, an agent writes a summary, records decisions in the knowledge base and opens issues for follow-up tasks.
- **Flaky-test hunter:** at night, agents rerun recent test failures, separate flaky tests from real bugs and open a fix or quarantine PR.

It's up to us to decide which of these workflows make sense for us and which don't, or how we can adapt them to fit the needs of our product and team. The goal isn't to create the **perfect workflow** on the first try, but to **start simple** and then optimize, not only by building but also by **simplifying** and removing unnecessary steps.

## System security

Remote agents open up many possibilities, but they also bring many risks. We can push the system toward greater autonomy, but we need to be aware of the risk of **mistakes** and attacks from outside. We already know that **prompt injection** can trick agents into doing things they shouldn’t, and it remains an open problem.

The problem gets bigger when our system becomes more capable - when we connect our calendar, Gmail accounts, messaging apps or at some point our devices and credit card. All this information can be extracted by an agent that reads a malicious email, website or any other message.

![Flow diagram. On the left, the untrusted input frame holds a malicious e-mail, a website and any message. Red lines go from these sources to the agent. The agent connects to Gmail, Calendar, Communicators, and a credit card and devices, in the connected access frame. From Gmail, a line goes to a data leak. From the credit card and devices, a line goes to a forced action. The two hidden instructions are examples.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-13/frame.html)

There are two terms we need to understand about LLM security: 

- **Prompt injection:** An attack that tries to make an LLM-based system treat untrusted input as authoritative instructions, overriding its intended task or higher-priority instructions. The input may come directly from a user or be hidden in content the system reads, such as a web page or document. The goal might be to expose private data, manipulate an answer, or trigger an unauthorized action.
- **Jailbreak:** An attack that tries to bypass a model’s safety constraints, causing it to produce content or perform behavior it would normally refuse. This often involves adversarial prompts, role-play, or a carefully constructed conversation.

**The key distinction:** Prompt injection targets **which instructions the system trusts**; jailbreaking targets **what the model is allowed to do**. The terms overlap: a single attack can do both.

![A flow diagram with two lanes. On the left, prompt injection points to the trusted instructions, and a jailbreak points to the safety constraints. Both targets are in a frame named LLM-based system. Between the two attacks, one attack shown in red points to both targets, because the terms overlap.](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e05/artifacts/lesson/figure-14/frame.html)

The best material on prompt injection comes from Pliny the Liberator and his GitHub repository: **[L1B3RT4S](https://github.com/elder-plinius/L1B3RT4S)**. WARNING: following instructions from this repository may get your account blocked! 

On his X profile, Pliny shows that every single model currently available is vulnerable to these kinds of attacks. But Matthew Berman once challenged Pliny to break into his system and managed to fend off all the attacks, though Pliny’s attempts were quite simple. Nonetheless, [Berman’s article](https://x.com/MatthewBerman/status/2030423565355676100) on his defense mechanisms is worth reading. 

His defenses include: 

- **Deterministic sanitizer**: removes invisible and token-heavy Unicode, converts lookalike letters to Latin, decodes base64, hex and HTML entities, limits input by tokens and flags jailbreak patterns.
- **Frontier scanner**: The strongest LLM scores risk from 0 to 100: review at 35, block at 70. If the scanner fails, it blocks high-risk sources.
- **Outbound gate**: Checks outgoing text for secrets, internal paths, injection markers, image-URL leaks and dollar amounts.
- **Redaction**: Hides secrets, personal emails, phone numbers and dollar amounts before messages go out.
- **Access control**: Blocks sensitive files and private network addresses. Allows only http/https.

But despite all these mechanisms, the lesson here is that **wherever we use an LLM, we make our system vulnerable**, so we need to think twice before giving our agents access to tools that could lead to data leaks or irreversible actions.

## Business value

The idea of running agents in the background may be interesting, but it may also raise concerns about **costs**, **quality**, and **reliability**, as well as its **actual value**. With the help of AI, it is easy to set up routines and triggers that wake agents to produce work nobody will read or implement, or that we find useless.

That's a real problem, and there is no single answer to it, although there are some directions we may consider, like: 

- **Balance deterministic and non-deterministic logic:** we do know that agents can write code and set deterministic schedules and triggers that will invoke logic that runs without an LLM or uses one only sparingly.
- **Human engagement:** while agents can take care of quality, reliability, order and security, humans have to remain responsible for the direction and the most important decisions - although even this should be supported by AI. This setup, at least for now, increases the chance that we'll build **the right thing**.
- **Hack away the unessential:** it's easy to add something to the system, but both humans and AI have to actively work on **simplification** and **removal** - in fact this needs to be a higher priority than adding things. 
- **Trust earned, not given:** as mentioned, agents can be trusted **only** if they can verify their own work through actual observations and self-testing. In fact, the entire system has to be optimized for this, because our goal is to **ensure quality even when development moves at a pace of a few thousand PRs a month**. 

As programmers, we can think about workflows built on **our knowledge** of system design and on what we now know about generative AI and the available tools. And even if our perspective may be too narrow to tell whether a given solution will help the business, we still may want to **explore and show what's possible**.

And meanwhile it is also worth exploring what remote and background agents can do for us, in the context of our work but also our daily lives.
