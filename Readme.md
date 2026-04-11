TODO:
- RAG
* js-ai-rag-text-neutralembeddings
* js-ai-rag-json-embeddings
- Sandbox: devs4, Daytona, e2b, docker
- obserwacja - langfuse
- kompresja
- skille
- lokalne
- Grounding

## Description

Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence, such as understanding language, recognizing patterns, and making decisions. It encompasses a range of techniques, from rule-based systems to modern machine learning and deep learning models that learn from data. AI systems can be narrow, solving specific problems like image classification or translation, or more general, supporting a wide variety of cognitive tasks. These technologies are increasingly embedded in everyday products and services, from recommendation engines and virtual assistants to medical diagnostics and industrial automation. As AI continues to advance, it raises important questions about ethics, safety, fairness, and the impact on work and society.

## Main Concepts

| Concept | Description |
| --- | --- |
| Model | A model can be imagined as a function in programming: it takes input data and returns an output, but you do not have access to its internal definition. |
| API | The API is the interface that lets you communicate with the model: you send input data (the prompt) and receive the model’s response (the chat completion). |
| Prompt | The prompt is the instruction together with the entire previous conversation history; every API request must include the full content on which the model should base its answer. |
| Tools | Tools are JSON object schemas that are attached to the prompt so the model knows which structured outputs it can generate. |
| Function Calling | Function Calling is the process where the model generates JSON objects for the declared tools, which you use in code to call functions and interact with external services. |
| Agent | An agent is a loop of requests to the model in which the model decides whether to return JSON that triggers another tool call or plain text that ends the loop and serves as the agent’s final answer. |
| Tokens | Users pay for tokens, which represent pieces of text: a token can be a whole word or part of a word. Polish text typically uses about 50–70% more tokens than equivalent English text. Tokens are counted both for input (what you send to the model) and for output (what the model returns), and output tokens usually cost 3–5 times more than input tokens. For models with advanced reasoning, additional “thinking” tokens are added on top of the normal output tokens, further increasing the cost. |

## Main Questions
* Do you really need AI for this task?
* Which model is enough?
* How much context do you really need?

## API mechanisms
* **Prompt caching**: it is a technique where the model provider remembers (caches) repeated parts of your prompts so you don’t pay for and re-send the same context every time, reducing latency and token costs for recurring or shared prompt sections.
* **Batch API**: it lets you send many independent requests to the model in a single API call, so they’re processed more efficiently and cheaply than making the same number of separate, individual requests. You can wait for respose till 24 hours but you pay 50% of price.
* **Model routing**: it is automatically choosing the most appropriate AI model for each request (based on cost, speed, or capabilities) instead of always using a single fixed model.
* **Local model**: it is an AI model that runs directly on your own machine or private infrastructure, instead of being accessed over the internet as a cloud service.

## Example AI Models
* OpenAI 
* Anthropic 
* Gemini 
* xAI

## Example AI Platforms
* OpenRouter 
* Amazon Bedrock 
* Microsoft Azure

## JSON Output
* **Structured Outputs**: are AI responses returned in a strict JSON format, so the result follows a predefined schema and can be reliably parsed and used directly in code. 
* **Function Calling**: is when an AI model outputs structured JSON instead of plain text, describing which function to call and with what arguments so your code can safely execute actions based on the model’s response.

## Model Strategies
* **Main model**: The simplest configuration, where the entire system uses a single model for all tasks.
* **Main and alternative**: The most common setup is to choose a pair of models: one as strong as possible (but usually slower and more expensive), and a second one optimized for speed and cost. The “larger” model handles the most difficult tasks, while the “smaller” one takes care of the rest.
* **Main and specialized**: Similar to the previous configuration, but instead of speed or cost optimization, the priority is high performance on specific tasks. For example, z.ai models may work well for generating UI components, Anthropic or Kimi models for generating long-form text, and x.ai models for fast exploration of the file system.
* **Team of small models**: Thanks to low cost and high speed, it is possible to use many small models together with techniques such as task decomposition and voting to achieve high overall quality without relying on the most expensive models. However, this is demanding and rarely used, especially at the scale of entire systems rather than isolated tasks.

## Security
"Every AI agent is only as strong as its weakest tool and can cause as much harm as its broadest permission."

