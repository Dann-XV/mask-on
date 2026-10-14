"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { registerAccount } from "@/lib/api/auth";
import { ApiError } from "@/types/api";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface RegisterFormProps {
  onRegistered: (username: string) => void;
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control: form.control, name: "password" });

  async function onSubmit(values: FormValues) {
    try {
      const { username } = await registerAccount(values.password);
      onRegistered(username);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Couldn't create your account. Please try again.",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" {...field} />
              </FormControl>
              <PasswordStrength value={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="Repeat it" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={form.formState.isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>
    </Form>
  );
}
