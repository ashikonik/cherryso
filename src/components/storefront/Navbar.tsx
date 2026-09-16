import Link from "next/link";
import { Search, ShoppingBag, Menu, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary flex items-center gap-2">
            🍒 CherrySo
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/category/new-arrivals" className="transition-colors hover:text-primary">
            New Arrivals
          </Link>
          <Link href="/category/accessories" className="transition-colors hover:text-primary">
            Accessories
          </Link>
          <Link href="/category/gifts" className="transition-colors hover:text-primary">
            Gifts
          </Link>
          <Link href="/category/mystery-boxes" className="transition-colors hover:text-primary">
            Mystery Boxes
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full max-w-sm hidden md:flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="flex h-9 w-full rounded-2xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
            />
          </div>
          
          <ThemeToggle />
          
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Link>
          
          <Link href="/cart" className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}>
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
