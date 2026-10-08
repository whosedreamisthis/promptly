# Chatbot Color Palette & Style Guide

To achieve a modern, vibrant look that avoids plain black, stark white, or typical dark modes, this palette centers around **mid-tone blues**, **soft oceanic shades**, and **cool slate backgrounds**. It balances professional elegance with an inviting, accessible user experience.

---

## 1. Core Palette Swatches

### Primary Brand & Accents

- **Primary Accent (Indigo/Ocean Blue):** `#3B82F6` (Tailwind `blue-500`)
  - _Usage:_ Primary call-to-action buttons, active navigation states, user speech bubbles, interactive toggles.
- **Secondary Accent (Cyan/Electric Sky):** `#0EA5E9` (Tailwind `sky-500`)
  - _Usage:_ Hover states, glowing stream indicators, AI typing indicators, key highlight text.
- **Subtle Highlight (Ice Blue):** `#E0F2FE` (Tailwind `sky-100`)
  - _Usage:_ Active thread highlights in the sidebar, badge backgrounds, tag borders.

### Mid-Tone Backgrounds (Non-Black / Non-White)

- **Main Canvas (Cool Slate Blue):** `#0F172A` (Tailwind `slate-900`)
  - _Usage:_ Main chat window background. Deep blue tint instead of harsh pitch black.
- **Surface / Container (Deep Blue-Grey):** `#1E293B` (Tailwind `slate-800`)
  - _Usage:_ Chat message bubbles (AI response), modal dialogs, top headers, dropdown menus.
- **Sidebar Surface (Midnight Navy):** `#1E1B4B` (Tailwind `indigo-950`)
  - _Usage:_ Collapsible sidebar background to establish clear visual depth between navigation and content.

### Text & Messaging Contrast

- **Primary Text (Cool Off-White):** `#F8FAFC` (Tailwind `slate-50`)
  - _Usage:_ Main headings, user query text, primary reading content.
- **Muted Text (Soft Steel):** `#94A3B8` (Tailwind `slate-400`)
  - _Usage:_ Timestamps, secondary subtitles, model details, search placeholders.

---

## 2. Component Design System

### A. Speech Bubbles

- **User Messages:**
  - Background: `#2563EB` (Gradient to `#3B82F6`)
  - Text: `#FFFFFF`
  - Alignment: Right-aligned
- **AI Responses:**
  - Background: `#1E293B` (Border: `1px solid #334155`)
  - Text: `#F8FAFC`
  - Alignment: Left-aligned

### B. Sidebar & Navigation

- **Background:** `#1E1B4B` (Deep Midnight Navy)
- **Active Thread Item:** Background `#312E81` with a left border accent of `#3B82F6`
- **Inactive Thread Hover:** Background `#2E1065` / `rgba(255, 255, 255, 0.05)`

### C. Input Bar & Controls

- **Chat Input Container:**
  - Background: `#1E293B`
  - Border: `#334155` (Focus border: `#3B82F6` with subtle blue glow ring)
  - Placeholder: `#64748B`

---

## 3. Tailwind CSS Config Implementation

If you are using Tailwind CSS, you can extend your theme configuration with these exact variables:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#3b82f6", // Main Action
          600: "#2563eb", // Hover
          700: "#1d4ed8",
        },
        surface: {
          canvas: "#0f172a", // Main Background
          card: "#1e293b", // Component / Message Cards
          sidebar: "#1e1b4b", // Navigation Panel
          border: "#334155", // Borders & Dividers
        },
      },
    },
  },
};
```

---

## 4. Design Guidelines & Tips

1. **Gradients for AI Polish:** Use subtle linear gradients for AI accents (e.g., `from-sky-500 to-blue-600`) on icons, streaming indicators, or primary CTA buttons to give the UI a living, modern AI look.
2. **Readability First:** Keep text contrast high by using `#F8FAFC` on all slate backgrounds. Avoid using grey text on dark blue containers unless it's for secondary meta-data like timestamps.
3. **Borders over Shadows:** On tinted mid-tone backgrounds, standard drop-shadows are hard to see. Use subtle 1px borders (`#334155` or `rgba(255,255,255,0.1)`) to elevate cards and floating menus.
