import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="w-48 h-48 mb-8 bg-muted rounded-full flex items-center justify-center text-6xl shadow-sm">
        (・_・;)
      </div>
      <h2 className="text-3xl font-bold mb-4 text-primary">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn&apos;t find the page you&apos;re looking for. Maybe it went for a walk in the cherry blossom garden?
      </p>
      <Link href="/" className={buttonVariants({ variant: "default", className: "rounded-2xl" })}>
        Back to Home
      </Link>
    </div>
  );
}
