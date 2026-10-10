import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import PromptsView from "@/components/prompts/PromptsView";
import { getUserPrompts } from "@/lib/prompts-data";

export const metadata = { title: "Prompts | Promptly" };

async function PromptsContent() {
  const { userId } = await auth();
  const userPrompts = userId ? await getUserPrompts(userId) : [];
  return <PromptsView userPrompts={userPrompts} />;
}

export default function PromptsPage() {
  return (
    <Suspense fallback={null}>
      <PromptsContent />
    </Suspense>
  );
}
