"use client";

import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { ReplyGate } from "@/components/chat/reply-gate";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTicker } from "@/hooks/use-ticker";
import { useChat } from "@/providers/chat-provider";
import type { Peer } from "@/types/chat";
import { ArrowLeft, Timer } from "lucide-react";

/** Same sender within this window renders as one visual group. */
const GROUP_WINDOW_MS = 60_000;

export function Conversation({ peer }: { peer: Peer }) {
  const { messages, connected, setActivePeerId, sendMessage } = useChat();
  const now = useTicker();
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = messages[peer._id] ?? [];

  useEffect(() => {
    setActivePeerId(peer._id);
    return () => setActivePeerId(null);
  }, [peer._id, setActivePeerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-card px-4">
        <Button asChild variant="ghost" size="icon" className="lg:hidden">
          <Link href="/chat" aria-label="Back to chats">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <Avatar username={peer.username} className="size-10" />

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-mono text-[1.0625rem] font-medium text-fg">
            {peer.username}
          </h2>
          <p className="text-meta text-fg-muted">
            {!connected
              ? "Reconnecting…"
              : peer.isContact
                ? "Messages vanish after 5 minutes"
                : "Not in your contacts"}
          </p>
        </div>
      </header>

      <div className="chat-canvas flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex w-full max-w-[56rem] flex-col gap-0.5">
          {/* Standing system notice, the way WhatsApp marks a disappearing-
              messages chat, so the behaviour is stated rather than discovered. */}
          <div className="mb-4 flex justify-center">
            <p className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-meta text-fg-muted">
              <Timer className="size-3.5 shrink-0" aria-hidden />
              Messages in this chat disappear after 5 minutes
            </p>
          </div>

          {thread.length === 0 && (
            <p className="py-12 text-center text-[0.9375rem] text-fg-muted">No messages yet.</p>
          )}

          <AnimatePresence initial={false}>
            {thread.map((message, i) => {
              const next = thread[i + 1];
              const tail =
                !next ||
                next.outgoing !== message.outgoing ||
                next.createdAt - message.createdAt > GROUP_WINDOW_MS;

              return (
                <div key={message.id} className={tail ? "mb-2" : undefined}>
                  <MessageBubble message={message} now={now} tail={tail} />
                </div>
              );
            })}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {peer.isContact ? (
        <MessageComposer onSend={(content) => sendMessage(peer._id, content)} />
      ) : (
        <ReplyGate peer={peer} />
      )}
    </div>
  );
}
