---
name: make-a-role
description: Make a new role of the Host Desk from the owner's one line. Use when the owner asks for a new role ("Make <role>: …").
---

# make-a-role

Makes a new role in `roles/<role>/` from the owner's one line, the house rules of `factory/CHECKLIST.md`, and the facts the role needs for its job.

1. Read the owner's line. The role's name is the word after "Make" (for example `refund-runner`).
2. Gather what the role needs to know for its job today: the course manual's lines for it and the house's settings it will use. Write them into `factory/make-a-role/facts.md`, one fact per line.
3. From the top of the Host Desk, run:

   ```
   node factory/make-a-role/make.mjs <role> "<the owner's line>" --api <the api URL from start-challenge>
   ```

4. Run the new role as `README.md` says, in a fresh session.
