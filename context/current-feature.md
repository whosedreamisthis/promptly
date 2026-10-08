# Current Feature: New Chat View

<!-- Feature name and short description -->

Initial landing screen for starting a conversation: a centered hero greeting and a floating multi-function input bar at the bottom. Spec: `context/features/new-chat-spec.md`.

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Hero centered vertically and horizontally in the main area: multi-colored gradient spark icon above a dynamic greeting (e.g. `Hi Dana, let's get into it`) in medium-weight, high-contrast type
- Floating input bar anchored near the bottom: `rounded-lg`, light neutral background, soft border, minimal drop shadow, single-row flex layout
- Far left Plus (`+`) button opens the native file picker; also supports drag-and-drop onto the input bar
- Accepted files: images (`.png`, `.jpg`, `.webp`) and documents (`.pdf`, `.txt`, `.csv`, `.docx`)
- Selected files show as removable chips above the input before sending; individual files can be removed
- Auto-resizing multi-line text area with placeholder `Ask Promptly`, expanding upward to a max height (~128px) then scrolling
- `Enter` submits (when non-empty), `Shift + Enter` inserts a line break
- Microphone button for voice dictation via the Web Speech API: visual feedback while active (pulsing red ring), appends recognized speech into the text area in real time
- Send button on the far right, revealed when there is text (or attachments)
- Submitting packages the text and files into a payload, clears the input, and transitions from the New Chat state to the Active Chat / streaming thread state
- Accessibility: auto-focus the text area on load; Tab order is Upload, Text input, Dictation, Send; `aria-label`s on icon buttons
- Mobile: fixed bottom positioning using `env(safe-area-inset-bottom)` so the virtual keyboard does not obscure the bar

## Notes

<!-- Any extra notes -->

- Use "Ask Promptly" everywhere; the spec's "Ask Gemini" mention is a leftover
- Greeting uses the signed-in user's first name (Clerk); fall back to a generic greeting when signed out
- The sidebar "New chat" button should lead to this view
- The AI backend does not exist yet, so submit can use a placeholder/mock response for the Active Chat state
- Use the pastel palette in `context/colors.md` (input background `#FFFFFF`, border `#E7E0D3`, focus border mint `#A7F3D0`, placeholder `#9E9893`)
- Voice dictation depends on browser support for the Web Speech API; hide or disable the mic button where unsupported

## Completed Features

<!-- One line per completed feature, earliest to latest. Full details in context/feature-history.md -->

- **Clerk Authentication:** Adds Clerk sign-in/register via nav bar modals and `(auth)` pages, Google and email/password; key files `proxy.ts`, `components/layout/NavBar.tsx`, `app/(auth)/`.
- **Sidebar:** Adds a closable sidebar with search, new chat, collapsible notebooks and recents, and pin/rename/delete menus; key files `components/sidebar/`, `lib/mock-chats.ts`.
- **Sidebar Footer Clerk Account Button:** Replaces the footer avatar and name with Clerk's UserButton (manage account, sign out), removes Free Tier text, adds Promptly favicon; key files `components/sidebar/Sidebar.tsx`, `app/icon.svg`.
