# AI Integration Spec: Gemini Replies & Auto-Titles

Replaces the placeholder reply in `ChatsProvider` with real streamed Gemini responses, saves messages on the server, and generates chat titles after the first turn. Text only: attachments are a later feature.

## 1. Decisions

- **Streaming uses an API route**, not a server action. `context/coding-standards.md` reserves API routes for long-running operations, and server-action streams (`@ai-sdk/rsc`, experimental) cannot be cancelled.
- **The server saves messages.** The route saves the user message before streaming and the assistant message when it finishes. The client no longer calls `addMessage`.
- **Titles use a server action** (`generateChatTitle`), called by the client after the first reply. It returns the title so `ChatsProvider` state can be updated; `revalidatePath` would not update that state.
- **Packages to install:** `ai` and `@ai-sdk/google`. Check the installed major version's docs for the text-stream response helper before coding.
- **Key:** `GEMINI_API_KEY` (already in `.env.example`). The Google provider reads `GOOGLE_GENERATIVE_AI_API_KEY` by default, so pass `createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })`. Add the variable to Vercel for production.
- **Model:** `gemini-3.8-flash` for replies and titles (`gemini-2.5-flash` is no longer available to new API users), defined once as `GEMINI_MODEL` in `lib/ai.ts`.

## 2. Files

| File                                | Purpose                                                                                   |
| :---------------------------------- | :---------------------------------------------------------------------------------------- |
| `app/api/chat/route.ts`             | `POST` streaming endpoint                                                                 |
| `lib/ai.ts`                         | Provider, model, system prompt, history mapping, title cleanup                            |
| `lib/validations/messages.ts`       | Add `chatRequestSchema`                                                                   |
| `actions/chats.ts`                  | Add `generateChatTitle`                                                                   |
| `components/chat/ChatsProvider.tsx` | Call the route, read the stream, remove client-side message saving and the mock reply     |
| `actions/messages.ts`               | Delete `addMessage` and its tests (the route owns saving)                                 |

## 3. Chat Route: `POST /api/chat`

**Request:** `{ chatId: string, messageId: string, text: string }`. `chatRequestSchema` (Zod): ids 1 to 64 chars, `text` trimmed, 1 to `MAX_MESSAGE_LENGTH` (10,000). Invalid input returns 400.

**Steps:**

1. `ensureUser()` from `lib/session.ts`; no session returns 401.
2. Load the chat with `where: { id: chatId, userId }`; not found returns 404.
3. Create the user `Message` (`id: messageId`, role `USER`).
4. Load history: the chat's last 30 messages by `createdAt asc` (includes the new one), mapped by `lib/ai.ts` to `{ role: "user" | "assistant", content }`.
5. `streamText` with `GEMINI_MODEL`, the system prompt, the history and `maxOutputTokens: 2000`, so replies stay under the 10,000 character message limit.
6. Return a plain text stream response with the header `X-Message-Id: <new assistant message id>`.
7. In `onFinish`, save the assistant `Message` with that id and the text (trimmed, sliced to `MAX_MESSAGE_LENGTH`), and set the chat's `updatedAt`. Skip saving empty text.

**Other rules:**

- `export const maxDuration = 60`.
- Pass `req.signal` as `abortSignal` so cancelling the request stops generation. If the client aborts, partial text is not saved.
- Errors are logged and return a 500 JSON `{ error: "Something went wrong. Please try again." }`.
- A user message may be left without a reply if generation fails. Consecutive user messages in history are allowed.

**System prompt (in `lib/ai.ts`):** a short assistant persona: friendly, concise, replies of three paragraphs or fewer, uses markdown only when it helps, asks a question when a request is unclear. No user data is placed in it.

## 4. Title Action: `generateChatTitle`

`generateChatTitle({ chatId })` in `actions/chats.ts`, through `runAction` (Clerk session, Zod `chatIdSchema`, `{ success, data, error }`).

1. Find the chat for the user where `isCustomTitle` is false; otherwise return `ok({ title: null })`.
2. Read its first user message and first assistant message.
3. `generateText` with `GEMINI_MODEL` and this prompt: _"Write a title of 3 to 5 words in title case for this conversation. Return only the title, with no quotes, punctuation, markdown or prefix.\n\nUser: {user}\nAssistant: {assistant}"_ (each message sliced to 500 characters).
4. `cleanTitle()` in `lib/ai.ts`: strip quotes, markdown, a `Title:` prefix and trailing punctuation, collapse whitespace, cut to 60 characters. An empty result counts as failure.
5. `updateMany({ where: { id: chatId, userId, isCustomTitle: false }, data: { title } })`, so a manual rename made during generation is never overwritten.
6. Return `ok({ title })`. On any failure return `ok({ title: null })` and keep the existing title, which is already the first message's text (set by `sendMessage`).

Manual rename keeps using the existing `renameChat` action.

## 5. Client: `ChatsProvider.sendMessage`

1. Create the chat first if it is new (unchanged), then add the user message locally.
2. Add an empty assistant message and mark the chat as streaming.
3. `fetch("/api/chat", { method: "POST", body, signal })` using an `AbortController` stored per chat in a ref (replacing the `timersRef` interval).
4. Read `response.body` with a `TextDecoder`, appending each chunk to the assistant message text. Use the `X-Message-Id` header as the assistant message id.
5. When the stream ends, stop streaming. If this was the chat's first turn (it had no messages before), call `generateChatTitle` and update the title in state when it returns one.
6. On a non-OK response or a network error: remove the empty assistant message and show `toast.error`. The user message stays.
7. Deleting a chat aborts its request. Unmounting the provider aborts all.

The input stays disabled while a chat is streaming (unchanged). Attached files are still shown but are not sent to the model.

## 6. Edge Cases

| Scenario                                | Handling                                                                                  |
| :-------------------------------------- | :---------------------------------------------------------------------------------------- |
| Navigate to another chat while streaming | The stream continues; state lives in the layout-level provider.                          |
| Reload while streaming                  | Request is cancelled, the user message is saved, no assistant message is saved.          |
| Rename while the title is generating    | `isCustomTitle: true` makes the `updateMany` match nothing.                              |
| Gemini error or quota exceeded          | 500 from the route, toast, no partial assistant message.                                 |
| Title generation fails                  | Keep the first-message title.                                                            |
| Reply hits the output cap               | The reply is saved as streamed; no continuation.                                         |

## 7. Tests (Vitest, no network)

- `lib/ai.test.ts`: `cleanTitle` (quotes, `Title:` prefix, markdown, length, empty) and the history mapping (roles, 30-message cap).
- `actions/chats.test.ts`: `generateChatTitle` with `generateText` mocked: happy path, no session, custom title skipped, unknown chat, model failure keeps the title, `updateMany` always filters `isCustomTitle: false`.
- Remove `actions/messages.test.ts` with the action it covers.
- The route is not unit tested (project standard); verify it in the browser.

## 8. Not in Scope

Attachments and file understanding, model switching, regenerate and edit, conversation memory beyond the last 30 messages, token usage tracking.
