import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Password encryption utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export const generateToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.verify(token, secret)
}

// User role validation
export const isAdmin = (userRole: string): boolean => {
  return userRole === 'ADMIN'
}

export const isMember = (userRole: string): boolean => {
  return userRole === 'MEMBER'
}
