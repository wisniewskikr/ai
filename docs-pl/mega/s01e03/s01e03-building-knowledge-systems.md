# S01E03 · Building Knowledge Systems

Knowledge bases aren't anything new, but their importance and role are changing as **agents become the primary users** (and maintainers) of them. This makes us reconsider everything we know about building them, from their purpose to their tooling, structure and management.

Let's begin!

## Outline

- Formats: Markdown, HTML, mdx and svx, components, levels of depth, artifacts and skills
- Agent-first bases: agents vs. humans, bridges to existing tools, the LLM builds and maintains
- Retrieval: grep and ripgrep, semantic search, relevance vs. similarity, decision models, hybrid search
- Reaching context: global context, project context, metadata, structure the agent chooses
- Self-management: single inbox, boards, templates, schedules, events

Back in the day, tools like Google Drive or Notion were totally fine because their editors and collaboration features were great, and **in many cases they still are.** But now that more and more people work mainly with their agents, tools that weren't designed with AI in mind struggle to give those agents easy access for both **reading** and **writing**. For example, even something as simple as **accessing an image** is often impossible. 

![An AI agent connects to documents in Google Drive and Notion. Below the documents, the figure has two separate columns. The Reading column shows that the agent often cannot access images and other details. This part is marked red. The Writing column shows that the agent struggles to edit documents.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-1/frame.html)

## Text Files and Cloud Platforms

Since LLMs' native "language" is text, Markdown and HTML got incredibly popular, despite all their limitations. Agents can easily access and manage them, and Markdown can be easily converted to other formats and even websites using [Astro](https://astro.build/) or [Next](https://nextjs.org/). In practice, however, we often need **permission management**, **real-time collaboration** and many features that have been with us for years in tools such as Notion or Google Docs.

![A vertical diagram. At the top, an LLM reads and writes text. A line goes down to a frame named Text files, with an example Markdown file and an example HTML file of the same deployment note. From the frame, two lines go down to two frames. The Agents frame lists what agents do easily: access and edit any file, search across files, navigate between files, and convert Markdown to websites. The Humans frame is red and lists what humans struggle with: HTML is hard to read, real-time collaboration is not default, and sharing and permissions are not default. The file contents are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-2/frame.html)

Obviously, there are some tools that aim to give us both. Some are existing tools **converting themselves into AI-native** ones, although agents still can't access all their features. Others are new **AI-native** tools that lack important features. The decision isn't easy.

Let's consider the following: 

- Agents are getting more popular even among non-technical people
- The knowledge reaches humans through an agent, rather than directly
- Documents are managed and consumed by agents, rarely by humans
- Agents can process a large number of documents quickly
- In many cases, we don't need documents, only the outcome

These points **are not true for most organizations today**, but that's changing quite fast, which means we may want **a knowledge base built for agents, not humans**. For now, some bridges may be useful, but not as the core of the entire system. 

![A flow diagram. On the left is a frame named Core. It holds an Agent that reads and writes a Knowledge base of Markdown and HTML files. The knowledge base is marked red. On the right is a frame named Bridges for humans. It holds Google Drive and Notion, which the knowledge base connects to through integrations. The file names in the click details are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-3/frame.html)

