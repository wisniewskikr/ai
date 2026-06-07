import { type Document } from "../utils/knowledge-base.js";

interface Enrichment {
  dependencies?: string[];
  usedBy?: string[];
  tags?: string[];
}

const enrichments: Record<string, Enrichment> = {
  alpha: {
    dependencies: ["Database Core", "Payment API", "Auth Service", "File Storage", "Notification Service"],
    tags: ["e-commerce", "shop", "orders", "cart", "checkout"],
  },
  beta: {
    dependencies: ["Database Core", "Auth Service", "File Storage", "Audit Logger"],
    tags: ["admin", "dashboard", "management", "backoffice"],
  },
  gamma: {
    dependencies: ["Auth Service", "Notification Service", "File Storage"],
    tags: ["mobile", "iOS", "Android", "app"],
  },
  delta: {
    dependencies: ["Database Core", "Auth Service", "Audit Logger"],
    tags: ["reports", "analytics", "charts", "exports", "CSV"],
  },
  payment: {
    dependencies: ["Database Core"],
    usedBy: ["Project Alpha", "Project Beta", "Project Gamma"],
    tags: ["Stripe", "PayU", "transactions", "invoice", "billing"],
  },
  auth: {
    dependencies: ["Database Core"],
    usedBy: ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta"],
    tags: ["JWT", "OAuth", "login", "sessions", "permissions"],
  },
  notification: {
    dependencies: ["Database Core"],
    usedBy: ["Project Alpha", "Project Gamma"],
    tags: ["email", "SMS", "push", "alerts"],
  },
  database: {
    usedBy: ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta", "Payment API", "Auth Service", "Notification Service", "File Storage", "Audit Logger"],
    tags: ["PostgreSQL", "SQL", "migrations", "backups", "replication"],
  },
  storage: {
    dependencies: ["Database Core"],
    usedBy: ["Project Alpha", "Project Beta", "Project Gamma"],
    tags: ["S3", "files", "images", "uploads", "CDN"],
  },
  audit: {
    dependencies: ["Database Core"],
    usedBy: ["Project Beta", "Project Delta"],
    tags: ["logs", "events", "compliance", "GDPR", "history"],
  },
};

export function plainDocument(doc: Document): string {
  return `${doc.name}: ${doc.description}`;
}

export function enrichDocument(doc: Document): string {
  const e = enrichments[doc.id];
  let text = `${doc.name}: ${doc.description}`;
  if (e?.dependencies?.length) text += `\n  Dependencies: ${e.dependencies.join(", ")}.`;
  if (e?.usedBy?.length)       text += `\n  Used by: ${e.usedBy.join(", ")}.`;
  if (e?.tags?.length)          text += `\n  Tags: ${e.tags.join(", ")}.`;
  return text;
}
