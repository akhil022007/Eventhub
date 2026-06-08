# EventHub — API Documentation

How to drive every feature over HTTP (curl / Postman). The web UI wraps these same endpoints.

- **Base URL (local):** `http://localhost:3000`
- **Request bodies:** JSON (`Content-Type: application/json`), except media upload which is `multipart/form-data`.
- **Responses:** JSON.

---

## Authentication

Log in with your **email and password**. On success the server sets a session **cookie** named `userId`; send that cookie on every later request and you're authenticated. Log out to clear it.

- The cookie is `httpOnly` (browser JS can't read it) and is signed, so it can't be edited or faked — a tampered or made-up value is treated as logged-out (`401`).
- Your role and event access are always looked up server-side, not stored in the cookie.

**curl** — use a cookie jar (`-c` to save, `-b` to send):

```bash
# log in, save cookies to jar.txt
curl -c jar.txt -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@test.com","password":"pass123"}'

# authenticated request, send cookies from jar.txt
curl -b jar.txt http://localhost:3000/api/events
```

**Postman** — Postman keeps a cookie jar per domain automatically. Just send `POST /api/login` once; the `userId` cookie is stored and attached to later requests to `localhost:3000`. (Set a Postman environment variable `baseUrl = http://localhost:3000`.)

---

## Roles & permissions

**Global role** (on the user): `ADMIN` or `USER` (default). `ADMIN` is a superuser over every event.

**Per-event role** (membership): `ORGANIZER` (the creator), `UPLOADER`, `VIEWER`.

| Action | Organizer / Admin | Uploader | Viewer |
|---|:---:|:---:|:---:|
| View gallery, like, comment, download | Yes | Yes | Yes |
| Upload media | Yes | Yes | No |
| Set cover, delete media, edit/delete event | Yes | No | No |
| Manage members, invite link | Yes | No | No |

Failing a permission check returns **403**; not being logged in returns **401**.

---

## Endpoint reference

### Auth

#### `POST /api/register`
Create an account. Does **not** log you in.

- Body: `{ "name", "email", "password" }`
- `201` → `{ "id", "name", "email" }`
- `400` → missing fields (`"All fields are required"`) or `"Email already exists"`

```bash
curl -X POST http://localhost:3000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@test.com","password":"pass123"}'
```

#### `POST /api/login`
- Body: `{ "email", "password" }`
- `200` → `{ "message":"Login successful", "user":{ "id","name","email","role" } }` + sets `userId` cookie
- `401` → `"Invalid credentials"`

#### `POST /api/logout`
- `200` → `{ "message":"Logged out" }` and clears the cookie. (Send the cookie jar.)

#### `GET /api/me`
- `200` → `{ "id","name","role" }` when logged in, or the literal `null` when not.

---

### Events

#### `GET /api/events`  · *auth required*
Returns the events you can access — **admins** see all; everyone else sees events they **created** or are a **member** of. Each item includes the event fields plus **your** membership role and the `inviteToken`.

- `401` if not logged in.
- `200` → array of:
  ```json
  {
    "id": "…", "title": "…", "description": "…",
    "coverImage": null, "inviteToken": "…", "creatorId": "…",
    "createdAt": "…", "updatedAt": "…",
    "members": [{ "role": "ORGANIZER" }]   // your membership (may be [])
  }
  ```

```bash
curl -b jar.txt http://localhost:3000/api/events
```

> Note: grab an event’s `id` and `inviteToken` here (or from the create response) to build the invite link.

#### `POST /api/events`  · *auth required*
Creates an event; **you become its `ORGANIZER`**.

- Body: `{ "title", "description"? }`
- `201` → the created event (includes `id`, `inviteToken`)
- `400` → `"Title is required"`; `401` if not logged in

```bash
curl -b jar.txt -X POST http://localhost:3000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"title":"Tech Fest 2026","description":"Annual fest"}'
```

#### `PATCH /api/events/{id}`  · *organizer/admin*
- Body: `{ "title"?, "description"? }`
- `200` → updated event; `401` / `403`

#### `DELETE /api/events/{id}`  · *organizer/admin*
Deletes the event and all its media (files + DB rows), members, likes, comments, tags.
- `200` → `{ "message":"Event deleted" }`; `401` / `403`

#### `PATCH /api/events/{id}/cover`  · *organizer/admin*
Sets the event cover image.
- Body: `{ "imageUrl": "/uploads/<file>.jpg" }`
- `200` → updated event; `401` / `403`

---

### Members (invites & roles)

#### Joining via invite link — *web page, not a JSON endpoint*
`GET /events/{id}/join?token=<inviteToken>` is a **page**. Opened while logged in, it adds you to the event as a **`VIEWER`** and redirects to the event. With curl you’ll see a `307` redirect:

```bash
curl -b jar.txt -i "http://localhost:3000/events/<eventId>/join?token=<inviteToken>"
# → HTTP/1.1 307 Temporary Redirect, Location: /events/<eventId>
```
An invalid/missing token shows an “Invalid invite link” page (no membership created).

#### `PATCH /api/events/{id}/members/{userId}`  · *organizer/admin*
Promote/demote a member. The creator’s role is fixed and `ORGANIZER` cannot be assigned via the API.
- Body: `{ "role": "UPLOADER" | "VIEWER" }`
- `200` → updated membership
- `400` → `"Invalid role"` or `"The event creator's role cannot be changed"`
- `403` (not organizer) · `404` (`"Event not found"` / `"Member not found"`)

```bash
curl -b jar.txt -X PATCH \
  http://localhost:3000/api/events/<eventId>/members/<userId> \
  -H 'Content-Type: application/json' -d '{"role":"UPLOADER"}'
```

#### `DELETE /api/events/{id}/members/{userId}`  · *organizer/admin*
- `200` → `{ "message":"Member removed" }`
- `400` → creator can’t be removed · `403` · `404`

> Note: there’s no JSON endpoint that lists a single event’s members with their `userId`s (that list is rendered on the event page). To manage a member by API, get their `userId` from their registration response or another source.

---

### Media

#### `POST /api/media`  · *organizer or uploader*
Uploads one file to an event. **`multipart/form-data`**.

- Fields: `file` (the upload, required), `eventId` (required), `tags` (optional, **repeatable** — send the field multiple times).
- Allowed types: `image/jpeg`, `image/jpg`, `image/png`, `video/mp4`, `video/webm`, `video/quicktime`.
- Tags are normalized (trimmed, lowercased, deduped) and merged with filename-derived suggestions.
- `201` → the media with its tags:
  ```json
  { "id":"…","url":"/uploads/<uuid>.png","fileType":"image/png",
    "fileName":"<uuid>.png","originalName":"beach.png","eventId":"…",
    "createdAt":"…","tags":[{"id":"…","name":"beach"}] }
  ```
- `400` → `"File and eventId are required"` / `"Unsupported file type"` · `401` · `403`

```bash
curl -b jar.txt -X POST http://localhost:3000/api/media \
  -F "file=@/path/to/photo.png;type=image/png" \
  -F "eventId=<eventId>" \
  -F "tags=music" -F "tags=festival"
```

In **Postman**: Body → *form-data* → add `file` (type **File**), `eventId` (text), and one `tags` row per tag (all named `tags`).

#### `DELETE /api/media/{id}`  · *organizer/admin of the media’s event*
Deletes the media file and its row (plus its likes/comments/tags).
- `200` → `{ "message":"Deleted" }` · `401` · `404` (`"Media not found"`) · `403`

#### `POST /api/media/{id}/like`  · *any member*
Toggles **your** like (you never affect anyone else’s).
- `200` → `{ "liked": true }` (added) or `{ "liked": false }` (removed)
- `401` · `404` · `403` (not a member of the event)

```bash
curl -b jar.txt -X POST http://localhost:3000/api/media/<mediaId>/like
```

#### `POST /api/media/{id}/comments`  · *any member*
- Body: `{ "content": "Nice shot!" }`
- `201` → `{ "id","content","userId","mediaId","createdAt" }`
- `400` → `"Comment cannot be empty"` · `401` · `404` · `403`

> Note: listing an event’s media/comments/likes is done on the server-rendered event page, not via a JSON endpoint. The upload (`201`) response returns the created media (with tags); the like/comment responses confirm the action.

---

## End-to-end walkthrough (curl)

```bash
B=http://localhost:3000

# 1. Register two users
curl -X POST $B/api/register -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@test.com","password":"pass123"}'
curl -X POST $B/api/register -H 'Content-Type: application/json' \
  -d '{"name":"Bob","email":"bob@test.com","password":"pass123"}'

# 2. Log in (separate cookie jars)
curl -c alice.txt -X POST $B/api/login -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"pass123"}'
curl -c bob.txt   -X POST $B/api/login -H 'Content-Type: application/json' \
  -d '{"email":"bob@test.com","password":"pass123"}'

# 3. Alice creates an event (she becomes organizer). Note id + inviteToken.
curl -b alice.txt -X POST $B/api/events -H 'Content-Type: application/json' \
  -d '{"title":"Tech Fest 2026","description":"Annual fest"}'

# 4. Bob joins via the invite link (becomes viewer)
curl -b bob.txt -i "$B/events/<eventId>/join?token=<inviteToken>"

# 5. Alice promotes Bob to uploader
curl -b alice.txt -X PATCH $B/api/events/<eventId>/members/<bobUserId> \
  -H 'Content-Type: application/json' -d '{"role":"UPLOADER"}'

# 6. Bob uploads a tagged photo
curl -b bob.txt -X POST $B/api/media \
  -F "file=@photo.png;type=image/png" -F "eventId=<eventId>" \
  -F "tags=stage" -F "tags=night"

# 7. Anyone (member) likes + comments
curl -b alice.txt -X POST $B/api/media/<mediaId>/like
curl -b alice.txt -X POST $B/api/media/<mediaId>/comments \
  -H 'Content-Type: application/json' -d '{"content":"Great shot!"}'
```

---

## Status codes used

| Code | Meaning |
|---|---|
| `200` / `201` | success / created |
| `400` | invalid input (missing fields, bad role, unsupported file type, empty comment) |
| `401` | not logged in (missing/invalid session cookie) |
| `403` | logged in but not allowed (wrong role for the action) |
| `404` | event / media / member not found |
| `500` | server error (generic message; details are logged server-side, never returned) |
