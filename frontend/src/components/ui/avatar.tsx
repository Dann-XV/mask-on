import { avatarColor, avatarInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  className?: string;
}

export function Avatar({ username, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: avatarColor(username) }}
      className={cn(
        "flex size-11 shrink-0 select-none items-center justify-center rounded-full font-display text-sm font-semibold text-[#121216]",
        className,
      )}
    >
      {avatarInitials(username)}
    </span>
  );
}
