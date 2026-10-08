"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { getGeminiModel, setGeminiModel } from "@/actions/settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NOT_SIGNED_IN } from "@/lib/action-result";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_MODEL,
  FREE_TIER_MODELS,
  resolveModel,
  type FreeTierModelId,
} from "@/lib/models";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  open,
  onOpenChange,
}: SettingsModalProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [model, setModel] = useState<FreeTierModelId>(DEFAULT_MODEL);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getGeminiModel().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setSignedIn(true);
        setModel(result.data);
      } else if (result.error === NOT_SIGNED_IN) {
        setSignedIn(false);
      } else {
        toast.error(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleModelChange = async (value: string) => {
    const previous = model;
    const next = resolveModel(value);
    setModel(next);
    const result = await setGeminiModel({ model: next });
    if (!result.success) {
      setModel(previous);
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Choose how Promptly looks and which model answers you.
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Theme</h3>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch
              id="dark-mode"
              checked={resolvedTheme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </section>
        <Separator className="my-2" />
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Model</h3>
          <Label htmlFor="gemini-model">Gemini model</Label>
          <Select
            value={model}
            onValueChange={handleModelChange}
            disabled={!signedIn}
          >
            <SelectTrigger id="gemini-model" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREE_TIER_MODELS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {signedIn
              ? "Only free tier models are offered."
              : "Sign in to choose a model."}
          </p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
