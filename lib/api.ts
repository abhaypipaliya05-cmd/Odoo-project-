import { ApiResponse, ApiSuccessResponse, DashboardStats, Destination, Trip, User } from '@/types';

class ApiClient {
  private baseUrl = '/api';

  private getAuthHeader(): HeadersInit {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('globetrotter_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const resJson: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Failed to parse response from server',
        },
      }));

      if (!response.ok || !resJson.success) {
        const errorMessage =
          (!resJson.success && resJson.error?.message) ||
          `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).code = !resJson.success ? resJson.error?.code : 'HTTP_ERROR';
        (error as any).details = !resJson.success ? resJson.error?.details : [];
        throw error;
      }

      return (resJson as ApiSuccessResponse<T>).data;
    } catch (err: any) {
      console.error(`API error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  // --- Auth APIs ---
  async signup(data: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      }
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Dashboard APIs ---
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // --- Trips APIs ---
  async getTrips(params?: { status?: string; search?: string }): Promise<Trip[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Trip[]>(`/trips${qs}`);
  }

  async getTrip(id: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}`);
  }

  async createTrip(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget: number;
    currency?: string;
    coverImage?: string;
  }): Promise<Trip> {
    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id: string, data: Partial<Trip>): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrip(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneTrip(id: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/clone`, {
      method: 'POST',
    });
  }

  async shareTrip(id: string): Promise<{ shareUrl: string; shareToken: string; visibility: string }> {
    return this.request<{ shareUrl: string; shareToken: string; visibility: string }>(`/trips/${id}/share`, {
      method: 'POST',
    });
  }

  // --- Profile APIs ---
  async getProfile(): Promise<User> {
    return this.request<User>('/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Destinations & Saved ---
  async getDestinations(search?: string): Promise<Destination[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Destination[]>(`/destinations${query}`);
  }

  async getSavedDestinations(): Promise<Destination[]> {
    return this.request<Destination[]>('/destinations/saved');
  }

  async toggleSaveDestination(id: string): Promise<{ isSaved: boolean }> {
    return this.request<{ isSaved: boolean }>(`/destinations/${id}/save`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
