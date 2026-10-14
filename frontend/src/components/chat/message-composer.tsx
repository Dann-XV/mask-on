"use client";

import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const MAX_LENGTH = 5000;
const MAX_HEIGHT = 160;

export function MessageComposer({ onSend }: { onSend: (content: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    // Only show a scrollbar once the field has actually stopped growing —
    // otherwise one sits inside the box permanently.
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }

  useEffect(resize, []);

  function submit() {
    const content = value.trim();
    if (!content) return;

    onSend(content);
    setValue("");
    requestAnimationFrame(resize);
  }

  return (
    <div className="shrink-0 border-t border-line bg-card px-4 py-3">
      <div className="mx-auto flex w-full max-w-[56rem] items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          placeholder="Write a message"
          aria-label="Message"
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-11 flex-1 resize-none overflow-hidden rounded-xl border border-input bg-surface px-4 py-2.5 text-base leading-snug text-fg outline-none transition-colors placeholder:text-fg-muted/60 focus-visible:border-ring"
        />

        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Send message"
          className="size-11 rounded-full"
        >
          <SendHorizonal className="size-[1.125rem]" />
        </Button>
      </div>
    </div>
  );
}
