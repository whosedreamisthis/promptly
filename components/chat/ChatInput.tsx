"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, FileText, Mic, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ACCEPT_ATTRIBUTE, isAcceptedFile } from "@/lib/chat-files";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/messages";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";

export interface ChatSubmission {
  text: string;
  files: File[];
}

interface ChatInputProps {
  disabled: boolean;
  onSubmit: (submission: ChatSubmission) => void;
}

export default function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dictationBaseRef = useRef("");

  const { supported, listening, toggle, cancel } = useSpeechRecognition(
    (transcript) =>
      setText(
        (dictationBaseRef.current + transcript).slice(0, MAX_MESSAGE_LENGTH),
      ),
    () => {
      const current = textareaRef.current?.value ?? "";
      dictationBaseRef.current =
        current && !current.endsWith(" ") ? `${current} ` : current;
    },
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [text]);

  const addFiles = (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter(isAcceptedFile);
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = !disabled && (text.trim() !== "" || files.length > 0);

  const submit = () => {
    if (!canSend) return;
    cancel();
    onSubmit({ text: text.trim(), files });
    setText("");
    setFiles([]);
  };

  return (
    <div
      className="mx-auto w-full max-w-3xl"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) addFiles(event.dataTransfer.files);
      }}
    >
      {files.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label="Attached files">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="max-w-full">
              <Badge
                variant="outline"
                className="h-auto max-w-full gap-2 rounded-md bg-white py-1 pl-2 pr-1 text-sm font-normal"
              >
                <FileText className="text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                >
                  <X />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <InputGroup
        className={`h-auto rounded-lg bg-white p-1 shadow-[0_4px_20px_-2px_rgba(41,37,36,0.05)] ${
          dragging ? "border-ring ring-2 ring-ring/50" : ""
        }`}
      >
        <InputGroupAddon align="inline-start" className="self-end pb-0.5">
          <InputGroupButton
            size="icon-sm"
            aria-label="Attach files"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-5" />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupTextarea
          ref={textareaRef}
          rows={1}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={disabled}
          placeholder="Ask Promptly"
          aria-label="Message"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="max-h-32 min-h-9 px-2 py-1.5 text-base"
        />
        <InputGroupAddon align="inline-end" className="gap-1 self-end pb-0.5">
          {supported && (
            <InputGroupButton
              size="icon-sm"
              aria-label={listening ? "Stop dictation" : "Start dictation"}
              aria-pressed={listening}
              disabled={disabled}
              onClick={toggle}
              className={
                listening ? "animate-pulse bg-red-100 ring-2 ring-red-400" : ""
              }
            >
              <Mic className="size-5" />
            </InputGroupButton>
          )}
          {(text.trim() !== "" || files.length > 0) && (
            <InputGroupButton
              size="icon-sm"
              variant="default"
              aria-label="Send message"
              disabled={!canSend}
              onClick={submit}
              className="hover:bg-secondary"
            >
              <ArrowUp className="size-5" />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
