export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number;
  sizes: string[];
  images: string[];
  stock: number;
  active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  is_admin: boolean;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  product_id: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  size: string;
  qty: number;
  price: number;
  image: string | null;
};
