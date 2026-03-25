import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          "inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && <div className="mr-2 h-4 w-4 animate-spin border-2 border-white/30 border-t-white rounded-full" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
