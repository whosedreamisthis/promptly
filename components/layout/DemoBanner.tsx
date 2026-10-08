"use client";

import { useUser } from "@clerk/nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";

/** Tells demo users that their changes are temporary; renders nothing for everyone else. */
export default function DemoBanner() {
  const { user } = useUser();
  if (user?.publicMetadata.demo !== true) return null;

  return (
    <Alert
      role="status"
      className="shrink-0 rounded-none border-x-0 border-t-0 bg-highlight py-1.5 text-center text-highlight-foreground"
    >
      <AlertDescription className="text-highlight-foreground">
        You&apos;re in the demo. Changes are temporary and the demo resets each
        time it starts.
      </AlertDescription>
    </Alert>
  );
}
