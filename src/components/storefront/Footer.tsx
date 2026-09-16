import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            🍒 CherrySo
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cute accessories, gifts, and stationery to brighten your day. Bringing kawaii culture to Bangladesh!
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/category/new-arrivals" className="hover:text-primary">New Arrivals</Link></li>
            <li><Link href="/category/accessories" className="hover:text-primary">Accessories</Link></li>
            <li><Link href="/category/stationery" className="hover:text-primary">Stationery</Link></li>
            <li><Link href="/category/gifts" className="hover:text-primary">Gifts</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-primary">Shipping Info</Link></li>
            <li><Link href="/returns" className="hover:text-primary">Returns & Exchanges</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
          
          <div className="mt-6 text-xs text-muted-foreground/80 leading-relaxed border-t border-border/50 pt-4">
            <p>
              *Character designs inspired by Sanrio&apos;s Hello Kitty, My Melody, Cinnamoroll, and Kuromi. All character rights belong to Sanrio Co., Ltd. We do not sell counterfeit licensed merchandise.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CherrySo. All rights reserved.</p>
      </div>
    </footer>
  );
}
