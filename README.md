# Promptly

A chatbot web app with streaming Gemini replies, saved chats organised into notebooks, and a try-without-signing-up demo mode.

## Features

- **Streaming chat:** Gemini replies stream from `/api/chat`, rendered as markdown, with auto-generated chat titles and a mock mode that skips model calls.
- **Chats and notebooks:** Chats and messages are saved per user in Postgres. Notebooks group related chats and have their own pages.
- **Sidebar:** Search, new chat, pinned and recent chats, and rename, pin and delete menus with delete confirmation.
- **Input extras:** File attachments and voice dictation.
- **Guest chat:** Signed-out visitors can chat in memory without saving.
- **Demo mode:** "Try the demo" signs visitors into a temporary, freshly seeded user that a daily cron job cleans up.
- **Usage limits:** Per-minute, daily and global limits on Upstash Redis. Over the limit, replies switch to a sample reply.
- **Settings:** Dark and light themes, plus a free-tier Gemini model choice saved per user.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 and [shadcn/ui](https://ui.shadcn.com)
- [Clerk](https://clerk.com) for authentication
- [Prisma](https://www.prisma.io) with Postgres on [Neon](https://neon.tech)
- [Vercel AI SDK](https://ai-sdk.dev) with Google Gemini
- [Upstash Redis](https://upstash.com) for rate limiting
- [Vitest](https://vitest.dev) for unit tests

## Getting started

1. Install dependencies (this also runs `prisma generate`):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values (see below).

3. Apply the database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Optionally seed the development database with sample notebooks, chats and messages:

   ```bash
   npm run db:seed
   ```

5. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Environment variables

| Variable                                            | Purpose                                                                                |
| :-------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk authentication                                                               |
| `GEMINI_API_KEY`                                    | Gemini API access                                                                      |
| `USE_AI_MODEL`                                      | Set to `false` to return mock replies and skip model calls                             |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`             | Pooled and direct Postgres connection strings                                          |
| `SEED_ALLOWED_HOST`                                 | Host of the development database; `db:seed` refuses any other host                     |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Redis for rate limits                                                                 |
| `GLOBAL_DAILY_MODEL_LIMIT`                          | Total model calls per day across all users (default 500)                               |
| `CHAT_DAILY_LIMIT`                                  | Optional. Model replies per person per day (default 10)                                |
| `CRON_SECRET`                                       | Protects `/api/demo/cleanup`; Vercel Cron sends it as a bearer token                   |
| `DEMO_LIMIT_PER_IP`, `DEMO_LIMIT_GLOBAL`, `DEMO_USER_TTL_HOURS` | Optional. Demo limits per address and overall, and hours before a demo user is deleted |

## Scripts

| Command              | What it does                                   |
| :------------------- | :--------------------------------------------- |
| `npm run dev`        | Start the development server                   |
| `npm run build`      | Build for production                           |
| `npm start`          | Run the production build                       |
| `npm run lint`       | Run ESLint                                     |
| `npm test`           | Run the Vitest unit tests once                 |
| `npm run test:watch` | Run Vitest in watch mode                       |
| `npm run db:seed`    | Seed the development database                  |

## Project structure

- `app/`: routes (`/`, `/chats/[chatId]`, `/notebooks/[notebookId]`, auth pages) and API routes (`/api/chat`, `/api/demo`)
- `components/`: UI by feature (`chat`, `sidebar`, `notebook`, `layout`) and shadcn components in `ui/`
- `actions/`: Server Actions for chats, messages and settings
- `lib/`: AI setup, rate limits, validation, database and helper code
- `prisma/`: schema, migrations and seed data
- `context/`: project specs, coding standards and feature history

## Deployment

Deploy on [Vercel](https://vercel.com). Run `prisma migrate deploy` before the app starts in production, and set the environment variables above. `vercel.json` schedules a daily cron job (04:00) that calls `/api/demo/cleanup` to delete expired demo users.
