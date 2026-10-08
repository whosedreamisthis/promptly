# Technical Specification: Gemini Integration & Auto-Renaming via Server Actions (`gemini-integration-spec.md`)

## 1. Architecture Overview

This specification details the server and client architecture required to connect the Next.js chat interface to Google's Gemini API strictly using **Next.js Server Actions** (and the `ai/rsc` or AI SDK streamable UI / text stream patterns) rather than traditional `/api/chat` REST routes.

It handles real-time response streaming, database state persistence, multimodal input (files), and background chat renaming after the initial message turn.

there is a GEMINI_API_KEY defined in .env

---

## 2. Server Actions Architecture

Instead of HTTP route handlers, all communication logic is encapsulated in type-safe Server Actions located under `app/actions/chat.ts`.

### 2.1 Primary Action: `streamChatResponse`

Handles message ingestion, database persistence, streaming Gemini completion back to the client, and triggering the title generation lifecycle.

- **Execution Context:** `"use server"` module.
- **Model Target:** `gemini-2.5-flash` (or `gemini-1.5-flash`) via `@ai-sdk/google`.
- **Signature:**
  ```typescript
  export async function streamChatResponse(payload: {
    chatId: string;
    userPrompt: string;
    attachments?: Array<{ name: string; type: string; urlOrBase64: string }>;
  }): Promise<{
    messageStream: ReturnType<typeof createStreamableValue>;
  }>;
  ```

#### Implementation Lifecycle Pipeline:

1. **Authentication & Validation:**
   - Extract current authenticated user session.
   - Validate session ownership for `chatId`.
2. **User Message Persistence:**
   - Write user prompt and attachment references to the database under `chatId`.
3. **Stream Initiation:**
   - Initialize a `createStreamableValue` object from the `ai/rsc` package (or `readStreamableValue`).
   - Invoke `streamText()` targeting Gemini with message history + system instructions.
4. **Stream Consumption & Persistence:**
   - Pipe model text chunks directly to the streamable value for client UI consumption.
   - On completion (`onFinish` or stream resolution), persist the final assistant response text to the database.
5. **Turn 1 Check & Rename Trigger:**
   - Query database to check if `chat.title === "New Chat"` and `chat.isCustomTitle === false`.
   - If true, non-blocking asynchronous dispatch of `generateChatTitleAction({ chatId, userPrompt, assistantResponse })`.

---

### 2.2 Background Action: `generateChatTitleAction`

Generates a short, contextually relevant chat title after the first turn completes.

- **Execution Context:** `"use server"` module (triggered server-side asynchronously).
- **Model Target:** `gemini-2.5-flash` (optimized for fast zero-shot headline generation).
- **Signature:**
  ```typescript
  export async function generateChatTitleAction(payload: {
    chatId: string;
    userPrompt: string;
    assistantResponse: string;
  }): Promise<{ success: boolean; title?: string }>;
  ```
- **Prompt Instructions:**

  ```text
  You are an expert at creating concise titles for chat threads.
  Summarize the initial interaction below into a clean, title-case headline of 3 to 5 words.
  Do NOT use quotation marks, punctuation, markdown formatting, or prefixes like "Title:".
  Return ONLY the plain text string.

  User Message: <userPrompt>
  Assistant Response: <assistantResponse>
  ```

- **Post-Processing & State Sync:**
  1. Trim and sanitize output.
  2. Database update: `UPDATE Chat SET title = :generatedTitle WHERE id = :chatId AND isCustomTitle = false`.
  3. Call Next.js `revalidatePath('/')` or `revalidateTag(`chat-list-${userId}`)` to trigger server-driven UI updates across the sidebar.

---

### 2.3 User Rename Action: `updateChatTitleAction`

Handles explicit manual user renames from the sidebar or header.

- **Signature:**
  ```typescript
  export async function updateChatTitleAction(chatId: string, newTitle: string);
  ```
- **Behavior:** Updates database record and explicitly sets `isCustomTitle = true`. This locks the chat title and prevents `generateChatTitleAction` from overwriting it.

---

## 3. Client Interaction Lifecycle

### 3.1 Client State Machine

```
┌──────────────────────────────────────────┐
│             New Chat State               │
│  - User enters prompt & attaches files   │
│  - Clicks Send / Presses Enter           │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│      Execute Server Action               │
│  - Calls `streamChatResponse()`          │
│  - Obtains `streamableValue` handle      │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│         Streaming Active Chat            │
│  - Client iterates over stream reader    │
│  - UI updates message text in real-time  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│         First Turn Complete              │
│  - Assistant stream completes            │
│  - Server fires `generateChatTitleAction`│
│  - `revalidatePath()` updates sidebar    │
└──────────────────────────────────────────┘
```

---

## 4. Multimodal Payload Handling (Files via Server Actions)

1. **Client Processing:**
   - Files selected via the `+` button are converted to Base64 data strings or pre-uploaded via a direct storage upload action (e.g., Vercel Blob / S3).
2. **Server Action Ingestion:**
   - Pass Base64 data or media URLs directly into the `streamChatResponse` Server Action payload.
   - Construct Gemini-compliant multimodal content parts (`{ inlineData: { mimeType, data } }`) for prompt context.
3. **Fallback Naming:**
   - If the first user turn consists strictly of an uploaded image/document without prompt text, `generateChatTitleAction` uses the filename and visual/text contents of the attachment as summarization context (e.g., `"Receipt Analysis"` or `"PDF Summary"`).

---

## 5. Error Handling & Edge Cases

| Scenario                                 | Handling Strategy                                                                                                                              |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server Action Streaming Interruption** | Stream reader catches error; client UI renders an inline "Retry" button that re-executes the Server Action for the turn.                       |
| **Title Generation Model Timeout**       | Catch error gracefully on the server; fall back to extracting the first 30 characters of `userPrompt` + `"..."` as the title.                  |
| **User Manual Rename During Stream**     | Executes `updateChatTitleAction(chatId, newTitle)`. `isCustomTitle = true` ensures any in-flight title generation worker will abort DB update. |
| **Route Navigation During Stream**       | Next.js Server Actions execute independently on the server; navigated client route smoothly attaches to the updated DB thread state.           |
