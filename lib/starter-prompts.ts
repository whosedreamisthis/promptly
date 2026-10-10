import type { PromptCategory } from "@/lib/prompts";

export interface StarterPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
}

/** Ready-made prompts shown to everyone, including signed-out visitors. Each one ends where the user pastes their material. */
export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "starter_code_review",
    title: "Code Reviewer",
    description: "Find bugs, risks and improvements in code",
    category: "Coding",
    content: `Act as a senior engineer doing a code review. Review the code below and report, in this order:
1. Bugs and logic errors
2. Security problems
3. Performance problems
4. Readability and naming improvements

For each issue, quote the relevant line, explain why it matters, and show a fix. Skip praise and style nitpicks. If the code looks fine, say so briefly.

Code:`,
  },
  {
    id: "starter_sql_optimize",
    title: "SQL Optimizer",
    description: "Make a slow query faster and explain why",
    category: "Coding",
    content: `Act as a database performance expert. Optimize the SQL query below.
1. Rewrite the query so it runs faster and returns the same results.
2. Explain each change in one sentence.
3. Suggest indexes that would help, with the CREATE INDEX statements.
4. Point out anything that depends on the database engine or table size.

Database engine (for example PostgreSQL):
Table definitions, if you have them:

Query:`,
  },
  {
    id: "starter_explain_error",
    title: "Error Explainer",
    description: "Explain an error message and how to fix it",
    category: "Coding",
    content: `Explain the error below to me. Tell me what it means in plain language, the most likely cause, and the steps to fix it, most likely first. If you need more information to be sure, ask me for it at the end.

Error and the code around it:`,
  },
  {
    id: "starter_unit_tests",
    title: "Unit Test Writer",
    description: "Write tests for a function, including edge cases",
    category: "Coding",
    content: `Write unit tests for the code below. Cover the normal case, edge cases (empty, null, very large, wrong type) and failure cases. Use a clear test name for each one, and keep each test focused on one behavior. Tell me which test framework you assumed.

Code:`,
  },
  {
    id: "starter_summarize",
    title: "Text Summarizer",
    description: "Short summary with the key points",
    category: "Writing",
    content: `Summarize the text below.
- Start with a one-sentence summary.
- Then list the 3-5 key points as bullets.
- Keep the original meaning and do not add facts that are not in the text.

Text:`,
  },
  {
    id: "starter_rewrite_email",
    title: "Email Rewriter",
    description: "Rewrite an email in the tone you pick",
    category: "Writing",
    content: `Rewrite the email below so it is clear and well organized. Keep the meaning and every fact. Tone: friendly but professional (change this line if you want a different tone). Give me the rewritten email only, then one sentence on what you changed.

Email:`,
  },
  {
    id: "starter_proofread",
    title: "Proofreader",
    description: "Fix spelling and grammar without changing voice",
    category: "Writing",
    content: `Proofread the text below. Fix spelling, grammar and punctuation, but keep my wording and voice. Show the corrected text first, then a short list of the changes you made.

Text:`,
  },
  {
    id: "starter_action_items",
    title: "Meeting Notes to Actions",
    description: "Turn messy notes into decisions and action items",
    category: "Productivity",
    content: `Turn my meeting notes below into:
1. A three-sentence summary
2. Decisions that were made
3. Action items, each with an owner and a due date if the notes mention them
4. Open questions

If an owner or date is missing, write "unassigned" instead of guessing.

Notes:`,
  },
  {
    id: "starter_plain_english",
    title: "Plain-English Explainer",
    description: "Explain a hard topic simply, with an example",
    category: "Learning",
    content: `Explain the topic below as if I am smart but new to it. Use simple words and avoid jargon, or explain any jargon you must use. Give one everyday analogy and one concrete example. End with two questions I could ask to learn more.

Topic:`,
  },
  {
    id: "starter_study_guide",
    title: "Study Guide Maker",
    description: "Turn notes into key terms and practice questions",
    category: "Learning",
    content: `Turn my notes below into a study guide:
1. The key terms with one-line definitions
2. The main ideas, in order of importance
3. Eight practice questions, with the answers listed after all the questions

Notes:`,
  },
  {
    id: "starter_recipe",
    title: "Recipe from Ingredients",
    description: "Meal ideas from what is in your kitchen",
    category: "Everyday",
    content: `Suggest three meals I can make with the ingredients below. Assume I also have salt, pepper, oil and water. For each meal, give the name, the cooking time and short step-by-step instructions. Tell me if a meal needs one extra ingredient.

Ingredients I have:
Dietary needs (optional):`,
  },
  {
    id: "starter_trip_plan",
    title: "Trip Planner",
    description: "A day-by-day plan for a destination and budget",
    category: "Everyday",
    content: `Plan a trip for me with a day-by-day itinerary. For each day give a morning, afternoon and evening plan, with an estimate of the cost. Mix well-known sights with a few local favorites, and keep the travel time between places short.

Destination:
Number of days:
Budget:
What I enjoy:`,
  },
];
