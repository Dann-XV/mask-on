"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "@/lib/api/auth";
import { decodeTokenPayload } from "@/lib/jwt";
import { saveIdentity } from "@/lib/session";
import { ApiError } from "@/types/api";

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
  prefillUsername?: string;
  onLoggedIn: (username: string) => void;
}

export function LoginForm({ prefillUsername, onLoggedIn }: LoginFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: prefillUsername ?? "", password: "" },
  });

  useEffect(() => {
    if (prefillUsername) form.setValue("username", prefillUsername);
  }, [prefillUsername, form]);

  async function onSubmit(values: FormValues) {
    try {
      const { username, token } = await login(values.username.trim(), values.password);

      // The httpOnly cookie is what authenticates us; we read the token only to
      // learn our own userId, then drop it.
      const payload = decodeTokenPayload(token);
      if (!payload) {
        toast.error("Logged in, but the session couldn't be read. Try again.");
        return;
      }

      saveIdentity({ userId: payload.userId, username: payload.username });
      onLoggedIn(username);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't log in. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="e.g. 7Kq2mVxB1p"
                  className="font-mono tracking-tight"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" placeholder="Your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={form.formState.isSubmitting} className="mt-2">
          Log in
        </Button>
      </form>
    </Form>
  );
}
