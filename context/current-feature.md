# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

Completed

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## Completed Features

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
- **Settings Modal:** Fills the sidebar footer settings modal with a dark mode switch and a free tier Gemini model dropdown saved per user; key files `components/sidebar/SettingsModal.tsx`, `actions/settings.ts`, `lib/models.ts`.
- **New Color Theme:** Replaces the pastel palette with mint, cerulean, rose and plum light and dark themes, including a mauve light mode, plum dark surfaces and a new logo gradient; key files `app/globals.css`, `context/colors.md`, `components/layout/Logo.tsx`.
- **Demo Mode:** Adds a Try the demo button that signs visitors into a temporary, freshly seeded Clerk user, with a banner, usage limits and daily cleanup; key files `app/api/demo/route.ts`, `lib/seed-user.ts`, `components/layout/DemoButton.tsx`.
- **Notebook Tweaks:** Adds a naming page for brand new notebooks before the regular page, and focuses the name field when renaming; key files `components/notebook/NotebookNameForm.tsx`, `lib/notebooks.ts`, `components/chat/ActionsMenu.tsx`.
- **Confirm Delete:** Asks for confirmation in a shadcn alert dialog before a chat or notebook is deleted, in the sidebar and on notebook pages; key files `components/chat/ConfirmDeleteDialog.tsx`, `components/sidebar/useSidebarMenus.tsx`, `components/ui/alert-dialog.tsx`.
- **Rate Limit IP Hardening:** Reads the client IP from platform-set headers instead of `x-forwarded-for`, makes the demo limits fail closed when Upstash is down, and checks demo capacity before the global quota; key files `lib/demo-limits.ts`, `lib/rate-limit.ts`, `app/api/demo/route.ts`.
- **Chat Route Hardening:** Scopes the duplicate message check to the chat, treats a concurrent duplicate save as already saved, and caps guest history size and the request body; key files `app/api/chat/route.ts`, `lib/validations/messages.ts`, `app/api/chat/route.test.ts`.
- **Security Hardening:** Protects `/chats` and `/notebooks` in the Clerk middleware, requires the demo email domain before the cleanup cron deletes a user, and limits markdown links to safe schemes; key files `proxy.ts`, `app/api/demo/cleanup/route.ts`, `lib/safe-url.ts`.
- **Lib Cleanup:** Moves the duplicated env parsing into `lib/env.ts` and shares the id, title and message schemas across the validation files, with no behavior change; key files `lib/env.ts`, `lib/validations/common.ts`, `lib/validations/messages.ts`.
- **Pending Delete Hook:** Shares the pending-delete and confirm-dialog state between the sidebar and notebook pages through a `usePendingDelete` hook, with no behavior change; key files `components/chat/usePendingDelete.ts`, `components/sidebar/useSidebarMenus.tsx`, `components/notebook/NotebookView.tsx`.
- **Sidebar Empty Text Colour:** Uses the theme's muted text colour for the "No recent chats" line instead of a hard-coded grey; key file `components/sidebar/Sidebar.tsx`.
- **Simplify Chat Code:** Splits the guest branch and shared helpers out of `ChatsProvider` and moves reply saving and body reading out of the chat route, with no behavior change; key files `components/chat/ChatsProvider.tsx`, `app/api/chat/route.ts`, `lib/save-chat-turn.ts`.
- **Simplify More Chat Code:** Removes the duplicate `GuestHistory` type, shares the notebook ownership check in the chat actions, and names the repeated send condition in the chat input, with no behavior change; key files `actions/chats.ts`, `components/chat/useChatMessages.ts`, `components/chat/ChatInput.tsx`.
