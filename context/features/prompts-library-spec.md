# Prompts Library Specification

A `/prompts` page with a grid of ready-made starter prompts and the user's own saved prompts. Picking one fills the chat input on a new chat so the user can edit it before sending.

## 1. Scope

**In v1**

- Starter prompts defined in code (read-only, the same for everyone, including guests)
- User prompts saved in the database: create, edit, duplicate, delete
- Search and category filter
- "Use" fills the chat input of a new chat; it never sends anything by itself
- A "Prompts" entry in the sidebar

**Not in v1**

- `/` slash commands in the chat box
- Sharing prompts, a public marketplace, import and export
- `{{variables}}` or form fields inside a prompt
- Attaching a prompt to a notebook, or a default model per prompt
- Pinning, ordering or folders for prompts

## 2. Data Model

New Prisma model, added with `prisma migrate dev` (never `db push`).

```prisma
model Prompt {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String   @default("")
  content     String   @db.Text
  category    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, updatedAt])
}
```

Add `prompts Prompt[]` to `User`.

- `category` is a plain string checked by Zod against the list in section 3, so adding a category needs no migration.
- `onDelete: Cascade` means the demo user cleanup and account deletion remove prompts with no extra code.
- Ids are client-generated like chats (`idSchema`, max 64 characters), so a retried create cannot make a duplicate.

### Limits

| Field         | Rule                                                              |
| :------------ | :---------------------------------------------------------------- |
| `title`       | 1-60 characters after trimming                                    |
| `description` | 0-120 characters, optional                                        |
| `content`     | 1-10,000 characters (`MAX_MESSAGE_LENGTH`), so it always fits the chat input |
| `category`    | One of the categories below                                       |
| Per user      | At most 100 prompts; creating more fails with a clear error       |

## 3. Categories

`Coding`, `Writing`, `Productivity`, `Learning`, `Everyday`. Defined once in `lib/prompts.ts` as a constant array and a type, and used by the Zod schema, the filter chips and the starter prompts.

## 4. Starter Prompts

Defined in `lib/starter-prompts.ts` as a typed constant array (`StarterPrompt`: `id`, `title`, `description`, `content`, `category`). Ids are fixed strings prefixed `starter_`. Each prompt ends by asking the user to paste their material, so the filled input is ready to edit.

| Id                      | Title                    | Category     | Description                                      |
| :---------------------- | :----------------------- | :----------- | :----------------------------------------------- |
| `starter_code_review`   | Code Reviewer            | Coding       | Find bugs, risks and improvements in code        |
| `starter_sql_optimize`  | SQL Optimizer            | Coding       | Make a slow query faster and explain why         |
| `starter_explain_error` | Error Explainer          | Coding       | Explain an error message and how to fix it       |
| `starter_unit_tests`    | Unit Test Writer         | Coding       | Write tests for a function, including edge cases |
| `starter_summarize`     | Text Summarizer          | Writing      | Short summary with the key points                |
| `starter_rewrite_email` | Email Rewriter           | Writing      | Rewrite an email in the tone you pick            |
| `starter_proofread`     | Proofreader              | Writing      | Fix spelling and grammar without changing voice  |
| `starter_action_items`  | Meeting Notes to Actions | Productivity | Turn messy notes into decisions and action items |
| `starter_plain_english` | Plain-English Explainer  | Learning     | Explain a hard topic simply, with an example     |
| `starter_study_guide`   | Study Guide Maker        | Learning     | Turn notes into key terms and practice questions |
| `starter_recipe`        | Recipe from Ingredients  | Everyday     | Meal ideas from what is in your kitchen          |
| `starter_trip_plan`     | Trip Planner             | Everyday     | A day-by-day plan for a destination and budget   |

### Prompt text

**Code Reviewer**

```
Act as a senior engineer doing a code review. Review the code below and report, in this order:
1. Bugs and logic errors
2. Security problems
3. Performance problems
4. Readability and naming improvements

For each issue, quote the relevant line, explain why it matters, and show a fix. Skip praise and style nitpicks. If the code looks fine, say so briefly.

Code:
```

**SQL Optimizer**

