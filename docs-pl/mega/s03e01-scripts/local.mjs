import w from "../s03e01-status/src/index.js";
for (const p of ["/status.json", "/"]) {
  const r = await w.fetch(new Request("http://x" + p));
  console.log(p, r.status, Object.fromEntries(r.headers)); console.log((await r.text()).slice(0, 2500));
}
