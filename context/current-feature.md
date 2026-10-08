# Current Feature: Sidebar Footer Clerk Account Button

<!-- Feature name and short description -->

Simplify the sidebar footer: drop the "Free Tier" text and make the user avatar/name the Clerk account button.

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Remove the "Free Tier" text from the sidebar footer
- Replace the custom avatar and name with Clerk's `UserButton`, showing the user's avatar and name
- Clicking it opens Clerk's menu with Manage account and Sign out

## Notes

<!-- Any extra notes -->

- Footer is in `components/sidebar/Sidebar.tsx`; it currently uses `useUser` for a custom avatar and name
- Keep the Settings (gear) icon on the right of the footer
- Signed-out users still need a sensible footer (the current Guest fallback)
- Style to match the pastel palette in `context/colors.md`

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Clerk Authentication:** Adds Clerk sign-in/register via nav bar modals and `(auth)` pages, Google and email/password; key files `proxy.ts`, `components/layout/NavBar.tsx`, `app/(auth)/`.
- **Sidebar:** Adds a closable sidebar with search, new chat, collapsible notebooks and recents, and pin/rename/delete menus; key files `components/sidebar/`, `lib/mock-chats.ts`.