```
Act as a database performance expert. Optimize the SQL query below.
1. Rewrite the query so it runs faster and returns the same results.
2. Explain each change in one sentence.
3. Suggest indexes that would help, with the CREATE INDEX statements.
4. Point out anything that depends on the database engine or table size.

Database engine (for example PostgreSQL):
Table definitions, if you have them:

Query:
```

**Error Explainer**

```
Explain the error below to me. Tell me what it means in plain language, the most likely cause, and the steps to fix it, most likely first. If you need more information to be sure, ask me for it at the end.

Error and the code around it:
```

**Unit Test Writer**

```
Write unit tests for the code below. Cover the normal case, edge cases (empty, null, very large, wrong type) and failure cases. Use a clear test name for each one, and keep each test focused on one behavior. Tell me which test framework you assumed.

Code:
```

**Text Summarizer**

```
Summarize the text below.
- Start with a one-sentence summary.
- Then list the 3-5 key points as bullets.
- Keep the original meaning and do not add facts that are not in the text.

Text:
```

**Email Rewriter**

```
Rewrite the email below so it is clear and well organized. Keep the meaning and every fact. Tone: friendly but professional (change this line if you want a different tone). Give me the rewritten email only, then one sentence on what you changed.

Email:
```

**Proofreader**

```
Proofread the text below. Fix spelling, grammar and punctuation, but keep my wording and voice. Show the corrected text first, then a short list of the changes you made.

Text:
```

**Meeting Notes to Action Items**

```
Turn my meeting notes below into:
1. A three-sentence summary
2. Decisions that were made
3. Action items, each with an owner and a due date if the notes mention them
4. Open questions

If an owner or date is missing, write "unassigned" instead of guessing.

Notes:
```

**Plain-English Explainer**

```
Explain the topic below as if I am smart but new to it. Use simple words and avoid jargon, or explain any jargon you must use. Give one everyday analogy and one concrete example. End with two questions I could ask to learn more.

Topic:
```

**Study Guide Maker**

```
Turn my notes below into a study guide:
1. The key terms with one-line definitions
2. The main ideas, in order of importance
3. Eight practice questions, with the answers listed after all the questions

Notes:
```

**Recipe from Ingredients**

```
Suggest three meals I can make with the ingredients below. Assume I also have salt, pepper, oil and water. For each meal, give the name, the cooking time and short step-by-step instructions. Tell me if a meal needs one extra ingredient.

Ingredients I have:
Dietary needs (optional):
```

**Trip Planner**

```
Plan a trip for me with a day-by-day itinerary. For each day give a morning, afternoon and evening plan, with an estimate of the cost. Mix well-known sights with a few local favorites, and keep the travel time between places short.

Destination:
Number of days:
Budget:
What I enjoy:
```

## 5. Page and UI

Route `/prompts` (`app/prompts/page.tsx`, a server component). Layout matches the notebook and chat pages: the sidebar, then a main column. Use shadcn components for everything (`Card`, `Button`, `Input`, `Dialog`, `AlertDialog`, `Badge`, `Textarea`, `Select`, `DropdownMenu`); add missing ones with `npx shadcn@latest add`. No new colors: use the theme variables in `app/globals.css`.

- **Header:** "Prompts" title, a search box (matches title, description and content, case-insensitive), and a "New prompt" button.
- **Category chips:** "All" plus the five categories. One active at a time; filters the grid with the search.
- **Sections:** "Your prompts" first (hidden for guests), then "Starter prompts". A section with no matches is hidden; if both are empty, show "No prompts match your search".
- **Empty state for the user's own prompts:** "You have not saved any prompts yet" with a New prompt button.
- **Card:** title, a category badge, the description (or the first 120 characters of the content if there is none), and a **Use** button. Cards for the user's own prompts have a menu with Edit, Duplicate and Delete. Starter cards have a menu with Duplicate only (called "Save a copy").
- **Preview:** clicking a card opens a dialog with the full prompt text, the Use button and the same actions as the menu.
- **Create and edit dialog:** title, category select, description, content textarea with a character count. Save is disabled until the title and content are filled. Errors show as a toast.
- **Delete:** confirmation in the existing `ConfirmDeleteDialog` before the prompt is removed.
- **Mobile:** one column under `md`, two columns at `md`, three at `lg`. Buttons use `rounded-md`. Every control is reachable by keyboard and has an accessible label.

## 6. Using a Prompt

