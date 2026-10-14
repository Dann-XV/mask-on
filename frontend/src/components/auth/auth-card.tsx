"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { UsernameReveal } from "@/components/auth/username-reveal";

type View =
  | { mode: "login"; prefillUsername?: string }
  | { mode: "register" }
  | { mode: "reveal"; username: string }
  | { mode: "success"; username: string };

const copy: Record<View["mode"], { title: string; subtitle: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Enter the username you were given.",
  },
  register: {
    title: "Create an account",
    subtitle: "Pick a password. We'll generate your username.",
  },
  reveal: {
    title: "This is your username",
    subtitle: "It can't be recovered. Save it before you continue.",
  },
  success: {
    title: "You're in",
    subtitle: "Taking you to your messages.",
  },
};

const ease = [0.32, 0.72, 0, 1] as const;

export function AuthCard() {
  const router = useRouter();
  const [view, setView] = useState<View>({ mode: "login" });
  const { title, subtitle } = copy[view.mode];

  // Deliberately no "already signed in, bounce to /chat" redirect here. The
  // chat shell is the only place that decides whether a session is valid; if
  // this page redirected on stored identity alone, a stale localStorage entry
  // with a dead cookie would bounce between the two routes forever.
  useEffect(() => {
    if (view.mode === "success") router.replace("/chat");
  }, [view.mode, router]);

  return (
    <motion.div layout transition={{ duration: 0.3, ease }} className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view.mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease }}
          className="flex flex-col"
        >
          <header className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-display">{title}</h1>
            <p className="text-[1rem] leading-relaxed text-fg-muted">{subtitle}</p>
          </header>

          <div className="mt-7">
            {view.mode === "login" && (
              <LoginForm
                prefillUsername={view.prefillUsername}
                onLoggedIn={(username) => setView({ mode: "success", username })}
              />
            )}

            {view.mode === "register" && (
              <RegisterForm onRegistered={(username) => setView({ mode: "reveal", username })} />
            )}

            {view.mode === "reveal" && (
              <UsernameReveal
                username={view.username}
                onContinue={() => setView({ mode: "login", prefillUsername: view.username })}
              />
            )}

            {view.mode === "success" && (
              <p className="text-center font-mono text-sm text-fg">{view.username}</p>
            )}
          </div>

          {(view.mode === "login" || view.mode === "register") && (
            <p className="mt-7 border-t border-line pt-5 text-center text-[0.9375rem] text-fg-muted">
              {view.mode === "login" ? "No account yet?" : "Already have one?"}{" "}
              <button
                type="button"
                onClick={() => setView(view.mode === "login" ? { mode: "register" } : { mode: "login" })}
                className="rounded-sm font-medium text-brand underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {view.mode === "login" ? "Create one" : "Log in"}
              </button>
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
