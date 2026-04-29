import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] hover:border-primary/20"
    >
      <div className="relative p-3">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/50">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-lg">
              -{discount}%
            </span>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <button
          onClick={onAdd}
          className="absolute bottom-6 right-6 z-10 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-[var(--shadow-soft)] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Add to cart"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
        <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {product.category}
        </span>
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-200">{product.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating ?? 4.5) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.rating?.toFixed(1) ?? "4.5"})</span>
        </div>
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground/70 line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
