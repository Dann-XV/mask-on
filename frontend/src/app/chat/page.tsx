import { MessagesSquare } from "lucide-react";

export default function ChatIndexPage() {
  // Desktop-only: on mobile the contact list itself is the /chat screen.
  return (
    <div className="hidden flex-1 flex-col items-center justify-center gap-3 px-6 text-center lg:flex">
      <MessagesSquare className="size-10 text-fg-muted/50" strokeWidth={1.5} />
      <p className="text-base text-fg-muted">Pick a contact to start messaging.</p>
    </div>
  );
}
