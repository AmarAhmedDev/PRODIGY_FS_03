import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  address: z.string().trim().min(5, "Address is too short").max(255),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(100),
});

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — PioMart" }] }),
});

function CheckoutPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: f.name || profile.name,
        email: f.email || profile.email,
        address: f.address || profile.address || "",
      }));
    }
  }, [profile]);

  const shipping = total > 0 && total < 50 ? 5.99 : 0;
  const grandTotal = total + shipping;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        fe[i.path[0] as keyof typeof form] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const ref = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        totalPrice: grandTotal,
        status: "pending",
        shipping: parsed.data,
        createdAt: serverTimestamp(),
      });
      setOrderId(ref.id);
      clear();
      toast.success("Order placed!");
    } catch (err) {
      console.error(err);
      toast.error("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center md:px-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Thank you for your order!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order <span className="font-mono text-foreground">#{orderId.slice(0, 8)}</span> is now being processed.
            We've sent a confirmation to your email.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/profile">
              <Button className="rounded-full">View order history</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="rounded-full">
                Keep shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Almost there — just shipping details.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
              Continue shopping →
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-bold">Shipping details</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {(["name", "email", "address", "city", "zip", "country"] as const).map((field) => (
                  <div key={field} className={field === "address" ? "md:col-span-2" : ""}>
                    <Label htmlFor={field} className="capitalize">
                      {field === "zip" ? "ZIP / Postal code" : field}
                    </Label>
                    <Input
                      id={field}
                      type={field === "email" ? "email" : "text"}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="mt-1"
                      disabled={submitting}
                    />
                    {errors[field] && <p className="mt-1 text-xs text-destructive">{errors[field]}</p>}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                This is a demo store — no real payment is processed.
              </p>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <div className="mt-4 space-y-3">
                {items.map((i) => (
                  <div key={i.productId} className="flex gap-3">
                    <img src={i.imageUrl} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-1 font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="my-3 border-t border-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                type="submit"
                className="mt-6 w-full rounded-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm order"}
              </Button>
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
