import { Suspense } from "react";

import { ConversationRoute } from "@/components/chat/conversation-route";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";

export default function ConversationPage() {
  // The route reads the userId from the URL, so it streams in behind a
  // boundary and the shell around it still prerenders.
  return (
    <section data-conversation className="flex min-w-0 flex-1 flex-col">
      <Suspense fallback={<ConversationSkeleton />}>
        <ConversationRoute />
      </Suspense>
    </section>
  );
}
