import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((p) => {
        if (mounted) setProducts(p);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError(e?.message || "Failed to load products");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
}
