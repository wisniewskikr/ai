import config from "../../config.json";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

export interface WikiResult {
  excerpt: string | null;
  coverageScore: number;
  keywordsFound: number;
  keywordsTotal: number;
}

async function fetchArticleText(keyword: string): Promise<string | null> {
  const searchParams = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: keyword,
    format: "json",
    origin: "*",
  });

  try {
    const searchResp = await fetch(`${WIKI_API}?${searchParams}`);
    const searchData = await searchResp.json() as { query?: { search?: Array<{ pageid: number }> } };
    const firstResult = searchData.query?.search?.[0];
    if (!firstResult) return null;

    const extractParams = new URLSearchParams({
      action: "query",
      pageids: String(firstResult.pageid),
      prop: "extracts",
      exintro: "true",
      explaintext: "true",
      format: "json",
      origin: "*",
    });

    const extractResp = await fetch(`${WIKI_API}?${extractParams}`);
    const extractData = await extractResp.json() as { query?: { pages?: Record<string, { extract?: string }> } };
    const page = extractData.query?.pages?.[firstResult.pageid];
    return page?.extract ?? null;
  } catch {
    return null;
  }
}

export async function checkWikipedia(keywords: string[]): Promise<WikiResult> {
  let articleText: string | null = null;

  // Try each keyword until we find an article
  for (const keyword of keywords) {
    articleText = await fetchArticleText(keyword);
    if (articleText) break;
  }

  if (!articleText) {
    return { excerpt: null, coverageScore: 0, keywordsFound: 0, keywordsTotal: keywords.length };
  }

  const lowerText = articleText.toLowerCase();
  let found = 0;
  for (const kw of keywords) {
    if (lowerText.includes(kw.toLowerCase())) found++;
  }

  return {
    excerpt: articleText.slice(0, 500),
    coverageScore: found / keywords.length,
    keywordsFound: found,
    keywordsTotal: keywords.length,
  };
}
