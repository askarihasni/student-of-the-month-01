import type { AuthAdapter, User } from './AuthAdapter'

const AUTH_USER_STORAGE_KEY = 'minifigma_auth_user'
const REGISTERED_USERS_KEY = 'minifigma_registered_users'

export class MockAuthAdapter implements AuthAdapter {
  private defaultUser: User = {
    id: 'usr_senior_designer_01',
    name: 'Askari Hasni',
    email: 'designer@minifigma.io',
    avatar: '/avatar.jpg',
    plan: 'pro',
  }

  constructor() {
    this.seedDefaultUser()
  }

  private seedDefaultUser(): void {
    try {
      const existing = localStorage.getItem(REGISTERED_USERS_KEY)
      if (!existing) {
        const initial = [
          {
            ...this.defaultUser,
            password: 'password123',
          },
        ]
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initial))
      }
    } catch {
      // ignore
    }
  }

  async login(email: string, password: string): Promise<User> {
    // Artificial latency for realistic UX feel
    await new Promise(r => setTimeout(r, 400))

    if (!email || !password) {
      throw new Error('Please enter both email and password.')
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email format.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    let user: User = {
      id: `usr_${Date.now().toString(36)}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      avatar: '/avatar.jpg',
      plan: 'pro',
    }

    // Check registered mock users
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY)
      if (raw) {
        const users = JSON.parse(raw)
        const match = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase())
        if (match) {
          user = {
            id: match.id,
            name: match.name,
            email: match.email,
            avatar: match.avatar || user.avatar,
            plan: match.plan || 'pro',
          }
        }
      }
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
    } catch {
      // fallback
    }

    return user
  }

  async register(name: string, email: string, password: string): Promise<User> {
    await new Promise(r => setTimeout(r, 400))

    if (!name.trim()) {
      throw new Error('Full name is required.')
    }
    if (!email.includes('@')) {
      throw new Error('Please provide a valid email address.')
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: '/avatar.jpg',
      plan: 'pro',
    }

    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY)
      const list = raw ? JSON.parse(raw) : []
      list.push({ ...newUser, password })
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list))
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(newUser))
    } catch {
      // fallback
    }

    return newUser
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY)
      if (raw) {
        const u = JSON.parse(raw) as User
        if (!u.avatar || u.avatar.includes('unsplash.com')) {
          u.avatar = '/avatar.jpg'
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(u))
        }
        return u
      }
      return this.defaultUser
    } catch {
      return this.defaultUser
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 400))
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }
    return true
  }
}

export const authAdapter = new MockAuthAdapter()

