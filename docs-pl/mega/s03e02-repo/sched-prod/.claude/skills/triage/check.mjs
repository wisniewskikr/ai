#!/usr/bin/env node
// Checks the triaged tracker in doc/issues/ against the triage skill's rules.
//   node .agents/skills/triage/check.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join('doc', 'issues');
const list = (v) => (v ? v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean) : []);
const issues = readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => {
  const text = readFileSync(join(DIR, f), 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { f, bad: 'no frontmatter' };
  const fm = Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  return { f, fm, body: m[2], labels: list(fm.labels), sources: list(fm.sources) };
});

const errs = [];
const keys = new Set(issues.map((i) => i.fm?.key));
const seen = new Map();
for (const i of issues) {
  if (i.bad) { errs.push(`${i.f}: ${i.bad}`); continue; }
  const { fm, labels, body } = i;
  for (const s of i.sources) {
    // a merged ticket split into several issues may sit in several sources; anything else is a leftover
    if (seen.has(s) && !(fm.key.startsWith('TRI-') && seen.get(s).startsWith('TRI-'))) errs.push(`${s} in sources of both ${seen.get(s)} and ${fm.key}`);
    seen.set(s, fm.key);
  }
  if (fm.key.startsWith('IN-') && !i.sources.includes(fm.key)) errs.push(`${i.f}: own id not in sources`);
  const marks = labels.filter((l) => l === 'agent-ready' || l === 'needs-human');
  if (fm.status === 'open') {
    if (marks.length !== 1) errs.push(`${i.f}: open with ${marks.length} marks`);
    if (marks[0] === 'agent-ready') {
      for (const h of ['## Intent', '## Acceptance', '## Boundaries']) if (!body.includes(h)) errs.push(`${i.f}: missing ${h}`);
      if (!/Allowed by AUT-1/.test(body)) errs.push(`${i.f}: no "Allowed by AUT-1"`);
      if (!/\bnot\b/i.test(body.split('## Acceptance')[1]?.split('## Boundaries')[0] ?? '')) errs.push(`${i.f}: no must-not case`);
    }
    if (marks[0] === 'needs-human') {
      for (const h of ['## Question', '## Options', '## Recommendation', '## Why']) if (!body.includes(h)) errs.push(`${i.f}: missing ${h}`);
      if (!/(PRD|DES|ADR|AUT)-\d+|SCHED-\d+|IN-\d+/.test(body.split('## Why')[1] ?? '')) errs.push(`${i.f}: Why cites no id`);
    }
  } else if (fm.status === 'closed') {
    if (!['duplicate', 'obsolete', 'contradicts-spec', 'not-planned'].includes(fm.reason)) errs.push(`${i.f}: closed without valid reason`);
    if (fm.reason === 'duplicate' && !keys.has(fm['duplicate-of'])) errs.push(`${i.f}: duplicate-of missing/unknown`);
    if (!/(PRD|DES|ADR|AUT)-\d+|SCHED-\d+|IN-\d+/.test(body)) errs.push(`${i.f}: closed cites no id`);
  } else if (fm.status !== 'done') errs.push(`${i.f}: bad status ${fm.status}`);
  for (const b of list(fm['blocked-by'])) if (!keys.has(b)) errs.push(`${i.f}: blocked-by unknown ${b}`);
}
console.log(`${issues.length} issues, ${seen.size} request ids`);
console.log(errs.length ? errs.join('\n') : 'OK');
process.exit(errs.length ? 1 : 0);
