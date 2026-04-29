import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, uploadToCloudinary } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, ImagePlus, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Add Product — PioMart" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  description: z.string().trim().min(10, "Add a longer description").max(2000),
  price: z.coerce.number().positive("Price must be positive"),
  oldPrice: z.coerce.number().positive().optional(),
  category: z.string().trim().min(2).max(60),
  stock: z.coerce.number().int().nonnegative("Stock can't be negative"),
});

const CATEGORIES = [
  "Gadgets",
  "Electronics",
  "Home",
  "Kitchen",
  "Furniture",
  "Bags",
  "Accessories",
  "Footwear",
  "Sports",
  "Outdoor",
  "Books",
  "Tools",
  "Toys",
];

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    category: CATEGORIES[0],
    stock: "10",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login", search: { redirect: "/admin" } });
  }, [authLoading, user, navigate]);

  const onPickImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setImageFile(file);
    setImageUrl(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const doUpload = async () => {
    if (!imageFile) {
      toast.error("Pick an image first");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(imageFile);
      setImageUrl(url);
      toast.success("Image uploaded to Cloudinary");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed. Check Cloudinary preset is unsigned.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      ...form,
      oldPrice: form.oldPrice === "" ? undefined : form.oldPrice,
    });
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        fe[i.path[0] as keyof typeof form] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});

    let finalImageUrl = imageUrl;
    try {
      if (!finalImageUrl && imageFile) {
        setUploading(true);
        finalImageUrl = await uploadToCloudinary(imageFile);
        setImageUrl(finalImageUrl);
        setUploading(false);
      }
    } catch (err) {
      setUploading(false);
      console.error(err);
      toast.error("Image upload failed");
      return;
    }

    if (!finalImageUrl) {
      toast.error("Please upload a product image");
      return;
    }

    setSubmitting(true);
    try {
      const ref = await addDoc(collection(db, "products"), {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        ...(parsed.data.oldPrice ? { oldPrice: parsed.data.oldPrice } : {}),
        category: parsed.data.category,
        stock: parsed.data.stock,
        imageUrl: finalImageUrl,
        rating: 4.5,
        createdAt: serverTimestamp(),
      });
      setSavedId(ref.id);
      toast.success("Product added");
      setForm({
        name: "",
        description: "",
        price: "",
        oldPrice: "",
        category: CATEGORIES[0],
        stock: "10",
      });
      setImageFile(null);
      setImagePreview(null);
      setImageUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not save product. Check Firestore rules.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Add a Product</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload an image to Cloudinary and store the product in Firestore.
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="rounded-full">View shop</Button>
          </Link>
        </div>

        {savedId && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>
              Product saved (ID <span className="font-mono">{savedId.slice(0, 8)}</span>). Add another below or go to the{" "}
              <Link to="/products" className="font-semibold text-primary underline">shop</Link>.
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div>
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Wireless Headphones Pro"
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe materials, features, and what's in the box."
                className="mt-1"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99.00"
                  className="mt-1"
                />
                {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
              </div>
              <div>
                <Label htmlFor="oldPrice">Compare-at ($)</Label>
                <Input
                  id="oldPrice"
                  inputMode="decimal"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  placeholder="optional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1"
                />
                {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold">Product image</h2>

            <div
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary hover:bg-muted"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <ImagePlus className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">Click to choose image</p>
                  <p className="mt-1 text-xs">PNG / JPG up to 8MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickImage(f);
                e.target.value = "";
              }}
            />

            <Button
              type="button"
              onClick={doUpload}
              disabled={!imageFile || uploading || !!imageUrl}
              variant="outline"
              className="w-full rounded-full"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {imageUrl ? "Uploaded ✓" : uploading ? "Uploading..." : "Upload to Cloudinary"}
            </Button>

            {imageUrl && (
              <p className="break-all rounded-lg bg-muted p-2 text-[10px] text-muted-foreground">
                {imageUrl}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={submitting || uploading}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save product"}
            </Button>
            <p className="text-xs text-muted-foreground">
              The image uploads automatically when you save if you haven't already uploaded it.
            </p>
          </aside>
        </form>
      </div>
      <Footer />
    </div>
  );
}
