import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureSeeded } from "@/lib/products";
import type { Product } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Minus, Plus, ShoppingBag, ChevronLeft, Truck, ShieldCheck, Edit2, Trash2 } from "lucide-react";
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
  const navigate = useRouter().navigate;
  const { user } = useAuth();
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      toast.success("Product deleted successfully");
      navigate({ to: "/products" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete product");
    }
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-muted/20 pb-24 lg:pb-0">
      <Navbar />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 lg:px-12 lg:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/products" className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to shop
          </Link>
          
          {user?.uid === product.userId && (
            <div className="flex items-center gap-2">
              <Link to="/edit/$productId" params={{ productId }}>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Edit2 className="mr-1.5 h-4 w-4" /> Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" className="rounded-full" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_400px] lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Image Section */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-border/40">
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-square">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-full w-full object-contain transition-transform duration-500 hover:scale-105 mix-blend-multiply" 
              />
            </div>
            {/* Trust Badges under image */}
            <div className="mt-8 grid w-full grid-cols-2 gap-4 border-t border-border/50 pt-6">
              <div className="flex items-center gap-3 justify-center text-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">Protected by Stripe</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center text-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On all orders over $50</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">{product.name}</h1>
            
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating ?? 4.5) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating?.toFixed(1) ?? "4.5"}</span>
              <span className="text-sm text-muted-foreground">· 1,284 Reviews</span>
            </div>

            <div className="mt-6 rounded-2xl bg-[#fff0f3] p-6 border border-[#ffe0e6]">
              {discount > 0 && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-[#f5365c] px-2 py-0.5 text-xs font-bold uppercase text-white">Flash Sale</span>
                  <span className="text-sm font-medium text-[#f5365c]">Ends in 12:45:00</span>
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-[#f5365c]">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-lg font-medium text-muted-foreground/70 line-through">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="ml-2 text-sm font-bold text-[#f5365c]">-{discount}%</span>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-foreground text-lg border-b pb-2">Description</h3>
              <p className="leading-relaxed text-muted-foreground/90">{product.description}</p>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium text-foreground">Quantity</span>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? <span className="text-emerald-600 font-medium">{product.stock} in stock</span> : "Currently unavailable"}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-32 items-center justify-between rounded-xl border border-border bg-white px-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="hidden lg:block flex-1">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-xl bg-[#f5365c] hover:bg-[#d42a4c] text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] text-base font-bold"
                    onClick={handleAdd}
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    {product.stock === 0 ? "Out of stock" : "Add to cart"}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-border/50 bg-background/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex flex-col">
          <span className="text-lg font-black text-[#f5365c]">${product.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">{product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
        </div>
        <Button
          size="lg"
          className="h-12 rounded-xl bg-[#f5365c] hover:bg-[#d42a4c] text-white shadow-lg px-8 text-base font-bold"
          onClick={handleAdd}
          disabled={product.stock === 0}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to cart
        </Button>
      </div>

      <Footer />
    </div>
  );
}
