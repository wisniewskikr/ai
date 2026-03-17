## Description

Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence, such as understanding language, recognizing patterns, and making decisions. It encompasses a range of techniques, from rule-based systems to modern machine learning and deep learning models that learn from data. AI systems can be narrow, solving specific problems like image classification or translation, or more general, supporting a wide variety of cognitive tasks. These technologies are increasingly embedded in everyday products and services, from recommendation engines and virtual assistants to medical diagnostics and industrial automation. As AI continues to advance, it raises important questions about ethics, safety, fairness, and the impact on work and society.

## Main Concepts

| Concept | Description |
| --- | --- |
| Model | A model can be imagined as a function in programming: it takes input data and returns an output, but you do not have access to its internal definition. |
| API | The API is the interface that lets you communicate with the model: you send input data (the prompt) and receive the model’s response (the chat completion). |
| Prompt | The prompt is the instruction together with the entire previous conversation history; every API request must include the full content on which the model should base its answer. |
| Tools | Tools are JSON object schemas that are attached to the prompt so the model knows which structured outputs it can generate. |
| Function Calling | Function Calling is the process where the model generates JSON objects for the declared tools, which you use in code to call functions and interact with external services. |
| Agent | An agent is a loop of requests to the model in which the model decides whether to return JSON that triggers another tool call or plain text that ends the loop and serves as the agent’s final answer. |
| Tokens | Users pay for tokens, which represent pieces of text: a token can be a whole word or part of a word. Polish text typically uses about 50–70% more tokens than equivalent English text. Tokens are counted both for input (what you send to the model) and for output (what the model returns), and output tokens usually cost 3–5 times more than input tokens. For models with advanced reasoning, additional “thinking” tokens are added on top of the normal output tokens, further increasing the cost. |

## Main Questions
* Do you really need AI for this task?
* Which model is enough?
* How much context do you really need?

## API mechanisms
* **Prompt caching**: it is a technique where the model provider remembers (caches) repeated parts of your prompts so you don’t pay for and re-send the same context every time, reducing latency and token costs for recurring or shared prompt sections.
* **Batch API**: it lets you send many independent requests to the model in a single API call, so they’re processed more efficiently and cheaply than making the same number of separate, individual requests. You can wait for respose till 24 hours but you pay 50% of price.
* **Model routing**: it is automatically choosing the most appropriate AI model for each request (based on cost, speed, or capabilities) instead of always using a single fixed model.
* **Local model**: it is an AI model that runs directly on your own machine or private infrastructure, instead of being accessed over the internet as a cloud service.

## Example AI Models
* OpenAI 
* Anthropic 
* Gemini 

## Example AI Platforms
* OpenRouter 
* Amazon Bedrock 
* Microsoft Azure

## JSON Output
* **Structured Outputs**: are AI responses returned in a strict JSON format, so the result follows a predefined schema and can be reliably parsed and used directly in code. 
* **Function Calling**: is when an AI model outputs structured JSON instead of plain text, describing which function to call and with what arguments so your code can safely execute actions based on the model’s response.