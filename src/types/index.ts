export type Priority = 'high' | 'medium' | 'low';
export type Status = 'pending' | 'in_progress' | 'granted' | 'denied';

export interface Address {
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
}

export interface Product {
  sku: number;
  name: string;
  salePrice: number;
  image: string;
  weight: number | null;
  shortDescription?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Wish {
  id: number;
  user_id?: number;
  name?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  product_name?: string;
  product_sku?: string;
  product_image?: string;
  product_weight?: number;
  product_price?: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateWishRequest {
  name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
  title: string;
  description?: string;
  priority?: Priority;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  product_weight?: number;
  product_price?: number;
}

export interface UpdateWishRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  product_name?: string;
  product_sku?: string;
  product_image?: string;
  product_weight?: number;
  product_price?: number;
}

export interface ShoppingListWish {
  id: number;
  name: string;
  title: string;
  city: string;
  status: Status;
}

export interface ShoppingListItem {
  product_sku: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  product_weight: number;
  quantity: number;
  total_price: number;
  total_weight: number;
  wishes: ShoppingListWish[];
}

export interface ShoppingListResponse {
  shopping_list: ShoppingListItem[];
  total_items: number;
  total_cost: number;
  total_weight: number;
}

export type BribeStatus = 'pending' | 'accepted' | 'rejected';

export interface WishTrackingInfo {
  id: number;
  title: string;
  status: Status;
  product_name: string;
  product_image: string | null;
  product_weight: number | null;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
  created_at: string;
  queue_position: number | null;
  total_in_queue: number | null;
  bribe_offer: string | null;
  bribe_status: BribeStatus | null;
}
