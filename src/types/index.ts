export type Priority = 'high' | 'medium' | 'low';
export type Status = 'pending' | 'in_progress' | 'granted' | 'denied';

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
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  created_at?: string;
  updated_at?: string;
  latitude?: string | null;
  longitude?: string | null;
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
  title: string;
  description: string;
  priority?: Priority;
  latitude?: string | null;
  longitude?: string | null;
}

export interface UpdateWishRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
}
