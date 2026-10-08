"use client";

import { Pin } from "lucide-react";
import ActionsMenu, { type MenuAction } from "@/components/chat/ActionsMenu";
import InlineRenameInput from "@/components/chat/InlineRenameInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  pinned: boolean;
  renaming: boolean;
  actions: MenuAction[];
  onSelect: () => void;
  onTogglePin: () => void;
  onRename: (title: string) => void;
  onCancelRename: () => void;
}

export default function SidebarItem({
  icon,
  label,
  active,
  pinned,
  renaming,
  actions,
  onSelect,
  onTogglePin,
  onRename,
  onCancelRename,
}: SidebarItemProps) {
  return (
    <div
      className={cn(
        "group flex h-10 items-center rounded-md pr-1 transition-colors",
        active ? "bg-sidebar-accent" : "hover:bg-accent",
      )}
    >
      {renaming ? (
        <div className="flex h-full min-w-0 flex-1 items-center gap-3 pl-3">
          <span className="shrink-0">{icon}</span>
          <InlineRenameInput
            value={label}
            ariaLabel="Rename"
            onRename={onRename}
            onCancel={onCancelRename}
            className="h-7 min-w-0 flex-1 bg-white"
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          className={cn(
            "h-full min-w-0 flex-1 justify-start gap-3 pl-3 text-left hover:bg-transparent",
            active ? "font-semibold" : "font-normal",
          )}
        >
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </Button>
      )}
      {pinned && !renaming && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Unpin ${label}`}
          onClick={onTogglePin}
          className="shrink-0"
        >
          <Pin className="h-4 w-4" />
        </Button>
      )}
      <ActionsMenu
        label={`Options for ${label}`}
        actions={actions}
        keepFocus={renaming}
        triggerSize="icon-sm"
        triggerClassName={cn(
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
          renaming && "hidden",
        )}
      />
    </div>
  );
}
