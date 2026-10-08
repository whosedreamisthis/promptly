"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, FileText, Mic, Plus, X } from "lucide-react";
import { ACCEPT_ATTRIBUTE, isAcceptedFile } from "@/lib/chat-files";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";

export interface ChatSubmission {
  text: string;
  files: File[];
}

interface ChatInputProps {
  disabled: boolean;
  onSubmit: (submission: ChatSubmission) => void;
}

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[#EFE8F6] focus-visible:outline-2 focus-visible:outline-pastel-mint disabled:cursor-default disabled:opacity-50";

export default function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dictationBaseRef = useRef("");

  const { supported, listening, toggle, cancel } = useSpeechRecognition(
    (transcript) => setText(dictationBaseRef.current + transcript),
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
            <li
              key={`${file.name}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-md border border-surface-border bg-white py-1 pl-2 pr-1 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-stone-500" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-pastel-lavender"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className={`flex items-end gap-1 rounded-lg border bg-white p-2 shadow-[0_4px_20px_-2px_rgba(41,37,36,0.05)] transition-colors focus-within:border-pastel-mint focus-within:ring-2 focus-within:ring-pastel-mint/50 ${
          dragging
            ? "border-pastel-mint ring-2 ring-pastel-mint/50"
            : "border-surface-border"
        }`}
      >
        <input
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
        <button
          type="button"
          aria-label="Attach files"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={ICON_BUTTON}
        >
          <Plus className="h-5 w-5" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
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
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none self-center bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-[#9E9893]"
        />
        {supported && (
          <button
            type="button"
            aria-label={listening ? "Stop dictation" : "Start dictation"}
            aria-pressed={listening}
            disabled={disabled}
            onClick={toggle}
            className={`${ICON_BUTTON} ${
              listening ? "animate-pulse bg-red-100 ring-2 ring-red-400" : ""
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        {(text.trim() !== "" || files.length > 0) && (
          <button
            type="button"
            aria-label="Send message"
            disabled={!canSend}
            onClick={submit}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-pastel-mint transition-colors hover:bg-pastel-lavender focus-visible:outline-2 focus-visible:outline-pastel-mint disabled:cursor-default disabled:opacity-50"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
