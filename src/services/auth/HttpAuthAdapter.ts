import type { AuthAdapter, User } from './AuthAdapter';
import { apiClient } from '../api/apiClient';

export class HttpAuthAdapter implements AuthAdapter {
  async login(email: string, password: string): Promise<User> {
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
  }

  async register(name: string, email: string, password: string): Promise<User> {
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
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      apiClient.setToken(null);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = apiClient.getToken();
    if (!token) return null;

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
      return null;
    }
  }

  async requestPasswordReset(_email: string): Promise<boolean> {
    // Password reset simulation
    return true;
  }
}

export const httpAuthAdapter = new HttpAuthAdapter();
