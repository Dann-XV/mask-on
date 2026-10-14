"use client";

import { usePathname } from "next/navigation";

import { ContactRow } from "@/components/chat/contact-row";
import type { ChatMessage, Peer } from "@/types/chat";

interface ContactListProps {
  contacts: Peer[];
  messages: Record<string, ChatMessage[]>;
  unread: Record<string, number>;
}

/**
 * Rendered without an active row during prerender, then again with the
 * highlight once the pathname is known at runtime.
 */
export function ContactRows({
  contacts,
  messages,
  unread,
  activePath,
}: ContactListProps & { activePath?: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {contacts.map((contact) => (
        <li key={contact._id}>
          <ContactRow
            contact={contact}
            active={activePath === `/chat/${contact._id}`}
            unread={unread[contact._id] ?? 0}
            lastMessage={messages[contact._id]?.at(-1)}
          />
        </li>
      ))}
    </ul>
  );
}

export function ContactList(props: ContactListProps) {
  return <ContactRows {...props} activePath={usePathname()} />;
}
