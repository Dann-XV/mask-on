"use client";

import { Copy, LogOut, MoreVertical, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { toast } from "sonner";

import { Wordmark } from "@/components/brand/wordmark";
import { AddContactDialog } from "@/components/chat/add-contact-dialog";
import { ContactList, ContactRows } from "@/components/chat/contact-list";
import { SearchDialog } from "@/components/chat/search-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChat } from "@/providers/chat-provider";

const shellClasses = "flex h-full w-full flex-col border-r border-line bg-card lg:w-[21rem]";

function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside className={cn(shellClasses, className)}>
      <div className="flex h-16 shrink-0 items-center px-4">
        <Wordmark className="h-7 opacity-40" />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2 pt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { identity, ready, peers, messages, unread, connected, logOut, refreshContacts } =
    useChat();

  // Most recent conversation first, untouched contacts after.
  const ordered = useMemo(
    () =>
      [...peers].sort((a, b) => {
        const aLast = messages[a._id]?.at(-1)?.createdAt ?? 0;
        const bLast = messages[b._id]?.at(-1)?.createdAt ?? 0;
        return bLast - aLast;
      }),
    [peers, messages],
  );

  if (!ready || !identity) return <SidebarSkeleton className={className} />;

  async function copyUsername() {
    if (!identity) return;

    try {
      await navigator.clipboard.writeText(identity.username);
      toast.success("Username copied");
    } catch {
      toast.error("Couldn't copy your username");
    }
  }

  const listProps = { contacts: ordered, messages, unread };

  return (
    <aside className={cn(shellClasses, className)}>
      <div className="flex h-16 shrink-0 items-center justify-between gap-1 px-4">
        {/* Doubles as "close the open conversation" — desktop has no back arrow. */}
        <Link
          href="/chat"
          aria-label="Back to all chats"
          className="rounded-md outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Wordmark className="h-7" />
        </Link>

        <div className="flex items-center">
          <SearchDialog />
          <AddContactDialog />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={copyUsername}>
                <Copy className="size-4" />
                Copy my username
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void refreshContacts()}>
                <RefreshCw className="size-4" />
                Refresh contacts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={logOut}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {ordered.length === 0 ? (
          <p className="px-4 py-12 text-center text-[0.9375rem] leading-relaxed text-fg-muted">
            No contacts yet. Add someone by their username to start a conversation.
          </p>
        ) : (
          <Suspense fallback={<ContactRows {...listProps} />}>
            <ContactList {...listProps} />
          </Suspense>
        )}
      </nav>

      {!connected && (
        <p className="shrink-0 border-t border-line px-4 py-2.5 text-meta text-fg-muted">
          Reconnecting to the server…
        </p>
      )}
    </aside>
  );
}
