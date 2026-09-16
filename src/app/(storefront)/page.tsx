import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { RotatingGreeting } from "@/components/storefront/RotatingGreeting";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div className="mb-8 p-12 bg-muted/50 rounded-[3rem] w-full max-w-4xl border border-border relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <RotatingGreeting />
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
          Curated accessories, gifts, and stationery. Treat yourself to a little slice of joy.
        </p>
        
        <div className="flex gap-4 justify-center relative z-10">
          <Link href="/category/new-arrivals" className={buttonVariants({ size: "lg", className: "rounded-full font-bold text-lg px-8" })}>
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </div>
  );
}
