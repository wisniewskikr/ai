import { log } from "./monitor.js";
import { mockArticles, type Article } from "../utils/mock-articles.js";

const HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

export type { Article };

export async function fetchArticles(count: number): Promise<Article[]> {
  try {
    const topRes = await fetch(HN_TOP_URL, { signal: AbortSignal.timeout(8000) });
    if (!topRes.ok) throw new Error(`HN API returned ${topRes.status}`);

    const ids: number[] = await topRes.json();
    const articles: Article[] = [];

    // Fetch up to 5x the needed count to account for articles without text
    for (const id of ids.slice(0, Math.min(count * 5, 50))) {
      if (articles.length >= count) break;

      const itemRes = await fetch(HN_ITEM_URL(id), { signal: AbortSignal.timeout(5000) });
      if (!itemRes.ok) continue;

      const item = await itemRes.json();
      if (!item.text) {
        log.info({ layer: "pipeline", id: item.id }, "skipped — no text");
        continue;
      }

      articles.push({ id: item.id, title: item.title ?? "Untitled", text: item.text });
    }

    if (articles.length === 0) {
      log.warn({ layer: "pipeline" }, "no articles with text found — using mock data");
      return mockArticles.slice(0, count);
    }

    return articles;
  } catch (err) {
    log.warn({ layer: "pipeline", error: String(err) }, "HN API unavailable — using mock data");
    return mockArticles.slice(0, count);
  }
}
