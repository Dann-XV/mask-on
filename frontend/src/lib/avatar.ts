/**
 * Usernames are random 10-char strings with no profile photo behind them, so we
 * derive a stable colour + initials from the name itself (the way Telegram does
 * for photo-less accounts). Same username always lands on the same colour.
 */
const palette = [
  "#E8705F",
  "#E0A458",
  "#6FB07F",
  "#5AA9C9",
  "#6F86D6",
  "#A77BCA",
  "#D96FA0",
  "#C9956F",
] as const;

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function avatarColor(username: string) {
  return palette[hash(username) % palette.length];
}

export function avatarInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}