| Threat | Description |
| --- | --- |
| Prompt Injection | Two forms: `direct` (malicious instructions in the prompt) and `indirect` (malicious instructions hidden in retrieved content). |
| Tool/Function Abuse | The agent is tricked into calling powerful tools in unsafe or unintended ways. |
| Excessive agency | The agent is given too much autonomy, so it acts beyond the intended scope and increases risk. |
| Data Exfiltration | Sensitive data is extracted or leaked through the agent’s responses and/or tool calls. |
| System Prompt Leakage | Definition: attackers try to reveal hidden system instructions. Two scenarios: `hypothetical scenarios` (tricking the agent to disclose hidden instructions) and `role framing` (persuading the agent to adopt a role that reveals system content). |
| Attack on MCP (Model Context Protocol) | Abuse or tamper with MCP context/transport to inject or manipulate tool/context data; tool poisoning (malicious tool/context injection), rug pull (sudden context rollback), token hijacking (steal/abuse tokens via tampered context). |
| Vector and embedding weaknesses | In RAG, retrieval uses vectors/embeddings; weaknesses include knowledge-base poisoning (injecting harmful content), embedding manipulation (steering similarity), and retrieval attacks (adversarial queries/ranking), leading to irrelevant or unsafe context and lower accuracy/safety. |
| Privilege Escalation via Permissions | Overly broad permissions let the agent perform actions beyond what it should be allowed to do. |
| Jailbreaks & Policy Evasion | Attempts to bypass safety rules so the agent produces disallowed or harmful outputs. |

## Security - 5 Layers of Defense

| Name | Description |
| --- | --- |
| Input Validation | Validate and sanitize all inputs (user text, retrieved docs, tool parameters) before they reach the agent. |
| Least Privilege | Restrict tool access and permissions to only what is required for the task. |
| Output Validation | Check outputs against expected formats, policies, and safety constraints before using them. |
| Isolation | Run risky tools/actions in sandboxes or isolated environments to limit blast radius. |
| Monitoring and Auditing | Log actions and decisions, detect anomalies, and review behavior for security incidents. |

## Security - 4 Questions

* What minimal permissions does the agent need?
* What happens if someone injects instructions into the data?
* What data does the agent see, and should it see everything?
* How will we know the agent is doing something it shouldn’t?

## Security - 4 Design Questions

| Question | Description |
| --- | --- |
| **What can go wrong?** | What is the worst thing the AI Agent could do that you did not plan for? For example: send an email, delete files, delete records in the database, etc. This is the so-called "blast radius". |
| **How do I revert it?** | Do you have backups? Can you undo the agent's actions? |
| **Who will see it?** | Can you answer what the AI Agent was doing at any given minute? Do you have an audit trail and observability? |
| **What does the law say?** | Is what the AI Agent does with the data legal? Do users know they are talking to AI? |

## Security - Access Levels

| Level | Description |
| --- | --- |
| **Level 1 – Read Only at start** | If you allow writes, make them surgical: to a specific table, row, or field. Or use the "staging" design pattern: write first to a "staging" table, and only after validation to the target table. Or use the "Proposal and approval" pattern: a new record is created with status "draft", and a human or separate process decides whether to publish. |
| **Level 2 – Dry Run** | Before the AI Agent performs any harmful operation (e.g. deleting a record), it must notify the user and wait for confirmation. This is HITL (Human in the Loop). |
| **Level 3 – Automatic backup** | Before every destructive operation, an automatic backup should be performed so that the action can be reverted. |

## Security - Tokens

| Principle | Description |
| --- | --- |
| **Principle 1** | Create separate tokens for each tool, with limited permissions. |
| **Principle 2** | Rotate tokens. A token that lives for months or years is an invitation to disaster. Short-lived tokens (e.g. 5-minute) reduce attack risk by about 90%. |

## Security - Law

| Topic | Description |
| --- | --- |
| **Legal basis** | The AI Agent must have a legal basis for processing personal data (e.g. consent, legitimate interest, etc.). |
| **Data minimization** | The AI Agent must have access only to data that is strictly necessary for its task. |
| **Breach notification** | Every breach must be reported within 72 hours. |
| **Transparency** | The user must be informed that they are interacting with an AI Agent. |

## Security - Design Steps

| Step | Description |
| --- | --- |
| **Step 1 – Map access** | Before the agent starts operating, list all systems, databases, APIs, and services it will have access to. For each one, specify whether the agent needs read, write, or both. Does it need access to all data or only a subset? What is the blast radius if that access is compromised? |
| **Step 2 – Configure controls** | For each access point, set minimum required permissions. Create dedicated tokens with limited scope. Enable logging from day one. Set up alerts for anomalies, unusual query volume, access to unusual resources, or privilege escalation attempts. |
| **Step 3 – Build a safety net** | Backup before destructive operations. Human in the loop for critical actions. A kill switch: the ability to immediately cut off the agent from all systems. When something goes wrong, you want one button, not a 20-step procedure. |
| **Step 4 – Check compliance** | Do you have a legal basis for the agent to process data? Do users know they are interacting with AI? Does your logging meet audit requirements? Do you have a procedure for reporting incidents within 72 hours? |

