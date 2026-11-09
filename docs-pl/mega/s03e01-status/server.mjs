// Node wrapper for Heroku: serves the same handler as the Cloudflare Worker.
import http from "node:http";
import worker from "./src/index.js";

const port = process.env.PORT || 3000;
http.createServer(async (req, res) => {
  const r = await worker.fetch(new Request(`http://${req.headers.host || "localhost"}${req.url}`, { method: req.method }));
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(req.method === "HEAD" ? undefined : Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`status-for-the-night on :${port}`));
