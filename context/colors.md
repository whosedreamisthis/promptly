# Chatbot Color Palette & Style Guide

This palette is built from four base colors: a bright mint, a deep cerulean, a blush rose and a dark midnight violet, plus a plum `#51344D` for dark mode surfaces. Dark mode is the default, with light mode as an option.

---

## 1. Base Palette

| Name            | Hex       | Usage                                                              |
| :-------------- | :-------- | :----------------------------------------------------------------- |
| Aquamarine Mint | `#A9FFCB` | Primary accent in dark mode, focus rings, active indicators        |
| Cerulean        | `#0075A2` | Primary accent in light mode, links, primary buttons |
| Blush Rose      | `#D55672` | Favorites, notifications, destructive actions, errors              |
| Midnight Violet | `#48233C` | Light mode text                                                    |
| Plum            | `#51344D` | Dark mode surfaces                                                 |

### Derived Tints & Shades

These are mixes of the base colors, used for surfaces and borders.

| Name              | Hex       | Derived from                                  |
| :---------------- | :-------- | :-------------------------------------------- |
| Plum Deep         | `#2A1828` | Darker `#51344D`, dark mode canvas            |
| Plum Muted        | `#3A2437` | Darker than `#51344D`, dark mode muted areas and inputs |
| Plum Border      | `#6E4A68` | Lighter `#51344D`, dark mode borders          |
| Mauve Mist        | `#E0D3DE` | Base mauve, light mode canvas       |
| Mauve Surface     | `#D3C3D0` | Darker `#E0D3DE`, light mode cards and sidebar |
| Mauve Border      | `#BFA9BB` | Light mode borders                            |

---

## 2. Dark Mode (default)

### Surfaces

| Role                  | Hex       |
| :-------------------- | :-------- |
| Canvas (chat window)  | `#2A1828` |
| Sidebar               | `#51344D` |
| Card / popover        | `#51344D` |
| Border                | `#6E4A68` |
| Input background      | `#3A2437` |

### Text

| Role         | Hex       | Notes                              |
| :----------- | :-------- | :--------------------------------- |
| Primary text | `#F4FFF9` | Mint-tinted off-white              |
| Muted text   | `#D3B6CE` | Timestamps, placeholders, metadata |

### Accents

| Role                     | Hex       |
| :----------------------- | :-------- |
| Primary (buttons, focus) | `#A9FFCB` (text on it: `#2A1828`) |
| Highlight (hover, active) | `#664560` |
| Destructive / favorite   | `#D55672` |
| Link                     | `#A9FFCB` |

### Components

- **User message:** background `#A9FFCB`, text `#2A1828`, right-aligned
- **AI response:** background `#51344D`, border `1px solid #6E4A68`, text `#F4FFF9`, left-aligned
- **Active sidebar item:** background `#664560` with a left border accent of `#A9FFCB`
- **Sidebar item hover:** background `#5B3C56`
- **Chat input:** background `#3A2437`, border `1px solid #6E4A68`, focus border `#A9FFCB` with a subtle mint ring glow, placeholder `#D3B6CE`

---

## 3. Light Mode

### Surfaces

| Role                  | Hex       |
| :-------------------- | :-------- |
| Canvas (chat window)  | `#E0D3DE` |
| Sidebar               | `#D3C3D0` |
| Card / popover        | `#EFE6ED` |
| Border                | `#BFA9BB` |
| Input background      | `#EFE6ED` |

### Text

| Role         | Hex       | Notes                              |
| :----------- | :-------- | :--------------------------------- |
| Primary text | `#48233C` | Midnight violet                    |
| Muted text   | `#66495F` | Timestamps, placeholders, metadata |

### Accents

| Role                     | Hex       |
| :----------------------- | :-------- |
| Primary (buttons, focus) | `#0075A2` (text on it: `#FFFFFF`) |
| Highlight (hover, active) | `#CBB9C8` (text on it: `#48233C`) |
| Destructive / favorite   | `#D55672` |
| Link                     | `#0075A2` |

### Components

- **User message:** background `#51344D`, text `#F4FFF9`, right-aligned
- **AI response:** background `#EFE6ED`, border `1px solid #BFA9BB`, text `#48233C`, left-aligned
- **Active sidebar item:** background `#CBB9C8` with a left border accent of `#0075A2`
- **Sidebar item hover:** background `#D9CAD6`
- **Chat input:** background `#EFE6ED`, border `1px solid #BFA9BB`, focus border `#0075A2` with a subtle cerulean ring glow, placeholder `#7F6578`

---

## 4. Tailwind CSS v4 Implementation

Tailwind v4 uses CSS-based configuration (no `tailwind.config.js`). Define the palette in `app/globals.css`, with dark mode as the default and light mode under a `.light` class (or the project's existing theme switch).

```css
@import "tailwindcss";

@theme {
  --color-mint: #a9ffcb;
  --color-cerulean: #0075a2;
  --color-rose: #d55672;
  --color-violet: #48233c;
}

:root {
  /* Dark mode (default) */
  --background: #2a1828;
  --foreground: #f4fff9;
  --sidebar: #51344d;
  --card: #51344D;
  --border: #6e4a68;
  --muted-foreground: #d3b6ce;
  --primary: #a9ffcb;
  --primary-foreground: #2a1828;
  --accent: var(--sidebar-accent);
  --destructive: #d55672;
}

.light {
  --background: #e0d3de;
  --foreground: #48233c;
  --sidebar: #d3c3d0;
  --card: #efe6ed;
  --border: #bfa9bb;
  --muted-foreground: #66495f;
  --primary: #0075a2;
  --primary-foreground: #ffffff;
  --accent: var(--sidebar-accent);
  --destructive: #d55672;
}
```

---

## 5. Design Guidelines & Tips

1. **Contrast:** Use `#F4FFF9` text on dark surfaces and `#48233C` text on light surfaces. Put dark text (`#2A1828` / `#48233C`) on mint backgrounds, and white text on cerulean and rose.
2. **Accent per mode:** Mint is the primary accent in dark mode, where it has strong contrast. In light mode it is too pale for text or buttons, so cerulean takes over and mint is not used in light mode.
3. **Gradients:** Use gentle gradients for headers, avatars or decorative borders, e.g. `from-[#A9FFCB] via-[#E3B7C7] to-[#D55672]`.
4. **Shadows:** Dark mode uses `0 4px 20px -2px rgba(0, 0, 0, 0.35)`. Light mode uses `0 4px 20px -2px rgba(72, 35, 60, 0.08)`.
5. **Restraint:** Rose is for favorites, warnings and errors only. Don't use them for large surfaces.
