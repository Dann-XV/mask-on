import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const placeholders = [
  { outgoing: false, width: "w-52" },
  { outgoing: true, width: "w-36" },
  { outgoing: false, width: "w-64" },
  { outgoing: true, width: "w-44" },
];

export function ConversationSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {placeholders.map((item, i) => (
            <div key={i} className={cn("flex", item.outgoing ? "justify-end" : "justify-start")}>
              <Skeleton className={cn("h-10 rounded-2xl", item.width)} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
