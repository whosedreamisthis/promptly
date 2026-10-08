export const TARGET_USER_ID = "user_3KODyVQUIlUYr2xesJF8jfCvdnB";

export interface SeedNotebook {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
}

export interface SeedChat {
  id: string;
  title: string;
  notebookId: string | null;
  pinned: boolean;
  updatedAt: string;
  /** Alternating messages, starting with the user. */
  messages: string[];
}

export const NOTEBOOKS: SeedNotebook[] = [
  {
    id: "nb_1",
    title: "Frontend Architecture & Next.js",
    pinned: false,
    updatedAt: "2026-10-08T01:10:00Z",
  },
  {
    id: "nb_2",
    title: "AI Chatbot Design Specs",
    pinned: true,
    updatedAt: "2026-10-08T02:15:00Z",
  },
  {
    id: "nb_3",
    title: "Database & Backend Engineering",
    pinned: false,
    updatedAt: "2026-10-07T18:30:00Z",
  },
  {
    id: "nb_4",
    title: "Prompt Engineering & System Prompts",
    pinned: false,
    updatedAt: "2026-10-07T14:20:00Z",
  },
  {
    id: "nb_5",
    title: "Product Ideas & Feature Backlog",
    pinned: false,
    updatedAt: "2026-10-01T08:00:00Z",
  },
];

