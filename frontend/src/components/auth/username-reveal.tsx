"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface UsernameRevealProps {
  username: string;
  onContinue: () => void;
}

export function UsernameReveal({ username, onContinue }: UsernameRevealProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (resetTimer.current && clearTimeout(resetTimer.current)), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the username and copy it manually");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-1.5 pl-4">
        <span className="flex-1 select-all font-mono text-lg tracking-tight text-fg">{username}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label={copied ? "Username copied" : "Copy username"}
        >
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
      </div>

      <Label className="flex items-start gap-2.5 text-sm font-normal leading-relaxed text-fg-muted">
        <Checkbox
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked === true)}
          className="mt-0.5"
        />
        I&apos;ve saved my username somewhere safe
      </Label>

      <Button type="button" disabled={!confirmed} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
