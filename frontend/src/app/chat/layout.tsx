import { Sidebar } from "@/components/chat/sidebar";
import { ChatProvider } from "@/providers/chat-provider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {/*
        Two panes on desktop, one at a time on mobile. Which pane shows is
        decided in CSS from whether the route below rendered a conversation,
        rather than by reading the pathname — that keeps the layout
        prerenderable instead of blocking on runtime URL data.
      */}
      <div className="group flex h-screen w-full overflow-hidden">
        <Sidebar className="group-has-[[data-conversation]]:hidden lg:group-has-[[data-conversation]]:flex" />
        {children}
      </div>
    </ChatProvider>
  );
}
