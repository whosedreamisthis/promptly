"use client";

import { useEffect, useRef } from "react";
import { MoreVertical, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MenuAction {
  label: string;
  icon: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  children?: MenuAction[];
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  pinned: boolean;
  renaming: boolean;
  actions: MenuAction[];
  onSelect: () => void;
  onRename: (title: string) => void;
  onCancelRename: () => void;
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

export default function SidebarItem({
  icon,
  label,
  active,
  pinned,
  renaming,
  actions,
  onSelect,
  onRename,
  onCancelRename,
}: SidebarItemProps) {
  const settled = useRef(false);
  const renamingRef = useRef(renaming);

  useEffect(() => {
    renamingRef.current = renaming;
  }, [renaming]);

  const finishRename = (value: string) => {
    if (settled.current) return;
    settled.current = true;
    const title = value.trim();
    if (title && title !== label) onRename(title);
    else onCancelRename();
  };

  return (
    <div
      className={`group flex h-10 items-center rounded-full pr-1 transition-colors ${
        active ? "bg-[#E9E3F3]" : "hover:bg-[#EFE8F6]"
      }`}
    >
      {renaming ? (
        <div className="flex h-full min-w-0 flex-1 items-center gap-3 pl-3">
          <span className="shrink-0">{icon}</span>
          <Input
            autoFocus
            defaultValue={label}
            aria-label="Rename"
            onFocus={(event) => {
              settled.current = false;
              event.currentTarget.select();
            }}
            onBlur={(event) => finishRename(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                finishRename(event.currentTarget.value);
              if (event.key === "Escape") {
                settled.current = true;
                onCancelRename();
              }
            }}
            className="h-7 min-w-0 flex-1 bg-white"
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          className={`h-full min-w-0 flex-1 justify-start gap-3 rounded-full pl-3 text-left hover:bg-transparent ${
            active ? "font-semibold" : "font-normal"
          }`}
        >
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </Button>
      )}
      {pinned && !renaming && (
        <Pin aria-label="Pinned" className="mr-1 h-4 w-4 shrink-0" />
      )}
      {!renaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${label}`}
              className="rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52"
            onCloseAutoFocus={(event) => {
              // Keep focus on the rename field instead of returning it to the trigger.
              if (renamingRef.current) event.preventDefault();
            }}
          >
            <MenuItems actions={actions} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
