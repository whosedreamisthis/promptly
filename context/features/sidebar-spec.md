# Sidebar Specification

## 1. Overview

The sidebar serves as the primary navigation and workspace management hub for the AI chat application. Designed for a Next.js application operating without credit cards, it provides a clean, responsive layout for creating chats, managing history, searching past conversations, accessing saved notebooks, and managing account settings.

---

## 2. Structural Layout

The sidebar is vertically structured into four main regions:

1. **Header / Top Bar**: The Promptly title and logo. need to create a logo
2. **Quick Navigation**: Search and notebook access.
3. **Chat History**: Scrollable, chronologically ordered list of recent conversations.
4. **Footer / Profile Bar**: Pinned user identity and app settings.

## 3. Detailed Component Specifications

### 3.1 Header / Top Bar

- **Sidebar Toggle Icon (Top-Left)**:
  - Icon: Left panel collapse/expand icon (e.g., `PanelLeft`).
  - Behavior: Toggles sidebar between **Expanded** and **Collapsed** states.
- **App Branding (Center)**:
  - Title: "Gemini AI" or custom app title.
  - Visibility: Visible only when sidebar is expanded.
- **New Chat Icon (Top-Right)**:
  - Icon: Square Pen / Edit icon.
  - Behavior: Instantiates a new blank chat session.

### 3.2 Quick Navigation

- **Search Chats**:
  - **Expanded State**: Search bar input field with placeholder `Search chats...` and search icon. Filters chat history dynamically in real time.
  - **Collapsed State**: Displays search icon only. Clicking expands the sidebar and focuses the search input.
- **Notebooks Link**:
  - Icon: Bookmark or Notebook icon.
  - Behavior: Navigates to or opens user notebooks and saved prompt templates.

### 3.3 Scrollable Recent Chats

- **Section Header**: Muted, upper-case category title (`RECENT`) shown in expanded view.
- **Chat List Items**:
  - Displays previous chat thread titles accompanied by a chat bubble icon.
  - Highlights active/selected chat item.
  - Truncates long titles with an ellipsis (`...`).
- **Scroll & Overflow**:
  - Vertical scroll enabled (`overflow-y: auto`) while Top Bar and Footer remain fixed.
- **Empty State**: Displays a fallback label (e.g., _No recent chats_) when search query or history is empty.

### 3.4 Footer / Profile Bar

- **Positioning**: Fixed at the bottom of the sidebar (`margin-top: auto`).
- **User Identity (Left)**:
  - User Avatar: Display picture or default user icon on the left.
  - Account Details: Displays user name and account status (e.g., "Free Tier") when expanded.
- **Settings Icon (Right)**:
  - Icon: Gear/Cog icon (`Settings`).
  - Position: Pinned to the far right of the footer bar.
  - Behavior: Opens settings drawer/modal (preferences, theme options, model settings).

---

## 4. Responsive & State Specifications

| Feature           | Desktop Expanded ($256\text{px}$)        | Desktop Collapsed ($64\text{px}$)   | Mobile Viewport ($< 768\text{px}$)                          |
| :---------------- | :--------------------------------------- | :---------------------------------- | :---------------------------------------------------------- |
| **Positioning**   | Relative / Static layout pushing content | Compact side rail alongside content | Fixed drawer overlay on top of screen                       |
| **Backdrop**      | None                                     | None                                | Dark backdrop overlay (`bg-black/50`)                       |
| **Labels & Text** | Visible                                  | Hidden (Icons only)                 | Fully visible when drawer is open                           |
| **Dismissal**     | Toggle button                            | Toggle button                       | Tapping backdrop overlay or selecting a chat closes sidebar |

---

## 5. Visual Design & Accessibility Guidelines

- **Transitions**: Smooth width transition (`transition-all duration-300 ease-in-out`) between collapsed and expanded modes.
- **Accessibility**:
  - Keyboard navigation support (`Tab`, `Enter`, `Space`) across all interactive elements.
  - Clear `aria-label` tags on icon-only buttons (e.g., `aria-label="Toggle sidebar"`, `aria-label="Settings"`).