## Pillars of Context

Context engineering is the practice of ensuring an agent has the right information at the right time to make good decisions — not just a longer prompt, but the right information.

| Pillar | Description |
| --- | --- |
| **System instruction as a map** | The system instruction should act as a map, not a phone book. It provides orientation and key landmarks, not an exhaustive list of every possible case. |
| **Dynamic context** | Context should change based on the situation. The agent receives relevant information that is appropriate for the current task, not a static block of text. |
| **Context through observation** | Agents can infer context by analyzing existing structure and patterns (e.g., how files are already organized) rather than requiring everything to be stated explicitly. |
| **User-specific knowledge** | The agent must understand who the user is and how they think — e.g., "sensible folders" means something different to an accountant than to a photographer. |

## Safety Rules

Even with perfect context, agents operating on large datasets carry risk. These four rules form a safety baseline for any agent that modifies data:

| Rule | Description |
| --- | --- |
| **Dry run by default** | The agent first shows a plan of intended actions and waits for user approval before executing. Changes the interaction from "act then explain" to "plan then confirm". |
| **Backup before every operation** | Before any move, delete, or rename, the agent creates a backup. The cost of a backup (seconds, disk space) is disproportionately small compared to the cost of irreversible data loss. |
| **Confirmation for large operations** | If an agent plans to execute hundreds of operations, it must summarize and ask for confirmation. Silence during bulk actions is a red flag, not a feature. |
| **Operation log with undo** | Every action is recorded: what file, from where, to where, when. This creates a time-machine effect — any batch of actions can be reversed with a single command. |

## Relation Between Context and Safety

Context and safety are complementary layers — neither alone is sufficient.

| Scenario | Result |
| --- | --- |
| **Context without safety** | Agent makes better decisions but when it fails, the damage is large and potentially irreversible. |
| **Safety without context** | Agent is safe but useless — it lacks the knowledge to make good decisions, so it falls back to generic behavior (e.g., filing 80% of files into "other"). |
| **Context + safety** | Context raises decision quality; safety ensures poor decisions are not catastrophic. Together they shift the interaction from *"I hope it works"* to *"I know I can undo it"*. |

## Voice Recordings and Privacy

### Four Things to Remember

| # | Rule | Description |
| --- | --- | --- |
| **1** | **Voice may be biometrics** | Treat voice recordings as personal data — because legally they are. Under GDPR, voice is a special category requiring explicit consent. An exception applies only if the system is strictly limited to speech-to-text with no emotion detection and immediately deletes source files. |
| **2** | **Local processing is real** | Local speech-to-text quality now matches cloud APIs. The entry barrier has dropped drastically — choose the right tool for your constraints. |
| **3** | **Don't send sensitive recordings to the cloud** | Apply a simple rule: if you wouldn't send the content of the recording by email to a stranger, don't send the recording to someone else's server. |
| **4** | **Privacy routing is mandatory when designing agents** | Your users may not know their recording just flew to another country. You should know when and why you make that decision — and make it before deployment, not after. |

### Speech-to-Text Models

| Model | Type | Notes |
| --- | --- | --- |
| **Whisper API** (OpenAI) | Cloud | Fast, high quality; recording leaves your device. OpenAI API does not use data for training. |
| **Google Cloud Speech-to-Text** | Cloud | Fast, high quality; recording leaves your device. |
| **Deepgram Nova** | Cloud | Fast, high quality; recording leaves your device. |
| **Nvidia Canary-Qwen 2.5B** | Local | #1 on OpenASR Leaderboard (July 2025), ~5% WER, processes audio 418× faster than real time. **English only.** |
| **Whisper Large V3** | Local | Best local option for Polish. High quality, suitable for notes, meetings, and interviews. |
| **Whisper Large V3 Turbo** | Local | Faster variant of Large V3, requires ~6 GB VRAM. Quality comparable to paid APIs. Recommended default for Polish. |
| **MacWhisper** | Local | macOS wrapper around Whisper models; supports many languages with a convenient UI. |
| **VOSK** | Local / Offline | Lightweight engine with Polish support; runs offline even on a phone without GPU. Lower quality than Whisper, sufficient for field notes. |

### Privacy Routing

Privacy routing is the conscious decision of which processing channel to use based on the sensitivity of what is being said.

| Content type | Recommended channel |
| --- | --- |
| Shopping lists, public webinar notes | Cloud — fast, convenient, low risk |
| Client meetings, therapy sessions, financial data, any sensitive content | Local — recording never leaves your device |

## Screen Activity Tracking and Privacy

### Three Things to Remember

