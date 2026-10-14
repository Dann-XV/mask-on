"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { MESSAGE_TTL_MS, type ChatMessage } from "@/types/chat";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface MessageBubbleProps {
  message: ChatMessage;
  now: number;
  /** Last in a run from the same sender — only that one gets the clipped corner. */
  tail: boolean;
}

export function MessageBubble({ message, now, tail }: MessageBubbleProps) {
  const elapsed = Math.max(0, now - message.createdAt);
  const progress = Math.min(1, elapsed / MESSAGE_TTL_MS);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={cn("flex w-full", message.outgoing ? "justify-end" : "justify-start")}
    >
      <div
        style={{ opacity: 1 - progress * 0.3 }}
        className={cn(
          "relative max-w-[min(36rem,76%)] rounded-lg px-3 py-2 shadow-sm shadow-black/20",
          message.outgoing ? "bg-bubble-out text-white" : "bg-bubble-in text-fg",
          tail && (message.outgoing ? "rounded-br-sm" : "rounded-bl-sm"),
        )}
      >
        {/* Time sits on the last line of text and the paragraph reserves room
            for it, the way Telegram and WhatsApp inline their timestamps. */}
        <p className="whitespace-pre-wrap break-words text-base leading-snug">
          {message.content}
          <span className="pointer-events-none inline-block w-16 select-none align-bottom" />
        </p>

        <span
          className={cn(
            "absolute bottom-1.5 right-2.5 flex items-center gap-1 text-xs tabular-nums",
            message.outgoing ? "text-white/70" : "text-fg-muted",
          )}
        >
          {formatTime(message.createdAt)}
          {/* Single tick only: the server stores status "sent" and never
              updates it, so a second tick would be inventing a receipt. */}
          {message.outgoing && <Check className="size-3.5" aria-label="Sent" />}
        </span>
      </div>
    </motion.div>
  );
}
