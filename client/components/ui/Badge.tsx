import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "dark" | "outline" | "success" | "warning";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-neutral-100 text-neutral-800",
    dark: "bg-black text-white",
    outline: "border border-neutral-200 text-neutral-700 bg-white",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        variantStyles,
        className
      )}
    >
      {children}
    </span>
  );
}
