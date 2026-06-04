export type Category =
  | "idle"
  | "work"
  | "communication"
  | "meetings"
  | "browsing"
  | "entertainment"
  | "other";

// Non-browser apps: check app first (stable process name), then title.
// Browsers are containers — their title determines the real category.
// browsing is the fallback when no specific title keyword matches.
const BROWSER_APPS = ["chrome", "firefox", "msedge", "edge", "brave", "safari"];

const CATEGORY_RULES: { category: Category; keywords: string[] }[] = [
  {
    category: "work",
    keywords: ["vscode", "code", "intellij", "idea64", "idea", "excel", "winword", "word", "cursor", "vim", "pycharm", "webstorm", "rider", "clion", "terminal", "powershell", "bash", "notepad++"],
  },
  {
    category: "meetings",
    keywords: ["zoom", "meet", "webex", "whereby", "ms-teams"],
  },
  {
    category: "communication",
    keywords: ["gmail", "outlook", "slack", "discord", "teams", "thunderbird", "mail"],
  },
  {
    category: "entertainment",
    keywords: ["youtube", "netflix", "disney", "hbo", "spotify", "twitch", "steam", "vimeo", "vlc"],
  },
];

export function classifyByKeyword(app: string, title: string): Category {
  const appLower = app.toLowerCase();
  const titleLower = title.toLowerCase();

  const isBrowser = BROWSER_APPS.some((b) => appLower.includes(b));

  // Browser usage is always classified as browsing — no topic analysis.
  if (isBrowser) return "browsing";

  // For non-browser apps: check app name first, then title.
  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => appLower.includes(kw))) return category;
  }

  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => titleLower.includes(kw))) return category;
  }

  return "other";
}
