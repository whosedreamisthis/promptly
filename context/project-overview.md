# Chatbot Product Specifications & Architecture

Building a modern chatbot requires both **core product features** (for the app itself) and a clear **page structure** (for the web application and public marketing platform).

---

## 1. Essential Features for the Chatbot App

### Core User Features

- **Streaming Responses:** Real-time text generation (using `readStreamableValue` / Server Actions) for zero latency perception.
- **Contextual Memory & Threading:** Ability to create, rename, archive, and delete separate chat threads with persistent history.
- **Model Switcher:** Toggle between different models or reasoning modes (e.g., Fast vs. Deep Reasoning vs. Multimodal).
- **Prompt Library & Slash Commands:** Access to saved templates (`/summarize`, `/code-review`) to quickly execute common prompts.
- **File & Image Attachments:** Support for uploading PDFs, images, or CSVs for context-aware document analysis and vision queries.
- **Export & Sharing:** One-click options to export chat logs (Markdown, PDF) or generate public read-only chat share links.

### Advanced & Platform Features

- **Custom System Instructions (Personas):** Allow users to define custom system prompts (e.g., "Act as a Senior React Engineer").
- **Voice-to-Text & Text-to-Speech:** Dictate queries or listen to assistant responses.
- **Branching & Editing:** Edit previous user messages to branch off into a new conversation path.
- **Token & Usage Tracking:** Live usage stats to show token consumption or query limits per tier.

---

## 2. Key Pages to Build

For a full web product, organize your route structure into **In-App Application Pages** and **Public Marketing Pages**:

### In-App Application Pages (Protected Routes)

| Page                             | Route         | Purpose                                                                                     |
| :------------------------------- | :------------ | :------------------------------------------------------------------------------------------ |
| **Main Chat Workspace**          | `/chat/[id]`  | The core chat interface with sidebar, thread history, input bar, and active model selector. |
| **Prompt Library / Templates**   | `/prompts`    | Grid of curated and user-saved prompt templates to start new chats quickly.                 |
| **Custom Assistants / Personas** | `/assistants` | UI to create, train (RAG/Knowledge base uploads), and configure custom AI bots.             |
| **Analytics & Usage**            | `/analytics`  | Insights on message counts, token usage, top topics, and response speeds.                   |
| **Account & Settings**           | `/settings`   | Profile preferences, API keys, subscription tier, and system theme (Dark/Light mode).       |

### Public & Marketing Pages (Unprotected Routes)

| Page                     | Route              | Purpose                                                                       |
| :----------------------- | :----------------- | :---------------------------------------------------------------------------- |
| **Landing Page**         | `/`                | Hero section, feature breakdown, live product preview/demo, and social proof. |
| **Pricing**              | `/pricing`         | Tiered plan comparison (Free, Pro, Team/Enterprise) with feature checklists.  |
| **Public Shared Chat**   | `/share/[shareId]` | Read-only view for non-logged-in users viewing a shared conversation thread.  |
| **Docs / API Reference** | `/docs`            | User guides, feature tutorials, and API/integration documentation.            |
