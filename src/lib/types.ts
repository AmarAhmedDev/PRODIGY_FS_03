export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  rating?: number;
  createdAt?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
  shipping: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: number;
}
