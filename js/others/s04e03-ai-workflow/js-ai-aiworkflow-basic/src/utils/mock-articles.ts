export interface Article {
  id: number;
  title: string;
  text: string;
}

export const mockArticles: Article[] = [
  {
    id: 1001,
    title: "TypeScript 5.8 Released with Improved Type Inference",
    text: "TypeScript 5.8 introduces several new features including improved type inference for complex generic types, faster incremental compilation, and better integration with modern JavaScript features like using declarations. The release also includes breaking changes that affect some edge cases in conditional type narrowing. Migration guide is available on the TypeScript blog.",
  },
  {
    id: 1002,
    title: "OpenAI Raises $40B at $300B Valuation",
    text: "OpenAI has secured $40 billion in new funding, pushing its valuation to $300 billion — the highest ever for a private tech company. The round was led by SoftBank with participation from Microsoft and other major investors. The funds will be used to accelerate AI research and expand computing infrastructure. CEO Sam Altman called it a pivotal moment for the company.",
  },
  {
    id: 1003,
    title: "Rust Surpasses C++ in Systems Programming Survey 2026",
    text: "A new industry survey of 5000 developers across 50 countries shows that Rust has overtaken C++ as the preferred language for new systems programming projects. Developers cite memory safety without garbage collection, modern tooling, and the cargo package manager as key advantages. The Linux kernel now has over 100,000 lines of Rust code. Microsoft and Google have both announced plans to rewrite critical components in Rust.",
  },
  {
    id: 1004,
    title: "Ask HN: How do you handle LLM output validation in production?",
    text: "I have been running LLM-powered workflows in production for 6 months. The biggest challenge has been output validation — LLMs occasionally return malformed JSON, truncated responses, or off-topic content. We process about 10,000 requests per day and see roughly 0.3% schema errors. I have found that Zod schema validation combined with p-retry and exponential backoff handles most cases gracefully. What approaches are others using? Particularly interested in canary checks and quality monitoring strategies.",
  },
  {
    id: 1005,
    title: "Deno 2.0 Achieves Full Node.js Compatibility",
    text: "Deno 2.0 has been released with full backwards compatibility with Node.js and npm packages. The release supports all Node.js built-in APIs and can run existing npm packages without any modification. The Deno team reports that 98% of the top 1000 npm packages now work out of the box. Performance benchmarks show Deno 2.0 is significantly faster than Node.js in HTTP server scenarios. The permission system has been redesigned to be less intrusive for standard use cases.",
  },
];