1. The user presses **Use** on a card or in the preview.
2. The prompt text is stored in a small client-side context (`PromptDraftProvider` in `components/prompts/`), not in the URL, because prompts can be up to 10,000 characters.
3. The app opens the new chat screen (`/`), the same way New chat does.
4. `ChatInput` reads the draft on mount, puts it in the textarea, focuses it with the cursor at the end, and clears the draft so a refresh or later visit starts empty.
5. Nothing is sent until the user presses Send.

If the user already typed something in the input, it is replaced, because Use always starts a new chat.

## 7. Server Actions

`actions/prompts.ts` (`"use server"`), using `runAction` and the `{ success, data, error }` result pattern. Every action reads the user from the Clerk session, validates input with Zod, and scopes queries by `userId`.

| Action          | Input                                   | Behavior                                                            |
| :-------------- | :-------------------------------------- | :------------------------------------------------------------------ |
| `createPrompt`  | `id`, `title`, `description`, `content`, `category` | Fails at 100 prompts; a repeated `id` for the same user returns the existing prompt, like `createChat` |
| `updatePrompt`  | `promptId` plus the editable fields     | `updateMany` with `userId`; "Prompt not found" if no row changed    |
| `deletePrompt`  | `promptId`                              | `deleteMany` with `userId`                                          |

Duplicate is not a separate action: the client calls `createPrompt` with a new id and the title "Copy of ...", cut to 60 characters.

Zod schemas live in `lib/validations/prompts.ts` and reuse `idSchema` from `lib/validations/common.ts`. The page loads prompts with Prisma directly in the server component (`lib/prompts-data.ts`, newest `updatedAt` first, same retry behavior as `lib/chats-data.ts`).

## 8. Guests and Demo Mode

- **Guests** (signed out): `/prompts` is public. They see only the starter prompts, and can use them. "New prompt" and "Save a copy" open the existing `SignInRequiredModal` with the feature name "Prompts".
- **Demo user:** works like any signed-in user. Their prompts are removed by the existing daily cleanup through the cascade delete. They are not seeded with prompts, because the starters already fill the page.
- `proxy.ts` needs no change for the page itself (it stays public); the server actions already reject signed-out calls.

## 9. Navigation

Add a "Prompts" item to the sidebar (`components/sidebar/Sidebar.tsx`), above Notebooks, using a lucide icon, highlighted while on `/prompts`. Selecting it closes the mobile sidebar like the other items.

## 10. Tests

Vitest only, for actions and utilities (not components). Mock `@/auth`, `@/lib/db` and the rate limit like `actions/chats.test.ts`.

- `actions/prompts.test.ts`: no session, invalid input, create succeeds, create at the 100 limit fails, repeated id returns the existing prompt, update and delete of another user's prompt return "Prompt not found".
- `lib/validations/prompts.test.ts`: title, description and content limits, unknown category rejected.
- `lib/starter-prompts.test.ts`: ids are unique, every prompt passes the same validation schema as user prompts, and every category is in the allowed list.

## 11. Key Files

- `prisma/schema.prisma` and the new migration
- `lib/prompts.ts`, `lib/starter-prompts.ts`, `lib/prompts-data.ts`
- `lib/validations/prompts.ts`
- `actions/prompts.ts`
- `app/prompts/page.tsx`
- `components/prompts/` (`PromptsView`, `PromptCard`, `PromptDialog`, `PromptDraftProvider`)
- `components/chat/ChatInput.tsx` (reads the draft)
- `components/sidebar/Sidebar.tsx` (new item)
- `README.md` (see section 12, step 8)

## 12. Build Order

Each step is one goal in `current-feature.md`.

1. Schema, migration, categories, validation schemas
2. Starter prompts and their test
3. Server actions and tests
4. `/prompts` page with the grid, search and filter (starters and guests first)
5. Create, edit, duplicate and delete dialogs
6. Use: draft context, `ChatInput` and navigation to `/`
7. Sidebar entry
8. Update `README.md`, once everything above works:
   - Features: add **Prompts library:** "12 starter prompts plus your own saved prompts at `/prompts`; Use fills the chat input of a new chat."
   - Project structure: add `/prompts` to the routes in `app/`, `prompts` to the feature folders in `components/`, and "prompts" to the Server Actions in `actions/`.
   - Nothing else changes: there are no new environment variables or scripts.
