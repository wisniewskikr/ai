# js-ai-chat — Knowledge Graph

AI chat app using OpenRouter API with a knowledge base stored as a graph (Project 5 from the knowledge base series). Instead of loading all data into the context window, the app traverses the graph to retrieve only the nodes and relations relevant to each query.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

## Run

```bash
# Development (ts-node, no build step)
npm run dev

# Production
npm run build
npm start
```

## Usage

Type a message and press Enter to chat. Available commands:

| Command     | Description                        |
|-------------|-------------------------------------|
| `/history`  | Show conversation history           |
| `/clear`    | Clear the console                   |
| `/exit`     | Quit the chatbot                    |

## Configuration

Edit `config.json` to change model, tokens, temperature, or knowledge graph path.

| Field               | Description                                                      |
|---------------------|------------------------------------------------------------------|
| `model`             | OpenRouter model ID                                              |
| `maxTokens`         | Max tokens per response                                          |
| `temperature`       | Sampling temperature                                             |
| `baseUrl`           | API base URL                                                     |
| `knowledgeBasePath` | Path to knowledge graph JSON file (relative to project root)     |

## Knowledge Graph

At startup the app loads the file specified by `knowledgeBasePath`. For each user query the app:

1. **Searches** — finds graph nodes matching keywords from the query (`id`, `label`, `properties`)
2. **Traverses** — BFS to depth 2 to collect connected nodes and relations
3. **Builds context** — serializes matching nodes and edges into text
4. **Sends** — injects that context as the system prompt for the current request

Only relevant data reaches the model — the full graph is never sent at once.

### Example — multi-hop traversal

Query: `What is the breed of Joe's dog?`

```
searchNodes("Joe's dog")  →  [joe_doe, biscuit]
getNeighbors(depth=2)     →  joe_doe --owns_pet--> biscuit --breed: golden retriever
buildContext              →  "Biscuit (Animal): breed: golden retriever
                              joe_doe --owns_pet--> Biscuit"
API response              →  "Joe's dog Biscuit is a golden retriever."
```

This query requires following two hops: `joe_doe → biscuit → breed`. In a flat-text approach the whole knowledge base would be sent; here only the two relevant nodes and their relation are passed to the model.

### Graph format (`data/knowledge-graph.json`)

```json
{
  "nodes": [
    { "id": "joe_doe", "label": "Person", "properties": { "name": "Joe Doe", "role": "software engineer" } }
  ],
  "edges": [
    { "from": "joe_doe", "to": "clara", "relation": "married_to" }
  ]
}
```

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
