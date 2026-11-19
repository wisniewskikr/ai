# S04E04 · Automating Work Beyond Code

> **This lesson is extended.** It has two parts. This part has John's video and explains the principles of automating work beyond code. The [Build guide](https://hq.mega.dev/lessons/s04e04/build-guide/) is the written version of what John builds in the video, step by step, with the prompts and the checks for each job. On this page, the notes that start with "In John's build" link each principle to its build.

Agents can answer nearly any question about our daily work, and about the work of most people we work with. State-of-the-art models rarely need a substantive correction from us. Most of the issues we still see come from a mismatch between what we get and what we expected to see.

It's now difficult to find a question, or even an entire task, that we can do and AI can't. Still, poor-quality outcomes are easy to spot, and there are two main reasons for them. The first is that people use AI outside their area of competence, where they struggle to tell whether the results are correct. The second is that most people don't work with SOTA models.

In lesson **S03E03**, there's a diagram of our circle of competence. It shows how AI helps us reach beyond that circle, up to the edge of what we can still verify. Since models keep getting better, that edge may move further out. If it does, it's worth being even more open to things that are new to us, and learning how to get into them quickly. 

And the good news is that, with everything we've covered so far in MEGA, we can simply take action and, together with AI, reach further. It's up to us whether we stay in engineering and focus on an entirely new level of expertise, or reach more broadly into business areas. In both cases, we want to start thinking about **how to use AI to automate things beyond code**. A good place to start is to look at the available apps and services and see how we can connect them with our agents. And it's not just about the technical details of connecting an API, but about the **use cases** we may want to present to the business.

## Outline

- Events: repository changes, issues, messages, schedules, tool calls, failures, external signals
- Hooks: inspecting, redirecting, blocking, enriching, or continuing agent actions
- Pipelines: observe, classify, route, execute, verify, communicate
- Push Systems: delivering knowledge and instructions when needed instead of relying on agent discovery

## Events

One of the values AI agents bring us is the ability to **discover available APIs** very quickly, including features of libraries and platforms we may have known for years. But that's not all AI does. As we've already discussed, it can also **give us personalized recommendations** on how to use those features, along with many unique ideas. The first ones are often very shallow, though, so it's worth pushing further with the knowledge from the first week.

When thinking about autonomous systems, one thing to consider is **when the system can wake itself up**. The answer isn't obvious when we don't have many ideas about what could trigger it. On the other hand, at some point it may be tempting to add too many events, and they become just noise.

Let's say we have a subscription-based product. This business model requires close monitoring of various metrics, such as monthly recurring revenue (MRR), churn, trial-to-paid conversion, and customer lifetime value (LTV). Before agents, such products were integrated with very complex analytics tools, for example [Mixpanel](https://mixpanel.com). But back in the day, these tools weren't proactive, and humans had to turn any insights into actions. Now AI agents can handle most of this.

But before we even start thinking about wiring up events, we need to understand and match:

- **Business Context:** what the business offers its clients and what its objectives are
- **Metrics:** what we can measure to achieve the business objectives
- **Analytics tools:** what the analytics tools offer and how we can connect to them
- **Product:** how the current state of the product addresses all of the above and what we can do about it
- **Event:** what agents (or their scripts) need to observe
- **Action:** what types of actions can be taken
- **Eval:** how we can verify the results of an action

Without AI, all these points had to be handled by at least a small team of people with different kinds of experience. Today, AI agents **can at least research** all of this and provide clear recommendations and an implementation plan. However, what we're looking for here isn't just a single action but **events** that will **wake up our system** without being asked. And that's where the real difference comes from.

![A flow diagram on a square canvas. On the left, a box named Business context (offer and objectives) sends an arrow labelled metrics down into a frame named Analytics tools. The frame holds four example metrics for a subscription product: MRR (growth slows), Churn (rises in month two), Trial-to-paid (falls after a release) and LTV (drops for one plan). The Trial-to-paid box is red. A thick red arrow labelled event goes from it to a frame named Agent in the middle. Above the Agent frame, a box named Product (feature map and releases) sends an arrow labelled recalls into the frame. The Agent frame holds three steps joined by downward arrows: Wakes (without being asked), Explains (finds the cause in the product) and Plans (chooses the actions). An arrow labelled opens goes from the Agent frame to a frame named Actions on the right. The frame holds five example actions: Investigation (where do trials stop?), Experiment (a shorter setup, behind a flag), Guide update (new setup steps in the docs), Team brief (facts for marketing and sales) and Feature request (an agreement, with evidence). An arrow labelled asks for a feature goes from Feature request down and left to a box named We (accept, change or reject). An arrow labelled accepted goes from We to a box named Eval (did the metric move?). An arrow labelled measures again goes from Eval back up into the Analytics tools frame, so the loop closes. The metric trends and the five actions are examples of one case: fewer trials become paid plans after a release.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-1/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-1/frame.html)

