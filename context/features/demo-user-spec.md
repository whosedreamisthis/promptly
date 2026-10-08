# Demo Mode Specification

A "Try the demo" button lets recruiters and other visitors explore Promptly without registering. Each click creates an isolated, temporary Clerk user whose account is seeded with the sample data, and signs the visitor in as that user. The data is cleaned up automatically.

## 1. Goals

- One click from the nav bar (or the sign-in required dialog) to a fully populated app: 5 notebooks, 20 chats, 82 messages.
- Every demo is isolated: visitors never share data and never see each other's changes.
- A banner on every page tells demo users that their changes are temporary.
- Starting a demo is limited per address and per day, and the number of live demo users is capped.
- Old demo users are deleted from Clerk and the database on a schedule.

## 2. User Flow

1. A signed-out visitor clicks **Try the demo** (nav bar or the "Sign in required" dialog).
2. The button calls `POST /api/demo` and shows a spinner and "Starting demo…".
3. The route creates a Clerk user, seeds its data and returns a one-time sign-in token.
4. The browser redeems the token with Clerk's `ticket` strategy (`signIn.ticket()`, then `signIn.finalize()`) and lands on `/`.
5. The demo banner shows at the top: "You're in the demo. Changes are temporary and the demo resets each time it starts."
6. Signing out, or the user being deleted by cleanup, ends the demo. Clicking the button again always starts a fresh demo.

## 3. Demo Users

- Created with the Clerk Backend API (`clerkClient.users.createUser`):
  - `emailAddress`: `demo-<uuid>@promptly-demo.example.com` (`DEMO_EMAIL_DOMAIN` in `lib/demo-limits.ts`)
  - `firstName` / `lastName`: `Demo` / `Recruiter`
  - `publicMetadata`: `{ demo: true }`
  - `skipPasswordRequirement: true` (no password; sign-in is only possible through a token)
- The banner reads `user.publicMetadata.demo` from Clerk's frontend user object.
- Clerk cannot filter users by metadata, so live demo users are counted and found through the email domain query, and cleanup also checks `publicMetadata.demo === true` before deleting anything.
- The Clerk dashboard must have **account deletion turned off** for users (User & authentication → Account deletion), so a demo user cannot delete itself.

## 4. Seeding

- `seedUser(db, userId)` in `lib/seed-user.ts` replaces one user's notebooks, chats and messages with the data in `prisma/seed-data.ts`, in one transaction. Other users are untouched.
- Seed ids are global primary keys, so every id is prefixed with the user id (`<userId>_chat_103`, `<userId>_nb_1`, `<userId>_chat_103_m1`). Ids stay under the 64 character limit of the message schema.
- `npm run db:seed` uses the same function for the development user, and keeps its development-host safety check. The demo route does not use that check; it only ever writes rows owned by the user it just created.

## 5. API

### `POST /api/demo` (public)

Returns `{ success, data, error }`.

| Step | Failure response |
| :--- | :--- |
| Per-address daily limit (`DEMO_LIMIT_PER_IP`, default 3) | 429, "You've already started the demo a few times today…" |
| Global daily limit (`DEMO_LIMIT_GLOBAL`, default 30) | 429, "The demo has reached its daily limit…" |
| Live demo users at the cap (`MAX_LIVE_DEMO_USERS`, 150) | 503, "The demo is busy right now…" |
| Create user, seed, create token fails | 500, "The demo could not start…" and the new user is deleted |

On success: `{ success: true, data: { token }, error: null }`. The token expires after 60 seconds and works once.

### `GET /api/demo/cleanup` (cron only)

- Requires the header `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends it); otherwise 401.
- Finds Clerk users on the demo email domain with `publicMetadata.demo === true` that are older than `DEMO_USER_TTL_HOURS` (default 12), deletes them from Clerk and then deletes their `User` rows (chats, notebooks and messages cascade).
- Scheduled daily in `vercel.json`. The Vercel Hobby plan allows one run per day.

## 6. Limits

Limits use the existing Upstash limiter in `lib/rate-limit.ts` (shared across instances, in-memory fallback without Upstash).

| Limit | Default | Environment variable |
| :--- | :--- | :--- |
| Demos per address per day | 3 | `DEMO_LIMIT_PER_IP` |
| Demos per day, everyone | 30 | `DEMO_LIMIT_GLOBAL` |
| Age before a demo user is deleted | 12 hours | `DEMO_USER_TTL_HOURS` |
| Live demo users | 150 | not configurable |

Demo users share the existing chat limits (`CHAT_DAILY_LIMIT`, `GLOBAL_DAILY_MODEL_LIMIT`), so a demo cannot use up the model budget.

## 7. Environment Variables

| Variable | Purpose |
| :--- | :--- |
| `CLERK_SECRET_KEY` | Already set. Needed to create users and sign-in tokens. |
| `CRON_SECRET` | Random string protecting the cleanup route. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DEMO_LIMIT_PER_IP`, `DEMO_LIMIT_GLOBAL`, `DEMO_USER_TTL_HOURS` | Optional overrides of the defaults above. |

All of them must also be set on Vercel.

## 8. Constraints

- Only a Clerk **development** instance exists, which is capped at 500 users in total (real and demo). The live-user cap and the daily limits keep demos well below that.
- A dev instance shows Clerk's "Development mode" badge and its keys work on a deployed site, but a production instance would need its own domain.
- Demo data is visible only to its own user; nothing is shared between demos.

## 9. Testing

- `lib/seed-user.test.ts`: only the target user is replaced, ids never collide, chats and messages link to their own copies.
- `lib/demo-limits.test.ts`: per address and global limits, TTL, live-user cap, client address.
- `app/api/demo/route.test.ts`: success, each limit, capacity, rollback when seeding fails, Clerk failure.
- `app/api/demo/cleanup/route.test.ts`: authorization, only old demo users are deleted, database rows are removed.
- Clerk, the database and Redis are always mocked.
