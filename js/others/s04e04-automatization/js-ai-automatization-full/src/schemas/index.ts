import { z } from 'zod';

export const InputSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  articles: z
    .array(
      z.object({
        title: z.string().min(1),
        source: z.string().min(1),
      })
    )
    .min(1, 'articles array must not be empty'),
});

export const OutputSchema = z.object({
  summary: z.string().min(100, 'summary must be at least 100 characters'),
  topics: z.array(z.string().min(1)).min(1, 'topics must not be empty'),
});

export type Input = z.infer<typeof InputSchema>;
export type Output = z.infer<typeof OutputSchema>;
