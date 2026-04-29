import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, User, LogOut, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/admin", label: "Add Product" },
    { to: "/profile", label: "Account" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-8 lg:px-12">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-105">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            PioMart
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="relative text-sm font-medium text-foreground/70 transition-colors hover:text-primary after:absolute after:bottom-[-1.25rem] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary after:w-full after:bg-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-[var(--shadow-soft)]">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="hidden md:inline-flex">
                <Button variant="ghost" size="icon" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Profile">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex" aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="default" size="sm" className="rounded-full px-5 shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95">
                Sign in
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/5 hover:text-destructive"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
