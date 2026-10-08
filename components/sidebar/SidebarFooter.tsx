"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsModal from "@/components/sidebar/SettingsModal";
import { USER_MENU_POPOVER_CLASS } from "@/lib/clerk-appearance";

export default function SidebarFooter() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="mt-auto flex shrink-0 items-center gap-2 border-t border-surface-border p-3">
        <Show when="signed-in">
          <div className="min-w-0 flex-1">
            <UserButton
              showName
              appearance={{
                elements: {
                  userButtonPopoverCard: USER_MENU_POPOVER_CLASS,
                  userButtonBox: "!flex-row !justify-start gap-2",
                  userButtonAvatarBox: "!order-first",
                  userButtonOuterIdentifier:
                    "!order-last truncate text-sm font-medium text-foreground",
                  userButtonTrigger:
                    "w-full justify-start rounded-md p-1 hover:bg-accent focus:shadow-none",
                },
              }}
            />
          </div>
        </Show>
        <Show when="signed-out">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium">Guest</p>
        </Show>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="size-5" />
        </Button>
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
