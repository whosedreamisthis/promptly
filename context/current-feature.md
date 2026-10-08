# Current Feature: Database Persistence (Neon + Prisma)

Persist users, notebooks, chats and messages in Neon Postgres via Prisma, replacing `lib/mock-chats.ts` and the mock state in `ChatsProvider`. Spec: `context/features/database-spec.md`. The Gemini integration (`context/features/ai-integration-spec.md`) is the next feature and depends on this one.

## Status

In Progress

## Goals

- Set up Prisma with Neon: `DATABASE_URL` (pooled, runtime) and `DATABASE_URL_UNPOOLED` (direct, migrations); list both in `.env.example`
- Models: `User` (id = Clerk user id), `Notebook`, `Chat` (optional `notebookId`, `title` default "New Chat", `isCustomTitle`, `pinned`), `Message` (role USER/ASSISTANT, text content), `Attachment` (metadata only), with cascade/set-null rules and indexes per the spec
- Create the first migration with `prisma migrate dev` on the development branch
- Lazily upsert the `User` row on first server action (`ensureUser()`), no webhook
- Server actions for chats (create, list, get with messages, rename sets `isCustomTitle`, pin, move to notebook, delete) and notebooks (create, list with chats, rename, pin, delete keeps chats)
- All actions authenticate with Clerk, validate input with Zod, scope every query by `userId`, and return `{ success, data, error }`
- Sidebar, `ChatsProvider` and `/chats/[chatId]` load from the database; unknown or foreign chat ids give `notFound()`; a chat is written to the DB only when created or first used
- Remove `lib/mock-chats.ts` once unused
- Vitest tests for the actions with Clerk and the db client mocked

## Notes

- Neon: project `promptly`, branch `development` per CLAUDE.md. Never touch `production`. The Neon MCP needs authorizing before use
- Migrations only: never `prisma db push`; `prisma migrate reset` is never run against production; production changes only via `prisma migrate deploy`
- Check current Prisma docs (Context7) for client and generator setup for the installed version
- A chat belongs to at most one notebook; deleting a notebook moves its chats back to recents
- Out of scope: Gemini/streaming/auto-titling, file storage provider, Clerk webhooks, message search, sharing, usage tracking
- Run `prisma migrate status`, `npm test` and `npm run build` before committing

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Clerk Authentication:** Adds Clerk sign-in/register via nav bar modals and `(auth)` pages, Google and email/password; key files `proxy.ts`, `components/layout/NavBar.tsx`, `app/(auth)/`.
- **Sidebar:** Adds a closable sidebar with search, new chat, collapsible notebooks and recents, and pin/rename/delete menus; key files `components/sidebar/`, `lib/mock-chats.ts`.
- **Sidebar Footer Clerk Account Button:** Replaces the footer avatar and name with Clerk's UserButton (manage account, sign out), removes Free Tier text, adds Promptly favicon; key files `components/sidebar/Sidebar.tsx`, `app/icon.svg`.
- **New Chat View:** Adds the home chat screen with logo hero, greeting, attachment input bar, voice dictation and mock streamed replies; key files `components/chat/`, `lib/use-speech-recognition.ts`.
- **Chat Pages:** Adds `/chats/[chatId]` pages with shared chat state, a pre-generated id on `/`, and New chat creating and opening a chat; key files `components/chat/ChatsProvider.tsx`, `app/chats/[chatId]/page.tsx`.
- **shadcn/ui Migration:** Sets up shadcn/ui with the pastel theme and replaces hand-built menus, dialog, collapsibles, buttons, inputs and badges; key files `components/ui/`, `components.json`, `lib/utils.ts`.
