import ActionsMenu, { type MenuAction } from "@/components/chat/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { promptSummary } from "@/lib/prompts";
import type { Prompt } from "@/types/prompts";

interface PromptCardProps {
  prompt: Prompt;
  actions: MenuAction[];
  onOpen: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
}

export default function PromptCard({
  prompt,
  actions,
  onOpen,
  onUse,
}: PromptCardProps) {
  return (
    <Card
      className="relative h-full cursor-pointer transition-colors hover:bg-highlight hover:text-highlight-foreground"
      onClick={() => onOpen(prompt)}
    >
      <CardHeader>
        <CardTitle className="pr-8">
          {/* The click bubbles up to the card, which opens the preview. */}
          <Button
            variant="link"
            className="h-auto whitespace-normal p-0 text-left text-base font-medium text-inherit no-underline"
          >
            {prompt.title}
          </Button>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {promptSummary(prompt)}
        </CardDescription>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Badge variant="secondary">{prompt.category}</Badge>
          <Button
            size="sm"
            className="rounded-md"
            onClick={(event) => {
              event.stopPropagation();
              onUse(prompt);
            }}
          >
            Use
          </Button>
        </div>
      </CardHeader>
      {/* Menu clicks, including its portaled items, must not open the preview. */}
      <div
        className="absolute right-2 top-2"
        onClick={(event) => event.stopPropagation()}
      >
        <ActionsMenu
          label={`Actions for ${prompt.title}`}
          actions={actions}
          triggerSize="icon-sm"
        />
      </div>
    </Card>
  );
}
