export interface Document {
  id: string;
  name: string;
  description: string;
}

export const knowledgeBase: Document[] = [
  { id: "alpha",        name: "Project Alpha",        description: "E-commerce system for online shopping." },
  { id: "beta",         name: "Project Beta",          description: "Admin panel for managing the platform." },
  { id: "gamma",        name: "Project Gamma",         description: "Mobile application for end users." },
  { id: "delta",        name: "Project Delta",         description: "Reporting system for business analytics." },
  { id: "payment",      name: "Payment API",           description: "Module for handling online payments." },
  { id: "auth",         name: "Auth Service",          description: "User authentication and authorization." },
  { id: "notification", name: "Notification Service",  description: "Email and SMS notification delivery." },
  { id: "database",     name: "Database Core",         description: "Main database infrastructure." },
  { id: "storage",      name: "File Storage",          description: "File and media storage service." },
  { id: "audit",        name: "Audit Logger",          description: "System event journal and audit trail." },
];
