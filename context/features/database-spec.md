# Database Spec: Neon + Prisma + Postgres

Persist users, notebooks, chats and messages, replacing `lib/mock-chats.ts` and the mock state in `ChatsProvider`. This must land before the Gemini integration (`ai-integration-spec.md`), which reads and writes chats, messages and titles.

## 1. Tech Stack

- **Database:** Postgres on Neon (project `promptly`, use the `development` branch; see CLAUDE.md)
- **ORM:** Prisma, with `prisma migrate dev` for every schema change (never `db push`)
- **Env vars (`.env`, and listed in `.env.example`):**
  - `DATABASE_URL`: pooled connection, used by the app at runtime
  - `DATABASE_URL_UNPOOLED`: direct connection, used by Prisma Migrate (`directUrl`)
- **Migrations only, never `db push`:** all schema changes go through `prisma migrate dev` (development branch), producing committed files in `prisma/migrations/`. Production is only ever changed with `prisma migrate deploy`, run before the app starts. `prisma db push` and `prisma migrate reset` are never run against production, and never against any branch without checking `DATABASE_URL` first
- Check current Prisma docs (Context7) for the client setup and generator config of the installed version before writing the schema

## 2. Do We Need a User Table?

Clerk owns authentication (credentials, sessions, profile), but a small `User` table is still worth having:

- Foreign keys: `Chat` and `Notebook` need something to reference, so deleting a user cascades to their data instead of leaving orphans
- Per-user app data Clerk shouldn't hold: preferences, default model, persona/system instructions, usage counters, plan tier
- Clean joins and queries without calling Clerk's API

Design:

- `User.id` is the **Clerk user id** (`user_...`) stored as text. No separate internal id, so `auth().userId` can be used directly in queries
- **Create lazily:** upsert the row the first time a signed-in user hits a server action (a small `ensureUser()` helper). No webhook is needed for v1
- Store only what the app needs. Do not duplicate name, email or avatar; read them from Clerk when needed
- Later, an optional Clerk `user.deleted` webhook can delete the row (cascade removes their data)

## 3. Schema

### User

| Field       | Type     | Notes                            |
| :---------- | :------- | :------------------------------- |
| `id`        | String   | PK, Clerk user id                |
| `createdAt` | DateTime | default now                      |
| `updatedAt` | DateTime | `@updatedAt`                     |

Relations: has many `Notebook`, has many `Chat`.

### Notebook

A folder that groups multiple chats.

| Field       | Type     | Notes                              |
| :---------- | :------- | :--------------------------------- |
| `id`        | String   | PK, cuid                           |
| `userId`    | String   | FK to `User`, `onDelete: Cascade`  |
| `title`     | String   |                                    |
| `pinned`    | Boolean  | default false                      |
| `createdAt` | DateTime | default now                        |
| `updatedAt` | DateTime | `@updatedAt`                       |

Relations: has many `Chat`. Index: `(userId, updatedAt)`.

### Chat

| Field           | Type     | Notes                                                                     |
| :-------------- | :------- | :------------------------------------------------------------------------ |
| `id`            | String   | PK, cuid. The client pre-generates ids today (see Chat Pages), keep that  |
| `userId`        | String   | FK to `User`, `onDelete: Cascade`                                         |
| `notebookId`    | String?  | FK to `Notebook`, `onDelete: SetNull`, null means a plain "recent" chat   |
| `title`         | String   | default `"New Chat"`                                                      |
| `isCustomTitle` | Boolean  | default false. True once the user renames; blocks AI auto-rename          |
| `pinned`        | Boolean  | default false                                                             |
| `createdAt`     | DateTime | default now                                                               |
| `updatedAt`     | DateTime | `@updatedAt`, bumped when a message is added (drives "recents" order)     |

Indexes: `(userId, updatedAt)`, `(notebookId)`.

A chat belongs to at most one notebook (one-to-many). This matches the sidebar, where a chat sits either under a notebook or in recents. Deleting a notebook keeps its chats and moves them back to recents.

### Message

| Field         | Type     | Notes                                                       |
| :------------ | :------- | :---------------------------------------------------------- |
| `id`          | String   | PK, cuid                                                    |
| `chatId`      | String   | FK to `Chat`, `onDelete: Cascade`                           |
| `role`        | Enum     | `USER` or `ASSISTANT` (add `SYSTEM` only if needed later)   |
| `content`     | String   | `@db.Text`, the message text                                |
| `createdAt`   | DateTime | default now                                                 |

Index: `(chatId, createdAt)` for ordered history.

### Attachment

References to files sent with a user message. Storage of the bytes (Base64 for v1, blob storage later) is decided in the Gemini feature; this table only records metadata so the schema doesn't need another migration for it.

| Field       | Type    | Notes                                              |
| :---------- | :------ | :------------------------------------------------- |
| `id`        | String  | PK, cuid                                           |
| `messageId` | String  | FK to `Message`, `onDelete: Cascade`               |
| `name`      | String  | original filename                                  |
| `mimeType`  | String  |                                                    |
| `size`      | Int     | bytes                                              |
| `url`       | String? | storage URL; null until a storage provider is used |

## 4. Server Actions (`actions/chats.ts`, `actions/notebooks.ts`)

All actions: `"use server"`, get the Clerk `userId` (reject if none), validate input with Zod, scope every query by `userId` (ownership check on any id passed in), wrap in try/catch, and return `{ success, data, error }`.

**Chats:** `createChat(id?)`, `getChats()`, `getChat(chatId)` (with messages), `renameChat(chatId, title)` (sets `isCustomTitle = true`), `togglePinChat`, `moveChatToNotebook(chatId, notebookId | null)`, `deleteChat`.

**Notebooks:** `createNotebook(title)`, `getNotebooks()` (with their chats), `renameNotebook`, `togglePinNotebook`, `deleteNotebook`.

`addMessage` is not exposed here; the Gemini feature persists messages inside `streamChatResponse`.

## 5. Frontend Changes

- Server components load chats and notebooks directly with Prisma (per coding standards) and pass them to the client
- `ChatsProvider` is initialised from DB data and calls the server actions for mutations (optimistic updates are fine, with a toast on failure)
- A chat created via New chat is only written to the DB when it is created or first used, not on every visit to `/`
- `/chats/[chatId]` loads the chat and its messages for the signed-in user; unknown or foreign ids give `notFound()`
- Remove `lib/mock-chats.ts` once nothing imports it

## 6. Testing

- Vitest tests for the server actions with `@clerk/nextjs/server` and `@/lib/db` mocked; no real database in unit tests
- Cover: no session, invalid input, accessing another user's chat/notebook, rename sets `isCustomTitle`, deleting a notebook leaves its chats
- Run `prisma migrate status`, `npm test` and `npm run build` before committing

## 7. Out of Scope

- AI/Gemini calls, streaming and auto-titling (next feature)
- File storage provider
- Clerk webhooks, search across messages, sharing/public links, usage tracking
