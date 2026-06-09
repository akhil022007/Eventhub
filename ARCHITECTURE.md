# EventHub — Architecture

A single Next.js app (server-rendered pages + JSON API in one process) backed by PostgreSQL, with uploaded media on a file volume. Auth is a signed session cookie.

## Runtime / components

```
                        ┌───────────────────────────────────────────────┐
                        │                 Browser (user)                │
                        │   server-rendered pages  +  fetch() to /api/* │
                        └────────────────────────┬──────────────────────┘
                                                 │  HTTP   (cookie: userId = <id>.<hmac>)
                                                 ▼
   ┌────────────────────────── Next.js app  (one Node container) ─────────────────────────────┐
   │                                                                                          │
   │   proxy.ts ──► auth gate on /dashboard, /events, /upload  (verifies the cookie)          │
   │                                                                                          │
   │   ┌─── Server Components (pages) ───┐        ┌──────── Route Handlers  /api/* ────────┐  │
   │   │ home · login · register         │        │ auth   : register, login, logout, me   │  │
   │   │ dashboard · events · event/[id] │        │ events : list/create, [id] edit/delete │  │
   │   │ upload · events/[id]/join       │        │          cover, members/[userId]       │  │
   │   │ (render + read DB via Prisma)   │        │ media  : upload, [id] delete,          │  │
   │   └────────────────┬────────────────┘        │          [id]/like, [id]/comments      │  │
   │                    │                          │ uploads/[name]  (streams a file)      │  │
   │                    │                          └───────────────┬───────────────────────┘  │
   │                    │                                          │                          │
   │   lib/  auth (getCurrentUser, canView/Upload/ManageEvent) · session (HMAC sign/verify)   │
   │         api (JSON helpers) · client (fetch) · prisma (client) · types                    │
   │   services/ auto-tags (filename → tag suggestions)                                       │
   │                    │ Prisma (SQL)                             │ fs read / write          │
   └────────────────────┼──────────────────────────────────────────┼──────────────────────────┘
                        ▼                                          ▼
              ┌───────────────────┐                     ┌─────────────────────────────┐
              │    PostgreSQL     │                     │   Upload storage            │
              │   (db container)  │                     │   public/uploads/  (volume) │
              │   volume: pgdata  │                     │   served via /api/uploads/  │
              └───────────────────┘                     └─────────────────────────────┘
```

Key point: media **bytes** live on the file volume (served by the `uploads/[name]` route at request time); the database only stores the **metadata** (url, filename, type) + relations.
