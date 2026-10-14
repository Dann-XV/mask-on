"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Conversation } from "@/components/chat/conversation";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { Button } from "@/components/ui/button";
import { useChat } from "@/providers/chat-provider";

export function ConversationRoute() {
  const { userId } = useParams<{ userId: string }>();
  const { peers, ready } = useChat();

  if (!ready) return <ConversationSkeleton />;

  const peer = peers.find((candidate) => candidate._id === userId);

  // No contact entry and no received messages — a stale or hand-typed id.
  if (!peer) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl">Conversation unavailable</h2>
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-fg-muted">
            There&apos;s no conversation with this account, and it isn&apos;t in your contacts.
          </p>
        </div>
        <Button asChild size="auto" variant="outline">
          <Link href="/chat">Back to contacts</Link>
        </Button>
      </div>
    );
  }

  return <Conversation peer={peer} />;
}