A few months ago, Andrej Karpathy [wrote about his personal knowledge base](https://x.com/karpathy/status/2039805659525644595), and there are some lessons we may get from it, regardless of the purpose of our wiki. Namely:

- The LLM is the one that builds the wiki, not the human.
- Raw content is for AI; well-presented content is for you.
- Markdown editors (such as [Obsidian](https://obsidian.md/)) are still useful, but mostly to **read** the content.
- For small, personal knowledge bases, [there's no need for advanced search engines](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/summary-index).
- The LLM can help not only with **building** but first and foremost with **maintaining**, and this is one of the biggest changes since the "pre-AI" era; maintenance helps keep the knowledge base clean and up to date.

![A diagram of Karpathy's personal wiki, from left to right: raw/ (sources as he saved them), then LLM, then wiki/ (Markdown articles, summaries, index files and backlinks), then You, reading in Obsidian. Solid arrows go from raw/ to the LLM, from the LLM to wiki/ and from wiki/ to You. They point in one direction only. Five numbered lessons sit on the parts that they describe. 1: the LLM builds the wiki, not you, and you never write into wiki/. 2: raw content is for the AI, and well-presented content is for you. 3: Obsidian is mostly for reading. 4: at this size, no advanced search engine is needed, because the LLM uses its own index files and summaries (about 100 articles, 400K words). 5, in red: a dashed loop goes from the LLM back onto wiki/. It is labelled with health checks: fix inconsistencies, fill missing data and suggest new articles. This is the biggest change from the pre-AI era.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-4/frame.html)

## Beyond Markdown

Markdown and HTML are not the only formats we can use for knowledge bases. There are also `mdx` and `svx`, which let us use components within markdown files. This way, we balance **file readability** with **interactivity** and, depending on our needs, even **state**! 

Below is an example of an `.svx` file whose source stays simple, while its rendered version includes a functional checklist. And since [components come into play](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/guided-components) here, they can be reused across many files. 

![Two panels side by side. Left, "The file": the plain source of an example note, deploy-checklist.svx, with frontmatter (a title and four steps), a heading, one sentence and the component line \<Checklist items={steps} />, which is outlined in red. Small text under the panel says "mdx or svx". A red arrow labelled "renders as" goes from the component line to the right panel, "What you see": the same note rendered, with the heading, the sentence and a live checklist outlined in red. Build and Run tests are ticked, Deploy and Verify are not, and the readout says "2 of 4 done".](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-5/frame.html)

This becomes especially useful for complex ideas that need to be presented from a broad perspective first, with the option to dig into the details without having to scroll through a wall of text. 

![An interactive schema explainer for an LLM-written knowledge base. At the top is a strip with four steps: sources, documents, chunks and links. Below it are four equal table columns that list their fields and types. A "decide" tag marks each open decision. A full-width card at the bottom explains the selected table or field. At the start, documents.updated\_by is selected. The example values in the card, such as URLs, uuids, timestamps and row counts, are illustrative examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-6/frame.html)

Agents can use `.svx` quite easily these days, but it's worth spending some time on a setup that makes it even easier for them. You can find an example in the [skills repository](https://github.com/overment/skills/tree/main/skills/explainer), where the `explainer` skill isn't just a prompt. It also includes templates and logic that make it easier for the agent to prepare **consistent** visualizations. A skill like this works best with **state-of-the-art (SOTA) models**. 

The `explainer` skill may serve as **inspiration** for generating skills in different specialized areas: issue explainers, activity reports, high-level architectural decisions, etc., all personalized to the projects we're working on. The conclusion here is that **artifacts and skills may become part of your knowledge base** and they should **guide a model** toward results that meet our needs without limiting its options.

![A flow diagram. A frame named Knowledge base holds two boxes: Structure, contents (Markdown, HTML, .svx) and Templates, guidance (skills, artifacts). Structure, contents gives content to the Model. Templates, guidance steers the Model, in red. The Model is guided, not limited, and gives Personalized results that are desired and consistent.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-7/frame.html)

## Purpose of the knowledge bases

Knowledge systems such as internal wikis were built for many reasons: **document organization**, **employee onboarding**, or **improving communication** and **processes**. Their main users were humans, so we could assume they had at least a general understanding of the wider context, which helped them use the system.

For agents, this works slightly differently: models can read and understand documents faster than humans, but the way they access and perceive them can easily lead to mistakes, despite their intelligence. Let's consider the following example: 

1. The agent is asked about the **deployment process**
2. It searches the knowledge base and reaches a few notes that **look complete**
3. But the agent **never reaches the note** that explains the context needed to understand the bigger picture
4. As a result, we've got a **hallucinated** answer or a **poorly implemented feature**

![The query "How do we deploy?" goes to the Agent with an arrow labelled "searches". A red arrow labelled "reads" goes from the Agent to the "Deploy checklist" note, which has a red border and the lines "run tests · tag release" and "notify #eng · monitor". Plain lines join it to "Release process" on the left and "On-call rotation" on the right. All notes are in one frame. Below a dashed rule and the label "never reached" are three dimmed notes with dashed borders: "Why we deploy this way", "System architecture" and "Rollback policy". No line goes to them.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-8/frame.html)

Scenarios like that are very common, and there is no solution that **guarantees** success. But as I mentioned in the previous lessons, **working with LLMs is not about certainty but about increasing the odds of getting the results we want**.

First, we need to understand how the agent **reaches** the context. It does this through search tools used in **agentic logic**, so the retrieval process may take many turns. Let's break this down:

**bash / grep / ripgrep:** agents navigate files by writing scripts and/or commands, trying to match keywords related to the available context. Even if they don't match all the relevant files on the first try, they can keep **exploring** until the model decides it has enough information or that there's no information available. This type of search is highly effective when we're dealing only with text files and codebases, but [it's nearly useless for images, PDF documents](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/image-sidecar-notes) and similar.

![Flow diagram. An agent runs bash, grep or ripgrep commands against a knowledge base. The commands work well on text files and code and are nearly useless on images and PDFs. A dashed red line goes from the commands back to the agent and says "keep exploring". The commands and file names in the details are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-9/frame.html)

**Semantic Search:** there are **embedding models** specialized in **describing the meaning** of the content using a list of numbers (a vector). This way we can index existing documents to get their embeddings. Then, whenever we want to search for something, we send the query to the embedding model to **get its meaning** and then **compare the vectors** to determine **which documents are similar to the query in terms of meaning**. 

![A flow diagram. Documents and a query both go to the same embedding model. The model turns the documents into document vectors and the query into a query vector. A compare step, marked red, compares the vectors to find the documents that are similar in meaning to the query. The document titles, the query, the vector numbers and the similarity scores are example values.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-10/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-10/frame.html)

While semantic search increases the chance of finding documents that pattern-based search **can't match with regex patterns**, it also adds complexity because it requires indexing.

Moreover, embedding models have **context limits**, so long documents have to be split into fragments. They also have a **knowledge cutoff**, so they may have a **different understanding of some concepts** or simply not be aware of them. On the other hand, multimodal embeddings can handle **image search**.

But first and foremost, we need to understand that embeddings let us find content that is 'similar in meaning', which isn't necessarily the same as 'relevant'. 

![An example query, "How do I deploy to production?", and four example documents ranked by similarity in meaning. Dithered bars show how similar each document is to the query. The bar lengths are illustrative, not measured scores. The most similar document, "Deployment: a history of our tools", is marked red because it is not relevant. The production deploy runbook is relevant and ranks second. A deploy dashboard redesign note is similar but not relevant. A note that says production servers need VPN access is relevant but has the lowest similarity.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-11/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-11/frame.html)

**Decision Models**: fast decision models may also be helpful in searching and navigating files in a codebase or file system. One of the examples is [jevgrep](https://github.com/dzhng/jevgrep) that in some cases visibly reduces costs, as [the agent spends less time exploring the codebase](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/file-picker) and / or knowledge base.

![A flow diagram. A task goes to Jev, a fast decision model. Jev points to three items in a codebase or knowledge base: the deploy/ folder, the rollback.md file and the release() function. Two other items, onboarding/ and clean(), get no pointer. The task and all names are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-12/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-12/frame.html)

**Hybrid Search:** Lastly, we have [hybrid search](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/hybrid-search). It's the most complex approach, but it often gives the best results, because documents that weren't matched by **pattern-based search** may still be caught by **similarity search**.

Besides search tools, we should consider additional kinds of context that **[help agents reach the knowledge they need](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/unreached-notes)**. These include:

- **global context:** files that live beyond a given project, containing information about the current system, environment, existing projects, installed tools, and general principles
- **project context:** files that describe the project but also **its vision**, **feature map**, **styleguide** or even **business aspects** - in other words, information that may help an agent understand the broad context.
- **metadata:** categories, tags, sources and other metadata may also increase the chance of getting the correct results. It's worth taking a look at the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), which is still just Markdown with YAML frontmatter, but also tells agents **where a note came from**, **how much they can trust it** and **whether it's still up to date**.

![Three stacked layers of knowledge base files. At the top, global context: system, environment, existing projects, installed tools and general principles. In the middle, project context: vision, feature map, styleguide and business aspects. At the bottom, notes are boxes. Each box shows the contents and the metadata of a note: tags and a source. The note names, contents and metadata are example values. Lines link deploy.md to env-setup.md and to rollback.md. A red arrow at the side points up from specific contents to broader perspective.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-13/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-13/frame.html)

Now we might start thinking about **the structure** for folders, categories, tags, and templates, and instinctively try to build it ourselves to "stay in control". But the truth is that **agents will be responsible for managing documents**, so it's a good idea to **let them** figure out the structure on their own and, if needed, steer the process to take our specific needs into account. We may even decide to use the tools we don't know yet, as AI may easily onboard us. A good example may be [neo4j](https://neo4j.com/). 

There is no single answer to the question of **how to make a perfect knowledge base**. But this is a very well-known problem and there are many approaches **models are familiar with** - even a simple question about popular strategies gives us this: 

![A transcript with two frames. The User frame holds the question: "What are the well-known, opinionated techniques for building and maintaining a knowledge base?" The AI frame is red. It holds the answer, a list of 36 techniques in three columns: Zettelkasten, Folgezettel, Evergreen notes, Maps of Content (LYT), Digital garden, PARA, CODE (Building a Second Brain), Progressive summarization, Johnny.Decimal, GTD reference filing and weekly review, Daily notes first, Commonplace book, Spaced repetition, Incremental reading, Diátaxis, Every Page Is Page One, Topic-based authoring (DITA), BLUF (inverted pyramid), Card sorting, Tree testing, Controlled vocabularies, SKOS taxonomies, Docs-as-code, Handbook-first, KCS (Knowledge-Centered Service), ADRs (Architecture Decision Records), RFCs (design docs), Single source of truth, Page owners with review dates, ROT audits, Archive don't delete, Boy Scout rule (wiki gardening), Search analytics, Automated link and staleness checks, Inbox processing, AI-readiness (llms.txt).](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-14/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-14/frame.html)

Now, given that models **think while generating tokens** and that **what's in the context affects what gets generated**, we need to make sure this knowledge appears in the conversation, either by including it in our messages or by asking the model for it.

While discussing these knowledge-base techniques may help us understand them better, what we're after is not **building the system ourselves** but **shaping the environment in which agents build a knowledge base**.

One example could be the [knowledge skill](https://github.com/overment/skills/tree/main/skills/knowledge), which aims to build a knowledge base structure in a generalized way:

1. **Define purpose:** a few questions we need to ask ourselves about the knowledge base.
2. **Build context:** the agent has to figure out the most useful methods and general rules.
3. **Initialize structure:** the agent has to iterate on the initial structure and the relationships between documents, trying a few different approaches.
4. **Initialize templates:** the shape of the documents has to be set, not necessarily as a list of strict sections, but rather as general instructions for choosing the best structure for a given note.
5. **Write instructions:** at this point, the agent has to create a skill for working with the knowledge base.
6. **Test it:** using subagents or separate sessions, the agent has to use the skill, see how the knowledge base behaves, and figure out together with us what can be improved.

An important thing to realize here is that, **given the initial requirements**, the process above can be carried out **automatically** until the LLM decides it's ready. And an even more important one is that **the process can run automatically** as the knowledge base grows, to improve its shape. And while modifying a knowledge base with thousands of notes won't be easy even for AI, it can still do way more than we're able to do without it.

![Six numbered stages, left to right: 1 Define purpose, 2 Build context, 3 Initialize structure, 4 Initialize templates, 5 Write instructions, 6 Test it. Arrows join the stages. Above stage 3, a red circular arrow says "try a few approaches". A red arrow goes back from stage 6 to stage 3 and says "improve, now and as the base grows". Stages 1 and 6 say "with us". A bracket over stages 2 to 6 says "automatic until the model decides it's ready".](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-15/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-15/frame.html)

A similar approach can be used with nearly **anything** that can **somehow** be verified, so the feedback loop lets the agents improve their work. In this particular case there is no **strict** verification, although models are great at assessing the quality of structures. But they also need **a clear definition of what "good enough" is.**

## Self-management

Before ChatGPT, knowledge bases could be partially maintained by **automations** that pulled in data from external services or took care of archiving old notes. These automations could get pretty advanced, although building the logic was difficult. Now **even connecting a knowledge base to Claude Code** (or any other agent) feels like magic. The only problem is that **it's mostly reactive**, so we need to be involved in the actions. But as programmers, we already know we can make it **proactive**.

While the mechanics that unlock **ambient, durable agents** will be covered in the second week of MEGA, even at this point we can consider the following:

**Single Entry Point:** every single piece of information we want to add to the knowledge base should arrive through a single entry point, such as an **inbox**. From there agents can pick it up and reliably organize and [connect it with existing knowledge](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/inbox-filing).

![A flow diagram. Four sources (an audio file, text, an event and anything else) all go into one inbox. An agent picks up each item from the inbox. It uses what it knows about the knowledge base to organize the item and connect it with existing knowledge.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-16/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-16/frame.html)

**Schedules:** [daily or weekly cleanup](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/knowledge-health-check) or synchronization may positively affect the overall health of a knowledge base. The biggest challenge, though, lies in building routines that will be **entirely autonomous** but also **straightforward**, so the risk of degrading the knowledge base or losing information is minimal.

![A flow diagram. A red frame named Background agents holds three routines: Merge duplicates (daily), Fix the structure (weekly), and Enrich documents (weekly, fills missing information). Each routine has a line to the knowledge base. The daily and weekly cadences are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-17/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-17/frame.html)

**Events:** since knowledge bases are now built mainly for agents, treating humans as the only source of information is limiting. It's worth looking at services and their APIs, because they may expose webhooks we can set up to **observe** them for changes. We can do the same with **devices** and **local daemons** running on our Mac or PC. Some examples:

- **PRs:** any merged change is a potential reason to update the knowledge base, and agents may be responsible for deciding what's worth keeping and what's not.
- **Repositories:** a new repository on our account likely means we have a new project our agent needs to know about. It should be added to the global context automatically, so the information is already there the moment the agent is asked about it.
- **Support Tickets:** while the knowledge base isn't necessarily the right place for the issues themselves, it can be updated with the overall state of the product and the most important things users talk about.
- **Issues:** as with support tickets, issue trackers contain knowledge that **shouldn't be copied to the knowledge base** but can be distilled to enrich the broader context of a project and its features.  
- **Labeled e-mails and messages:** we don't need agents to read all our messages, but the ones that are automatically labeled can be forwarded to the agent, and their contents can land in the knowledge base as documents.
- **Read Later:** new bookmarks or highlights can automatically land in the knowledge base **and be linked** to existing information.

![Flow diagram. Six event sources from services and devices sit in one frame: PRs, Repositories, Support Tickets, Issues, Labeled e-mails and messages, and Read Later. Each source sends events to an agent. The agent decides what to keep and updates the knowledge base, which is marked in red.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-18/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-18/frame.html)

## Broader context

Agents' understanding is limited to what's already in their context. And even if we have a knowledge base, they can see **only what's currently in it**, which means they lose track of **what came before and what's coming next**. 

And while a git repository may come to mind, we're talking more about a **list of implemented, active, planned and archived features**. This way, an agent walking into the **"tasks"** folder immediately knows not only the **narrow context** of their task, but also the **broader context** that helps them make good decisions.

![A frame named "tasks/" holds four columns: Implemented, Active, Planned and Archived. Each column lists example features from the lesson: Implemented has "Inbox as single entry point" and "Markdown export to a website". Active has "Semantic search indexing", marked red as the agent's task. Planned has "Hybrid search" and "Daily cleanup schedule". Archived has "Notion sync bridge". The feature names are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-19/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-19/frame.html)

A Kanban board doesn't sound like much of a discovery, but [in practice it's extremely useful for agents](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/task-board-context) because it helps them **better understand the context**. This helps not only during the implementation phase, but also when agents **shape requirements and ADRs** (Architecture Decision Records) or any other details of upcoming features.

![A flow diagram. On the left, a frame named tasks/ holds four example features, one for each status: implemented "User accounts", active "Add data export", planned "Storage to S3" and archived "CSV import". The agent reads the active task, which is its own, and also the planned feature. A red path goes from the planned feature to the agent and from the agent to its export design, which uses the storage interface. The feature names are examples.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-20/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-20/frame.html)

## An example

Let's say we want a personal knowledge base, strictly for us and our "personal AGI agent" that has broad context about us, our work, and our personal life. It aims to become our "second brain", a concept that's been widely known for years, but now managed entirely by an agent. To make it useful, we need to set a couple of rules:

- **Availability:** the agent has to reach it easily, whether it runs in the cloud, on our Mac or PC, or on a mobile device (phone, watch or any other wearable). Because of this, the knowledge base has to live remotely, and if it's filesystem-based, it can be synced with our computer using tools like `mutagen sync`.
- **Source of truth:** the knowledge base should be the source of truth for its own notes, without two-way synchronization; information already well maintained in external services should stay there, but [the agent should be aware of what can be found there.](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/pointer-notes) 
- **Self-evolving:** it has to grow nearly autonomously, without us needing to verify or change anything by looking at the files. Any interaction with us has to be proxied through the agent(s).
- **Simplicity:** a knowledge base can easily become a separate system, but so far the best path has been to **keep it simple** and rely solely on **growing agents' and harnesses' capabilities** instead of fighting their flaws.

There may be more rules, depending on our needs. And then we may want to use the `knowledge skill` mentioned above to give an initial shape to the knowledge base and to the skill for managing it. The generated skill is presented below. 

![A card titled "personal-agi-kb skill" with three tiers. At the top, the SKILL.md box lists what the base is for, rules with their reasons, and which note to open for which task. Thin lines run from it down to six reference notes: map, flow, intake, search, upkeep and structure log, each with a short role. At the bottom are two scripts: check.ts checks links and fields, and kb.ts handles IDs, queries and rebuilt pages. A vertical scale on the right marks the tiers as always read, opened when needed, and run, not read. Under the card: judgment in notes, mechanics in scripts.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-21/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-21/frame.html)

And below we have **a general structure** of the "personal AGI knowledge base", which covers our **general context, what we've learned** and information about our **work activities**. In practice, the structure will be refined as new information comes in, and it's not just about growing it but shaping it to our needs.

![A box labelled inbox on the left has an arrow labelled "everything enters here" that points into the knowledge base. The base has three stacked layers. Context lists system · tools · projects. Work is the only red layer. It has one strip of four lanes, planned → active → review → done, with blank cards in the lanes and the text plans · tasks · PRs · decisions under the strip. Knowledge reads what was learned.](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-22/frame.png)

[Open figure](https://hq.mega.dev/figures/s01e03/artifacts/lesson/figure-22/frame.html)

## Takeaway

Even with AI, knowledge bases are "easy to start and hard to master", but that shouldn't stop us from starting. And a personal knowledge base is one of the best things we can try, because it will help us explore many possibilities, but also run into issues, not only on the AI side but also in the environment around it, since many apps and services simply aren't ready for the AI era yet.
