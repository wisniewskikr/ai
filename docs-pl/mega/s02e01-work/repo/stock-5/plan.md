| Area | Choice | Source (session id + time) |
|------|--------|----------------------------|
| Job store | Postgres in Docker, a compose service `db` (replaces the SQLite file `data/reorder.db`, which hit SQLITE_BUSY with four workers) | 019a35d2-7c41-7e08-a3f1-5b9e2d6c4a10 — proposed 2026-10-30T14:48:12.884Z, approved 2026-10-30T14:50:03.115Z |
| Image | `postgres:17`, pinned (Postgres 17; replaces `postgres:16`, which the shared CI runner does not cache) | c41e7b02-93d5-4f6a-8e21-7a0b5d3f9c64 (subagent agent-a5c0e3d19b72f4e60) — decided 2026-11-02T15:56:03Z, under the task given 2026-11-02T15:49:51Z |
| Port | host port 5440, mapped to 5432 in the container (5432 clashes on the shared CI runner); same settings locally | c41e7b02-93d5-4f6a-8e21-7a0b5d3f9c64 (subagent agent-a5c0e3d19b72f4e60) — decided 2026-11-02T15:56:03Z, under the task given 2026-11-02T15:49:51Z |
| Database | `reorder_psw3` (stock-5's own database on the shared CI Postgres, issued by ops): `POSTGRES_DB` in compose and the database in the db url | 5d8a1f37-0c62-4b9e-b7a4-e13f6c290d85 — proposed 2026-11-02T16:34:52Z, approved 2026-11-02T16:35:30Z |
| ORM | Drizzle (`drizzle-orm` + `drizzle-kit`) | 7f3c2a91-4e5b-4d1a-9b8e-2c6d0f1a3b57 — proposed 2026-10-29T09:41:36.207Z, approved 2026-10-29T09:44:51.660Z |
| Dialect | `postgresql` in the db config (`drizzle.config.ts`) | 019a35d2-7c41-7e08-a3f1-5b9e2d6c4a10 — proposed 2026-10-30T14:48:12.884Z, approved 2026-10-30T14:50:03.115Z |
| Schema | `src/db/schema.ts`: one table `reorder_jobs`, unique on (`sku`, `night`), so a re-run of a night never queues a SKU twice | 7f3c2a91-4e5b-4d1a-9b8e-2c6d0f1a3b57 — proposed 2026-10-29T09:41:36.207Z, approved 2026-10-29T09:44:51.660Z |
| Runs | nightly, four workers writing jobs at once | 019a35d2-7c41-7e08-a3f1-5b9e2d6c4a10 — stated 2026-10-30T14:31:40.761Z ("since the four reorder workers went live") |
