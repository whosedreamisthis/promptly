# Current Feature

Message Persistence: save chat messages to the database and load them back when a chat is opened.

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Save user messages and the placeholder assistant replies to the `Message` table through a Clerk-scoped server action
- Load a chat's saved messages when opening `/chats/[chatId]`, so chats are no longer empty after a reload
- Limit message length to 10,000 characters, enforced by Zod on the server and by the chat input

## Notes

<!-- Any extra notes -->

- Attachments are out of scope: only message text is saved, so file-only messages are not persisted
- Action in `actions/messages.ts`, schema and limit in `lib/validations/messages.ts`

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
