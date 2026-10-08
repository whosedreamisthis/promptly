# Database Seed Specification

Seeds realistic development data (notebooks, chats, messages) for one existing user. It matches `prisma/schema.prisma` as it is today: `User`, `Notebook`, `Chat`, `Message`. Attachments are not seeded.

## 1. Target

- **Database:** Neon project `promptly` (`cold-math-39202337`), branch **`development`** (`br-misty-rain-b5r0qzcy`) only. Never `production` (`br-bitter-dream-b549ysk3`).
- **User:** Clerk user id `user_3KODyVQUIlUYr2xesJF8jfCvdnB`.
- **Scope:** 5 notebooks, 20 chats (6 in notebooks, 14 standalone), 82 messages.

## 2. Schema Constraints

| Model      | Fields that can be set                                                                         |
| :--------- | :--------------------------------------------------------------------------------------------- |
| `User`     | `id` only (no email, name or tier)                                                             |
| `Notebook` | `id`, `userId`, `title`, `pinned`, `createdAt`, `updatedAt` (no description)                   |
| `Chat`     | `id`, `userId`, `notebookId?`, `title`, `isCustomTitle`, `pinned`, `createdAt`, `updatedAt`    |
| `Message`  | `id`, `chatId`, `role` (`USER` or `ASSISTANT`), `content` (max 10,000 chars), `createdAt`      |

- `Notebook` and `Chat` use `@updatedAt`, but Prisma accepts an explicit value on `create`; set `updatedAt` from the "Last updated" column so the sidebar order is deterministic (it sorts by `updatedAt desc`).
- Message order is `createdAt asc`. Give each message a strictly increasing `createdAt` (1 minute apart, starting at the chat's `createdAt`). Never rely on the default `now()`, because a bulk insert would give ties.
- Ids are fixed strings (`nb_1`, `chat_101`, message `<chatId>_m<n>`) so the script can be re-run. They fit the 64-character id limit in `lib/validations/chats.ts`.
- Set `isCustomTitle: true` on every seeded chat so automatic renaming never changes the titles.

## 3. Data

### 3.1 Notebooks (5)

| Id     | Title                                  | Chats                  | Pinned |
| :----- | :------------------------------------- | :--------------------- | :----- |
| `nb_1` | Frontend Architecture & Next.js        | `chat_101`, `chat_102` | no     |
| `nb_2` | AI Chatbot Design Specs                | `chat_103`, `chat_104` | yes    |
| `nb_3` | Database & Backend Engineering         | `chat_105`             | no     |
| `nb_4` | Prompt Engineering & System Prompts    | `chat_106`             | no     |
| `nb_5` | Product Ideas & Feature Backlog        | none (empty-state test) | no    |

`updatedAt` for each notebook is the newest `updatedAt` of its chats; `nb_5` uses `2026-10-01T08:00:00Z`.

### 3.2 Long thread: `chat_103` (18 messages, tests scrolling)

Title `Sidebar Component Architecture & UX Discussion`, notebook `nb_2`, `createdAt` `2026-10-08T00:00:00Z`, `updatedAt` `2026-10-08T00:18:00Z`, pinned.

Messages alternate USER/ASSISTANT, starting with USER. Assistant replies are 2 to 8 lines of plain text (no need for full code):

1. USER: what should my sidebar for my gemini clone look like? im creating a chat bot in nextjs with no credit cards
2. ASSISTANT: A short layout description: header with logo and close button, search box, New chat, collapsible Notebooks and Recents, footer with the account button, plus a Tailwind sketch.
3. USER: i dont want the implementation i want a markdown file with the specs
4. ASSISTANT: A markdown spec overview with an ASCII diagram of the sidebar.
5. USER: create a markdown file
6. ASSISTANT: A detailed specification: sections, behaviours, breakpoints.
7. USER: create a markdown md file with these specs
8. ASSISTANT: The same spec as one raw markdown block.
9. USER: create a markdown file that i can download
10. ASSISTANT: Explains it can't attach files here and offers the markdown to copy.
11. USER: hello?
12. ASSISTANT: Apologises for the delay and restates what it can provide.
13. USER: where did you go?
14. ASSISTANT: I'm right here! Here is the Markdown containing your complete sidebar specifications.
15. USER: im creating a chat bot clone. i have the user avatar on the bottom in the sidebar but when the sidebar is closed the avatar appears in the top right of the page
16. ASSISTANT: Three options: 1) a narrow icon rail, 2) avatar top right, 3) a floating drawer.
17. USER: which option should i choose?
18. ASSISTANT: Option 1 provides the smoothest experience on desktop, keeping the sidebar as a narrow icon strip with the avatar remaining at the bottom-left.

### 3.3 Other chats (19)

Messages alternate USER/ASSISTANT starting with USER, so counts are even. The seed file writes short realistic text for each: the first USER message is the opening question for the title's topic, the rest are brief follow-ups and answers (1 to 6 lines each, never over 10,000 characters).

