# Make a role with your factory

`make-a-role` is the part of your factory that makes a new role from the owner's one line. `SKILL.md` says how to use it; any harness can follow it. It writes `roles/<role>/` from `template/`. You and your harness may change anything here, code included.

| Path | What it is |
|---|---|
| `SKILL.md` | The steps: gather the facts, run `make.mjs`, run the new role. |
| `make.mjs` | Writes `roles/<role>/`: `ROLE.md`, `run.mjs`, `extensions/`, `scripts/`. Plain Node, no install. |
| `template/` | The files every new role starts from. |
| `facts.md` | The facts for the next role. You or your harness write it. |

## Make it

From the top of your Host Desk:

```
node factory/make-a-role/make.mjs <role> "<the owner's line>" --api <the api URL from start-challenge>
```

`state/` inside a role survives a remake; the rest is made again.

## Run the made role

Run the made role in a fresh session. One line per harness, from `roles/<role>/`:

- Pi: `MODEL=openrouter/<model id> node run.mjs` (on Windows PowerShell: `$env:MODEL = "openrouter/<model id>"; node run.mjs`).
- Claude Code: `claude -p --system-prompt-file ROLE.md --no-session-persistence "Start."`
- Codex: `codex exec --ephemeral -c model_instructions_file="ROLE.md" "Start."`
- Any harness: `node run.mjs` is a plain Node script that starts Pi; start it from your harness's shell.

`pi -p` and `codex exec` wait for input on an open stdin: close it (`< /dev/null`) if you start them some other way. Under Claude Code or Codex the role uses that harness's tools, not the three in `extensions/`.
