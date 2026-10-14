"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { motion, type HTMLMotionProps } from "motion/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-fg hover:bg-secondary/80",
        ghost: "bg-transparent text-fg-muted hover:bg-secondary hover:text-fg",
        outline: "border border-line bg-transparent text-fg hover:bg-secondary",
      },
      size: {
        default: "h-12 w-full px-5 text-[0.9375rem]",
        auto: "h-12 px-5 text-[0.9375rem]",
        sm: "h-9 px-3.5 text-sm",
        icon: "size-10 shrink-0",
        "icon-sm": "size-8 shrink-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const press = { type: "spring", stiffness: 420, damping: 22, mass: 0.6 } as const;

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    return (
      <Slot data-slot="button" className={classes} {...(props as React.ComponentProps<typeof Slot>)}>
        {children}
      </Slot>
    );
  }

  const inert = disabled || loading;

  return (
    <motion.button
      data-slot="button"
      className={classes}
      disabled={inert}
      whileTap={inert ? undefined : { scale: 0.96 }}
      whileHover={inert ? undefined : { scale: 1.01 }}
      transition={press}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </motion.button>
  );
}

export { Button, buttonVariants };
