export type Category =
  | "idle"
  | "communication"
  | "meetings"
  | "entertainment"
  | "browsing";

// Browser-only classifier: the gate (is this a browser?) is in index.ts.
// Here we only classify what the user is doing inside the browser by title.
// browsing is the fallback when no specific title keyword matches.
const CATEGORY_RULES: { category: Category; keywords: string[] }[] = [
  {
    category: "meetings",
    keywords: ["zoom", "meet", "webex", "whereby"],
  },
  {
    category: "communication",
    keywords: ["gmail", "outlook", "slack", "discord", "teams", "mail"],
  },
  {
    category: "entertainment",
    keywords: ["youtube", "netflix", "disney", "hbo", "spotify", "twitch", "steam", "vimeo"],
  },
];

export function classifyBrowserTitle(title: string): Category {
  const titleLower = title.toLowerCase();

  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => titleLower.includes(kw))) return category;
  }

  return "browsing";
}
