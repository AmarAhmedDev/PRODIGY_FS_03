import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Search {
  category?: string;
}

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Products — PioMart" },
      { name: "description", content: "Browse the full PioMart catalog. Filter by category, price, and popularity." },
    ],
  }),
});

function ProductsPage() {
  const { category: initialCategory } = Route.useSearch();
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc">("popular");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let arr = products;
    if (category) arr = arr.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (maxPrice !== "" && !Number.isNaN(maxPrice)) {
      arr = arr.filter((p) => p.price <= Number(maxPrice));
    }
    arr = [...arr];
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    else arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return arr;
  }, [products, category, search, sort, maxPrice]);

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />
      <div className="mx-auto w-full px-4 py-12 md:px-8 lg:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">All Products</h1>
          <p className="mt-2 text-sm text-muted-foreground/80">
            {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-sm)]">
              <label className="mb-3 block text-sm font-semibold text-foreground/90">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 border-border/50 bg-muted/30 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-sm)]">
              <label className="mb-3 block text-sm font-semibold text-foreground/90">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory(undefined)}
                  className={`block w-full rounded-xl px-3.5 py-2 text-left text-sm transition-all duration-200 ${!category ? "bg-primary/10 font-medium text-primary shadow-[var(--shadow-xs)]" : "text-foreground/70 hover:bg-muted/80"}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`block w-full rounded-xl px-3.5 py-2 text-left text-sm transition-all duration-200 ${category === c ? "bg-primary/10 font-medium text-primary shadow-[var(--shadow-xs)]" : "text-foreground/70 hover:bg-muted/80"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-sm)]">
              <label className="mb-3 block text-sm font-semibold text-foreground/90">Max price ($)</label>
              <Input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="No limit"
                className="border-border/50 bg-muted/30 focus:border-primary/50"
              />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-sm)]">
              <label className="mb-3 block text-sm font-semibold text-foreground/90">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-primary/50"
              >
                <option value="popular">Most popular</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            {(category || search || maxPrice !== "") && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  setCategory(undefined);
                  setSearch("");
                  setMaxPrice("");
                }}
              >
                Clear filters
              </Button>
            )}
          </aside>

          <main>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/80" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card p-16 text-center shadow-[var(--shadow-sm)]">
                <p className="text-sm text-muted-foreground/80">No products match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
