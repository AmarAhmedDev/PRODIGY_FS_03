import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";
import heroKid from "@/assets/hero-kid.jpg";
import heroBags from "@/assets/hero-bags.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "PioMart — Modern shopping, delivered" },
      { name: "description", content: "Shop curated gadgets, fashion, home goods and more. 30% off winter sale." },
    ],
  }),
});

const CATEGORIES = [
  { name: "Gadgets", color: "from-blue-100 to-blue-50", emoji: "📱" },
  { name: "Fashion", color: "from-pink-100 to-rose-50", emoji: "👗" },
  { name: "Home", color: "from-amber-100 to-orange-50", emoji: "🏡" },
  { name: "Furniture", color: "from-emerald-100 to-teal-50", emoji: "🪑" },
  { name: "Bags", color: "from-violet-100 to-purple-50", emoji: "🎒" },
  { name: "Shoes", color: "from-yellow-100 to-amber-50", emoji: "👟" },
];

function HomePage() {
  const { products, loading } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--hero-bg)]" />
        <div className="relative mx-auto grid w-full gap-10 px-4 py-16 md:grid-cols-2 md:px-8 lg:px-12 md:py-24 lg:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary shadow-[var(--shadow-xs)]">
              <Sparkles className="h-3.5 w-3.5" /> Best Gadget & Fashion
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
              30% Off <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Winter Sale</span>
              <br />
              Promo Code
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground/90">
              This year, our curated winter collection brings you premium quality at unbeatable prices — shop your favorites today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8 shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95">
                  Shop now <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-2 transition-transform hover:scale-105 active:scale-95">
                  Browse categories
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/50 pt-8">
              <div>
                <div className="text-3xl font-bold text-foreground">#1</div>
                <div className="mt-1 text-xs text-muted-foreground">eCommerce platform</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">25k+</div>
                <div className="mt-1 text-xs text-muted-foreground">Happy customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">1M</div>
                <div className="mt-1 text-xs text-muted-foreground">Items shipped</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 overflow-hidden rounded-3xl bg-white p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Mid Summer</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">Baby & Kids</h3>
                  <p className="text-2xl font-bold text-primary">Clothings</p>
                  <Link to="/products" className="group mt-3 inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary">
                    Shop now <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <img src={heroKid} alt="Kids clothing" width={200} height={200} className="h-40 w-40 object-contain transition-transform duration-300 hover:scale-105 md:h-52 md:w-52" />
              </div>
            </div>
            <div className="col-span-2 overflow-hidden rounded-3xl bg-[var(--soft-pink)] p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:col-span-1">
              <p className="text-xs font-semibold text-primary">Feel Amazing</p>
              <h3 className="text-xl font-bold tracking-tight">EVERYDAY</h3>
              <p className="text-sm text-muted-foreground/80">Kids Bag</p>
              <img src={heroBags} alt="Backpacks" loading="lazy" width={180} height={180} className="mx-auto mt-4 h-28 w-28 object-contain transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="col-span-2 flex flex-col justify-center rounded-3xl bg-white p-6 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)] sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Limited offer</p>
              <h3 className="text-xl font-bold tracking-tight">Free shipping</h3>
              <p className="mt-1 text-sm text-muted-foreground/80">On orders over $50.</p>
              <Link to="/products" className="group mt-3 text-sm font-medium text-primary hover:underline">Learn more <span className="inline-block transition-transform group-hover:translate-x-1">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto grid w-full grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-8 lg:px-12 md:py-10">
          {[
            { icon: Truck, title: "Free shipping", text: "Orders over $50" },
            { icon: ShieldCheck, title: "Secure payments", text: "Encrypted checkout" },
            { icon: RotateCcw, title: "Easy returns", text: "30-day window" },
            { icon: Sparkles, title: "Curated quality", text: "Hand-picked items" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 transition-transform hover:translate-x-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-[var(--shadow-xs)]">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground/90">{f.title}</div>
                <div className="text-xs text-muted-foreground/80">{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full px-4 py-20 md:px-8 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Shop by Category</h2>
            <p className="mt-2 text-sm text-muted-foreground/80">Find what you love across our collections.</p>
          </div>
          <Link to="/products" className="hidden text-sm font-medium text-primary hover:underline md:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/products"
              search={{ category: c.name }}
              className={`group flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br ${c.color} p-6 text-center shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]`}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{c.emoji}</span>
              <span className="text-sm font-semibold text-foreground/90">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full px-4 pb-20 md:px-8 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Featured Products</h2>
            <p className="mt-2 text-sm text-muted-foreground/80">Loved by 25,000+ customers.</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">
            See all →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="mx-auto w-full px-4 pb-20 md:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--gradient-primary)] p-10 shadow-[var(--shadow-2xl)] md:p-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnptMCAyYzIuMjA5IDAgNCAxLjc5MSA0IDRzLTEuNzkxIDQtNCA0LTQtMS43OTEtNC00IDEuNzkxLTQgNC00eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">Join PioMart Plus</h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Get free shipping, exclusive drops and early access to seasonal sales.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="mt-8 rounded-full px-8 shadow-[var(--shadow-lg)] transition-transform hover:scale-105 active:scale-95">
                Create your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
