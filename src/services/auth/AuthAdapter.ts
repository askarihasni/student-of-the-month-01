export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface AuthSession {
  user: User
  token: string
}

export interface AuthAdapter {
  login(email: string, password: string): Promise<User>
  register(name: string, email: string, password: string): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  requestPasswordReset(email: string): Promise<boolean>
}
