# Current Feature: Sidebar

<!-- Feature name and short description -->

Primary navigation and workspace hub for the chat app: new chat, search, notebooks, recent chats, and profile/settings. Spec: `context/features/sidebar-spec.md`.

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Four regions: header, quick navigation, scrollable recent chats, pinned footer
- Header: sidebar toggle (`PanelLeft`), "Promptly" title with a newly created logo (title visible only when expanded), New Chat icon (square pen)
- Quick navigation: search chats input (`Search chats...`) that filters history in real time; icon-only when collapsed, and clicking it expands the sidebar and focuses the input; Notebooks link (bookmark/notebook icon)
- Recent chats: muted uppercase `RECENT` header, items with chat bubble icon, active item highlighted, long titles truncated with ellipsis, vertical scroll while header and footer stay fixed, empty state ("No recent chats")
- Footer: pinned at bottom with user avatar, name and account status ("Free Tier") when expanded, and a Settings (gear) icon on the far right that opens a settings drawer/modal
- Desktop expanded 256px (pushes content), desktop collapsed 64px icon-only rail, mobile (<768px) fixed drawer overlay with `bg-black/50` backdrop, dismissed by tapping the backdrop or selecting a chat
- Smooth `transition-all duration-300 ease-in-out` width transition
- Accessibility: keyboard support (Tab/Enter/Space) and `aria-label`s on icon-only buttons (e.g. "Toggle sidebar", "Settings")

## Notes

<!-- Any extra notes -->

- Spec title says "Gemini AI" as an example; use "Promptly" as the app title
- A logo needs to be created for the header
- Use the pastel palette in `context/colors.md` (sidebar surface `#F3F0F8`, active item `#E9E3F3` with mint `#A7F3D0` left border, hover `#EFE8F6`)
- No credit card required for any part of the app
- Chat history and notebooks may use placeholder/mock data until persistence exists

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Clerk Authentication:** Adds Clerk sign-in/register via nav bar modals and `(auth)` pages, Google and email/password; key files `proxy.ts`, `components/layout/NavBar.tsx`, `app/(auth)/`.