This example shows how we can navigate both the engineering and business aspects to see the bigger picture and, together with AI **and our team**, figure out the best possible setup that can be turned into **autonomous jobs**. And even if most of the work can be handled by agents, someone needs to come up with an idea. But what's equally important, **the practical implementation of mechanics like that requires real teamwork**. 

If we think about it, this single example applies to nearly any part of business processes and product engineering. And these tasks aren't just "prompts" that AI can carry out end-to-end, because they touch the real world, including clients, in many places. For example:

- **Pricing:** a competitor changes its plans and one of our agents catches it with Firecrawl. The agent compares those plans with ours and with our financial reports from Stripe and prepares options, but the decision and the conversations with clients stay with us.
- **Payments:** [Stripe](https://stripe.com) webhooks show that failed payments are rising in one country. The agent checks the checkout funnel in [PostHog](https://posthog.com/), finds the cause and proposes a fix to the checkout, while the team contacts the affected clients.
- **Support:** the same question has kept coming up for months in a tool such as [Plain](https://www.plain.com/). The agent updates the docs and proposes a change to the interface in [Paper](https://paper.design/), while the support team still answers people.
- **Sales:** call transcripts (for example, from [Granola](https://www.granola.ai/)) mention the same missing feature. The agent checks whether we can build it and drafts an agreement in [Linear](https://linear.app/), then leaves the decision to us.
- **Store rating:** the app's rating drops after a particular version. The agent connects the reviews from [Sentry](https://sentry.io/welcome/) with the changes in that release and recommends what to revert.
- **Spam reports:** Resend reports more complaints about our marketing campaigns, and people unsubscribe from the list without giving clear reasons. An anomaly like this can emit an event and let agents figure out the root cause and suggest changes.

Below is a visualization of the first example, related to **pricing**, mapped across phases and business areas. It shows just how wide the scope of this process is, even though it's designed to be handled almost entirely by AI agents. Here, we also need to keep in mind that **we're not designing this process alone**, so it's wise to consider designing proper primitives that can be reused in other processes. 

![An example run of an autonomous pricing job. Three lanes, Engineering (data and tools), Product (plans and features) and Business (goals and people), cross four steps: Event (an agent notices), Analysis (agent compares), Decision (people choose) and Result (changed, measured). Each crossing has one dot with the thing that area prepares. Event: Pricing watch, checked every day; Change rules, skip small edits; Owner, who gets the task. Analysis: Revenue data, read-only access; Our plans, features per plan; Goals, targets, margins. Decision: Simulation, run on our data; Options, shown on one page; Approval, the owner decides. Result: Eval, did revenue move?; New plans, behind a flag; Announcement, people tell clients. One red path, labelled one run of the job, starts at Competitor, changes its plans, and goes down through column one, up through column two, down through column three and up through column four, ending at Eval. The case and all twelve points are examples.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-2/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-2/frame.html)

As we adopt a product engineer's mindset, it will become clearer that we can use AI to bring many valuable ideas to team meetings. And depending on how our organization is structured, we can take on different parts of the implementation work.

When we think about it, the activities involved in this process are much the same as those we've discussed so far in the context of programming. And the only thing we need to do at this point is **think about this** and take action. The goal of **events** is to make the entire system **wake without being asked**, handle almost the entire process, and ask for help only when it is needed.

So the most actionable steps here are:

- **Map:** ask an agent to scan the services we use and list their webhooks, APIs and logs. Most products already produce events that nobody reads.
- **Select:** choose one process with clear business value and go through the seven points above with the team. One event, one action and one eval are enough to start.
- **Unify:** make every event arrive through one entry point and in the same shape, with its source, type, identity, time and payload. This is the **Subscriptions** primitive from **S03E01**, and it lets us add the next source without building a new integration.
- **Identify:** give each event an identity. The same event delivered twice must stay one piece of work, while the same event with different content is a change, not a retry.
- **Filter:** start with simple rules, and add a small model only where the rules fail, as in the Specter example from **S04E01**. An agent should wake up only for events that matter.
- **Convert:** turn each event into one task with an owner and a reference back to the event. If the owner is unclear, the system should ask instead of guessing.
- **Observe:** let the agent report what it would do before it's allowed to do it. And review the events regularly, because removing noisy ones matters as much as adding new ones.

And **the primitives** should always be considered in a broader context, not just that of the single process we're working on. 

**In John's build:** a support ticket wakes a small job. The app writes one line to its log for each new ticket, with the ticket's ID. A separate program, the watcher, reads the new lines and starts the sorter, so the guest never waits for a model. The same ticket delivered twice gets one tag, and a bookmark lets the sorter continue after a restart. A failed request wakes a second job, the error hunter. See [Wake a Job](https://hq.mega.dev/lessons/s04e04/build-guide/#wake-a-job).

## Hooks

While events determine when a system starts, hooks determine **what happens along the way**. In **S04E03**, we discussed using hooks throughout an agentic loop’s lifecycle. Now we’re looking at the processes around that loop: how to observe actions, wait for them, respond to them, and adjust the agent’s behavior accordingly. This allows agents to handle long-horizon jobs that may require waiting weeks for feedback.

There are also scenarios where the job’s default flow needs to change depending on the current context. For example, if the system detects issues with important metrics, such as trial-to-paid conversion or email delivery, it may raise an alert when certain thresholds are reached. 

![A timeline across three weeks. Two metric rows are at the top, and each has a dashed threshold that a hook watches. The trial-to-paid metric stays in range, so its hook never fires. In the second week, the email delivery metric falls below its threshold, and a red dot marks the crossing. The job row below is mostly a dotted line, because the job sleeps. An event starts the job, and the job attaches two hooks. When the email hook fires, a red detour leaves the job's default path. It goes down to the owner, who decides to continue, and then it goes back up, where the job resumes. In the third week, the job reports the result. The job, the two metrics and the alert are examples.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-3/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-3/frame.html)

Hooks should usually be defined together with the entire plan for a given job. But as with primitives, it helps to think about their role in multiple contexts. **Alerts**, for example, are a great candidate for a primitive. You can use one whenever something goes wrong, either to reach a human or to trigger dedicated procedures. Another hook could be **Approval**, which contacts a person or agent to get the permission or information needed to proceed with the job.

Below are three timelines representing jobs that an autonomous system may handle after being awakened by an event. Each timeline has its own hooks, which may or may not be triggered depending on the agent's actions. Some hooks are shared, though, because all that changes is the payload and context of their trigger, not their purpose.

![Three example jobs from an online business, each drawn as one horizontal timeline. Pricing review (plans changed, runs for days) meets the hooks Change (page changes, compares again), Timeout (no decision, reminds owner), Approval (owner approves, these options) and Completion (result measured, closes itself). Failed payments (failures rise, runs for hours) meets Join (new reports, join this job), Alert (still rising, alerts a person), Approval (person approves, the fix) and Completion (rate is normal, closes itself). Campaign health (complaints rise, runs for weeks) meets Threshold (limit crossed, holds a segment), Approval (lead approves, lifts the hold) and Completion (two clean sends, closes itself). The Approval hook is marked in red and sits in the same column in all three rows, under the label "the same hook in every job". The Completion hook ends every line in the same column. A time arrow runs under all rows. The jobs and hook details are examples.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-4/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-4/frame.html)

From a technical perspective, a hook is a registered rule with an associated action. It joins a condition with a response and belongs to one job. A general structure of the hook may include:

- **Owner:** the job the hook belongs to
- **Trigger:** what the hook listens to, such as a type of event, a point in time, or a step of the job
- **Condition:** when the hook applies, for example, when a metric crosses a threshold
- **Response:** what the system does, such as waking the agent, running a script, sending an alert, or asking for approval
- **Description:** why the hook exists, written for an agent that will wake up with an empty context
- **Expiration:** when the hook is removed, which is usually the moment the job ends

A structure like this can be interpreted as: **for** this job, **when** this happens, **then** do that, **until** the job ends.

A system can hold **a registry** for hooks, which can be a file or a database table. When a job is created, it registers the hooks it needs, with the proper callbacks. A hook can be created from an existing template or built from scratch. From that moment, the agent can go to sleep, because no model has to run while a hook waits.

Every incoming event, alarm, or step of the job is then compared with the registered hooks by **plain code**. When one of them matches, the system either runs the response directly or wakes the agent and passes it the note together with the event, so the agent knows what happened and why it matters. Each time a hook fires, this is recorded in the job's history, and when the job ends, its hooks are removed.

There are three more things worth keeping in mind. A hook can do only what its job is allowed to do. The same event should fire a hook only once. And a job should have just a few hooks, because too many of them become noise, exactly like too many events.

![A diagram of the general structure of a hook: one record named Hook with six rows that read like a sentence. The group words "for", "when", "then" and "until" split the rows into four groups. The rows are Owner (the job it belongs to), Trigger (what it listens to), Condition (when it applies), Response (what the system does), Note (why, for the agent) and Lifetime (when it is removed). The example values describe one hook of a pricing review job: pricing review, page changed, page is on our list, wake the agent, compare plans again, the job ends. On the left, a Job box (plans the job) registers the hook, and an Event box (or an alarm) is matched against it in code. On the right, one red arrow labelled "wakes" goes from the record to the Agent box (continues).](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-5/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-5/frame.html)

**In John's build:** the closest idea is one rule in the sorter. When the money answer is in the middle, or the sorter is not sure about the owner, plain code marks the ticket unsure, saves the reason, and puts the ticket at the top of the Issues widget for a person. This changes the default path the way an alert or an approval does here. His build has no registry of hooks and no jobs that wait for weeks, so the pricing review stays our example for those. See [Sort New Tickets](https://hq.mega.dev/lessons/s04e04/build-guide/#sort-new-tickets).

## Pipelines

Not everything in autonomous systems has to be dynamic. Many processes are well defined and established. They can follow a fixed path, and often they must. Most of their steps can be fully deterministic, with an agent only managing them. That way, the agent handles potential issues on its own, while repeated or escalated ones go to a person.

Below is a figure showing the general structure of a pipeline and the components it may include:

- **Observation:** receives the event payload and saves it.
- **Classification:** checks the payload against deterministic rules, or passes it to the model when the rules fail. An unclear case goes to manual review.
- **Routing:** depending on the pipeline structure, a router may pick the owner of a particular case.
- **Execution:** does the actual work. This is the step where an agent is most often needed.
- **Verification:** checks the result against proof before anything leaves the pipeline. Work that fails goes back to execution.
- **Communication:** reports the result to the right person or system and records it for the next run.

![A generalized pipeline drawn as one straight red path from "event" to "result". Six evenly spaced steps sit on the path. Under each step are its name, what it does and who does it: Observe, takes the event, code; Classify, names its kind, rules or model; Route, picks the owner, code; Execute, does the work, agent; Verify, checks proof, code or model; Communicate, reports result, code. A dashed line goes up from Classify to "manual review" for unclear cases. A dashed arc goes back from Verify to Execute and is labelled "failed: again". The red label above the path says "the path is fixed".](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-6/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-6/frame.html)

Each step has a clear **input**, a clear **output**, and **a check**. An event starts the entire pipeline, and hooks can change its path. But in general, the structure is defined upfront, so the job can be repeated, observed, and evaluated.

In earlier lessons we discussed the **code mode** and **package** primitives. Both are a great fit for pipelines because they combine easily, and you can run them deterministically or let an agent manage them. Below are a few ideas for pipelines that can work beyond code.

![Four example pipelines of an online business, drawn as four horizontal timelines with the same six columns: Observe, Classify, Route, Execute, Verify and Communicate. Grey dots mark steps that plain code does. Red dots mark steps that an agent or a model does. Release material starts on each merge: merge arrives, reads labels, notes and docs, writes texts (agent), checks links, opens a review. Reconciliation runs every night: reads payments, match or not, exceptions, explains each (agent), totals agree, sends report. Feedback sorting starts on new feedback: takes messages, names feature (agent), to its owner, adds to issue, valid label, weekly digest. Lesson publication starts on a saved draft: draft saved, what changed, text and figures, reviews and draws (agent), build passes, person publishes. The pipelines and step texts are examples. Every step is code except one per pipeline. In three pipelines that step is Execute, and in feedback sorting it is Classify.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-7/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-7/frame.html)

**In John's build:** each of the three jobs follows a fixed path, and plain code does most of the steps. In the sorter, code reads the new ticket, a model answers two questions (who owns it, and is it about money), and code saves the tag. In the drafter, code looks up the stay, Booking writes the reply, and a check traces every amount back to the lookup. Every result waits for a person: a tag to read, a draft to send or not, and a report to hand to Main. See [Sort New Tickets](https://hq.mega.dev/lessons/s04e04/build-guide/#sort-new-tickets) and [Draft Replies from Lookups](https://hq.mega.dev/lessons/s04e04/build-guide/#draft-replies-from-lookups).

## Push Systems

Autonomous agents need context to make good decisions. Agents are great at retrieval and context discovery today, but there will still be scenarios where we rely on smaller models, or where we simply want to be sure the agent is properly steered. Context injection can also matter for optimization, especially for tasks repeated many times, where cost and latency add up quickly. But the most important thing to keep in mind here is that we need to be certain that the context **must be present** and remains useful. 

We already know that in the agentic loop, lifecycle hooks can add context. The same applies to the steps of workflows and pipelines, where we may know exactly what the agent needs to proceed with a task, or we can determine this using routing or decision models.

![A left-to-right flow. A step in a pipeline or a hook starts. An arrow goes down into a frame named "Choose" that holds two options: "Fixed list" (we know the needs) and "Router" (a small model picks). An arrow labelled "selects" goes to the red frame named "Context". It holds three example kinds of context: "Facts" (current, with their age), "Rules" (for this kind of case) and "Last run" (what it learned). A thick red arrow labelled "pushed" goes to a box named "Check" (all present?). An arrow labelled "yes" goes to a box named "Agent" (starts ready). An arrow goes down from Check to the label "no: the step waits". Under the flow, a dashed line labelled "without push: the agent searches for all of it" goes to the Agent box from below. A muted line says "more calls, more cost, and it can miss".](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-8/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-8/frame.html)

Pushing context, even into pipelines where we know almost exactly what's going to happen, can easily cause issues that the agent won't be able to work out on its own. Let's say we have a pipeline that manages product orders. If the **event payload** includes client and product identifiers, we can easily prefetch their details. This makes the agent immediately aware of the most important information and lets it take action right away. In practice, however, it isn't obvious which data should be loaded upfront, because in some cases the agent may need the user's order history, while in others it may need associated products for cross-selling.

![An "order placed" event goes to a prefetch step. The prefetch loads data from our data, which holds two example facts: the same order came yesterday, and an old address is still stored. The prefetch builds three contexts, drawn as three trays with the same six slots: client, product, last order, old orders, old address and related. In "Too little", only client and product are filled. The red empty slot "last order" means that the agent confirms a duplicate. In "Too much", all six slots are filled. The red slot "old address" conflicts with the client record, so the agent ships to the old address. In "Fits this case", client, product and last order are filled, and the agent asks before it confirms. The same agent is under each tray. The order, the repeat and the old address are examples.](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-9/frame.png)

[Open figure](https://hq.mega.dev/figures/s04e04/artifacts/lesson/figure-9/frame.html)

In scenarios like this, we may find a balance between **contents** and **source references or IDs** paired with **minimal descriptions**. This form is much more compressed but perfectly readable for agents. And even though loading the details still requires additional steps, the process becomes more accurate.

**In John's build:** the drafter is a push system. Code reads the stay from the ticket, asks the app for the dates, the price and the total, and gives these facts to Booking together with its customer-facing notes. Booking has no tools, so it cannot search for more. The internal half of its notes stays out, because with it Booking explained an internal mechanism to a guest. When a lookup fails, the facts say "unknown", and the draft gives no amount. See [Draft Replies from Lookups](https://hq.mega.dev/lessons/s04e04/build-guide/#draft-replies-from-lookups).

## Takeaways

Autonomous agentic systems are not only about working on a codebase, as they can integrate into any area of our life and work. For many of us, if not all of us at some point, our daily activities will change compared to what we knew and were familiar with. And for some of us, this is already happening as we work with new tools and navigate areas that are new to us.

Today's lesson was mostly about thinking through **what's really possible**and, first and foremost, **what we can choose** from. At the same time, it shows how all the concepts from MEGA connect. If we think back to the first lesson, it was about seeing generative AI from a very broad perspective, like admiring the view from a mountaintop. Using this analogy, we can think of this lesson not as a way to spot the details of specific places, but rather as a way to use AI to quickly get to the ones we need at a given moment. And sometimes even to be in many of them at once.

The main takeaway, however, is to use whatever tool we like best, or build one if we wish, and together with an agent, figure out what we can do with the apps or services we're working with so we can see how we interact with them and which parts agents can handle for us. While doing so, at least part of our focus should be not on a particular workflow or pipeline, but on smoothly switching between broad and narrow perspectives. At some point, this should lead us to a set of **primitives** that we or our agents can combine to develop and maintain new capabilities for our system, bringing it to nearly full autonomy.
