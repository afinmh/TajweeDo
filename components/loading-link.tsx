"use client";
import Link, { LinkProps } from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// A wrapper around Next.js Link that triggers the global route loader
// and shows a small inline spinner while pending.
export function LoadingLink({ className, children, onClick, ...rest }: LinkProps & { className?: string; children: React.ReactNode; }) {
  const [pending, setPending] = useState(false);
  return (
    <Link
      {...rest}
      className={cn(className, pending && "opacity-70")}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        setPending(true);
        window.dispatchEvent(new Event('route-loading-start'));
      }}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {pending && (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
      </span>
    </Link>
  );
}
