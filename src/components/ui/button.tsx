"use client";

import { cn } from "@/lib/cn";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "icon";
  asChild?: boolean;
  className?: string;
};

export function Button({ variant = "default", size = "md", asChild, className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variantCls = variant === "outline"
    ? "border border-black/10 bg-white hover:bg-[#f6f6f6] text-black"
    : "bg-brand text-brand-foreground hover:opacity-90";
  const sizeCls = size === "sm" ? "h-9 px-3"
    : size === "icon" ? "h-9 w-9"
    : "h-10 px-4";

  const cls = cn(base, variantCls, sizeCls, className);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      className: cn((children as any).props?.className, cls),
    });
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