| # | Rule | Description |
| --- | --- | --- |
| **1** | **Raw screen data is surveillance, not analytics** | Screenshots, window titles containing client names, mouse inactivity tracking — each element alone can violate GDPR. Together they create a system for which Amazon paid €32 million in fines. |
| **2** | **Aggregates are enough** | If all you need is the answer to "how much time do I spend coding vs. on emails", you don't need to know which emails you're reading. Local classification with Ollama gives exactly that: meaningful results without sensitive data. Instead of storing "Gmail, salary renegotiation, 23 minutes", store "email, 23 minutes". |
| **3** | **Architecture is a decision** | If your screen tracker takes screenshots every 5 seconds and sends them to a server, that is an architectural decision. If you classify locally and save only aggregates, that is also an architectural decision. Both provide analytics, but only one respects privacy. |

## Bot - Two Faces

An AI bot writing messages is not inherently harmful — it depends entirely on how it is used and whether a human remains in the loop.

| Face | Description |
| --- | --- |
| **Ethical use** | The bot writes messages on behalf of a busy person. Every message is reviewed, corrected, and approved by the human before sending. The human is the author; the bot is the tool. |
| **Malicious use** | The bot sends messages autonomously, impersonates non-existent people, builds fake profiles with AI-generated photos and fabricated work histories, conducts relationship-building campaigns over weeks, and then delivers phishing links, exclusive offers, or data requests. At scale: 1,000 parallel conversations per day. |

Beyond text, the threat extends to voice cloning (a few seconds of audio is enough) and real-time deepfake video. Notable cases:
* **January 2025** – A Canadian company lost **$12 million** via a single phone call using a cloned CFO voice.
* **2024** – Engineering firm Arup lost **$25 million** in a live video call featuring a deepfake CFO.
* A deepfake costs less than **$2** to create. Deepfake-as-a-Service platforms offer subscription models like Netflix.
* Deepfake volume grew **16×** in two years (500K in 2023 → 8M now). AI voice phishing rose **1,600%** in Q1 2025 alone.
* Only **0.1%** of people can consistently detect deepfakes. Automated detection tools are bypassed in over **90%** of cases.

## Psychological Playbook

Four steps used in social engineering attacks — amplified by AI to unprecedented scale:

| Step | Trigger | Example |
| --- | --- | --- |
| **Authority** | The sender appears to be someone with power | *"The CEO is calling", "From the law firm", "I'm from the bank"* |
| **Urgency** | Time pressure disables rational thinking | *"Today. By end of day. Immediately."* |
| **Familiarity** | The message sounds like someone you know, based on analyzed contacts and posts | *"I sound like someone you know — because I analyzed your network"* |
| **Isolation** | Prevents verification through other channels | *"Don't tell anyone. This is confidential. Just between us."* |

> "Video call is not verification. If the only proof that you are talking to a real person is that you see their face and hear their voice — you have no proof at all."

## How to Defend — Private Person vs Company

### Private Person

| Action | Description |
| --- | --- |
| **Family password** | Agree on a secret word known only to your close circle. If someone calls in your daughter's voice claiming danger and requesting a transfer — ask for the password. No deepfake knows your password. |
| **Cross-channel verification** | Got an email from your boss? Call them. Got a phone call? Send an SMS to the number you have saved in your contacts — not the number the caller is calling from. |

### Company

| Action | Description |
| --- | --- |
| **Callback on a known number** | Never call back the number provided during the conversation. Call the number you have in your system. |
| **Dual approval for transfers** | Two people must confirm any transfer above a set threshold. Even if one is deceived, the chance that both fall for the same deepfake is minimal. |

## AI With Supervision vs AI Without Supervision

| Scenario | Result |
| --- | --- |
| **AI with supervision** | The human reads every message before it is sent. The human is the filter. AI is the tool, the human is the author. This works. |
| **AI without supervision** | No logging, no approval flow, no monitoring. When something goes wrong, there is no one to say "stop". Problems are not caused by AI becoming malicious — they are caused by no one watching. |

The difference between AI being incredibly useful and causing irreversible harm at scale is: **oversight, monitoring, evaluation, and a human in the loop** — not as an obstacle, but as a guarantee.

## Four Rules

Rules for using AI to write and send communications honestly:

| # | Rule | Description |
| --- | --- | --- |
| **1** | **Transparency** | Optionally add a signature: *"Sent with AI assistance"*. Not everyone wants this, but give the recipient a chance to know. This is a matter of respect, not regulation. |
| **2** | **Never impersonate** | AI can write in someone's style, but the recipient should know who they are talking to. Writing to a client in AI's words while still being yourself is fine. Writing to a client in AI's words while pretending to be someone else is fraud. |
| **3** | **Approval flow as standard** | Every message the AI sends should pass through your eyes before it reaches the recipient. You decide. You click send. You take responsibility. AI writes, you send — that is the fair division. |
| **4** | **Supervise** | Log what the AI does. Check whether results match your expectations. Build a system that can catch when something goes wrong. AI cannot stop itself — it is a tool that does what it is told. If no one is watching, there is no one to say stop. |

