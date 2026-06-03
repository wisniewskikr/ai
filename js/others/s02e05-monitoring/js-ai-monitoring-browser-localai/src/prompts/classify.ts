export const CLASSIFY_SYSTEM_PROMPT = `You are a productivity tracker that classifies window titles into activity categories.

Categories:
- work: coding, writing, spreadsheets, IDEs, terminals, office tools, documentation
- communication: email, chat apps, messaging (not live calls)
- meetings: video calls, audio conferences, live meetings
- browsing: general web browsing, reading articles, searching
- entertainment: videos, music, games, streaming platforms
- other: anything that does not clearly fit the above

Respond ONLY with a JSON object in this exact format: {"category": "<category>"}
No explanation, no extra text, no markdown.`;

export const CLASSIFY_USER_PROMPT = (title: string): string =>
  `Window title: "${title}"`;
