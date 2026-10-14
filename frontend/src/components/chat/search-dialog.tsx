"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChat } from "@/providers/chat-provider";

export function SearchDialog() {
  const router = useRouter();
  const { peers, messages } = useChat();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return peers;
    return peers.filter((peer) => peer.username.toLowerCase().includes(needle));
  }, [peers, query]);

  function openConversation(userId: string) {
    setOpen(false);
    setQuery("");
    router.push(`/chat/${userId}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search contacts">
          <Search className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Search contacts</DialogTitle>

        {/* Icon and field are flex siblings, so they stay on the same baseline
            no matter the field height. */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 pr-12">
          <Search className="size-5 shrink-0 text-fg-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search contacts"
            aria-label="Search contacts"
            className="w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-muted/60"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {peers.length === 0 ? (
            <p className="px-3 py-10 text-center text-[0.9375rem] leading-relaxed text-fg-muted">
              You have no contacts yet. Add someone by their username first.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-[0.9375rem] text-fg-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {results.map((peer) => {
                const last = messages[peer._id]?.at(-1);

                return (
                  <li key={peer._id}>
                    <button
                      type="button"
                      onClick={() => openConversation(peer._id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-secondary focus-visible:bg-secondary"
                    >
                      <Avatar username={peer.username} className="size-10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[0.9375rem] text-fg">
                          {peer.username}
                        </span>
                        <span className="block truncate text-meta text-fg-muted">
                          {last ? `${last.outgoing ? "You: " : ""}${last.content}` : "No messages"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
