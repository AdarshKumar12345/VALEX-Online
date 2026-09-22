"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={id} className="block text-xs font-semibold text-neutral-800">
              {label}
              {props.required && <span className="text-neutral-400 ml-0.5">*</span>}
            </label>
            {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-neutral-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
