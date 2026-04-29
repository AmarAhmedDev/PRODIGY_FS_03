import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/50 bg-[var(--surface)]">
      <div className="mx-auto grid w-full gap-12 px-4 py-16 md:grid-cols-4 md:px-8 lg:px-12 lg:gap-16">
        <div>
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-bold text-transparent">
              PioMart
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground/80">
            Your one-stop modern shop for the things you love. Curated quality, delivered fast with care.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground/90">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="text-muted-foreground transition-colors hover:text-primary">All products</Link></li>
            <li><Link to="/products" className="text-muted-foreground transition-colors hover:text-primary">Featured</Link></li>
            <li><Link to="/products" className="text-muted-foreground transition-colors hover:text-primary">New arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground/90">Account</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/login" className="text-muted-foreground transition-colors hover:text-primary">Sign in</Link></li>
            <li><Link to="/signup" className="text-muted-foreground transition-colors hover:text-primary">Create account</Link></li>
            <li><Link to="/profile" className="text-muted-foreground transition-colors hover:text-primary">Order history</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground/90">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="cursor-not-allowed text-muted-foreground/60">Shipping & returns</span></li>
            <li><span className="cursor-not-allowed text-muted-foreground/60">Contact support</span></li>
            <li><span className="cursor-not-allowed text-muted-foreground/60">Privacy policy</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} PioMart. Crafted with care.
      </div>
    </footer>
  );
}
