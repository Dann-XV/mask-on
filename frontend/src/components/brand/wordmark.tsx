import Image from "next/image";

import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <Image
      src="/maskon-wordmark.png"
      alt="MaskOn"
      width={1303}
      height={300}
      priority
      className={cn("h-9 w-auto select-none", className)}
    />
  );
}
