"use client";

import { useState } from "react";

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Type your answer...",
  sendLabel = "Send",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  sendLabel?: string;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-xl border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50 dark:border-white/15"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        {sendLabel}
      </button>
    </div>
  );
}
