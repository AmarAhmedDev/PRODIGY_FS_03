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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-white hover:border-primary/30 transition-colors"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
        {discount > 0 && (
          <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-[#f5365c] px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-2 mix-blend-multiply"
        />
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-xs text-foreground/90 leading-tight min-h-[32px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] text-muted-foreground">{product.rating?.toFixed(1) ?? "4.5"}</span>
        </div>
        <div className="mt-auto pt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold text-[#f5365c]">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-primary hover:text-white"
          aria-label="Add to cart"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}
