"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { focusRenameInput } from "@/components/chat/InlineRenameInput";
import { useLatest } from "@/lib/use-latest";

export interface MenuAction {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  children?: MenuAction[];
}

interface ActionsMenuProps {
  /** Accessible name of the trigger button. */
  label: string;
  actions: MenuAction[];
  /** While true, closing the menu leaves focus where it is (e.g. on a rename field). */
  keepFocus?: boolean;
  triggerSize?: "icon" | "icon-sm";
  triggerClassName?: string;
}

function MenuItems({ actions }: { actions: MenuAction[] }) {
  return actions.map((action) => {
    if (action.children) {
      return (
        <DropdownMenuSub key={action.label}>
          <DropdownMenuSubTrigger>
            {action.icon}
            {action.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            {action.children.length === 0 ? (
              <DropdownMenuItem disabled>Nothing here yet</DropdownMenuItem>
            ) : (
              <MenuItems actions={action.children} />
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }
    return (
      <DropdownMenuItem
        key={action.label}
        variant={action.danger ? "destructive" : "default"}
        onSelect={() => action.onSelect?.()}
      >
        {action.icon}
        {action.label}
      </DropdownMenuItem>
    );
  });
}

export default function ActionsMenu({
  label,
  actions,
  keepFocus = false,
  triggerSize = "icon",
  triggerClassName,
}: ActionsMenuProps) {
  // Read through a ref: the menu closes in the same update that starts the rename.
  const keepFocusRef = useLatest(keepFocus);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          aria-label={label}
          className={triggerClassName}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onCloseAutoFocus={(event) => {
          if (!keepFocusRef.current) return;
          event.preventDefault();
          focusRenameInput();
        }}
      >
        <MenuItems actions={actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
