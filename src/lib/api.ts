import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Wish,
  CreateWishRequest,
  UpdateWishRequest,
  User,
} from '@/types';

const API_BASE_URL = 'https://byte5-makeathon-backend-shen-dn7qdj.laravel.cloud/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    "Accept": "application/json"
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// const withRandomCoordinates = (wish: Wish): Wish => {
//   const latitude = (Math.random() * 140 - 70).toFixed(6); // -70 to +70 to avoid poles
//   const longitude = (Math.random() * 360 - 180).toFixed(6);
//   return {
//     ...wish,
//     latitude,
//     longitude,
//   };
// };

export const api = {
  auth: {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await fetchApi<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('token', response.token);
      return response;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await fetchApi<AuthResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('token', response.token);
      return response;
    },

    logout: async (): Promise<void> => {
      await fetchApi('/logout', { method: 'POST' });
      localStorage.removeItem('token');
    },

    me: async (): Promise<User> => {
      return fetchApi<User>('/me');
    },
  },

  wishes: {
    getAll: async (): Promise<Wish[]> => {
      const response = await fetchApi<any>('/wishes/all');
      // API returns paginated response with data property
      if (response && response.data && Array.isArray(response.data)) {
        return response.data
      }
      return Array.isArray(response) ? response : [];
    },

    getMine: async (): Promise<Wish[]> => {
      const response = await fetchApi<any>('/wishes');
      // API might return paginated response with data property
      if (response && response.data && Array.isArray(response.data)) {
        return response.data
      }
      return Array.isArray(response) ? response : [];
    },

    getById: async (id: number): Promise<Wish> => {
      const wish = await fetchApi<Wish>(`/wishes/${id}`);
      return wish
    },

    create: async (data: CreateWishRequest): Promise<Wish> => {
      return fetchApi<Wish>('/wishes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: UpdateWishRequest): Promise<Wish> => {
      return fetchApi<Wish>(`/wishes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number): Promise<void> => {
      return fetchApi<void>(`/wishes/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
