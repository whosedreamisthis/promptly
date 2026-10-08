"use client";

import Link from "next/link";
import DemoButton from "@/components/layout/DemoButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SignInRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  /** Called when the user follows the Sign in link. */
  onSignIn: () => void;
}

export default function SignInRequiredModal({
  open,
  onOpenChange,
  feature,
  onSignIn,
}: SignInRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            {feature} are only available once you&apos;re signed in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DemoButton className="rounded-md" />
          <Button asChild className="rounded-md">
            <Link
              href="/sign-in"
              onClick={() => {
                onOpenChange(false);
                onSignIn();
              }}
            >
              Sign in
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
