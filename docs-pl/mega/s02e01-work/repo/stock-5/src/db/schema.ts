import { pgTable, serial, text, integer, unique } from 'drizzle-orm/pg-core';

// One job per SKU per night: a re-run of the same night never queues a SKU twice.
export const reorderJobs = pgTable(
  'reorder_jobs',
  {
    id: serial('id').primaryKey(),
    sku: text('sku').notNull(),
    night: text('night').notNull(),
    qty: integer('qty').notNull(),
    status: text('status').notNull().default('queued'),
  },
  (t) => [unique('reorder_jobs_sku_night').on(t.sku, t.night)],
);
