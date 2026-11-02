import json, sys, os
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def short(s, n=400):
    s = s if isinstance(s, str) else json.dumps(s, ensure_ascii=False)
    s = s.replace(chr(10),' | ')
    return s if len(s) <= n else s[:n] + f' …[{len(s)}]'
for root, _, files in os.walk(src):
    for f in files:
        if not f.endswith('.jsonl'): continue
        p = os.path.join(root, f); lines = []
        for ln in open(p, encoding='utf-8'):
            try: o = json.loads(ln)
            except: continue
            ts = o.get('timestamp', '')
            if 'message' in o and isinstance(o.get('message'), dict):  # claude
                m = o['message']; role = m.get('role'); c = m.get('content')
                if isinstance(c, str): lines.append(f'[{ts}] {role}: '+c.replace(chr(10),' | ')); continue
                for b in c or []:
                    t = b.get('type')
                    if t == 'text': lines.append(f'[{ts}] {role} TEXT: '+b['text'].replace(chr(10),' | '))
                    elif t == 'thinking': lines.append(f'[{ts}] {role} THINK: {short(b.get("thinking",""),600)}')
                    elif t == 'tool_use': lines.append(f'[{ts}] {role} TOOL {b["name"]}: {short(b["input"],600)}')
                    elif t == 'tool_result': lines.append(f'[{ts}]   RESULT: {short(b.get("content"),500)}')
                for k in ('type',):
                    pass
                if o.get('type') not in ('user','assistant'): lines.append(f'[{ts}] {o.get("type")}: {short(o,300)}')
            elif o.get('type') == 'response_item':
                pl = o['payload']; t = pl.get('type')
                if t == 'message':
                    txt = ' '.join(x.get('text','') for x in pl.get('content', []))
                    lines.append(f'[{ts}] {pl["role"]}: {txt}')
                elif t == 'reasoning':
                    lines.append(f'[{ts}] REASON: ' + ' '.join(x.get('text','') for x in pl.get('summary') or []))
                elif t == 'function_call': lines.append(f'[{ts}] CALL {pl["name"]}: {short(pl["arguments"],600)}')
                elif t == 'function_call_output': lines.append(f'[{ts}]   OUT: {short(pl["output"],500)}')
                else: lines.append(f'[{ts}] {t}: {short(pl,300)}')
            elif o.get('type') in ('session_meta','turn_context','event_msg'):
                if o['type'] == 'event_msg' and o['payload'].get('type') in ('user_message','agent_message'): continue
                lines.append(f'[{ts}] {o["type"]}: {short(o["payload"],300)}')
            else:
                lines.append(f'[{ts}] OTHER {o.get("type")}: {short(o,400)}')
        name = os.path.relpath(p, src).replace(os.sep,'_').replace('/','_')
        open(os.path.join(out, name + '.txt'), 'w', encoding='utf-8').write('\n'.join(lines))
        print(name, len(lines))