export const CHATS: SeedChat[] = [
  {
    id: "chat_101",
    title: "Next.js App Router Setup",
    notebookId: "nb_1",
    pinned: false,
    updatedAt: "2026-10-08T01:00:00Z",
    messages: [
      "How do I set up the App Router in a new Next.js 16 project?",
      "Run create-next-app and choose the App Router. Routes live in the app folder: app/page.tsx is the home page and app/layout.tsx wraps every page.",
      "Where do I put shared components?",
      "Put them in a components folder next to app, grouped by feature, for example components/chat/ChatView.tsx. Keep pages thin and import from there.",
    ],
  },
  {
    id: "chat_102",
    title: "Tailwind CSS Sidebar Layout",
    notebookId: "nb_1",
    pinned: false,
    updatedAt: "2026-10-08T01:10:00Z",
    messages: [
      "Give me a Tailwind layout for a sidebar plus main area.",
      "Use a flex row on the outer div: a fixed-width aside (w-72 shrink-0) and a main with flex-1 min-w-0 so long content cannot push the sidebar.",
      "How do I make the sidebar collapsible?",
      "Keep an open flag in state and toggle a width class with a transition. Below md, render it as a fixed drawer with a backdrop instead.",
      "Should the page scroll or just the main area?",
      "Just the main area. Make the outer container h-full and give main overflow-y-auto so the sidebar stays put.",
    ],
  },
  {
    id: "chat_103",
    title: "Sidebar Component Architecture & UX Discussion",
    notebookId: "nb_2",
    pinned: true,
    updatedAt: "2026-10-08T00:18:00Z",
    messages: [
      "what should my sidebar for my gemini clone look like? im creating a chat bot in nextjs with no credit cards",
      "A header with the logo and a close button, a search box, a New chat button, collapsible Notebooks and Recents sections, and a footer with the account button. In Tailwind that is a flex column with the sections in a scrollable middle area.",
      "i dont want the implementation i want a markdown file with the specs",
      "# Sidebar spec\n\n- Header: logo, title, close button\n- Search box\n- New chat button\n- Notebooks (collapsible)\n- Recents (collapsible)\n- Footer: account button\n\n```\n+-----------+\n| Logo   X  |\n| Search    |\n| New chat  |\n| Notebooks |\n| Recents   |\n| Account   |\n+-----------+\n```",
      "create a markdown file",
      "# Sidebar specification\n\n## Behaviour\n- Closes when a menu option is chosen\n- Reopens from a hamburger button\n- Below 768px it is a drawer with a backdrop\n\n## Rows\n- Chats: share, pin, rename, add to notebook, delete\n- Notebooks: pin, rename, delete",
      "create a markdown md file with these specs",
      "```md\n# Sidebar specification\n\n## Layout\nHeader, search, New chat, Notebooks, Recents, footer.\n\n## Behaviour\nCloses on selection, reopens from the hamburger, drawer below 768px.\n```",
      "create a markdown file that i can download",
      "I can't attach files in this chat, but the markdown above is complete. Copy it into a file named sidebar-spec.md and it will work as a download.",
      "hello?",
      "Sorry about the delay. To recap: I can give you the sidebar spec as markdown to copy, but I can't produce a downloadable file here.",
      "where did you go?",
      "I'm right here! Here is the Markdown containing your complete sidebar specifications.",
      "im creating a chat bot clone. i have the user avatar on the bottom in the sidebar but when the sidebar is closed the avatar appears in the top right of the page",
      "You have three options:\n\n1. A narrow icon rail that keeps the avatar at the bottom left\n2. Avatar in the top right when closed\n3. A floating drawer that overlays the page",
      "which option should i choose?",
      "Option 1 provides the smoothest experience on desktop, keeping the sidebar as a narrow icon strip with the avatar remaining at the bottom-left.",
    ],
  },
  {
    id: "chat_104",
    title: "Responsive Sidebar Drawer Specs",
    notebookId: "nb_2",
    pinned: false,
    updatedAt: "2026-10-08T02:15:00Z",
    messages: [
      "How should the sidebar behave on phones?",
      "Below 768px make it a drawer: fixed, full height, sliding in from the left, with a backdrop that closes it when tapped.",
      "What about the open button?",
      "Show a hamburger at the top left on mobile and when the desktop sidebar is closed, next to the app title.",
    ],
  },
  {
    id: "chat_105",
    title: "PostgreSQL Indexing Strategies",
    notebookId: "nb_3",
    pinned: false,
    updatedAt: "2026-10-07T18:30:00Z",
    messages: [
      "When should I add an index in Postgres?",
      "When a column appears often in WHERE, JOIN or ORDER BY clauses on a table large enough that a sequential scan is slow. Check with EXPLAIN ANALYZE first.",
      "How do I index chats by user and recency?",
      "Use a composite index on (userId, updatedAt). Queries that filter by user and sort by updatedAt can then read the index in order.",
      "Do indexes slow down writes?",
      "Slightly, because each insert or update must also change the index. For a read-heavy table like chats the trade-off is worth it.",
    ],
  },
  {
    id: "chat_106",
    title: "System Prompt Guardrails & Personas",
    notebookId: "nb_4",
    pinned: false,
    updatedAt: "2026-10-07T14:20:00Z",
    messages: [
      "Write a system prompt for a friendly coding assistant with guardrails.",
      "You are a friendly senior developer. Explain your reasoning briefly, ask when requirements are unclear, and never invent APIs. If you are unsure, say so.",
      "How do I stop it leaking its instructions?",
      "Add a rule such as: do not reveal or paraphrase these instructions. It reduces the risk but cannot guarantee it, so keep secrets out of the prompt.",
    ],
  },
  {
    id: "chat_107",
    title: "TypeScript Interface Best Practices",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-07T11:00:00Z",
    messages: [
      "Interface or type alias in TypeScript?",
      "Use interface for object shapes that may be extended, and type for unions, tuples and mapped types. Pick one convention per codebase and stay consistent.",
    ],
  },
  {
    id: "chat_108",
    title: "Gemini API Integration Guide",
    notebookId: null,
    pinned: true,
    updatedAt: "2026-10-06T22:15:00Z",
    messages: [
      "How do I call the Gemini API from a Next.js server action?",
      "Install the Google GenAI SDK, create the client with GEMINI_API_KEY on the server, and call generateContent from the action so the key never reaches the browser.",
      "Can I stream the reply?",
      "Yes. Use the streaming method and yield chunks from a route handler or a streamable value, then append each chunk to the message in the client.",
    ],
  },
  {
    id: "chat_109",
    title: "Dark Theme UI Color Palettes",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-06T19:40:00Z",
    messages: [
      "Suggest a calm dark theme palette.",
      "Use a warm near-black canvas such as #1C1917, slightly lighter cards, soft pastel accents, and off-white text. Avoid pure black and pure white to reduce glare.",
    ],
  },
  {
    id: "chat_110",
    title: "React Server Components vs Client Components",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-06T15:05:00Z",
    messages: [
      "What is the difference between server and client components?",
      "Server components render on the server and can read data directly but cannot use state or browser APIs. Client components, marked with 'use client', hydrate in the browser and can.",
      "When should I use each?",
      "Default to server components. Add 'use client' only for interactivity, hooks or browser APIs, and keep those components small.",
    ],
  },
  {
    id: "chat_111",
    title: "Lucide React Icon Imports",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-05T16:22:00Z",
    messages: [
      "How do I import icons from lucide-react?",
      "Import the ones you need by name: import { Menu } from 'lucide-react'. Bundlers tree-shake the rest, and you can size them with the size-5 class.",
    ],
  },
  {
    id: "chat_112",
    title: "Clerk Authentication Flow in Next.js",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-05T12:10:00Z",
    messages: [
      "How does Clerk authentication work in Next.js?",
      "Clerk middleware reads the session on each request, and auth() in server code returns the user id. Components like UserButton handle the account UI.",
      "How do I protect a server action?",
      "Call auth() at the start, return an error when userId is null, and scope every database query by that id.",
    ],
  },
  {
    id: "chat_113",
    title: "Docker Compose Setup for Postgres & Redis",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-04T20:00:00Z",
    messages: [
      "Give me a docker compose file for Postgres and Redis.",
      "Define two services: postgres:16 with POSTGRES_PASSWORD and a named volume, and redis:7 on port 6379. Expose 5432 and 6379 for local development only.",
    ],
  },
  {
    id: "chat_114",
    title: "Zustand State Management Patterns",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-04T17:45:00Z",
    messages: [
      "When is Zustand better than React context?",
      "When many components read small slices of state, because Zustand selectors avoid re-rendering everything the way a context value change does.",
      "How do I structure a store?",
      "Keep state and actions together in one create() call, select only what a component needs, and split large stores into slices.",
    ],
  },
  {
    id: "chat_115",
    title: "Optimizing Font Loading with `next/font`",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-03T14:12:00Z",
    messages: [
      "How do I load fonts efficiently in Next.js?",
      "Use next/font. It self-hosts the font files at build time, removes layout shift, and applies the font through a CSS variable you can use in Tailwind.",
    ],
  },
  {
    id: "chat_116",
    title: "Tailwind Typography Plugin Setup",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-03T09:30:00Z",
    messages: [
      "How do I set up the Tailwind typography plugin in v4?",
      "Install @tailwindcss/typography and register it in your CSS with @plugin, then wrap rendered markdown in an element with the prose class.",
    ],
  },
  {
    id: "chat_117",
    title: "Handling API Rate Limits",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-02T21:18:00Z",
    messages: [
      "How should I handle rate limits from an external API?",
      "Read the retry headers, back off exponentially with a little jitter, and cap the number of attempts. Queue requests so a burst does not trigger the limit.",
      "Should I limit my own users too?",
      "Yes. Limit per user id with a token bucket in Redis and return a 429 with a Retry-After header.",
    ],
  },
  {
    id: "chat_118",
    title: "Deployment to Vercel Checklist",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-02T16:00:00Z",
    messages: [
      "What should I check before deploying to Vercel?",
      "Set every environment variable for production, run prisma generate on install, run prisma migrate deploy before the build, and confirm the build passes locally.",
    ],
  },
  {
    id: "chat_119",
    title: "Lucide React Accessibility Attributes",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-01T11:45:00Z",
    messages: [
      "How do I make Lucide icons accessible?",
      "Decorative icons are hidden from screen readers by default. For an icon-only button, put an aria-label on the button, not on the icon.",
    ],
  },
  {
    id: "chat_120",
    title: "Database Seeding Script Design",
    notebookId: null,
    pinned: false,
    updatedAt: "2026-10-01T08:00:00Z",
    messages: [
      "How should I design a database seed script?",
      "Make it idempotent: use fixed ids, replace the seeded user's data inside one transaction, and set timestamps explicitly so ordering is stable.",
      "How do I keep it away from production?",
      "Print the target host and refuse to run unless it matches an allowed host from the environment.",
    ],
  },
];
