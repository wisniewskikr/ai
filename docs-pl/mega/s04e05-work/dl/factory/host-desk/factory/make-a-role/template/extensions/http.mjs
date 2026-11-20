// http: one HTTP request. {{NAME}} references from vars are filled in the url, headers and body when the
// request is sent, so the model works with the reference only. Redirects are followed.
import { fillVars, loadVars } from './vars.mjs';

const MAX_BODY = 20_000;
const hide = (u, vars) => Object.entries(vars).reduce((s, [k, v]) => (v ? s.split(v).join(`{{${k}}}`).split(encodeURIComponent(v)).join(`{{${k}}}`) : s), u);

export default function (pi) {
  pi.registerTool({
    name: 'http',
    label: 'http',
    description: 'Sends one HTTP request and returns the status, the final URL and the response body. {{NAME}} references from vars are filled in when it is sent.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['url'],
      properties: {
        method: { type: 'string', description: 'GET (default), POST, PUT, PATCH or DELETE.' },
        url: { type: 'string' },
        headers: { type: 'object', additionalProperties: { type: 'string' } },
        body: { description: 'A string, or a JSON value (sent as JSON).' },
      },
    },
    async execute(_id, p, signal) {
      const vars = loadVars();
      const headers = Object.fromEntries(Object.entries(p.headers ?? {}).map(([k, v]) => [k, fillVars(v, vars)]));
      let body;
      if (p.body !== undefined && p.body !== null) {
        body = fillVars(typeof p.body === 'string' ? p.body : JSON.stringify(p.body), vars);
        if (typeof p.body !== 'string' && !Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) headers['content-type'] = 'application/json';
      }
      try {
        const res = await fetch(fillVars(p.url, vars), { method: (p.method ?? 'GET').toUpperCase(), headers, body, signal });
        const text = await res.text();
        // The URL as the model wrote it, references and not their values; after a redirect, each value shown as its name.
        const url = res.redirected ? hide(res.url, vars) : p.url;
        const out = `${res.status} ${url}\n${text.length > MAX_BODY ? `${text.slice(0, MAX_BODY)}\n…(cut)` : text}`;
        return { content: [{ type: 'text', text: out }], details: { status: res.status, url } };
      } catch (e) {
        return { content: [{ type: 'text', text: `request failed: ${e?.cause?.message ?? e?.message ?? e}` }], details: { failed: true } };
      }
    },
  });
}
