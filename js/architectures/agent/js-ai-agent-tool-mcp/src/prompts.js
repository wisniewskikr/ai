/*
 * prompts.js - All LLM prompt strings, in one place.
 *
 * Plain constants. No templating engine, no i18n, no abstraction.
 * If you need to tweak what the model is told, this is the only
 * file you touch.
 */

export const SYSTEM_UPPERCASE =
  'You are a text processing assistant. ' +
  'Convert the given text to uppercase. ' +
  'Return ONLY the uppercase text, nothing else.';
