import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your Cart — PioMart" }] }),
});

function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const shipping = total > 0 && total < 50 ? 5.99 : 0;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Your Cart</h1>
        <p className="mt-2 text-sm text-muted-foreground/80">
          {items.length === 0 ? "Your cart is empty." : `${items.length} item${items.length > 1 ? "s" : ""} in your cart.`}
        </p>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border/50 bg-card p-20 text-center shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[var(--shadow-xs)]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-foreground">Looks empty here.</p>
            <p className="mt-2 text-sm text-muted-foreground/80">Discover something you'll love.</p>
            <Link to="/products" className="mt-8">
              <Button size="lg" className="rounded-full px-8 shadow-[var(--shadow-soft)] transition-transform hover:scale-105 active:scale-95">Start shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="group flex gap-5 rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <Link
                    to="/products/$productId"
                    params={{ productId: item.productId }}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/50 p-1"
                  >
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/products/$productId"
                      params={{ productId: item.productId }}
                      className="line-clamp-1 font-semibold text-foreground/90 transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <span className="text-sm text-muted-foreground/80">${item.price.toFixed(2)} each</span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-border/50 bg-muted/30">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground/90">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-muted-foreground/70 transition-colors hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border/50 bg-card p-8 shadow-[var(--shadow-md)]">
              <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/80">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? <span className="text-primary">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="my-4 border-t border-border/50" />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="mt-8 block">
                <Button size="lg" className="w-full rounded-full shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Checkout <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products" className="mt-4 block text-center text-sm text-muted-foreground hover:text-primary">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
