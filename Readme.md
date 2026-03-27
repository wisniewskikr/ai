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
