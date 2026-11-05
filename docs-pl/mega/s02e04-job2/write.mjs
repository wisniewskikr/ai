import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const notes = fs.readFileSync('notes.txt','utf8').split(/\r?\n/).filter(Boolean);
for (const text of notes) {
  const step = fs.readFileSync('step.txt','utf8').trim();
  const out = execFileSync('node',['mcp.mjs','tools/call',JSON.stringify({name:'memo_write',arguments:{text,step}})],{stdio:['ignore','pipe','ignore']}).toString();
  const j = JSON.parse(out); const c = j.msg?.result?.content?.[0]?.text; console.log(text,'=>',c);
  const parsed = JSON.parse(c); if (!parsed.step) throw new Error('no step'); fs.writeFileSync('step.txt', parsed.step);
}
