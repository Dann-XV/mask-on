"use client";

import { motion } from "motion/react";

const levels = [
  { label: "Too short", color: "bg-destructive" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Strong", color: "bg-emerald-500" },
] as const;

/** Rough 0-3 score: length carries most of the weight, character variety the rest. */
function scorePassword(value: string) {
  if (value.length < 8) return 0;

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;

  if (value.length >= 14 && variety >= 3) return 3;
  if (value.length >= 10 || variety >= 3) return 2;
  return 1;
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  const score = scorePassword(value);
  const { label, color } = levels[score];

  return (
    <div className="flex items-center gap-2.5 pt-0.5">
      <div className="flex flex-1 gap-1" aria-hidden>
        {levels.map((_, i) => (
          <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
            <motion.span
              className={`block h-full origin-left ${color}`}
              initial={false}
              animate={{ scaleX: i <= score ? 1 : 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            />
          </span>
        ))}
      </div>
      <span className="w-16 shrink-0 text-right text-xs text-fg-muted">{label}</span>
    </div>
  );
}
