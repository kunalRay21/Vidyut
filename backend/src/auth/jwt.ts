import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'vidyut_sih_2026_super_secret_jwt_key';
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE_MINUTES ? `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m` : '15m';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE_DAYS ? `${process.env.REFRESH_TOKEN_EXPIRE_DAYS}d` : '7d';

export interface UserTokenPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTITUTION' | 'INDUSTRY' | 'ADMIN';
}

export function generateAccessToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE as any });
}

export function generateRefreshToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE as any });
}

export function verifyToken(token: string): UserTokenPayload {
  return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
