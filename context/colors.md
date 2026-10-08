# Chatbot Color Palette & Style Guide

To give your chatbot an inviting, calm, and approachable aesthetic, this palette focuses on a **range of harmonious pastels**. It avoids stark pure whites and heavy dark modes, opting instead for creamy off-whites, soft mints, muted lavender, warm blush accents, and gentle sage tones.

---

## 1. Core Palette Swatches

### Primary Brand & Accents

- **Primary Accent (Soft Sage / Mint):** `#A7F3D0` (Tailwind `emerald-200`)
  - _Usage:_ Primary action buttons, active toggles, key CTA highlights.
- **Secondary Accent (Lavender Mist):** `#DDD6FE` (Tailwind `violet-200`)
  - _Usage:_ AI status badges, streaming glow indicators, secondary highlights.
- **Warm Highlight (Blush Rose):** `#FBCFE8` (Tailwind `pink-200`)
  - _Usage:_ Notifications, favorite icons, warm user highlights.
- **Soft Alert / Accent (Peach Cream):** `#FED7AA` (Tailwind `orange-200`)
  - _Usage:_ System tags, warning toasts, interactive hover states.

### Background Canvas & Surfaces (Warm Pastel Tones)

- **Main Canvas (Soft Cream / Warm Parchment):** `#FDFBF7`
  - _Usage:_ Main chat window canvas. Provides a soft, non-glare warm foundation.
- **Surface / Container (Warm Vanilla):** `#F5F0E6`
  - _Usage:_ AI response bubbles, popover cards, top navigation header.
- **Sidebar Surface (Pale Lavender Tint):** `#F3F0F8`
  - _Usage:_ Collapsible navigation sidebar to softly separate history from the chat canvas.

### Text & Readable Contrast

- **Primary Text (Deep Slate Cocoa):** `#292524` (Tailwind `stone-800`)
  - _Usage:_ Main body text, speech bubble content, headings. Soft and easy on the eyes.
- **Muted Text (Soft Taupe):** `#78716C` (Tailwind `stone-500`)
  - _Usage:_ Timestamps, search placeholders, secondary metadata.

---

## 2. Component Design System

### A. Speech Bubbles

- **User Messages:**
  - Background: `#DDD6FE` (Soft Lavender)
  - Text: `#292524` (Deep Slate Cocoa)
  - Alignment: Right-aligned
- **AI Responses:**
  - Background: `#F5F0E6` (Warm Vanilla)
  - Border: `1px solid #E7E0D3`
  - Text: `#292524`
  - Alignment: Left-aligned

### B. Sidebar & Navigation

- **Background:** `#F3F0F8` (Pale Lavender Tint)
- **Active Thread Item:** Background `#E9E3F3` with a left border accent of `#A7F3D0` (Mint)
- **Inactive Thread Hover:** Background `#EFE8F6`

### C. Input Bar & Controls

- **Chat Input Container:**
  - Background: `#FFFFFF`
  - Border: `1px solid #E7E0D3` (Focus border: `#A7F3D0` with a subtle pastel ring glow)
  - Placeholder: `#9E9893`

---

## 3. Tailwind CSS Config Implementation

If you are using Tailwind CSS, you can extend your theme configuration with these exact pastel variables:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pastel: {
          mint: "#A7F3D0",
          lavender: "#DDD6FE",
          blush: "#FBCFE8",
          peach: "#FED7AA",
        },
        surface: {
          canvas: "#FDFBF7", // Main Warm Canvas
          card: "#F5F0E6", // Response Containers & Cards
          sidebar: "#F3F0F8", // Navigation Sidebar
          border: "#E7E0D3", // Soft Divider Lines
        },
        ink: {
          primary: "#292524", // Body Text
          muted: "#78716C", // Metadata & Timestamps
        },
      },
    },
  },
};
```

---

## 4. Design Guidelines & Tips

1. **Soft Gradients:** Use gentle pastel gradients (e.g., `from-violet-200 via-pink-200 to-emerald-200`) for headers, avatars, or decorative borders to add a cozy, modern touch.
2. **High Contrast Text:** Since pastel backgrounds are light, ensure all text uses dark cocoa/stone ink (`#292524`) rather than light gray to maintain WCAG accessibility standards.
3. **Subtle Shadows:** Use light, warm box-shadows (e.g., `box-shadow: 0 4px 20px -2px rgba(41, 37, 36, 0.05)`) to elevate cards gracefully off the canvas.
