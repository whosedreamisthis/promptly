"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";

export interface MenuAction {
  label: string;
  icon: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  children?: MenuAction[];
}

interface ItemMenuProps {
  anchor: DOMRect;
  triggerRef: React.RefObject<HTMLElement | null>;
  actions: MenuAction[];
  onClose: () => void;
}

const MENU_WIDTH = 208;
const MENU_ROW_HEIGHT = 40;

export default function ItemMenu({
  anchor,
  triggerRef,
  actions,
  onClose,
}: ItemMenuProps) {
  const [submenu, setSubmenu] = useState<MenuAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      // The trigger button toggles the menu itself.
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose, triggerRef]);

  const items = submenu?.children ?? actions;
  const height = (items.length + (submenu ? 1 : 0)) * MENU_ROW_HEIGHT + 16;
  const fitsBelow = anchor.bottom + height < window.innerHeight;
  const top = fitsBelow
    ? anchor.bottom + 4
    : Math.max(8, anchor.top - height - 4);
  const left = Math.max(8, anchor.right - MENU_WIDTH);

  const handleSelect = (action: MenuAction) => {
    if (action.children) {
      setSubmenu(action);
      return;
    }
    action.onSelect?.();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ top, left, width: MENU_WIDTH }}
      className="fixed z-[60] rounded-xl border border-surface-border bg-background p-2 shadow-[0_4px_20px_-2px_rgba(41,37,36,0.15)]"
    >
      {submenu && (
        <button
          type="button"
          role="menuitem"
          onClick={() => setSubmenu(null)}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-stone-500 hover:bg-[#EFE8F6]"
        >
          <ChevronLeft className="h-4 w-4" />
          {submenu.label}
        </button>
      )}
      {items.length === 0 && (
        <p className="px-3 py-2 text-sm text-stone-500">Nothing here yet</p>
      )}
      {items.map((action) => (
        <button
          key={action.label}
          type="button"
          role="menuitem"
          onClick={() => handleSelect(action)}
          className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-[#EFE8F6] ${
            action.danger ? "text-red-700" : ""
          }`}
        >
          <span className="shrink-0">{action.icon}</span>
          <span className="truncate">{action.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
