import { Config } from './config';

export async function embedText(text: string, config: Config): Promise<number[]> {
  const results = await embedBatch([text], config);
  return results[0];
}

export async function embedBatch(texts: string[], config: Config): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY!;
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch(`${config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.embeddingModel,
        input: batch,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embeddings API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as { data: { embedding: number[] }[] };
    allEmbeddings.push(...data.data.map(d => d.embedding));
  }

  return allEmbeddings;
}
