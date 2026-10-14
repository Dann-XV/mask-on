"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addContact } from "@/lib/api/contacts";
import { useChat } from "@/providers/chat-provider";
import { ApiError } from "@/types/api";
import type { Peer } from "@/types/chat";

/**
 * Contacts are one-directional on the backend: the socket rejects a message
 * unless the *sender* has the recipient in their list. So someone can message
 * us first, and we can read it but not reply until we add them back.
 */
export function ReplyGate({ peer }: { peer: Peer }) {
  const { refreshContacts } = useChat();
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    try {
      await addContact(peer.username);
      await refreshContacts();
      toast.success(`Added ${peer.username}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add that contact.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-line bg-card px-4 py-4">
      <div className="mx-auto flex w-full max-w-[56rem] flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
          {peer.unresolved ? (
            "Someone messaged you, but their username couldn't be looked up."
          ) : (
            <>
              <span className="font-mono text-fg">{peer.username}</span> added you and sent a
              message. Add them back to reply.
            </>
          )}
        </p>

        {!peer.unresolved && (
          <Button size="auto" onClick={add} loading={adding} className="shrink-0">
            Add them back
          </Button>
        )}
      </div>
    </div>
  );
}
