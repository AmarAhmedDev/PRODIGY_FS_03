import {
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";

// Bump this when SAMPLE changes to trigger a re-seed (old seeded items are removed).
const SEED_VERSION = "v3";

// Curated neutral imagery (no women). Categories: Gadgets, Electronics, Home,
// Kitchen, Furniture, Bags, Sports, Outdoor, Books, Tools, Toys, Footwear (men's), Accessories.
const SAMPLE: Omit<Product, "id">[] = [
  // ── Gadgets / Electronics ────────────────────────────────────────────────
  {
    name: "Wireless Noise-Cancel Headphones",
    description: "Over-ear wireless headphones with active noise cancellation and 40h battery life.",
    price: 199,
    oldPrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Gadgets",
    stock: 15,
    rating: 4.8,
  },
  {
    name: "Smart Fitness Watch",
    description: "Track heart rate, sleep, and 100+ workout types with a vibrant always-on display.",
    price: 159,
    oldPrice: 199,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    category: "Gadgets",
    stock: 30,
    rating: 4.6,
  },
  {
    name: "Pro Camera Mirrorless",
    description: "24MP mirrorless camera with 4K video, in-body stabilization, and dual SD slots.",
    price: 1299,
    oldPrice: 1499,
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    category: "Gadgets",
    stock: 6,
    rating: 4.9,
  },
  {
    name: "Mechanical Keyboard RGB",
    description: "Hot-swappable mechanical keyboard with per-key RGB and silent tactile switches.",
    price: 149,
    oldPrice: 189,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    category: "Gadgets",
    stock: 18,
    rating: 4.7,
  },
  {
    name: "Wireless Gaming Mouse",
    description: "Ultra-light 63g wireless mouse with 26K DPI sensor and 90h battery.",
    price: 89,
    oldPrice: 119,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    category: "Gadgets",
    stock: 42,
    rating: 4.6,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "IPX7 waterproof speaker with 360° sound and 24h playtime.",
    price: 79,
    oldPrice: 99,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    category: "Gadgets",
    stock: 55,
    rating: 4.5,
  },
  {
    name: "True Wireless Earbuds",
    description: "Compact earbuds with adaptive ANC, spatial audio, and wireless charging case.",
    price: 129,
    oldPrice: 169,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    category: "Gadgets",
    stock: 80,
    rating: 4.7,
  },
  {
    name: "4K Action Camera",
    description: "Rugged 4K60 action camera with HyperSmooth stabilization and waterproof body.",
    price: 299,
    oldPrice: 379,
    imageUrl: "https://images.unsplash.com/photo-1526317899437-c33ca8b13881?w=800&q=80",
    category: "Gadgets",
    stock: 12,
    rating: 4.8,
  },
  {
    name: "Compact Drone with Camera",
    description: "Foldable drone with 4K HDR camera, GPS return-to-home, and 30-min flight time.",
    price: 599,
    oldPrice: 749,
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    category: "Gadgets",
    stock: 9,
    rating: 4.7,
  },
  {
    name: "Smartphone Pro 256GB",
    description: "Flagship smartphone with triple-lens camera, 120Hz OLED, and titanium frame.",
    price: 999,
    oldPrice: 1099,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    category: "Electronics",
    stock: 25,
    rating: 4.8,
  },
  {
    name: "Ultrabook Laptop 14\"",
    description: "Featherweight 14\" laptop with OLED display, 16GB RAM, and 18-hour battery.",
    price: 1399,
    oldPrice: 1599,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    category: "Electronics",
    stock: 10,
    rating: 4.9,
  },
  {
    name: "10.9\" Tablet 128GB",
    description: "Premium tablet with Liquid Retina display, M2 chip, and stylus support.",
    price: 599,
    oldPrice: 699,
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80",
    category: "Electronics",
    stock: 22,
    rating: 4.7,
  },
  {
    name: "Smart TV 55\" 4K",
    description: "55-inch QLED 4K HDR smart TV with Dolby Vision and built-in voice assistant.",
    price: 749,
    oldPrice: 899,
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    category: "Electronics",
    stock: 7,
    rating: 4.6,
  },
  {
    name: "Gaming Console Pro",
    description: "Next-gen gaming console with 1TB SSD, 4K@120Hz output, and DualSense controller.",
    price: 499,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    category: "Electronics",
    stock: 14,
    rating: 4.9,
  },
  {
    name: "VR Headset Standalone",
    description: "All-in-one VR headset with 4K per-eye display, hand tracking, and 256GB storage.",
    price: 449,
    oldPrice: 549,
    imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80",
    category: "Electronics",
    stock: 16,
    rating: 4.7,
  },
  {
    name: "27\" 4K Monitor",
    description: "Color-accurate 27\" 4K IPS monitor with USB-C 90W power delivery.",
    price: 549,
    oldPrice: 699,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    category: "Electronics",
    stock: 20,
    rating: 4.6,
  },

  // ── Home & Furniture ─────────────────────────────────────────────────────
  {
    name: "Modern Lounge Chair",
    description: "Ergonomic lounge chair with solid oak frame and premium boucle upholstery.",
    price: 449,
    oldPrice: 599,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    category: "Furniture",
    stock: 8,
    rating: 4.9,
  },
  {
    name: "Scandinavian Floor Lamp",
    description: "Minimalist tripod floor lamp with warm linen shade. 1.6m tall.",
    price: 129,
    oldPrice: 169,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    category: "Furniture",
    stock: 18,
    rating: 4.5,
  },
  {
    name: "Walnut Bookshelf",
    description: "5-tier solid walnut bookshelf with adjustable shelves. 180cm tall.",
    price: 379,
    imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80",
    category: "Furniture",
    stock: 5,
    rating: 4.8,
  },
  {
    name: "Velvet Accent Sofa",
    description: "Compact 2-seater velvet sofa with brass legs. Perfect for modern living rooms.",
    price: 899,
    oldPrice: 1199,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    category: "Furniture",
    stock: 4,
    rating: 4.8,
  },
  {
    name: "Indoor Plant Pot Set",
    description: "Set of three terracotta plant pots in varying sizes with drainage trays.",
    price: 39,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
    category: "Home",
    stock: 60,
    rating: 4.5,
  },
  {
    name: "Aroma Diffuser & Oils",
    description: "Ultrasonic essential oil diffuser with 7-color LED and 3 starter oils.",
    price: 49,
    oldPrice: 69,
    imageUrl: "https://images.unsplash.com/photo-1602874801006-e26c4f1d8c50?w=800&q=80",
    category: "Home",
    stock: 70,
    rating: 4.4,
  },
  {
    name: "Soy Candle Trio",
    description: "Hand-poured soy wax candles — sandalwood, oud, and amber. 60h burn each.",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1602874801006-1f2c0e3a3a64?w=800&q=80",
    category: "Home",
    stock: 90,
    rating: 4.6,
  },
  {
    name: "Linen Throw Blanket",
    description: "Stonewashed linen throw, 130×170cm. Naturally hypoallergenic.",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=800&q=80",
    category: "Home",
    stock: 35,
    rating: 4.5,
  },
  {
    name: "Wall Clock Minimalist",
    description: "Silent-sweep 30cm wall clock with brushed aluminum frame.",
    price: 59,
    imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80",
    category: "Home",
    stock: 40,
    rating: 4.4,
  },

  // ── Kitchen ──────────────────────────────────────────────────────────────
  {
    name: "Ceramic Pour-Over Coffee Set",
    description: "Hand-crafted ceramic dripper with matching cup. Brews the perfect single cup.",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    category: "Kitchen",
    stock: 50,
    rating: 4.4,
  },
  {
    name: "Espresso Machine Pro",
    description: "15-bar pump espresso machine with steam wand and PID temperature control.",
    price: 449,
    oldPrice: 549,
    imageUrl: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800&q=80",
    category: "Kitchen",
    stock: 11,
    rating: 4.8,
  },
  {
    name: "Cast Iron Skillet 12\"",
    description: "Pre-seasoned cast iron skillet for stove, oven, and campfire cooking.",
    price: 39,
    imageUrl: "https://images.unsplash.com/photo-1584990347449-a7d3c8aa1e7c?w=800&q=80",
    category: "Kitchen",
    stock: 65,
    rating: 4.7,
  },
  {
    name: "Chef's Knife 8\"",
    description: "High-carbon Damascus steel chef's knife with ergonomic pakkawood handle.",
    price: 119,
    oldPrice: 159,
    imageUrl: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80",
    category: "Kitchen",
    stock: 28,
    rating: 4.9,
  },
  {
    name: "Stainless Cookware Set",
    description: "10-piece tri-ply stainless steel cookware set with tempered glass lids.",
    price: 299,
    oldPrice: 399,
    imageUrl: "https://images.unsplash.com/photo-1584990347163-1d22de8a3a4f?w=800&q=80",
    category: "Kitchen",
    stock: 13,
    rating: 4.7,
  },
  {
    name: "Electric Kettle Glass",
    description: "1.7L borosilicate glass kettle with temperature presets and keep-warm.",
    price: 69,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
    category: "Kitchen",
    stock: 32,
    rating: 4.5,
  },

  // ── Bags & Accessories (no women) ────────────────────────────────────────
  {
    name: "Minimal Backpack",
    description: "Water-resistant minimalist backpack with padded laptop sleeve and 22L capacity.",
    price: 79,
    oldPrice: 99,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    category: "Bags",
    stock: 40,
    rating: 4.5,
  },
  {
    name: "Leather Messenger Bag",
    description: "Full-grain leather messenger bag with 15\" laptop compartment.",
    price: 189,
    oldPrice: 239,
    imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80",
    category: "Bags",
    stock: 17,
    rating: 4.7,
  },
  {
    name: "Travel Duffel 40L",
    description: "Carry-on sized waterproof duffel with shoe compartment and trolley sleeve.",
    price: 99,
    imageUrl: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=80",
    category: "Bags",
    stock: 26,
    rating: 4.6,
  },
  {
    name: "Hardshell Carry-On",
    description: "Lightweight polycarbonate carry-on with 360° spinner wheels and TSA lock.",
    price: 179,
    oldPrice: 229,
    imageUrl: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80",
    category: "Bags",
    stock: 19,
    rating: 4.6,
  },
  {
    name: "Leather Wallet Bifold",
    description: "Slim full-grain leather bifold wallet with RFID-blocking lining.",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    category: "Accessories",
    stock: 100,
    rating: 4.5,
  },
  {
    name: "Classic Aviator Sunglasses",
    description: "UV400 polarized aviators with lightweight metal frame and case.",
    price: 89,
    oldPrice: 119,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    category: "Accessories",
    stock: 45,
    rating: 4.4,
  },
  {
    name: "Automatic Watch",
    description: "Self-winding automatic watch with sapphire crystal and 50m water resistance.",
    price: 349,
    oldPrice: 449,
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    category: "Accessories",
    stock: 12,
    rating: 4.8,
  },

  // ── Footwear (men's) ─────────────────────────────────────────────────────
  {
    name: "Classic Leather Sneakers",
    description: "Premium leather sneakers built for everyday comfort with cushioned insole.",
    price: 89,
    oldPrice: 129,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    category: "Footwear",
    stock: 24,
    rating: 4.7,
  },
  {
    name: "Trail Running Shoes",
    description: "Aggressive lugged outsole and rock plate for off-road running.",
    price: 139,
    oldPrice: 169,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27fa?w=800&q=80",
    category: "Footwear",
    stock: 30,
    rating: 4.6,
  },

  // ── Sports & Outdoor ─────────────────────────────────────────────────────
  {
    name: "Yoga Mat Pro 6mm",
    description: "Non-slip natural rubber yoga mat with alignment lines. 6mm cushioned.",
    price: 59,
    imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80",
    category: "Sports",
    stock: 80,
    rating: 4.5,
  },
  {
    name: "Adjustable Dumbbell Set",
    description: "5–52.5 lb adjustable dumbbells with quick-dial weight selection.",
    price: 349,
    oldPrice: 449,
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    category: "Sports",
    stock: 14,
    rating: 4.8,
  },
  {
    name: "Mountain Bike 29\"",
    description: "Hardtail aluminum mountain bike with hydraulic discs and 12-speed drivetrain.",
    price: 799,
    oldPrice: 999,
    imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
    category: "Sports",
    stock: 6,
    rating: 4.7,
  },
  {
    name: "4-Person Camping Tent",
    description: "Waterproof 4-person dome tent with vestibule. Sets up in under 5 minutes.",
    price: 189,
    oldPrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    category: "Outdoor",
    stock: 18,
    rating: 4.6,
  },
  {
    name: "Insulated Water Bottle 1L",
    description: "Vacuum insulated stainless steel bottle. Keeps cold 24h, hot 12h.",
    price: 35,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    category: "Outdoor",
    stock: 120,
    rating: 4.7,
  },
  {
    name: "Hiking Backpack 50L",
    description: "Ventilated 50L hiking pack with hydration sleeve and rain cover.",
    price: 159,
    oldPrice: 199,
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    category: "Outdoor",
    stock: 22,
    rating: 4.7,
  },

  // ── Books / Tools / Toys ────────────────────────────────────────────────
  {
    name: "Hardcover Notebook Set",
    description: "Set of 3 A5 hardcover dotted notebooks with 120gsm cream paper.",
    price: 29,
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
    category: "Books",
    stock: 200,
    rating: 4.6,
  },
  {
    name: "Classic Literature Box Set",
    description: "Curated 10-book hardcover collection of timeless classics.",
    price: 129,
    oldPrice: 179,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    category: "Books",
    stock: 25,
    rating: 4.8,
  },
  {
    name: "Cordless Drill Kit",
    description: "20V brushless cordless drill with 2 batteries, charger, and 30-piece bit set.",
    price: 159,
    oldPrice: 199,
    imageUrl: "https://images.unsplash.com/photo-1581147036324-c1c1f4f0c3d2?w=800&q=80",
    category: "Tools",
    stock: 28,
    rating: 4.7,
  },
  {
    name: "Precision Screwdriver Set",
    description: "64-in-1 magnetic precision screwdriver set for electronics repair.",
    price: 39,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
    category: "Tools",
    stock: 75,
    rating: 4.6,
  },
  {
    name: "Wooden Building Blocks",
    description: "100-piece sustainably sourced wooden blocks set for creative play.",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
    category: "Toys",
    stock: 60,
    rating: 4.8,
  },
  {
    name: "Remote Control Car",
    description: "1:16 scale 4WD off-road RC car with 2.4GHz controller and rechargeable battery.",
    price: 79,
    oldPrice: 99,
    imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80",
    category: "Toys",
    stock: 35,
    rating: 4.5,
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const productsCol = collection(db, "products");
    // Check if our current SEED_VERSION already exists.
    const versionedSnap = await getDocs(
      query(productsCol, where("seedVersion", "==", SEED_VERSION), limit(1)),
    );
    if (!versionedSnap.empty) return;

    // Remove any older auto-seeded products so we don't end up with a mixed catalog.
    const allSnap = await getDocs(productsCol);
    const batch = writeBatch(db);
    allSnap.docs.forEach((d) => {
      const data = d.data() as { seedVersion?: string };
      if (data.seedVersion && data.seedVersion !== SEED_VERSION) {
        batch.delete(d.ref);
      }
    });

    SAMPLE.forEach((p) => {
      const ref = doc(productsCol);
      batch.set(ref, { ...p, createdAt: Date.now(), seedVersion: SEED_VERSION });
    });
    await batch.commit();
  })();
  return seedPromise;
}

export async function fetchProducts(): Promise<Product[]> {
  await ensureSeeded();
  const snap = await getDocs(collection(db, "products"));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
      } as Product;
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