| Chat ID    | Title                                        | Notebook | Messages | Pinned | Last updated           |
| :--------- | :------------------------------------------- | :------- | :------- | :----- | :--------------------- |
| `chat_101` | Next.js App Router Setup                     | `nb_1`   | 4        | no     | `2026-10-08T01:00:00Z` |
| `chat_102` | Tailwind CSS Sidebar Layout                  | `nb_1`   | 6        | no     | `2026-10-08T01:10:00Z` |
| `chat_104` | Responsive Sidebar Drawer Specs              | `nb_2`   | 4        | no     | `2026-10-08T02:15:00Z` |
| `chat_105` | PostgreSQL Indexing Strategies               | `nb_3`   | 6        | no     | `2026-10-07T18:30:00Z` |
| `chat_106` | System Prompt Guardrails & Personas          | `nb_4`   | 4        | no     | `2026-10-07T14:20:00Z` |
| `chat_107` | TypeScript Interface Best Practices          | none     | 2        | no     | `2026-10-07T11:00:00Z` |
| `chat_108` | Gemini API Integration Guide                 | none     | 4        | yes    | `2026-10-06T22:15:00Z` |
| `chat_109` | Dark Theme UI Color Palettes                 | none     | 2        | no     | `2026-10-06T19:40:00Z` |
| `chat_110` | React Server Components vs Client Components | none     | 4        | no     | `2026-10-06T15:05:00Z` |
| `chat_111` | Lucide React Icon Imports                    | none     | 2        | no     | `2026-10-05T16:22:00Z` |
| `chat_112` | Clerk Authentication Flow in Next.js         | none     | 4        | no     | `2026-10-05T12:10:00Z` |
| `chat_113` | Docker Compose Setup for Postgres & Redis    | none     | 2        | no     | `2026-10-04T20:00:00Z` |
| `chat_114` | Zustand State Management Patterns            | none     | 4        | no     | `2026-10-04T17:45:00Z` |
| `chat_115` | Optimizing Font Loading with `next/font`     | none     | 2        | no     | `2026-10-03T14:12:00Z` |
| `chat_116` | Tailwind Typography Plugin Setup             | none     | 2        | no     | `2026-10-03T09:30:00Z` |
| `chat_117` | Handling API Rate Limits                     | none     | 4        | no     | `2026-10-02T21:18:00Z` |
| `chat_118` | Deployment to Vercel Checklist               | none     | 2        | no     | `2026-10-02T16:00:00Z` |
| `chat_119` | Lucide React Accessibility Attributes        | none     | 2        | no     | `2026-10-01T11:45:00Z` |
| `chat_120` | Database Seeding Script Design              | none     | 4        | no     | `2026-10-01T08:00:00Z` |

Each chat's `createdAt` is its "Last updated" minus the number of messages in minutes, and message `createdAt` values count up from there. Tailwind is v4 and Next.js is 16 wherever a title or message mentions versions.

### 3.4 Totals

| Entity                   | Count | Notes                                   |
| :----------------------- | :---- | :-------------------------------------- |
| Users                    | 1     | Upserted with `id` only                 |
| Notebooks                | 5     | `nb_5` has no chats                     |
| Chats in notebooks       | 6     | `chat_101` to `chat_106`                |
| Standalone chats         | 14    | `chat_107` to `chat_120`                |
| Messages                 | 82    | 18 + 24 (other notebook chats) + 40     |

## 4. Implementation

- **Files:** `prisma/seed.ts` (script) and the data in `prisma/seed-data.ts`.
- **Client:** build it like `lib/db.ts` (`PrismaClient` from `../app/generated/prisma/client` with the `PrismaPg` adapter and `DATABASE_URL`). Do not import from `@prisma/client`, and use relative imports so the script does not depend on the `@/` alias.
- **Runner:** add `tsx` as a dev dependency, a `"db:seed": "prisma db seed"` script in `package.json`, and `migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" }` in `prisma.config.ts`. `.env` is already loaded there through `dotenv/config`.
- **Safety guard:** the script prints the database host it will use and aborts unless `process.env.NODE_ENV !== "production"` and the host equals `SEED_ALLOWED_HOST` (set to the `development` branch's host in `.env`, not committed to `.env.example`). Confirm the host belongs to the `development` branch in the Neon console before the first run.
- **Idempotent re-runs:** inside one `db.$transaction`, upsert the user, delete that user's existing chats and notebooks (messages cascade), then recreate everything. Only data for `TARGET_USER_ID` is touched, so any other user stays as it is.
- **Insert order:** user, notebooks, chats (with `notebookId`), then messages with `createMany`.
- **Validation:** content must pass `addMessageSchema` limits (non-empty, at most 10,000 characters); the script throws if any message does not.

## 5. Verification

1. `npm run db:seed` against the development branch finishes without errors and prints counts: 5 notebooks, 20 chats, 82 messages.
2. Run it a second time: the counts stay the same.
3. Sign in as the target user: the sidebar shows both pinned items first, `nb_5` opens an empty notebook, and `chat_103` scrolls.
4. `npx prisma migrate status` still reports the schema in sync, and `npm test` and `npm run build` pass.
