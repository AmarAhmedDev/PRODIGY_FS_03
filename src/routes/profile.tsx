import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order } from "@/lib/types";
import { Loader2, Package, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Account — PioMart" }] }),
});

function ProfilePage() {
  const { user, profile, loading, logout, updateAddress } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/profile" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.address) setAddress(profile.address);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        // Fetch without composite index requirement: simple where, then sort client-side
        const snap = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
        const list: Order[] = snap.docs.map((d) => {
          const data = d.data() as Omit<Order, "id" | "createdAt"> & { createdAt?: Timestamp | number };
          const createdAt =
            typeof data.createdAt === "number"
              ? data.createdAt
              : data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : Date.now();
          return { ...data, id: d.id, createdAt } as Order;
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
        if (mounted) setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const onLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const onSaveAddress = async () => {
    setSavingAddress(true);
    try {
      await updateAddress(address.trim());
      toast.success("Address updated");
    } catch {
      toast.error("Could not save address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your profile and orders.</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={onLogout}>
            <LogOut className="mr-1 h-4 w-4" /> Log out
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold">Profile</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium">{profile?.name || user.displayName || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium">{profile?.email || user.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold">Saved address</h2>
            <Label htmlFor="address" className="mt-4 block">Default shipping address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Apt 4B, City"
              className="mt-1"
            />
            <Button className="mt-3 rounded-full" size="sm" onClick={onSaveAddress} disabled={savingAddress}>
              {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">Order history</h2>
          {ordersLoading ? (
            <div className="mt-6 flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
              <Link to="/products" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-sm font-semibold">
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        o.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : o.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="text-base font-bold">${o.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {o.items.map((i) => (
                      <div key={i.productId} className="flex shrink-0 items-center gap-2 rounded-xl bg-muted/60 p-2 pr-3">
                        <img src={i.imageUrl} alt={i.name} className="h-10 w-10 rounded-lg object-cover" />
                        <div className="text-xs">
                          <p className="line-clamp-1 max-w-[140px] font-medium">{i.name}</p>
                          <p className="text-muted-foreground">×{i.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
