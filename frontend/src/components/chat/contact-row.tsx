"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage, Peer } from "@/types/chat";

interface ContactRowProps {
  contact: Peer;
  active: boolean;
  unread: number;
  lastMessage?: ChatMessage;
}

export function ContactRow({ contact, active, unread, lastMessage }: ContactRowProps) {
  return (
    <Link
      href={`/chat/${contact._id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary/15" : "hover:bg-secondary",
      )}
    >
      <Avatar username={contact.username} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-mono text-base font-medium text-fg">
            {contact.username}
          </span>
          {lastMessage && (
            <span className="text-meta shrink-0 tabular-nums text-fg-muted">
              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[0.9375rem] text-fg-muted">
            {lastMessage
              ? `${lastMessage.outgoing ? "You: " : ""}${lastMessage.content}`
              : "No messages"}
          </span>

          {unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold tabular-nums text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