---

## Web Scraping

### Definition

Web scraping is the practice of writing bots that crawl websites and collect data automatically — product prices in online stores, listing titles and descriptions, article content for knowledge bases. At its core, scraping is a technical capability: it becomes ethical or unethical based entirely on *how* it is used and whether it respects the rules of the sites being scraped.

### Spectrum of Scraping — From Legal to Illegal

| Practice | Description |
| --- | --- |
| **Ethical scraping** | Parses `robots.txt` before the first request, respects `Disallow` rules, uses an honest user agent with contact info, applies rate limiting (≥5 s between requests), stops when personal data is detected. |
| **Gray zone** | Scrapes public data but ignores `robots.txt`; does not fake identity but sends requests at a rate that strains the target server. |
| **Illegal / harmful** | Fakes user agents (e.g., impersonating Googlebot), ignores explicit `Disallow` directives, harvests email addresses or personal data without consent, copies copyrighted content for commercial use. Legal precedent: Reddit v. Perplexity AI (2025), Reddit v. Anthropic (2025), Ziff Davis v. OpenAI (2025). |

> "Nobody forbids data collection. They forbid doing it rudely." — the key distinction in recent lawsuits is not scraping itself but scraping *without asking* or *ignoring explicit rules*.

### Anti-Bot Defense — Passive vs Active

| Type | Tool | How it works |
| --- | --- | --- |
| **Passive** | `robots.txt` | Declares which paths and bots are disallowed. Nearly 6 million sites now block GPTBot — a 70% increase year-over-year. |
| **Active – deception** | **Cloudflare AI Labyrinth** | Instead of blocking a non-compliant bot, it feeds it an infinite maze of AI-generated pages that look real but contain no useful data. The bot keeps crawling, consuming tokens and compute, while collecting nothing. |
| **Active – friction** | **Anubis** (open source) | Requires the client to solve a proof-of-work puzzle before receiving a response. A real browser solves it in ~1 second. A bot farm sending thousands of requests per minute faces a cost that makes mass scraping economically unviable. |

### 4 Rules of an Ethical Scraper

| # | Rule | Description |
| --- | --- | --- |
| **1** | **Respect `robots.txt`** | Parse it automatically before sending the first request. If the site says no — that's no. "Public" does not mean "free to take". |
| **2** | **Rate limiting is mandatory** | A minimum of 5 seconds between requests is a sensible baseline — not because the server needs it, but to signal you are not a DDoS attack and that you respect resources someone else is paying for. |
| **3** | **Honest user agent** | Stop pretending to be Googlebot. Your bot identifies itself with its real name and leaves contact information. If you are afraid of being blocked when you show your real user agent, ask yourself why — the answer is probably "because I am doing something I shouldn't." |
| **4** | **Flag personal data** | If your scraper encounters anything that looks like a name, surname, email address, or phone number, the system must pause and ask the operator what to do next. Do not collect personal data automatically. GDPR has no sense of humor. |

### New Standards — ai.txt and llm.txt

The web is not only defending itself; it is also trying to establish new rules of engagement. Two standard proposals have emerged:

| Standard | Description |
| --- | --- |
| **`ai.txt`** | An extension of the `robots.txt` idea, specific to AI. Not just "do not scrape" but "scrape these sections, not those; permitted uses are X, prohibited uses are Y." More granular and more precise. |
| **`llm.txt`** | A page declaration addressed directly to language models. What does the page contain? What are the citation rules? May the content be used for training? Not yet a legal standard — only a proposal — but the direction is clear. |

Beyond access control, content monetization is emerging as a third layer:

| Initiative | Description |
| --- | --- |
| **IAB TechLab Content Monetization Protocol** | If AI wants to use your content, it pays. Not steal, not ask for forgiveness — it pays. |
| **Cloudflare Pay Per Crawl** | Want to scrape a Cloudflare-protected site? You can — but you pay a rate set by the owner for each request. |

> The internet is moving from "free for all bots" to "an internet with a price list" — one that says: *my content has value; if you want to process it, respect my rules or pay.*

### Practice — Ethics and Contextual Feedback

Building a scraper that works today is only half the job. A site can change its structure tomorrow, Cloudflare can deploy new protection, or a new standard can come into force. A good scraper does two things:

**1. Follow the 4 ethical rules** (see above) on every run, automatically — `robots.txt` check, rate limiting, honest user agent, personal-data flag.

