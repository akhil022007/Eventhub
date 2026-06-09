# EventHub

A campus **event media gallery**. Organizers create events, invite people with a secret link, and members upload, browse, tag, like, and comment on photos and videos — all scoped by per-event roles.

## What it does

- **Accounts** — register and log in with email + password; the session is kept in a signed cookie so it can't be faked.
- **Events** — any logged-in user can create an event and becomes its **organizer**.
- **Per-event roles** — every event has three roles:
  - **Organizer** (the creator / admins) — full control: edit & delete the event, set the cover, upload, delete media, manage members, and share invite links.
  - **Uploader** — view + like + comment + download **and upload** media.
  - **Viewer** — view + like + comment + download.
- **Invite links** — each event has a secret token; opening `/events/<id>/join?token=…` while logged in joins you as a **viewer**. The organizer can later promote you to **uploader**.
- **Media** — upload images/videos to an event with **tags** (pick from defaults or add custom), then filter the gallery by tag.
- **Engagement** — per-user **likes** (you only toggle your own) and **comments**.
- **Dashboard** — stats scoped to the events you can access.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 + PostgreSQL · Tailwind CSS v4 · bcrypt · Docker.

> Auth is intentionally lightweight (a signed cookie, not NextAuth). Roles are enforced in the API route handlers and server components via `lib/auth.ts` — middleware (`proxy.ts`) only does a coarse logged-in gate.

---

## Run it locally

You need either **Docker** (easiest) or **Node 20+ with your own PostgreSQL**.

### The easy way — with Docker

If you have Docker installed, run one command:

```bash
./set-up.sh
```

That's it. The script creates a secret key for you, builds the app, starts the database and the app together, and tells you when it's ready. Open **http://localhost:3000** in your browser.

A few handy commands while you work:

- `make up` — same as `./set-up.sh` (start everything)
- `make down` — stop everything
- `make docker-build` — rebuild the app after you change code (then `make up` again)

Just make sure nothing else is already using ports **3000** (the app) and **5432** (the database) before you start.

### The manual way — with Node + your own Postgres

If you'd rather run it directly on your machine:

1. **Install the dependencies:**
   ```bash
   make install-dependencies     # (this just runs npm install)
   ```

2. **Create a `.env` file** in the project root with two lines — your database connection and a random secret:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventhub?schema=public"
   SESSION_SECRET="any-long-random-string"   # generate one with: openssl rand -hex 32
   ```
   (`SESSION_SECRET` is what keeps you logged in — the app won't start without it. With Docker this is created automatically.)

3. **Set up the database and start the app:**
   ```bash
   npx prisma migrate deploy     # create the tables
   npx prisma generate           # prepare the database client
   npm run dev                    # start the app
   ```

   Open **http://localhost:3000**.

### Once it's running

1. **Register** an account, then **log in**.
2. **Create an event** — you become its organizer.
3. Open the event and **copy the invite link** to share. Anyone who opens it (after logging in) **joins as a viewer**.
4. As the organizer, you can **promote a viewer to uploader** or remove them.
5. **Upload** photos/videos with tags, then **like**, **comment**, and **filter by tag** in the gallery.

---

## Project layout

```
app/                     Routes (App Router) + /api route handlers
  (protected)/           Pages behind the auth gate (dashboard, events, upload)
  api/                   JSON endpoints (auth, events, media, members)
components/              UI (events, gallery, layout, ui primitives)
lib/                     auth.ts, api.ts, client.ts, session.ts, prisma.ts, types.ts
prisma/                  schema.prisma + migrations + seed.ts
services/auto-tags.ts    Filename-based tag suggestions
public/uploads/          Uploaded media (Docker mounts a volume here)
Dockerfile, docker-compose.yml, set-up.sh, Makefile
```

## API

Full endpoint reference, auth details, and copy-paste curl / Postman examples are in **[api-documentation.md](api-documentation.md)**.

## Deploying (notes)

- Build the image → push to a registry (**ECR**) → run on **App Runner / ECS Fargate / EC2**. You **cannot** run a container from S3.
- Use **RDS for PostgreSQL** for the database and inject `DATABASE_URL` / `SESSION_SECRET` from **Secrets Manager / SSM**.
- Uploaded media is written to local disk (`public/uploads`), which is **ephemeral** on Fargate/App Runner. For production, store uploads in **S3** (a change in `app/api/media/route.ts`).

## Live demo

Deployed on Render: **https://eventhub-6qxs.onrender.com/**

It runs on Render's free tier, so it may be **down or slow on the first request** (the service sleeps when idle and takes ~30–60s to wake up) — just retry after a moment.
