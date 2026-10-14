import { AuthCard } from "@/components/auth/auth-card";
import { Wordmark } from "@/components/brand/wordmark";

export default function Home() {
  return (
    // Same dot canvas the message list uses, so the entry screen reads as part
    // of the app rather than a separate landing page.
    <main className="chat-canvas flex min-h-screen w-full items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-[25rem] flex-col items-center">
        <Wordmark className="mb-8 h-10" />

        <div className="w-full rounded-2xl border border-line bg-card p-7 shadow-2xl shadow-black/50 sm:p-8">
          <AuthCard />
        </div>
      </div>
    </main>
  );
}