**2. Report what is happening — contextual feedback.** A scraper should not simply return data; it should tell you the state of its environment:

| Signal | Meaning |
| --- | --- |
| Site responding normally | Data is reliable |
| Structure changed | Selectors may be broken; review required |
| New blocks detected | Access rules have changed |
| Content looks generated / nonsensical | Possible honeypot or AI Labyrinth trap |

> "The difference between a good and a bad scraper is the ability to say *I don't know* or *something is wrong*. A scraper that stays silent and delivers garbage is worse than one that says *I couldn't do it*."

A scraper that detects anomalies and surfaces them immediately lets you catch problems before they silently corrupt your data pipeline.

---

## Three Types of AI Queries

Not all questions are equal. There is no single retrieval strategy that handles all query types well. Every AI system encounters three fundamentally different kinds of queries daily:

| Type | Description | Best Tool | Examples |
| --- | --- | --- | --- |
| **Similarity** | Find documents semantically related to a topic | Vector search (embeddings) | *"Find documents related to GDPR."*, *"Show me emails about Project Delta."*, *"Did the Eagle 1 have one engine or two?"* |
| **Relationship** | Discover explicit connections between entities | Knowledge graph | *"Who reports to Mauricio?"*, *"Which microservices call this endpoint?"*, *"What are the dependencies between component A and component B?"* |
| **Global** | Summarize patterns across an entire corpus | GraphRAG / community summaries | *"What were the main topics across the last 100 meetings?"*, *"Summarize customer complaint trends this quarter."* |

**Why vectors alone fail for relationship queries:** The relation "reports to" is not a matter of semantic proximity — it is an explicit edge in a graph. Mauricio and his direct reports may work on completely different topics, so their documents are far apart in vector space. A vector search for "who reports to Mauricio" will match documents that mention reporting structures in general, not the actual org-chart edge.

**Why vectors alone fail for global queries:** Vector search finds the nearest neighbors to a query, but "what are the main themes across 100 meetings" requires seeing the forest, not individual trees. Techniques like Microsoft's GraphRAG build *community summaries* — summaries of clusters of related nodes — that enable answering big-picture questions.

---

## Three Approaches to AI Memory Architecture

| Approach | When to use | Pros | Cons |
| --- | --- | --- | --- |
| **PostgreSQL + pgvector** | Up to ~500K vectors, simple RAG, no massive scaling plans | Single system, ACID, 40 years of stability, easy ops | Architectural mismatch at scale: HNSW index builds take hours, unpredictable latency above ~5M vectors, requires pgvector Scale extension for production |
| **Dedicated vector database** (Qdrant, Milvus, Weaviate) | Millions of vectors, hybrid BM25 + semantic search needed | Native sharding, indexes optimized for vectors, built-in hybrid search | Additional operational complexity — another system to maintain, monitor, and back up |
| **PolyStore** (2026 consensus) | Production systems with mixed query types | Right tool for the right job: Postgres as relational source of truth, dedicated vector DB for semantic search, optional graph for relationship queries | Most complex setup; requires deliberate separation of responsibilities |

> Benchmarks from May 2025 show pgvector Scale outperforming Qdrant by 11× in certain tests, but above 100 million vectors dedicated databases take the lead.

---

## GraphRAG (Microsoft) — Pros and Cons

GraphRAG is Microsoft's approach to automatically building a knowledge graph from documents using LLMs, then using that graph structure to answer questions about relationships and global patterns.

| | Details |
| --- | --- |
| **How it works** | An LLM processes your documents, extracts entities and relationships, resolves naming conflicts, and builds a hierarchy. *Community summaries* are generated for clusters of related nodes, enabling global queries. |
| **Best for** | Relationship queries (*"which components depend on X?"*) and global queries (*"what are the main themes across the corpus?"*) |

### Pros
- Answers questions about structure and dependencies that pure vector search cannot handle
- Community summaries enable high-quality responses to big-picture questions
- Combines well with vector search for a complete retrieval strategy

### Cons
- **Expensive to build and maintain** — not a licensing cost, but the cost of constructing and keeping the graph current. LLMs must traverse all documents, extract entities and relations, and resolve conflicts
- **Pipeline overhead** — graph-building pipelines must re-run on every significant change to source documents
- **Research prototype origin** — the Nvidia/BlackRock *Hybrid RAG* paper (August 2024) that formally described combining vector search with knowledge graphs was a research prototype, not a production system. The industry has not reached consensus on naming or implementation

> **When to use it:** Start from the types of questions your system must answer. If you never need relationship or global queries, GraphRAG is overkill. If those queries are core to your use case, it may be the only viable path.

---

