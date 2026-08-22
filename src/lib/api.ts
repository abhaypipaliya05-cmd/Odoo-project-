import {
  ApiResponse,
  ApiSuccessResponse,
  AuthenticatedUser,
  BudgetBreakdown,
  CitySummary,
  CityWithActivities,
  DashboardStats,
  PublicTripDetail,
  TripDetail,
  TripSummary,
  TripTimeline,
  UserProfile,
} from '@/types';

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
  async signup(data: { name: string; email: string; password: string }): Promise<{ user: AuthenticatedUser; token: string }> {
    const res = await this.request<{ user: AuthenticatedUser; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('globetrotter_token', res.token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
    }
    return res;
  }

  async login(data: { email: string; password: string }): Promise<{ user: AuthenticatedUser; token: string }> {
    const res = await this.request<{ user: AuthenticatedUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('globetrotter_token', res.token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
    }
    return res;
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

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
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
  async getTrips(params?: { status?: string; search?: string }): Promise<TripSummary[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const trips = await this.request<TripSummary[]>(`/trips${qs}`);
    if (params?.search) {
      const s = params.search.toLowerCase();
      return trips.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s) ||
          t.cities?.some((c) => c.toLowerCase().includes(s))
      );
    }
    return trips;
  }

  async getTrip(id: string): Promise<TripDetail> {
    return this.request<TripDetail>(`/trips/${id}`);
  }

  async createTrip(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    currency?: string;
    coverImage?: string;
    visibility?: string;
  }): Promise<TripSummary> {
    return this.request<TripSummary>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id: string, data: Partial<TripSummary>): Promise<TripSummary> {
    return this.request<TripSummary>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrip(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneTrip(id: string): Promise<TripSummary> {
    return this.request<TripSummary>(`/trips/${id}/clone`, {
      method: 'POST',
    });
  }

  async shareTrip(id: string, visibility: 'PUBLIC' | 'PRIVATE' = 'PUBLIC'): Promise<{ shareSlug: string; shareUrl: string; visibility: string }> {
    return this.request<{ shareSlug: string; shareUrl: string; visibility: string }>(`/trips/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ visibility }),
    });
  }

  async getTripTimeline(id: string): Promise<TripTimeline> {
    return this.request<TripTimeline>(`/trips/${id}/timeline`);
  }

  async getTripBudget(id: string): Promise<BudgetBreakdown> {
    return this.request<BudgetBreakdown>(`/trips/${id}/budget`);
  }

  async getPublicTrip(slug: string): Promise<PublicTripDetail> {
    return this.request<PublicTripDetail>(`/trips/share/${slug}`);
  }

  // --- Profile APIs ---
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Cities & Discovery ---
  async getCities(params?: { q?: string; country?: string; region?: string; costIndex?: string }): Promise<CitySummary[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.country) query.append('country', params.country);
    if (params?.region) query.append('region', params.region);
    if (params?.costIndex) query.append('costIndex', params.costIndex);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<CitySummary[]>(`/cities${qs}`);
  }

  async getCity(id: string): Promise<CityWithActivities> {
    return this.request<CityWithActivities>(`/cities/${id}`);
  }

  async getSavedDestinations(): Promise<CitySummary[]> {
    return this.request<CitySummary[]>('/saved-destinations');
  }

  async saveDestination(cityId: string): Promise<{ isSaved: boolean }> {
    return this.request<{ isSaved: boolean }>('/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ cityId }),
    });
  }

  async removeSavedDestination(cityId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/saved-destinations/${cityId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
