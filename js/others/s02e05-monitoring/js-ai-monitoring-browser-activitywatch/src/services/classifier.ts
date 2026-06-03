export type Category =
  | "idle"
  | "work"
  | "communication"
  | "meetings"
  | "browsing"
  | "entertainment"
  | "other";

// Check app first (stable process name), then title.
// Meetings before communication to prefer meeting-specific apps (ms-teams, zoom).
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
    category: "browsing",
    keywords: ["chrome", "firefox", "msedge", "edge", "brave", "safari"],
  },
  {
    category: "entertainment",
    keywords: ["youtube", "netflix", "disney", "hbo", "spotify", "twitch", "steam", "vimeo", "vlc"],
  },
];

export function classifyByKeyword(app: string, title: string): Category {
  const appLower = app.toLowerCase();
  const titleLower = title.toLowerCase();

  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => appLower.includes(kw))) return category;
  }

  for (const { category, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => titleLower.includes(kw))) return category;
  }

  return "other";
}
