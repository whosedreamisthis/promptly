import type { MenuAction } from "@/components/chat/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Prompt } from "@/types/prompts";

interface PromptPreviewDialogProps {
  prompt: Prompt | null;
  actions: MenuAction[];
  onUse: (prompt: Prompt) => void;
  onClose: () => void;
}

export default function PromptPreviewDialog({
  prompt,
  actions,
  onUse,
  onClose,
}: PromptPreviewDialogProps) {
  return (
    <Dialog open={prompt !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        {prompt && (
          <>
            <DialogHeader>
              <DialogTitle>{prompt.title}</DialogTitle>
              <DialogDescription>{prompt.description}</DialogDescription>
              <Badge variant="secondary" className="w-fit">
                {prompt.category}
              </Badge>
            </DialogHeader>
            <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3 font-sans text-sm">
              {prompt.content}
            </pre>
            <DialogFooter>
              <Button
                className="rounded-md"
                onClick={() => {
                  onClose();
                  onUse(prompt);
                }}
              >
                Use
              </Button>
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.danger ? "destructive" : "outline"}
                  className="rounded-md"
                  onClick={() => {
                    onClose();
                    action.onSelect?.();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
