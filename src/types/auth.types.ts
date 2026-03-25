export interface User {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: string
  failedLoginAttempts: number
  lockedUntil: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface TokenResponse {
  accessToken: string
}
