import type { AuthAdapter, User } from './AuthAdapter';
import { apiClient } from '../api/apiClient';
import { mockAuthAdapter } from './MockAuthAdapter';

export class HttpAuthAdapter implements AuthAdapter {
  async login(email: string, password: string): Promise<User> {
    try {
      const data = await apiClient.post<{ user: any; accessToken: string }>('/auth/login', {
        email,
        password,
      });

      apiClient.setToken(data.accessToken);

      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl || '/profile-pic.jpg',
        plan: 'pro',
      };
    } catch (err: any) {
      // If backend is offline or Vite proxy returns 502/503/network error, gracefully fallback to local auth
      if (
        err?.status === 502 ||
        err?.status === 503 ||
        err?.message?.includes('502') ||
        err?.message?.includes('503') ||
        err?.message?.includes('fetch') ||
        err?.message?.includes('Network')
      ) {
        return await mockAuthAdapter.login(email, password);
      }
      throw err;
    }
  }

  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const data = await apiClient.post<{ user: any; accessToken: string }>('/auth/register', {
        name,
        email,
        password,
        avatarUrl: '/profile-pic.jpg',
      });

      apiClient.setToken(data.accessToken);

      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl || '/profile-pic.jpg',
        plan: 'pro',
      };
    } catch (err: any) {
      if (
        err?.status === 502 ||
        err?.status === 503 ||
        err?.message?.includes('502') ||
        err?.message?.includes('503') ||
        err?.message?.includes('fetch') ||
        err?.message?.includes('Network')
      ) {
        return await mockAuthAdapter.register(name, email, password);
      }
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      apiClient.setToken(null);
      await mockAuthAdapter.logout();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = apiClient.getToken();

    if (token) {
      try {
        const data = await apiClient.get<{ user: any }>('/auth/me');
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatarUrl || '/profile-pic.jpg',
          plan: 'pro',
        };
      } catch {
        // Token invalid or backend offline, fallback
      }
    }

    return await mockAuthAdapter.getCurrentUser();
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    return await mockAuthAdapter.requestPasswordReset(email);
  }
}

export const httpAuthAdapter = new HttpAuthAdapter();
