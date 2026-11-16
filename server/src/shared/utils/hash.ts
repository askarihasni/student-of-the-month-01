import { hash, verify } from '@node-rs/argon2'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
}

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plain)
  } catch {
    return false
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateRandomToken(bytes = 40): string {
  return crypto.randomBytes(bytes).toString('hex')
}

