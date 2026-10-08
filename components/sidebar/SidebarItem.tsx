"use client";

import { useRef, useState } from "react";
import { MoreVertical, Pin } from "lucide-react";
import ItemMenu, { type MenuAction } from "@/components/sidebar/ItemMenu";

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
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const settled = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const finishRename = (value: string) => {
    if (settled.current) return;
    settled.current = true;
    const title = value.trim();
    if (title && title !== label) onRename(title);
    else onCancelRename();
  };

  const menuOpen = anchor !== null;

  return (
    <div
      className={`group flex h-10 items-center rounded-full pr-1 transition-colors ${
        active ? "bg-[#E9E3F3]" : "hover:bg-[#EFE8F6]"
      }`}
    >
      {renaming ? (
        <div className="flex h-full min-w-0 flex-1 items-center gap-3 pl-3">
          <span className="shrink-0">{icon}</span>
          <input
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
            className="min-w-0 flex-1 rounded-md border border-pastel-mint bg-white px-2 py-1 text-sm outline-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          className={`flex h-full min-w-0 flex-1 items-center gap-3 rounded-full pl-3 text-left text-sm ${
            active ? "font-semibold" : ""
          }`}
        >
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </button>
      )}
      {pinned && !renaming && (
        <Pin aria-label="Pinned" className="mr-1 h-4 w-4 shrink-0" />
      )}
      {!renaming && (
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Options for ${label}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) =>
            setAnchor(
              menuOpen ? null : event.currentTarget.getBoundingClientRect(),
            )
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5 focus-visible:opacity-100 ${
            menuOpen ? "" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
      {anchor && (
        <ItemMenu
          anchor={anchor}
          triggerRef={triggerRef}
          actions={actions}
          onClose={() => setAnchor(null)}
        />
      )}
    </div>
  );
}
