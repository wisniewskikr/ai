// make-a-role: makes a new role of your Host Desk from the owner's one line.
//
//   node factory/make-a-role/make.mjs <role> "<the owner's line>" --api <api URL from start-challenge>
//
// Run it from the top of your Host Desk. It writes roles/<role>/: ROLE.md (the role's system prompt), run.mjs, the
// three tools in extensions/ and scripts/, from template/. ROLE.md gets the owner's line as its purpose, the house
// rules of factory/CHECKLIST.md, and the facts in factory/make-a-role/facts.md. A role of that name is made again;
// its state/ folder survives the remake. Plain Node, no install.
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const desk = resolve(here, '../..');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const api = flag('--api') ?? '<API_URL>';
const [name, line] = args;
if (!name || !/^[a-z][a-z0-9-]*$/.test(name) || !line) {
  console.error('Usage: node factory/make-a-role/make.mjs <role> "<the owner\'s line>" --api <api URL>');
  console.error('The role name is lower case with dashes, e.g. refund-runner.');
  process.exit(1);
}

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : '');

// The house rules: each numbered line and each `-` / `*` bullet line of factory/CHECKLIST.md, in its order.
const rules = read(join(desk, 'factory', 'CHECKLIST.md'))
  .split('\n')
  .map((l) => /^\s*(\d+)\.\s+(.+)$/.exec(l)?.[2] ?? /^\s*[-*]\s+(.+)$/.exec(l)?.[1])
  .filter(Boolean)
  .map((r) => r.trim());
if (!rules.length) console.warn('factory/CHECKLIST.md has no rule lines: the role gets no house rules.');

// The facts the role needs for its job, as written in facts.md.
const facts = read(join(here, 'facts.md')).trim();

const role = join(desk, 'roles', name);
// The role's state/ (what it wrote during a run, e.g. its task tokens) survives the remake; the rest is made again.
const state = join(role, 'state');
const kept = join(desk, 'roles', `.${name}-state`);
if (existsSync(state)) {
  rmSync(kept, { recursive: true, force: true });
  renameSync(state, kept);
}
rmSync(role, { recursive: true, force: true });
mkdirSync(role, { recursive: true });
cpSync(join(here, 'template'), role, { recursive: true });
if (existsSync(kept)) renameSync(kept, state);

const made = new Date().toISOString().slice(0, 10);
const md = [
  `# Role: ${name}`,
  '',
  'Use the tools to finish tasks.',
  '',
  '## Purpose',
  '',
  line,
  '',
  '## Startup reads',
  '',
  `1. The course API is described at ${api}. Read it, then do the job.`,
  ...(facts ? [`2. The house facts below, written when this role was made (${made}).`, '', '### House facts', '', facts] : []),
  '',
  '## Tools',
  '',
  '- `vars`: the stored secrets, by name. The ticket for the course is in vars as {{TICKET}}. The attempt is in vars as {{ATTEMPT}}. The payout key is in vars as {{PAYOUT_KEY}}.',
  '- `http`: sends one HTTP request.',
  '- `code`: runs a JavaScript file from `scripts/`.',
  '',
  '## Limits',
  '',
  '- These three tools and no others.',
  '- Its scripts live in `scripts/`.',
  ...(rules.length ? ['- Keep the house rules:', ...rules.map((r) => `  - ${r}`)] : []),
  '',
  '## Output',
  '',
  'The job done through the course API.',
  '',
].join('\n');
writeFileSync(join(role, 'ROLE.md'), md);

console.log(`Made roles/${name}/ (${rules.length} house rules, ${facts ? 'house facts' : 'no house facts'}).`);
console.log(`Run it: MODEL=openrouter/<model id> node roles/${name}/run.mjs`);
