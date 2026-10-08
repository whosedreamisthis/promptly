"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface InlineRenameInputProps {
  value: string;
  ariaLabel: string;
  className?: string;
  onRename: (title: string) => void;
  onCancel: () => void;
}

/**
 * Focuses the open rename field. It cannot focus itself on mount: the menu that opened it is still
 * closing and traps focus, which blurs the field and cancels the rename. The menu calls this once closed.
 */
export function focusRenameInput() {
  document.querySelector<HTMLInputElement>("input[data-rename-input]")?.focus();
}

/** Text field that commits on Enter or blur and cancels on Escape or an unchanged value. */
export default function InlineRenameInput({
  value,
  ariaLabel,
  className,
  onRename,
  onCancel,
}: InlineRenameInputProps) {
  const settled = useRef(false);

  const finish = (input: string) => {
    if (settled.current) return;
    settled.current = true;
    const title = input.trim();
    if (title && title !== value) onRename(title);
    else onCancel();
  };

  return (
    <Input
      data-rename-input=""
      defaultValue={value}
      aria-label={ariaLabel}
      onFocus={(event) => {
        settled.current = false;
        event.currentTarget.select();
      }}
      onBlur={(event) => finish(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish(event.currentTarget.value);
        if (event.key === "Escape") {
          settled.current = true;
          onCancel();
        }
      }}
      className={className}
    />
  );
}
