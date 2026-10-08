"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="w-full max-w-md rounded-xl border border-surface-border bg-background p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-pastel-lavender"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-stone-500">
          Preferences, theme options and model settings will appear here.
        </p>
      </div>
    </div>
  );
}
