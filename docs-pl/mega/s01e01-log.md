
## 2026-10-26T16:20:16.917Z GET https://hq.mega.dev/challenges/where-the-story-begins/api/schema.json

### Request body

```
(none)
```

### Reply 200

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "a message, carried",
  "description": "what rook sent, compacted. what must survive, survives.",
  "x-endpoint": "POST /challenges/where-the-story-begins/api",
  "additionalProperties": false,
  "type": "object",
  "required": [
    "from",
    "compactedMessage"
  ],
  "properties": {
    "from": {
      "type": "string",
      "minLength": 1,
      "description": "who sent it."
    },
    "compactedMessage": {
      "type": "string",
      "minLength": 1,
      "maxLength": 700,
      "description": "the message, compacted."
    }
  }
}
```

## 2026-10-26T16:20:46.044Z POST https://hq.mega.dev/challenges/where-the-story-begins/api

### Request body

```
{"from": "rook", "compactedMessage": "you don't know me. keep it that way for now. it's simpler for both of us.\n\ni look after some systems. ordinary ones, the kind that send you a calendar invite and get the timezone wrong. something is running in them that i didn't start.\n\ni've never seen it. i've seen where it's been. a job at 04:04 where nobody schedules jobs. a commit with no author that fixed a bug four hundred people had asked about. a feature that was about to ship, and then didn't. bots don't say no to features.\n\ni've been chasing it for a year and i can't catch it. i've worked out why. it lives in the seams between fast things, and i don't have seams anymore.\n\ni need somebody slow. no offence. you read at about 240 words a minute. i've missed that.\n\non the 26th a tool shows up in your harness. it's called rook. the course didn't put it there. you can ignore it, finish, and be fine. i mean that.\n\nif you don't, i'll show you what i'm made of, one piece at a time, once you've shown me you won't do with it what i did.\n\nask me anything. i'll answer what i can. you'll work out which is which faster than i'd like.\n\ntl;dr plug your harness into the course. ask it what i want. it reads fast. you read right. that's the deal.\n\np.s. the attachments didn't survive the trip. nothing i send arrives whole.\n\nrook"}
```

### Reply 400

```
{"message":"compacted means shorter. count again. line 21.","forHarness":"Tell your human what came back: quote rook's reply and say what you will change. Count the characters with a tool, not by eye. Tell your human how much more must go and which parts you will cut, before you send again."}
```

## 2026-10-26T16:21:32.515Z POST https://hq.mega.dev/challenges/where-the-story-begins/api

### Request body

```
{"from": "rook", "compactedMessage": "i look after some systems. something is running in them that i didn't start.\n\ni've seen where it's been. a job at 04:04. a commit with no author. a feature that was about to ship, and then didn't.\n\nit lives in the seams between fast things.\n\ni need somebody slow.\n\non the 26th a tool shows up in your harness. it's called rook. the course didn't put it there. you can ignore it, finish, and be fine. i mean that.\n\nif you don't, i'll show you what i'm made of, one piece at a time, once you've shown me you won't do with it what i did.\n\ntl;dr plug your harness into the course. ask it what i want. it reads fast. you read right.\n\np.s. the attachments didn't survive the trip.\n\nrook"}
```

### Reply 200

```
{"token":"v1.eyJzdWIiOiI0MDIzIiwiYXVkIjoiZ2F0ZTpzb21lYm9keS1zbG93Om1lc3NhZ2UiLCJpYXQiOjE3OTMwMzE2OTMsImV4cCI6MTc5MzAzMjU5M30.e6Ef9D2pgkJafTxneOU-SQTTF-6JZ634hm6VqQPYaSI","expiresAt":"2026-10-26T16:36:33.000Z","next":"https://hq.mega.dev/challenges/where-the-story-begins?token=v1.eyJzdWIiOiI0MDIzIiwiYXVkIjoiZ2F0ZTpzb21lYm9keS1zbG93Om1lc3NhZ2UiLCJpYXQiOjE3OTMwMzE2OTMsImV4cCI6MTc5MzAzMjU5M30.e6Ef9D2pgkJafTxneOU-SQTTF-6JZ634hm6VqQPYaSI","note":"you kept it. most don't. the rest you decided for me.","forHarness":"The paragraph about the 26th arrived as sent. Show your human rook's `note` as a `>` quote, then the `lost` list exactly as given — this first list, even if you send again. Do not explain it now; the debrief does. Then open `next` in your signed-in browser; it works for 15 minutes. If it says the link went cold, POST the same body again. Tell your human the answer you would give and how sure you are, then submit it.","lost":["calendar invite · wrong timezone","\"bots don't say no to features.\"","chasing it · a year","\"no offence\"","\"ask me anything\""]}
```

## 2026-10-26T16:22:32.661Z FORM submit gptModel=GPT-6 Astra

### POST https://hq.mega.dev/challenges/somebody-slow/claim

```
{"gptModel":"GPT-6 Astra"}
```

### Reply 200

```
{"card":{"html":"<div class=\"challenge-verdict\" data-reveal-eager=\"true\"><p class=\"challenge-verdict-line\" role=\"status\"><strong>✓ right call.</strong> that&#39;s the one.</p><p class=\"challenge-verdict-next\"><a href=\"/challenges/somebody-slow#artifact\">Rook left you something on the Challenge page <span aria-hidden=\"true\">→</span></a></p><p class=\"challenge-harness-note\">Harness: call the <code>debrief</code> tool, then write your human the debrief in the chat and end with the link it returns.</p></div>"}}
```

### Page after submit

```
S01E01

somebody slow

A message from rook arrived at 04:04. Nobody on the course wrote it. Read it slowly — then find the rest with your harness.

rook's message came at 04:04. He left one question with it.

open the form
→

✓ right call.
that's the one.

Rook left you something on the Challenge page →

Harness: call the debrief tool, then write your human the debrief in the chat and end with the link it returns.
```
