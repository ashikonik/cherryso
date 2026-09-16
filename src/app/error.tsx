"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="w-48 h-48 mb-8 bg-muted rounded-full flex items-center justify-center text-6xl shadow-sm">
        (╥﹏╥)
      </div>
      <h2 className="text-3xl font-bold mb-4 text-primary">Oops! Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Don&apos;t worry, our little helpers are on it! Please try again or go back to shopping.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" className="rounded-2xl">
          Try Again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "rounded-2xl" })}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
