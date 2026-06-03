import OpenAI from 'openai';
import { CLASSIFY_SYSTEM_PROMPT, CLASSIFY_USER_PROMPT } from '../prompts/classify.js';

// Order matters: more specific categories are checked before general ones.
// meetings before browsing prevents "Google Meet — Firefox" from matching browsing first.
const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ['meetings',      ['zoom', 'google meet', 'webex', 'whereby', 'skype']],
  ['work',          ['vscode', 'visual studio code', 'intellij', 'excel', 'word', 'cursor', 'vim',
                     'terminal', 'powershell', 'bash', 'pycharm', 'webstorm', 'rider', 'datagrip',
                     'android studio', 'xcode', 'sublime text', 'notepad++', 'visual studio']],
  ['communication', ['gmail', 'outlook', 'slack', 'discord', 'teams', 'telegram', 'whatsapp', 'signal']],
  ['entertainment', ['youtube', 'netflix', 'disney+', 'hbo', 'prime video', 'amazon prime',
                     'spotify', 'twitch', 'steam', 'vimeo', 'vlc']],
  ['browsing',      ['chrome', 'firefox', 'edge', 'brave', 'safari', 'opera']],
];

const VALID_CATEGORIES = ['work', 'communication', 'meetings', 'browsing', 'entertainment', 'other'];

export function classifyByKeyword(title: string): string {
  const lower = title.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'other';
}

export async function classifyByAI(title: string, ollamaBaseUrl: string, model: string): Promise<string> {
  const client = new OpenAI({ baseURL: ollamaBaseUrl, apiKey: 'ollama' });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: CLASSIFY_SYSTEM_PROMPT },
      { role: 'user', content: CLASSIFY_USER_PROMPT(title) },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content) as { category?: string };
  const cat = parsed.category?.toLowerCase() ?? 'other';

  return VALID_CATEGORIES.includes(cat) ? cat : 'other';
}