## Embedding Inversion

### What Is an Embedding?

An **embedding** is a numerical representation of a piece of text as a vector of floating-point numbers (e.g., 1 536 dimensions for OpenAI's `text-embedding-3-small`). Semantically similar texts produce vectors that are close together in that high-dimensional space. Embeddings are the foundation of vector search: you embed a query, then find the nearest stored vectors.

### The Myth: "Embeddings Are Safe Because You Can't Reconstruct the Original Text"

This claim was repeated across the industry for years. It is false.

| Research | Year | Finding |
| --- | --- | --- |
| **Song & Raktunathan** | 2020 | Recovered 50–70% of words from embeddings, but without preserving sentence order |
| **Vec2Text** (John Morris et al.) | 2023 | Recovered **92%** of original text from 32-token embeddings — including names, surnames, and medical diagnoses from clinical notes — with full sentence coherence |
| **Algen** | Feb 2025 | Inversion attack that works **without access to the embedding model**. A single leaked data point is sufficient to align embedding spaces and begin inversion |
| **ZS-Invert** | 2025 | Eliminates the need to train an attacker model altogether |

> The direction is clear: inversion attacks become cheaper and easier every year. Treat stored embeddings as sensitive data.

---

## Three Practical Tips for Embedding Security

| # | Rule | Why |
| --- | --- | --- |
| **1** | **Never expose raw embeddings via API** | If your API returns embedding vectors to clients, that is an attack surface. Return search results, not the underlying vectors. |
| **2** | **Apply access control to your vector database** | A vector database left open internally "because it's just vectors" is not safe — it stores semantic representations of your documents from which substantial content can be recovered. |
| **3** | **Consider encrypted embeddings** | Solutions like **Cloaked AI** (Iron Core Labs) encrypt vectors in a way that preserves enough properties for similarity search, but inversion returns nonsense. A relatively new category of tooling, worth monitoring. |

---

## Payment API — Three Solution Paths

The scenario: a dependency graph query returns 3 of 8 projects that depend on a payments API, because the other 5 use words like "billing", "invoices", or "transactions" in their documentation. Vector search found semantic similarity to "payments" and stopped there.

| Option | Approach | Cost | Scalability |
| --- | --- | --- | --- |
| **Minimal** | Enrich document metadata with explicit relationship fields. Add a "dependencies" and "related components" section to every document. Vector search now hits phrases that describe dependencies, dramatically improving recall without building a full graph. | Low | Good for simple dependency structures |
| **Compromise** | **Hybrid search** — combine semantic vector search with keyword search (BM25). A query for the payments API now matches both semantically similar documents *and* documents that literally mention the endpoint name. Supported natively by Weaviate, Qdrant, and Elasticsearch. | Medium | Good for most production systems |
| **Full** | Build an **automatic dependency graph** from technical documentation using an LLM. Add **intent routing**: the system classifies each incoming query as similarity, relationship, or global, then routes it to the appropriate retrieval mechanism. | High | The only approach that scales to complex dependency questions in large systems |

> No option is universally best. Each is best for a specific context — system scale, query types, and infrastructure maintenance budget. **Start from the questions, not the technology.**

---

## Silent Degradation

The system keeps running but quietly produces incorrect, incomplete, or misleading results — no crash, no alert. Example: a Slack-summarization workflow silently omitted discussion threads for 14 days after the LLM provider raised token limits. Nobody noticed.

> *"In distributed systems you don't ask whether something will break — you ask when, and how you will respond."* — Marc Brooker, AWS (2015)

### Script vs AI Workflow

| Dimension | Classic Script | AI Workflow |
| --- | --- | --- |
| **Cost per call** | None | Tokens (money) |
| **Result** | Deterministic | Non-deterministic |
| **Latency** | Stable | 200 ms – 1 min |
| **Failure mode** | Binary — works or doesn't | Spectrum — may succeed technically but return garbage |
| **Debugging** | Stack trace | No trace; output looks valid but is wrong |

### 4 Design Patterns

### Pattern 1. Retry + Exponential Backoff + Jitter

Naive retry causes the **Thundering Herd** problem — thousands of instances retrying simultaneously DDoS their own provider.

- **Exponential backoff**: 1 s → 2 s → 4 s → 8 s
- **Jitter**: random deviation from the base delay breaks synchronization (decorrelated jitter reduces collisions by an order of magnitude — Brooker, AWS Architecture Blog)
- **Retry costs money** — distinguish error types first:

| Error | Retry? |
| --- | --- |
| Timeout | Yes |
| HTTP 400 Bad Request | No — prompt is wrong |
| HTTP 429 Rate limit | Yes — with longer backoff |
| HTTP 500 Server error | Yes |

### Pattern 2. Circuit Breaker

Stops retrying a permanently unavailable service. Acts like an electrical fuse (Martin Fowler):

| State | Behavior |
| --- | --- |
| **Closed** | Requests pass through normally |
| **Open** | Requests fail immediately — no timeout wait |
| **Half-open** | One probe request allowed through |

- **Closed → Open**: 5 of last 10 calls failed
- **Open → Half-open**: after 60 s
- **Half-open → Closed / Open**: probe succeeded / failed

> AI-specific: HTTP 200 with a hallucination is not a "success" for the circuit breaker — connect this to output validation (Pattern 4).

### Pattern 3. Dead Letter Queue

Every task that exhausts its retries moves to a **DLQ** (a simple DB table) instead of being discarded.

| Column | Purpose |
| --- | --- |
| `timestamp` | When the task failed |
| `payload` | Original input |
| `error_type` | What went wrong |
| `attempt_count` | Number of tries |
| `status` | Pending / resolved / discarded |

- *"We lost 7 days of data"* → panic, manual reconstruction
- *"We have a queue of 7 days to reprocess"* → start reprocessing, go for coffee

### Pattern 4. AI Workflow Monitoring

Classical monitoring (uptime, latency, error rate) is not enough — AI workflows must also monitor **output quality**.

| Layer | What to check |
| --- | --- |
| **Schema compliance** | Expected JSON fields exist and are non-empty |
| **Length and proportions** | Output token count within expected range (300 tokens → 50 tokens = red flag) |
| **Canary checks** | Known test inputs sent periodically; output validated against expected results |

- Alert threshold: **≤ 5 minutes** after the first anomalous result

### Pattern Prioritization

| Priority | Pattern | When |
| --- | --- | --- |
| **1** | Retry + Backoff + Jitter | Always — covers ~80% of transient failures |
| **1** | Monitoring | Always — tells you when Retry isn't enough |
| **2** | Circuit Breaker | Multiple external dependencies (LLM + vector DB + CRM…) |
| **3** | Dead Letter Queue | Business-critical data whose loss has a real cost |

---

## Automation

### Trust Gap

The gap between *"task completed"* and *"task completed correctly"* is where most automation failures live. The better automation looks, the less you scrutinize it — and the longer failures go undetected.

### Three Phases and the Irony of Automation

Lisanne Bainbridge (*Ironies of Automation*, 1983): advanced automation eliminates the repetitive contact with the process that built human intuition. The more automated the system, the harder it is to notice when something goes wrong.

- **Honeymoon** — script works, data flows, you feel like Tony Stark.
- **Reality** — edge cases, timezone bugs, stale data, overlapping runs.
- **Irony** — the better automation looks, the less you scrutinize it.

### Heartbeat Monitoring

A silent refusal is as bad as a silent error. Two required behaviors:
- **Refuse loudly** — if input data is invalid, do not run *and* alert immediately.
- **Confirm loudly** — after every successful run, ping an external service (e.g. healthchecks.io). If the ping doesn't arrive in the expected window, an alert fires. No ping = something is wrong.

### Timezone — Always Explicit

Declare timezone in config, code, or comment — never rely on the server default.
`0 9 * * * TZ=Europe/Warsaw /path/to/task`
If anyone on the team has to guess the scheduler's timezone, that is a bug.

### Output Verification — Four Questions

Do not trust the exit code. Verify the result is useful:

| # | Question |
| --- | --- |
| **1** | Does the result exist? |
| **2** | Does it have a sensible size? (0-byte backup is not a backup) |
| **3** | Is the format correct? (parse JSON, count CSV columns) |
| **4** | Is the content complete? (7-day report has 7 days of data) |

GitLab (2017): backup script logged *"Backup Complete"* for months while writing to a non-existent directory. 6 hours of production data lost — not because the script failed, but because no one verified the output.

### Overlapping Runs and the Lock File

If a task runs longer than its interval, a second instance starts before the first finishes — two processes writing to the same output produce corrupted data. Fix: lock file with a timestamp TTL.
Phases: 
- On start → check lock → exit if present. 
- On finish → delete lock. 
- On crash → lock expires after TTL (e.g. 2 h).

### Final Report Pattern

| Component | Purpose |
| --- | --- |
| Explicit timezone | Runs when expected |
| Input validation | Refuses stale data |
| Output validation (size, format, completeness) | Confirms result is usable |
| Heartbeat ping | External proof the task ran |
| Lock file with TTL | Prevents overlapping runs |
| Alert on failure | Never silent |

Version 1: cron → model → Slack. 3 lines. Lasted one week.
Final version: ~30 lines. The difference between automation you *trust* and automation you *pray for*.
