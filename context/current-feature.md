# Current Feature: Settings Modal

<!-- Feature name and short description -->

Turns the placeholder settings modal, opened from the Settings button in the sidebar footer, into a working one where the user can toggle the theme and choose the Gemini model (free tier models only).

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

- Fill the existing `SettingsModal` (opened by the sidebar footer Settings button) with the theme and model settings; no separate `/settings` page
- Theme toggle: dark (default) / light, applied app-wide and remembered across visits via a cookie
- Gemini model selector offering only free tier models, with the current model preselected
- Chat requests use the selected model (`/api/chat` validates the value against the free tier allowlist)
- Persist the choice per user (signed-in) and fall back to the default model for guests
- Validate the model input with Zod and return `{ success, data, error }` from the Server Action, with toast on errors
- Use shadcn/ui components (e.g. Select / RadioGroup / Switch, Card) styled via theme variables

## Notes

- Current model is hardcoded in `lib/ai.ts` (`GEMINI_MODEL`); the allowlist of free tier models should live in a shared constant there or in `lib/`
- Confirm the current free tier Gemini model list before hardcoding it (check the Gemini API pricing docs / Context7)
- Storage decision: model is stored in a `User` column via `prisma migrate dev` (development branch only) and read server-side in `/api/chat`; theme is stored in a cookie read in the root layout so there is no flash on first paint and it works for guests
- Existing `components/sidebar/SettingsModal.tsx` is a placeholder dialog that this feature fills in
- Theme uses the already-installed `next-themes` (stored in localStorage, no flash) instead of a cookie, since it needs no extra code; the model is still stored in a `User` column
- `context/features/settings-spec.md` is an unfinished stub ("create a settiin") and can be ignored or deleted
- Theme: colors in `context/colors.md`, dark mode first with light as option

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Clerk Authentication:** Adds Clerk sign-in/register via nav bar modals and `(auth)` pages, Google and email/password; key files `proxy.ts`, `components/layout/NavBar.tsx`, `app/(auth)/`.
- **Sidebar:** Adds a closable sidebar with search, new chat, collapsible notebooks and recents, and pin/rename/delete menus; key files `components/sidebar/`, `lib/mock-chats.ts`.
- **Sidebar Footer Clerk Account Button:** Replaces the footer avatar and name with Clerk's UserButton (manage account, sign out), removes Free Tier text, adds Promptly favicon; key files `components/sidebar/Sidebar.tsx`, `app/icon.svg`.
- **New Chat View:** Adds the home chat screen with logo hero, greeting, attachment input bar, voice dictation and mock streamed replies; key files `components/chat/`, `lib/use-speech-recognition.ts`.
- **Chat Pages:** Adds `/chats/[chatId]` pages with shared chat state, a pre-generated id on `/`, and New chat creating and opening a chat; key files `components/chat/ChatsProvider.tsx`, `app/chats/[chatId]/page.tsx`.
- **shadcn/ui Migration:** Sets up shadcn/ui with the pastel theme and replaces hand-built menus, dialog, collapsibles, buttons, inputs and badges; key files `components/ui/`, `components.json`, `lib/utils.ts`.
- **Database Persistence:** Stores users, notebooks, chats and messages in Neon Postgres via Prisma, with Clerk-scoped server actions and a database-backed sidebar; key files `prisma/schema.prisma`, `actions/chats.ts`, `components/chat/ChatsProvider.tsx`.
- **Notebook Pages:** Adds `/notebooks/[notebookId]` pages opened from the sidebar, with a past chats list, a chat input and a breadcrumb back from notebook chats; key files `components/notebook/NotebookView.tsx`, `components/sidebar/RoutedSidebar.tsx`, `components/chat/ChatView.tsx`.
- **Database Error Handling:** Retries the chats query when Neon is unreachable and shows a branded error page instead of crashing; key files `lib/chats-data.ts`, `app/global-error.tsx`.
- **Message Persistence:** Saves user messages and replies to the database and loads them on chat pages, with a 10,000 character limit; key files `actions/messages.ts`, `lib/validations/messages.ts`, `components/chat/ChatsProvider.tsx`.
- **Database Seed:** Adds an idempotent `npm run db:seed` that fills the development database with 5 notebooks, 20 chats and 82 messages; key files `prisma/seed.ts`, `prisma/seed-data.ts`, `context/features/seed-spec.md`.
- **AI Integration:** Streams real Gemini replies from `/api/chat` with server-side saving, markdown rendering, auto-generated titles and a mock mode; key files `app/api/chat/route.ts`, `lib/ai.ts`, `components/chat/ChatsProvider.tsx`.
- **Code Scan and UI Review Fixes:** Adds rate limiting, atomic message saving, split chat contexts so streaming no longer re-renders the sidebar, shared menu components and accessibility fixes; key files `app/api/chat/route.ts`, `components/chat/ChatsProvider.tsx`, `lib/rate-limit.ts`.
- **Guest Chat:** Lets signed-out users chat in memory without saving, with a sign-in notice above the chat box and a sign-in dialog for New notebook; key files `app/api/chat/route.ts`, `components/chat/ChatsProvider.tsx`, `components/sidebar/SignInRequiredModal.tsx`.
- **Usage Limits:** Moves chat rate limits to Upstash Redis with per-minute, daily and global limits that switch replies to a sample reply; key files `lib/chat-limits.ts`, `lib/rate-limit.ts`, `app/api/chat/route.ts`.
- **Model Fallback:** Streams a sample reply when the model fails or returns nothing, such as when its quota is used up; key files `lib/ai.ts`, `app/api/chat/route.ts`.
