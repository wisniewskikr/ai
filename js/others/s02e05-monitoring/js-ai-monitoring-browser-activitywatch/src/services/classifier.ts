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

  if (!isBrowser) {
    // For non-browser apps: app name is the reliable signal — check it first.
    for (const { category, keywords } of CATEGORY_RULES) {
      if (keywords.some((kw) => appLower.includes(kw))) return category;
    }
  }

  // For browsers (and unmatched apps): title reveals what the user is actually doing.
  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => titleLower.includes(kw))) return category;
  }

  // Browser with no specific title match → generic browsing.
  if (isBrowser) return "browsing";

  return "other";
}
