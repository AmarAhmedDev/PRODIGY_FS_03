import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureSeeded } from "@/lib/products";
import type { Product } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, Minus, Plus, ShoppingBag, ChevronLeft, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Couldn't load product</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button
            className="mt-6"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
          Back to shop
        </Link>
      </div>
    </div>
  ),
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureSeeded();
        const snap = await getDoc(doc(db, "products", productId));
        if (mounted) {
          setProduct(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Product, "id">) }) : null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Link to="/products" className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to shop
        </Link>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="relative p-4">
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
              <div className="mx-auto aspect-square w-[85%] overflow-hidden rounded-xl bg-muted/50">
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating ?? 4.5) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating?.toFixed(1) ?? "4.5"})</span>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground/70 line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground/80">{product.description}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-border bg-card shadow-[var(--shadow-xs)]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 rounded-full shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.stock === 0 ? "Out of stock" : "Add to cart"}
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground/70">
              {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-border/50 pt-8">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
