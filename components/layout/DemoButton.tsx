"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DemoResponse } from "@/types/demo";

const GENERIC_ERROR = "The demo could not start. Please try again.";

interface DemoButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export default function DemoButton({
  className,
  variant = "outline",
}: DemoButtonProps) {
  const { signIn } = useSignIn();
  const [starting, setStarting] = useState(false);

  async function startDemo() {
    setStarting(true);
    try {
      const response = await fetch("/api/demo", { method: "POST" });
      const result = (await response.json()) as DemoResponse;
      if (!result.success || !result.data) {
        toast.error(result.error ?? GENERIC_ERROR);
        return;
      }

      const { error } = await signIn.ticket({ ticket: result.data.token });
      if (error || signIn.status !== "complete") {
        toast.error(GENERIC_ERROR);
        return;
      }

      await signIn.finalize({
        // A full page load, because the chat state is created once and would stay empty.
        navigate: ({ decorateUrl }) => {
          window.location.href = decorateUrl("/");
        },
      });
    } catch {
      toast.error(GENERIC_ERROR);
    } finally {
      setStarting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={starting}
      onClick={startDemo}
    >
      {starting && <Loader2Icon className="animate-spin" aria-hidden="true" />}
      {starting ? "Starting demo…" : "Try the demo"}
    </Button>
  );
}
