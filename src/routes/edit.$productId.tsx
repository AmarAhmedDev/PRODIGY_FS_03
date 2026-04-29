import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, uploadToCloudinary } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/edit/$productId")({
  component: EditProductPage,
  head: () => ({ meta: [{ title: "Edit Product — PioMart" }] }),
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

function EditProductPage() {
  const { productId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    category: CATEGORIES[0],
    stock: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: `/edit/${productId}` } });
    }
  }, [authLoading, user, navigate, productId]);

  useEffect(() => {
    if (authLoading || !user) return;

    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
          toast.error("Product not found");
          if (mounted) navigate({ to: "/products" });
          return;
        }

        const data = snap.data();
        
        // Security check: Must be owner
        if (data.userId !== user.uid) {
          toast.error("You don't have permission to edit this product");
          if (mounted) navigate({ to: "/products" });
          return;
        }

        if (mounted) {
          setForm({
            name: data.name || "",
            description: data.description || "",
            price: data.price ? String(data.price) : "",
            oldPrice: data.oldPrice ? String(data.oldPrice) : "",
            category: data.category || CATEGORIES[0],
            stock: data.stock !== undefined ? String(data.stock) : "",
          });
          setImagePreview(data.imageUrl || null);
          setImageUrl(data.imageUrl || null);
          setLoadingInitial(false);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load product");
        if (mounted) navigate({ to: "/products" });
      }
    })();

    return () => { mounted = false; };
  }, [productId, authLoading, user, navigate]);

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
      if (imageFile && finalImageUrl !== imagePreview) {
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
      await updateDoc(doc(db, "products", productId), {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        ...(parsed.data.oldPrice ? { oldPrice: parsed.data.oldPrice } : { oldPrice: null }), // Clear oldPrice if empty
        category: parsed.data.category,
        stock: parsed.data.stock,
        imageUrl: finalImageUrl,
      });
      toast.success("Product updated successfully");
      navigate({ to: `/products/${productId}` });
    } catch (err) {
      console.error(err);
      toast.error("Could not update product. Check Firestore rules.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || loadingInitial) {
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Edit Product</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Modify the details for your product.
            </p>
          </div>
          <Link to="/products/$productId" params={{ productId }}>
            <Button variant="outline" className="rounded-full">Cancel</Button>
          </Link>
        </div>

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
              className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary hover:bg-muted"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition-opacity group-hover:opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-semibold text-foreground bg-background/80 px-3 py-1 rounded-full text-sm shadow-sm">Change Image</p>
                  </div>
                </>
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

            {imageFile && (
              <Button
                type="button"
                onClick={doUpload}
                disabled={uploading}
                variant="outline"
                className="w-full rounded-full"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload new image"}
              </Button>
            )}

            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={submitting || uploading}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </aside>
        </form>
      </div>
      <Footer />
    </div>
  );
}
